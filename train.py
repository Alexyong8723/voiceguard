"""
train.py — Training Pipeline for VoiceGuard Dual-Branch Model
Usage:
    python train.py --data_root ./data --dataset_type folder --epochs 30
"""

import os
import argparse
import json
import time
from pathlib import Path

import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from sklearn.metrics import roc_auc_score, classification_report
import numpy as np

from dataset import get_dataloaders
from model import VoiceGuardDualBranch


# ─── Argument Parser ──────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser(description="Train VoiceGuard deepfake detector")
    p.add_argument("--data_root",     type=str, required=True,
                   help="Root folder of dataset (contains train/val/test)")
    p.add_argument("--dataset_type",  type=str, default="folder",
                   choices=["folder", "asvspoof2019"],
                   help="Dataset format")
    p.add_argument("--save_dir",      type=str, default="./checkpoints",
                   help="Where to save model checkpoints")
    p.add_argument("--log_dir",       type=str, default="./logs")
    p.add_argument("--embed_dim",     type=int, default=256)
    p.add_argument("--batch_size",    type=int, default=16)
    p.add_argument("--epochs",        type=int, default=30)
    p.add_argument("--lr",            type=float, default=1e-4)
    p.add_argument("--weight_decay",  type=float, default=1e-4)
    p.add_argument("--dropout",       type=float, default=0.3)
    p.add_argument("--patience",      type=int, default=7,
                   help="Early stopping patience (epochs)")
    p.add_argument("--num_workers",   type=int, default=2)
    p.add_argument("--resume",        type=str, default=None,
                   help="Path to checkpoint to resume from")
    p.add_argument("--freeze_w2v",    action="store_true", default=True,
                   help="Freeze Wav2Vec2 feature extractor layers")
    return p.parse_args()


# ─── Metrics ─────────────────────────────────────────────────────────────────

def compute_eer(y_true, y_scores):
    """Compute Equal Error Rate (EER) — standard metric in anti-spoofing."""
    from sklearn.metrics import roc_curve
    fpr, tpr, _ = roc_curve(y_true, y_scores, pos_label=1)
    fnr = 1 - tpr
    # EER is where FPR ≈ FNR
    eer_idx = np.nanargmin(np.abs(fpr - fnr))
    return (fpr[eer_idx] + fnr[eer_idx]) / 2


# ─── One Epoch ───────────────────────────────────────────────────────────────

def train_one_epoch(model, loader, optimizer, criterion, device, epoch):
    model.train()
    total_loss = 0.0
    all_preds, all_labels = [], []

    for step, (waveform, mel, labels) in enumerate(loader):
        waveform = waveform.to(device)
        mel      = mel.to(device)
        labels   = labels.to(device)

        optimizer.zero_grad()
        logits = model(waveform, mel)
        loss   = criterion(logits, labels)
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        total_loss += loss.item()
        preds = logits.argmax(dim=-1).cpu().numpy()
        all_preds.extend(preds)
        all_labels.extend(labels.cpu().numpy())

        if (step + 1) % 20 == 0:
            print(f"  [epoch {epoch}] step {step+1}/{len(loader)}  loss={loss.item():.4f}")

    acc = np.mean(np.array(all_preds) == np.array(all_labels)) * 100
    avg_loss = total_loss / len(loader)
    return avg_loss, acc


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss = 0.0
    all_preds, all_labels, all_probs = [], [], []

    for waveform, mel, labels in loader:
        waveform = waveform.to(device)
        mel      = mel.to(device)
        labels   = labels.to(device)

        logits = model(waveform, mel)
        loss   = criterion(logits, labels)
        total_loss += loss.item()

        probs  = torch.softmax(logits, dim=-1)[:, 1]  # P(fake)
        preds  = logits.argmax(dim=-1)

        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())
        all_probs.extend(probs.cpu().numpy())

    all_labels = np.array(all_labels)
    all_preds  = np.array(all_preds)
    all_probs  = np.array(all_probs)

    acc  = np.mean(all_preds == all_labels) * 100
    avg_loss = total_loss / len(loader)
    auc  = roc_auc_score(all_labels, all_probs) if len(set(all_labels)) > 1 else 0.5
    eer  = compute_eer(all_labels, all_probs) if len(set(all_labels)) > 1 else 0.5

    return avg_loss, acc, auc, eer, all_labels, all_preds


# ─── Main Training Loop ───────────────────────────────────────────────────────

