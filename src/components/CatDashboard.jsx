import { useState, useMemo, useRef, useEffect } from 'react'
import CatFormModal from './CatFormModal.jsx'
import arrowBackSvg from '../assets/icons/arrow_back.svg'
import moreHorizSvg from '../assets/icons/more_horiz.svg'

const PRIMARY      = '#EA5EAD'
const LS_WEIGHT    = 'cathealth_daily_weight'
const LS_VOMIT     = 'cathealth_daily_vomit'
const LS_HOSPITAL  = 'cathealth_daily_hospital'
const LS_HOSPITALS = 'cathealth_hospitals'
const LS_EXAM      = 'cathealth_exam_results'

// ── ユーティリティ ────────────────────────────────────
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${y}/${m}/${d}`
}

// ── データ読み込み ────────────────────────────────────
function loadWeight(catId) {
  try {
    return JSON.parse(localStorage.getItem(LS_WEIGHT) || '[]')
      .filter(r => String(r.catId) === String(catId) && parseFloat(r.weight) > 0)
      .map(r => ({ date: r.date, value: parseFloat(r.weight) }))
      .filter(r => !isNaN(r.value) && r.date)
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch { return [] }
}

function loadPh(catId) {
  try {
    return JSON.parse(localStorage.getItem(LS_EXAM) || '[]')
      .filter(r => String(r.catId) === String(catId) && r.urine?.ph != null)
      .map(r => ({ date: r.date, value: parseFloat(r.urine.ph) }))
      .filter(r => !isNaN(r.value) && r.date)
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch { return [] }
}

function loadHospitalVisits(catId) {
  try {
    return JSON.parse(localStorage.getItem(LS_HOSPITAL) || '[]')
      .filter(r => String(r.catId) === String(catId))
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch { return [] }
}

function loadHospitals() {
  try { return JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]') } catch { return [] }
}

function loadVomitByDate(catId) {
  try {
    const records = JSON.parse(localStorage.getItem(LS_VOMIT) || '[]')
      .filter(r => String(r.catId) === String(catId))
    const counts = {}
    records.forEach(r => { counts[r.date] = (counts[r.date] || 0) + 1 })
    return counts
  } catch { return {} }
}

// ── インラインアイコン ─────────────────────────────────
function WeightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 3C22.1049 3 23 3.89543 23 5V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V5C1 3.89543 1.89543 3 3 3H21ZM3 19H21V5H3V19ZM15.5 6.25C16.1904 6.25 16.75 6.80964 16.75 7.5V10.5C16.75 11.1904 16.1904 11.75 15.5 11.75H8.5C7.80964 11.75 7.25 11.1904 7.25 10.5V7.5C7.25 6.80964 7.80964 6.25 8.5 6.25H15.5ZM8.75 10.25H15.25V7.75H8.75V10.25Z" fill={PRIMARY}/>
    </svg>
  )
}

function HospitalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M10.9404 2.89366C11.5888 2.48857 12.4112 2.48857 13.0596 2.89366L20.0596 7.26866C20.6442 7.63404 20.9998 8.27457 21 8.96397V19.4103C20.9999 20.5147 20.1045 21.4103 19 21.4103H5C3.89549 21.4103 3.0001 20.5147 3 19.4103V8.96397C3.00017 8.27457 3.35579 7.63404 3.94043 7.26866L10.9404 2.89366ZM5 8.96397V19.4103H19V8.96397L12 4.58995L5 8.96397ZM13 11.9103H15.5V13.9103H13V16.4103H11V13.9103H8.5V11.9103H11V9.41026H13V11.9103Z"
        fill={PRIMARY}
      />
    </svg>
  )
}

function ChevronRight({ color = '#9CA3AF' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill={color}/>
    </svg>
  )
}

// ── LineGraph ─────────────────────────────────────────
// SVG の座標計算は inline style が必要。ラッパー・テキストは Tailwind。
function LineGraph({ pts, yUnit, title }) {
  const containerRef = useRef(null)
  const [containerW, setContainerW] = useState(300)

  // グラフ定数
  const PAD_L = 52, PAD_R = 16, PAD_T = 8, PAD_B = 46, PLOT_H = 100
  const MIN_MONTH_W = 36
  // 最初/最後の月ラベルが SVG 端でクリップされないよう左右に余白を確保
  const X_PAD = 18

  useEffect(() => {
    if (containerRef.current) setContainerW(containerRef.current.clientWidth - 24)
  }, [])

  if (pts.length < 2) {
    return (
      <div className="bg-surface-card rounded-card px-3 pt-3 pb-3">
        <p className="text-sm font-semibold text-neutral-main mb-2">{title}</p>
        <p className="text-xs text-neutral-muted text-center py-6">データなし</p>
      </div>
    )
  }

  // 全月リスト（データ空白月も含む）
  const allMonths = []
  const addMonth = (ym, endYm) => {
    let cur = ym
    while (cur <= endYm) {
      allMonths.push(cur)
      const [y, m] = cur.split('-').map(Number)
      cur = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
    }
  }
  addMonth(pts[0].date.slice(0, 7), pts[pts.length - 1].date.slice(0, 7))

  const svgH = PAD_T + PLOT_H + PAD_B
  const minV = Math.min(...pts.map(p => p.value))
  const maxV = Math.max(...pts.map(p => p.value))
  const rawRange = maxV - minV
  const step = rawRange < 0.3 ? 0.1 : rawRange < 0.8 ? 0.2 : rawRange < 2 ? 0.5 : 1
  const yMin = Math.round(Math.floor((minV - step) / step) * step * 10) / 10
  const yMax = Math.round(Math.ceil((maxV + step)  / step) * step * 10) / 10
  const yRange = yMax - yMin

  const gridVals = []
  for (let v = yMin; v <= yMax + 0.0001; v = Math.round((v + step) * 10) / 10) gridVals.push(v)

  const yOf = v => PAD_T + PLOT_H - ((v - yMin) / yRange) * PLOT_H

  const plotAreaW = containerW - PAD_L
  const plotSvgW  = Math.max(allMonths.length * MIN_MONTH_W, plotAreaW)
  const totalMonthSpan = allMonths.length - 1

  // X_PAD で両端を確保 → ラベルが SVG 外にはみ出さない
  const xOfMonth = mk => {
    const idx = allMonths.indexOf(mk)
    if (totalMonthSpan === 0) return plotSvgW / 2
    return X_PAD + (idx / totalMonthSpan) * (plotSvgW - PAD_R - X_PAD * 2)
  }

  const slotW = totalMonthSpan === 0
    ? plotSvgW
    : (plotSvgW - PAD_R - X_PAD * 2) / totalMonthSpan

  const monthGroups = {}
  pts.forEach((p, i) => {
    const mk = p.date.slice(0, 7)
    if (!monthGroups[mk]) monthGroups[mk] = []
    monthGroups[mk].push(i)
  })

  const svgPts = pts.map((p, i) => {
    const mk     = p.date.slice(0, 7)
    const group  = monthGroups[mk]
    const pos    = group.indexOf(i)
    const N      = group.length
    const baseX  = xOfMonth(mk)
    const spread = N > 1 ? Math.min((N - 1) * 8, slotW * 0.6) : 0
    const offset = N === 1 ? 0 : (pos / (N - 1) - 0.5) * spread
    return { ...p, x: baseX + offset, y: yOf(p.value) }
  })

  const polylinePath = svgPts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')

  // X軸ラベル：月のみ表示、年が変わる時だけ年を追加
  const xLabels = []
  const seenYears = new Set()
  for (const mk of allMonths) {
    const [y, m] = mk.split('-')
    const x = xOfMonth(mk)
    if (xLabels.length > 0 && x - xLabels[xLabels.length - 1].x < 24) continue
    const isNewYear = !seenYears.has(y)
    if (isNewYear) seenYears.add(y)
    xLabels.push({ x, label: `${Number(m)}月`, year: y, isNewYear })
  }

  return (
    <div ref={containerRef} className="bg-surface-card rounded-card px-3 pt-3 pb-1">
      <p className="text-sm font-semibold text-neutral-main mb-2">{title}</p>
      <div className="flex">
        {/* Y軸ラベル固定列 */}
        <svg width={PAD_L} height={svgH} style={{ flexShrink: 0, overflow: 'visible' }}>
          {gridVals.map(val => (
            <text key={val} x={PAD_L - 4} y={yOf(val) + 4}
              textAnchor="end" fontSize="10" fill="#374151">
              {val.toFixed(1)} {yUnit}
            </text>
          ))}
        </svg>

        {/* 横スクロール可能なプロットエリア */}
        <div className="weight-graph-scroll"
          style={{ flex: 1, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <svg width={plotSvgW} height={svgH} style={{ display: 'block' }}>
            {/* グリッドライン */}
            {gridVals.map(val => (
              <line key={val}
                x1={0} y1={yOf(val).toFixed(1)}
                x2={plotSvgW} y2={yOf(val).toFixed(1)}
                stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />
            ))}

            {/* 折れ線 */}
            <path d={polylinePath} fill="none"
              stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* データポイント */}
            {svgPts.map((p, i) => (
              <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill={PRIMARY} />
            ))}

            {/* X軸ラベル */}
            {xLabels.map((lb, i) => (
              <g key={i}>
                {/* 月ラベル */}
                <text x={lb.x.toFixed(1)} y={PAD_T + PLOT_H + 14}
                  textAnchor="middle" fontSize="10" fill="#374151">
                  {lb.label}
                </text>
                {/* 年ラベル（年が変わる月のみ） */}
                {lb.isNewYear && (
                  <text x={lb.x.toFixed(1)} y={PAD_T + PLOT_H + 28}
                    textAnchor="middle" fontSize="9" fontWeight="600" fill="#9CA3AF">
                    {lb.year}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}

// ── VomitHeatmap ──────────────────────────────────────
function VomitHeatmap({ catId, onTapTitle }) {
  const vomitCounts = useMemo(() => loadVomitByDate(catId), [catId])
  const today = todayStr()

  // 直近の土曜を末尾に 6 週分生成
  const todayDate = new Date()
  const dow = todayDate.getDay()
  const lastDate = new Date(todayDate)
  lastDate.setDate(todayDate.getDate() + (6 - dow))

  const weeks = []
  for (let w = 5; w >= 0; w--) {
    const week = []
    for (let d = 0; d <= 6; d++) {
      const date = new Date(lastDate)
      date.setDate(lastDate.getDate() - w * 7 - (6 - d))
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      week.push({ dateKey, count: vomitCounts[dateKey] || 0 })
    }
    weeks.push(week)
  }

  // 週ラベル: M/D-D or M/D-M/D（月またぎ）
  function weekLabel(week) {
    const [, fm, fd] = week[0].dateKey.split('-').map(Number)
    const [, lm, ld] = week[6].dateKey.split('-').map(Number)
    return fm === lm ? `${fm}/${fd}-${ld}` : `${fm}/${fd}-${lm}/${ld}`
  }

  const DOW_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const CELL = 30
  const GAP  = 4

  return (
    <div className="bg-surface-card rounded-card p-3">
      {/* タイトル行（タップで一覧へ） */}
      <button
        onClick={onTapTitle}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="text-sm font-semibold text-neutral-main">ゲロ</span>
        <ChevronRight />
      </button>

      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        {/* 週ラベル列 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, paddingTop: CELL + GAP }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{
              height: CELL,
              display: 'flex', alignItems: 'center',
              fontSize: 9, color: '#9CA3AF',
              whiteSpace: 'nowrap',
              width: 44,
            }}>
              {weekLabel(week)}
            </div>
          ))}
        </div>

        {/* 曜日グリッド */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
          {/* 曜日ヘッダー */}
          <div style={{ display: 'flex', gap: GAP }}>
            {DOW_LABELS.map(l => (
              <div key={l} style={{
                width: CELL, height: CELL,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: '#9CA3AF', fontWeight: 500,
              }}>{l}</div>
            ))}
          </div>

          {/* 週ごとの行 */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', gap: GAP }}>
              {week.map((cell, di) => {
                const isFuture  = cell.dateKey > today
                const hasVomit  = !isFuture && cell.count > 0
                const displayNum = isFuture ? '' : String(cell.count)

                return (
                  <div key={di} style={{
                    width: CELL, height: CELL,
                    borderRadius: 6,
                    background: isFuture ? 'transparent' : hasVomit ? '#FFF0F5' : '#F3F4F6',
                    border: `1.5px solid ${hasVomit ? PRIMARY : 'transparent'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600,
                    color: isFuture ? 'transparent' : hasVomit ? PRIMARY : '#9CA3AF',
                  }}>
                    {displayNum}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── DotMenu ───────────────────────────────────────────
