import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ExcelJS from 'exceljs'

/**
 * GET /api/admin/excel-report?start=YYYY-MM-DD&end=YYYY-MM-DD
 *
 * Generates and streams an Excel workbook directly to the browser.
 * Protected by admin session cookie — no email required.
 */
export async function GET(req: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // ── Params ─────────────────────────────────────────────────────────────────
  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('start') ?? new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const endDate   = searchParams.get('end')   ?? new Date().toISOString().split('T')[0]
  const start     = `${startDate}T00:00:00.000Z`
  const end       = `${endDate}T23:59:59.999Z`

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })

  const admin = createAdminClient()

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const [
    { data: allLogs },
    { data: authData },
    { data: pointsData },
    { data: usersByLevelRaw }
  ] = await Promise.all([
    admin.from('audit_logs')
      .select('id, created_at, event, user_id, ip_address, meta')
      .gte('created_at', start).lte('created_at', end)
      .order('created_at', { ascending: false }).limit(5000),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('user_points').select('user_id, total_points, streak_days, level'),
    admin.from('user_points').select('level')
  ])

  const logs        = allLogs ?? []
  const totalUsers  = authData?.users?.length ?? 0
  const newUsers    = authData?.users?.filter(u => u.created_at >= start && u.created_at <= end).length ?? 0
  const loginOk     = logs.filter(l => l.event === 'login_success').length
  const loginFail   = logs.filter(l => l.event === 'login_failure').length
  const detectScans = logs.filter(l => l.event === 'detect_scan')
  const spoofs      = detectScans.filter(l => (l.meta as any)?.label === 'spoof').length
  const bonaFide    = detectScans.filter(l => (l.meta as any)?.label === 'bona-fide').length
  const avgConf     = detectScans.length > 0
    ? Math.round(detectScans.reduce((s, l) => s + ((l.meta as any)?.confidence ?? 0), 0) / detectScans.length) : 0
  const avgPoints   = pointsData && pointsData.length > 0
    ? Math.round(pointsData.reduce((s, p) => s + (p.total_points ?? 0), 0) / pointsData.length) : 0
  const bonaFideRat = detectScans.length > 0 ? Math.round(bonaFide / detectScans.length * 100) : 0
  const failRate    = loginOk + loginFail > 0 ? Math.round(loginFail / (loginOk + loginFail) * 100) : 0
  const secScore    = Math.round(bonaFideRat * 0.60 + Math.max(0, 100 - failRate) * 0.40)

  const dayMap: Record<string, { logins: number; signups: number; scans: number; spoofs: number }> = {}
  for (const log of logs) {
    const day = log.created_at.split('T')[0]
    if (!dayMap[day]) dayMap[day] = { logins: 0, signups: 0, scans: 0, spoofs: 0 }
    if (log.event === 'login_success')  dayMap[day].logins++
    if (log.event === 'signup_success') dayMap[day].signups++
    if (log.event === 'detect_scan')    dayMap[day].scans++
    if (log.event === 'detect_scan' && (log.meta as any)?.label === 'spoof') dayMap[day].spoofs++
  }
  const dailyRows = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b))

  const levelCounts: Record<string, number> = {}
  for (const r of (usersByLevelRaw ?? [])) {
    const l = r.level ?? 'Beginner'
    levelCounts[l] = (levelCounts[l] ?? 0) + 1
  }

  // ── Build workbook ─────────────────────────────────────────────────────────
  const wb = new ExcelJS.Workbook()
  wb.creator = 'VoiceGuard Admin'; wb.created = wb.modified = new Date()

  // Shared styles
  const BG     = (argb: string): ExcelJS.FillPattern   => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
  const FT     = (argb: string, bold = false, size = 10): Partial<ExcelJS.Font> => ({ color: { argb }, name: 'Calibri', bold, size })
  const BORDER: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF1E293B' } }, bottom: { style: 'thin', color: { argb: 'FF1E293B' } },
    left: { style: 'thin', color: { argb: 'FF1E293B' } }, right: { style: 'thin', color: { argb: 'FF1E293B' } },
  }
  const hdr = (ws: ExcelJS.Worksheet, r: number, c: number, v: string, bg = 'FF312E81') => {
    const cell = ws.getCell(r, c); cell.value = v
    cell.fill = BG(bg); cell.font = FT('FFE2E8F0', true, 10)
    cell.alignment = { horizontal: 'center', vertical: 'middle' }; cell.border = BORDER
  }
  const dat = (ws: ExcelJS.Worksheet, r: number, c: number, v: ExcelJS.CellValue, ft?: Partial<ExcelJS.Font>, bg?: string) => {
    const cell = ws.getCell(r, c); cell.value = v
    cell.fill = BG(bg ?? (r % 2 === 0 ? 'FF1A1A3A' : 'FF0F0F2A'))
    cell.font = ft ?? FT('FF94A3B8'); cell.alignment = { vertical: 'middle' }; cell.border = BORDER
  }

  // ── Sheet 1: Summary ────────────────────────────────────────────────────────
  const s1 = wb.addWorksheet('📊 Summary', { properties: { tabColor: { argb: 'FF6366F1' } } })
  s1.views = [{ showGridLines: false }]
  s1.mergeCells('A1:H1'); s1.getCell('A1').value = `VoiceGuard Security Report  |  ${fmtDate(start)} — ${fmtDate(end)}`
  s1.getCell('A1').fill = BG('FF312E81'); s1.getCell('A1').font = FT('FFE2E8F0', true, 16)
  s1.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }; s1.getRow(1).height = 38
  s1.mergeCells('A2:H2'); s1.getCell('A2').value = `Security Health Score: ${secScore}/100  ·  Generated: ${new Date().toLocaleString('en-MY')}`
  s1.getCell('A2').fill = BG('FF0F0F2A'); s1.getCell('A2').font = FT('FF94A3B8', false, 10)
  s1.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }; s1.getRow(2).height = 20

  s1.mergeCells('A4:H4'); s1.getCell('A4').value = '👥  USER METRICS'
  s1.getCell('A4').fill = BG('FF1E3A5F'); s1.getCell('A4').font = FT('FFE2E8F0', true, 11)
  s1.getCell('A4').alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }; s1.getRow(4).height = 22

  ;['Metric', 'Value'].forEach((h, i) => hdr(s1, 5, i + 1, h))
  const uKpis: [string, string | number, Partial<ExcelJS.Font>][] = [
    ['Total Users',         totalUsers,         FT('FF60A5FA', true)],
    ['New Users (Period)',  newUsers,            FT('FF34D399', true)],
    ['Avg Points / User',  avgPoints,           FT('FFFBBF24', true)],
  ]
  uKpis.forEach(([l, v, f], i) => { dat(s1, 6+i, 1, l); dat(s1, 6+i, 2, v, f) })

  const sR = 12
  s1.mergeCells(`A${sR}:H${sR}`); s1.getCell(`A${sR}`).value = '🔐  SECURITY & AI DETECTION'
  s1.getCell(`A${sR}`).fill = BG('FF7F1D1D'); s1.getCell(`A${sR}`).font = FT('FFE2E8F0', true, 11)
  s1.getCell(`A${sR}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }; s1.getRow(sR).height = 22
  ;['Metric', 'Value'].forEach((h, i) => hdr(s1, sR+1, i+1, h))
  const sKpis: [string, string | number, Partial<ExcelJS.Font>][] = [
    ['Login Success',      loginOk,            FT('FF34D399', true)],
    ['Login Failures',     loginFail,          FT(loginFail > 5 ? 'FFF87171' : 'FF94A3B8', true)],
    ['Failure Rate',       `${failRate}%`,     FT(failRate > 20 ? 'FFF87171' : 'FF34D399', true)],
    ['Voice Scans',        detectScans.length, FT('FFA78BFA', true)],
    ['Spoof Detections',   spoofs,             FT(spoofs > 0 ? 'FFF87171' : 'FF34D399', true)],
    ['Bona-fide',          bonaFide,           FT('FF34D399', true)],
    ['Bona-fide Ratio',    `${bonaFideRat}%`,  FT(bonaFideRat >= 70 ? 'FF34D399' : 'FFF87171', true)],
    ['Avg AI Confidence',  `${avgConf}%`,      FT(avgConf >= 80 ? 'FF34D399' : 'FFFBBF24', true)],
    ['Security Score',     `${secScore}/100`,  FT(secScore >= 75 ? 'FF34D399' : secScore >= 50 ? 'FFFBBF24' : 'FFF87171', true)],
  ]
  sKpis.forEach(([l, v, f], i) => { dat(s1, sR+2+i, 1, l); dat(s1, sR+2+i, 2, v, f) })
  s1.getColumn(1).width = 30; s1.getColumn(2).width = 22; for (let c=3;c<=8;c++) s1.getColumn(c).width = 12

  // ── Sheet 2: Daily Activity ─────────────────────────────────────────────────
  const s2 = wb.addWorksheet('📅 Daily Activity', { properties: { tabColor: { argb: 'FF34D399' } } })
  s2.views = [{ showGridLines: false }]
  s2.mergeCells('A1:F1'); s2.getCell('A1').value = `Daily Activity  |  ${fmtDate(start)} — ${fmtDate(end)}`
  s2.getCell('A1').fill = BG('FF312E81'); s2.getCell('A1').font = FT('FFE2E8F0', true, 14)
  s2.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }; s2.getRow(1).height = 30
  ;['Date','Logins','Sign-ups','AI Scans','Spoofs','Total'].forEach((h,i) => hdr(s2, 3, i+1, h))
  dailyRows.forEach(([date, d], i) => {
    const r=4+i, tot=d.logins+d.signups+d.scans
    dat(s2,r,1, fmtDate(date+'T00:00:00')); dat(s2,r,2, d.logins, FT(d.logins>0?'FF34D399':'FF94A3B8',true))
    dat(s2,r,3, d.signups, FT(d.signups>0?'FF60A5FA':'FF94A3B8',true))
    dat(s2,r,4, d.scans, FT(d.scans>0?'FFA78BFA':'FF94A3B8',true))
    dat(s2,r,5, d.spoofs, FT(d.spoofs>0?'FFF87171':'FF94A3B8',true))
    dat(s2,r,6, tot, FT('FFE2E8F0',true)); s2.getRow(r).height = 18
  })
  const tR = 4+dailyRows.length
  ;['TOTAL', loginOk+loginFail, newUsers, detectScans.length, spoofs, logs.length].forEach((v,i)=>{
    const c=s2.getCell(tR,i+1); c.value=v; c.fill=BG('FF1E1B4B'); c.font=FT('FFE2E8F0',true); c.border=BORDER; c.alignment={vertical:'middle'}
  })
  ;[18,12,12,14,12,14].forEach((w,i)=>{ s2.getColumn(i+1).width=w })

  // ── Sheet 3: User Levels ────────────────────────────────────────────────────
  const s3 = wb.addWorksheet('🏅 User Levels', { properties: { tabColor: { argb: 'FFFBBF24' } } })
  s3.views = [{ showGridLines: false }]
  s3.mergeCells('A1:D1'); s3.getCell('A1').value = 'User Distribution by Skill Level'
  s3.getCell('A1').fill = BG('FF312E81'); s3.getCell('A1').font = FT('FFE2E8F0',true,14)
  s3.getCell('A1').alignment = { horizontal:'center', vertical:'middle' }; s3.getRow(1).height=30
  ;['Level','Users','Share %','Progress'].forEach((h,i)=>hdr(s3,3,i+1,h))
  const levels = ['Beginner','Aware','Guardian','Expert','Champion']
  const lColors: Record<string,string> = { Beginner:'FF94A3B8',Aware:'FF34D399',Guardian:'FF60A5FA',Expert:'FFC084FC',Champion:'FFFBBF24' }
  levels.forEach((lvl,i)=>{
    const cnt=levelCounts[lvl]??0, pct=totalUsers>0?Math.round(cnt/totalUsers*100):0, r=4+i
    dat(s3,r,1, lvl, FT(lColors[lvl]??'FF94A3B8',true))
    dat(s3,r,2, cnt, FT('FFE2E8F0',true,11))
    dat(s3,r,3, `${pct}%`)
    const bar=s3.getCell(r,4); bar.value='█'.repeat(Math.round(pct/5))||'▒'
    bar.fill=BG(i%2===0?'FF0F0F2A':'FF1A1A3A'); bar.font={color:{argb:lColors[lvl]??'FF94A3B8'},size:9}; bar.border=BORDER; s3.getRow(r).height=20
  })
  ;[16,10,12,30].forEach((w,i)=>{ s3.getColumn(i+1).width=w })

  // ── Sheet 4: Detections ─────────────────────────────────────────────────────
  const s4 = wb.addWorksheet('🎙️ Detections', { properties: { tabColor: { argb: 'FFF87171' } } })
  s4.views = [{ showGridLines: false }]
  s4.mergeCells('A1:G1'); s4.getCell('A1').value = `AI Voice Detection Log  |  ${fmtDate(start)} — ${fmtDate(end)}`
  s4.getCell('A1').fill = BG('FF7F1D1D'); s4.getCell('A1').font = FT('FFE2E8F0',true,14)
  s4.getCell('A1').alignment = { horizontal:'center', vertical:'middle' }; s4.getRow(1).height=30
  ;['Date & Time','User ID','Result','Confidence %','Filename','Size (KB)','IP'].forEach((h,i)=>hdr(s4,3,i+1,h,'FF7F1D1D'))
  if (detectScans.length===0) {
    s4.mergeCells('A4:G4'); s4.getCell('A4').value='No AI scan events in selected period.'
    s4.getCell('A4').fill=BG('FF0F0F2A'); s4.getCell('A4').font=FT('FF94A3B8',false,10); s4.getCell('A4').alignment={horizontal:'center',vertical:'middle'}
  }
  detectScans.forEach((log,i)=>{
    const r=4+i, m=(log.meta??{}) as any, isSp=m.label==='spoof'
    dat(s4,r,1, new Date(log.created_at).toLocaleString('en-MY'), FT('FF94A3B8',false,9))
    dat(s4,r,2, log.user_id ? log.user_id.slice(0,8)+'…' : 'Anon', FT('FF94A3B8',false,9))
    dat(s4,r,3, isSp?'🚨 SPOOF':'✅ BONA-FIDE', FT(isSp?'FFF87171':'FF34D399',true))
    dat(s4,r,4, m.confidence??'—', FT(isSp?'FFF87171':'FF34D399',true))
    dat(s4,r,5, m.filename??'—', FT('FF94A3B8',false,9))
    dat(s4,r,6, m.size ? Number((m.size/1024).toFixed(1)) : '—', FT('FF94A3B8',false,9))
    dat(s4,r,7, log.ip_address??'—', FT('FF94A3B8',false,9)); s4.getRow(r).height=16
  })
  ;[22,12,14,14,20,12,16].forEach((w,i)=>{ s4.getColumn(i+1).width=w })

  // ── Sheet 5: Audit Log ──────────────────────────────────────────────────────
  const s5 = wb.addWorksheet('📋 Audit Log', { properties: { tabColor: { argb: 'FF60A5FA' } } })
  s5.views = [{ showGridLines: false }]
  s5.mergeCells('A1:F1'); s5.getCell('A1').value = `Security Audit Log  |  ${fmtDate(start)} — ${fmtDate(end)}  |  ${logs.length} events`
  s5.getCell('A1').fill = BG('FF1E3A5F'); s5.getCell('A1').font = FT('FFE2E8F0',true,14)
  s5.getCell('A1').alignment = { horizontal:'center', vertical:'middle' }; s5.getRow(1).height=30
  ;['Date & Time','Event','User ID','IP Address','Details'].forEach((h,i)=>hdr(s5,3,i+1,h,'FF1E3A5F'))
  const evColors: Record<string,string> = {
    login_success:'FF34D399', login_failure:'FFF87171', logout:'FF94A3B8',
    signup_success:'FF60A5FA', detect_scan:'FFA78BFA', password_reset_request:'FFFBBF24',
  }
  logs.slice(0,2000).forEach((log,i)=>{
    const r=4+i, ec=evColors[log.event]??'FF94A3B8'
    const metaStr = log.meta && Object.keys(log.meta).length>0
      ? Object.entries(log.meta).map(([k,v])=>`${k}: ${String(v)}`).join(' | ').slice(0,120) : '—'
    dat(s5,r,1, new Date(log.created_at).toLocaleString('en-MY'), FT('FF94A3B8',false,9))
    dat(s5,r,2, log.event.replace(/_/g,' '), FT(ec,true,9))
    dat(s5,r,3, log.user_id ? log.user_id.slice(0,8)+'…' : 'Anon', FT('FF94A3B8',false,9))
    dat(s5,r,4, log.ip_address??'—', FT('FF94A3B8',false,9))
    dat(s5,r,5, metaStr, FT('FF94A3B8',false,9)); s5.getRow(r).height=15
  })
  ;[20,22,12,16,50].forEach((w,i)=>{ s5.getColumn(i+1).width=w })

  // ── Stream Excel to browser ─────────────────────────────────────────────────
  const buffer   = await wb.xlsx.writeBuffer()
  const filename = `VoiceGuard-Report-${startDate}-to-${endDate}.xlsx`

  return new NextResponse(Buffer.from(buffer), {
    status: 200,
    headers: {
      'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store',
    },
  })
}