def main():
    args = parse_args()
    os.makedirs(args.save_dir, exist_ok=True)
    os.makedirs(args.log_dir,  exist_ok=True)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    # ── DataLoaders ──
    train_loader, val_loader, test_loader = get_dataloaders(
        dataset_root=args.data_root,
        dataset_type=args.dataset_type,
        batch_size=args.batch_size,
        num_workers=args.num_workers,
    )

    # ── Model ──
    model = VoiceGuardDualBranch(
        embed_dim=args.embed_dim,
        dropout=args.dropout,
        freeze_w2v_cnn=args.freeze_w2v,
    ).to(device)

    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total     = sum(p.numel() for p in model.parameters())
    print(f"Trainable params: {trainable:,} / {total:,}")

    # ── Loss: weighted cross-entropy (handles class imbalance) ──
    # Estimate class weights from training set
    labels_all = [s[1] for s in train_loader.dataset.samples]
    n_real = labels_all.count(0)
    n_fake = labels_all.count(1)
    n_total = n_real + n_fake
    w_real = n_total / (2 * n_real) if n_real > 0 else 1.0
    w_fake = n_total / (2 * n_fake) if n_fake > 0 else 1.0
    class_weights = torch.tensor([w_real, w_fake], dtype=torch.float32).to(device)
    print(f"Class weights: real={w_real:.3f}, fake={w_fake:.3f}")

    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=args.lr,
        weight_decay=args.weight_decay,
    )
    scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-6)

    # ── Resume ──
    start_epoch = 1
    best_auc    = 0.0
    patience_ctr = 0
    history = {"train_loss": [], "val_loss": [], "val_acc": [], "val_auc": [], "val_eer": []}

    if args.resume and os.path.isfile(args.resume):
        ckpt = torch.load(args.resume, map_location=device)
        model.load_state_dict(ckpt["model_state"])
        optimizer.load_state_dict(ckpt["optim_state"])
        start_epoch = ckpt.get("epoch", 1) + 1
        best_auc    = ckpt.get("best_auc", 0.0)
        print(f"Resumed from epoch {start_epoch - 1}, best AUC={best_auc:.4f}")

    # ─── Training Loop ────────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("Starting training …")
    print("="*60)

    for epoch in range(start_epoch, args.epochs + 1):
        t0 = time.time()
        train_loss, train_acc = train_one_epoch(model, train_loader, optimizer,
                                                criterion, device, epoch)
        val_loss, val_acc, val_auc, val_eer, _, _ = evaluate(model, val_loader,
                                                              criterion, device)
        scheduler.step()

        elapsed = time.time() - t0
        print(f"\nEpoch {epoch:03d}/{args.epochs:03d} ({elapsed:.1f}s) — "
              f"train_loss={train_loss:.4f} train_acc={train_acc:.2f}% | "
              f"val_loss={val_loss:.4f} val_acc={val_acc:.2f}% "
              f"AUC={val_auc:.4f} EER={val_eer:.4f}")

        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)
        history["val_auc"].append(val_auc)
        history["val_eer"].append(val_eer)

        # Save checkpoint every epoch
        ckpt_path = os.path.join(args.save_dir, f"epoch_{epoch:03d}.pt")
        torch.save({
            "epoch": epoch,
            "model_state": model.state_dict(),
            "optim_state": optimizer.state_dict(),
            "best_auc": best_auc,
            "val_auc": val_auc,
        }, ckpt_path)

        # Save best model
        if val_auc > best_auc:
            best_auc = val_auc
            best_path = os.path.join(args.save_dir, "best_model.pt")
            torch.save(model.state_dict(), best_path)
            print(f"  ✓ New best model saved (AUC={best_auc:.4f})")
            patience_ctr = 0
        else:
            patience_ctr += 1
            print(f"  No improvement — patience {patience_ctr}/{args.patience}")

        if patience_ctr >= args.patience:
            print("Early stopping triggered.")
            break

    # ── Final test evaluation ──
    print("\n" + "="*60)
    print("Evaluating on TEST set …")
    best_path = os.path.join(args.save_dir, "best_model.pt")
    model.load_state_dict(torch.load(best_path, map_location=device))

    _, test_acc, test_auc, test_eer, y_true, y_pred = evaluate(
        model, test_loader, criterion, device)

    print(f"Test  acc={test_acc:.2f}%  AUC={test_auc:.4f}  EER={test_eer:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=["Real", "Fake"]))

    # Save history
    with open(os.path.join(args.log_dir, "history.json"), "w") as f:
        json.dump(history, f, indent=2)
    print(f"History saved to {args.log_dir}/history.json")
    print(f"Best model: {best_path}")


if __name__ == "__main__":
    main()