function DotMenu({ onProfile, onImportIcs, onImportJson, onExportJson }) {
  const [open, setOpen] = useState(false)

  const close = fn => () => { setOpen(false); fn() }

  const menuItem = (label, fn) => (
    <button
      onClick={close(fn)}
      className="block w-full px-4 py-3 text-left text-sm text-neutral-main hover:bg-[#F9FAFB]"
    >
      {label}
    </button>
  )

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="p-1">
        <img src={moreHorizSvg} width={24} height={24} alt="menu" />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-50" />
          <div className="absolute top-8 right-0 z-60 bg-surface-card rounded-btn shadow-[0_4px_24px_rgba(0,0,0,0.12)] min-w-[220px] overflow-hidden">
            {menuItem('プロフィール', onProfile)}
            <div className="border-t border-[#E5E7EB]" />
            {menuItem('データの取り込み（.ics）', onImportIcs)}
            {menuItem('インポート（JSON）', onImportJson)}
            {menuItem('エクスポート（JSON）', onExportJson)}
          </div>
        </>
      )}
    </div>
  )
}

// ── CatDashboard ──────────────────────────────────────
export default function CatDashboard({ cat, cats, onBack, onSaveCat }) {
  const [showProfileModal, setShowProfileModal] = useState(false)

  const weightPts   = useMemo(() => loadWeight(cat.id), [cat.id])
  const phPts       = useMemo(() => loadPh(cat.id), [cat.id])
  const latestWeight = weightPts.length > 0 ? weightPts[weightPts.length - 1] : null

  const hospitalVisits     = useMemo(() => loadHospitalVisits(cat.id), [cat.id])
  const hospitals          = useMemo(() => loadHospitals(), [])
  const latestVisit        = hospitalVisits.length > 0 ? hospitalVisits[0] : null
  const latestHospitalName = latestVisit
    ? (hospitals.find(h => String(h.id) === String(latestVisit.hospitalId))?.name || '不明')
    : null

  const handleSaveProfile = (updatedCat, photo) => {
    onSaveCat(updatedCat, photo)
    setShowProfileModal(false)
  }

  const handleImportIcs  = () => console.log('TODO: データの取り込み（.ics）')
  const handleImportJson = () => console.log('TODO: インポート（JSON）')
  const handleExportJson = () => console.log('TODO: エクスポート（JSON）')

  return (
    <div className="h-dvh flex flex-col bg-surface-bg overflow-hidden">

      {/* ── ヘッダー ── */}
      <div className="relative flex items-center justify-center h-[52px] shrink-0 bg-surface-card border-b border-[#E5E7EB]">
        <button onClick={onBack} className="absolute left-3 flex items-center p-1">
          <img src={arrowBackSvg} width={24} height={24} alt="back" />
        </button>
        <span className="text-[17px] font-bold text-neutral-main">{cat.name}</span>
        <div className="absolute right-3">
          <DotMenu
            onProfile={() => setShowProfileModal(true)}
            onImportIcs={handleImportIcs}
            onImportJson={handleImportJson}
            onExportJson={handleExportJson}
          />
        </div>
      </div>

      {/* ── スクロールエリア ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 flex flex-col gap-4">

        {/* 体重グラフ + 前回測定行 */}
        <div className="flex flex-col gap-2">
          <LineGraph pts={weightPts} yUnit="kg" title="体重" />

          {/* セクションラベル */}
          <p className="text-xs text-neutral-muted px-1">前回の体重測定</p>

          {/* 前回体重行 */}
          <div className="bg-surface-card rounded-card overflow-hidden">
            {latestWeight ? (
              <button className="flex items-center w-full px-4 py-3 gap-3">
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <WeightIcon />
                </div>
                <span className="text-sm font-semibold text-neutral-main">
                  {formatDate(latestWeight.date)}
                </span>
                <span className="flex-1" />
                <span className="text-sm font-semibold text-neutral-main">
                  {latestWeight.value.toFixed(1)} kg
                </span>
                <ChevronRight />
              </button>
            ) : (
              <p className="text-sm text-neutral-muted px-4 py-3">記録がありません</p>
            )}
          </div>
        </div>

        {/* 尿検査 pH グラフ + 前回動物病院受診行 */}
        <div className="flex flex-col gap-2">
          <LineGraph pts={phPts} yUnit="pH" title="尿検査 pH" />

          {/* セクションラベル */}
          <p className="text-xs text-neutral-muted px-1">前回動物病院受診</p>

          {/* 前回病院行 */}
          <div className="bg-surface-card rounded-card overflow-hidden">
            {latestVisit ? (
              <button className="flex items-center w-full px-4 py-3 gap-3">
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <HospitalIcon />
                </div>
                <span className="text-sm font-semibold text-neutral-main">
                  {formatDate(latestVisit.date)}
                </span>
                <span className="flex-1" />
                <span className="text-sm text-neutral-body">
                  {latestHospitalName}
                </span>
                <ChevronRight />
              </button>
            ) : (
              <p className="text-sm text-neutral-muted px-4 py-3">記録がありません</p>
            )}
          </div>
        </div>

        {/* ゲロヒートマップ */}
        <VomitHeatmap catId={cat.id} onTapTitle={() => {}} />

      </div>

      {/* プロフィール編集モーダル */}
      {showProfileModal && (
        <CatFormModal
          cat={cat}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  )
}
