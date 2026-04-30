import { useState, useMemo, useRef, useCallback } from 'react'
import CatFormModal              from '../components/CatFormModal.jsx'
import DailyHospitalSheet        from '../components/DailyHospitalSheet.jsx'
import HospitalVisitDetailScreen from './HospitalVisitDetailScreen.jsx'
import arrowBackSvg  from '../assets/icons/arrow_back.svg'
import moreHorizSvg  from '../assets/icons/more_horiz.svg'
import tuneSvg       from '../assets/icons/tune.svg'
import weightSvg     from '../assets/icons/weight.svg'
import poopSvg       from '../assets/icons/poop.svg'
import peeSvg        from '../assets/icons/pee.svg'
import vomitSvg      from '../assets/icons/vomit.svg'
import hospitalSvg   from '../assets/icons/hospital.svg'

const PRIMARY      = '#EA5EAD'
const LS_WEIGHT    = 'cathealth_daily_weight'
const LS_POOP      = 'cathealth_poop_records'
const LS_PEE       = 'cathealth_daily_pee'
const LS_VOMIT     = 'cathealth_daily_vomit'
const LS_HOSPITAL  = 'cathealth_daily_hospital'
const LS_HOSPITALS = 'cathealth_hospitals'
const LS_EXAM      = 'cathealth_exam_results'
const lsPhotoKey   = id => `cathealth_photo_${id}`

// ── ユーティリティ ────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// YYYY-MM-DD → YYYY/M/D
function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${y}/${m}/${d}`
}

// ── データ読み込み ────────────────────────────────────
function loadAllRecords(catId) {
  const records = []
  const push = (type, arr) =>
    arr.filter(r => r.catId === catId).forEach(r =>
      records.push({ type, date: r.date, id: r.id, data: r }))
  try { push('weight',   JSON.parse(localStorage.getItem(LS_WEIGHT)   || '[]')) } catch { /* ignore */ }
  try { push('poop',     JSON.parse(localStorage.getItem(LS_POOP)     || '[]')) } catch { /* ignore */ }
  try { push('pee',      JSON.parse(localStorage.getItem(LS_PEE)      || '[]')) } catch { /* ignore */ }
  try { push('vomit',    JSON.parse(localStorage.getItem(LS_VOMIT)    || '[]')) } catch { /* ignore */ }
  try { push('hospital', JSON.parse(localStorage.getItem(LS_HOSPITAL) || '[]')) } catch { /* ignore */ }
  return records.sort((a, b) =>
    b.date !== a.date ? b.date.localeCompare(a.date) : (b.id || '').localeCompare(a.id || ''))
}

function loadHospitals() {
  try { return JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]') } catch { return [] }
}

function loadLs(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

// ── エクスポート ──────────────────────────────────────
function exportCatData(cat) {
  const data = {
    catId:      cat.id,
    catName:    cat.name,
    exportDate: todayStr(),
    weight:     loadLs(LS_WEIGHT).filter(r => r.catId === cat.id),
    poop:       loadLs(LS_POOP).filter(r => r.catId === cat.id),
    pee:        loadLs(LS_PEE).filter(r => r.catId === cat.id),
    vomit:      loadLs(LS_VOMIT).filter(r => r.catId === cat.id),
    hospital:   loadLs(LS_HOSPITAL).filter(r => r.catId === cat.id),
    exam:       loadLs(LS_EXAM).filter(r => r.catId === cat.id),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `${cat.name}_export_${todayStr()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── インポート（JSON）────────────────────────────────
function importCatDataJson(jsonText, cat) {
  const data = JSON.parse(jsonText)
  const pairs = [
    { key: 'weight',   ls: LS_WEIGHT   },
    { key: 'poop',     ls: LS_POOP     },
    { key: 'pee',      ls: LS_PEE      },
    { key: 'vomit',    ls: LS_VOMIT    },
    { key: 'hospital', ls: LS_HOSPITAL },
    { key: 'exam',     ls: LS_EXAM     },
  ]
  pairs.forEach(({ key, ls }) => {
    const incoming = data[key] || []
    if (!incoming.length) return
    const existing = loadLs(ls)
    const incomingDates = new Set(incoming.map(r => r.date))
    // 同じcatId・日付の既存レコードを削除してから追加
    const filtered = existing.filter(r => r.catId !== cat.id || !incomingDates.has(r.date))
    localStorage.setItem(ls, JSON.stringify([...filtered, ...incoming]))
  })
}

// ── ICS インポート ────────────────────────────────────
const HOSPITAL_KEYWORDS = ['病院', '診察', '健康診断', '尿検査', '血液検査', 'ワクチン', '検査', '通院']
const CONTENT_OPTS      = ['健康診断', '尿検査', '血液検査', 'ワクチン', 'その他']

function parseIcs(text) {
  // 折り返し行を結合（RFC5545: continuation lines start with SPACE or TAB）
  const unfolded = text
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '')

  const events = []
  const blocks = unfolded.split('BEGIN:VEVENT')
  for (let i = 1; i < blocks.length; i++) {
    const lines = blocks[i].split('\n')
    let date = null, summary = null
    for (const line of lines) {
      if (/^DTSTART/i.test(line)) {
        const val = line.split(':').slice(1).join(':').trim()
        const dateOnly = val.replace(/T.*/,'').replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3')
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) date = dateOnly
      } else if (/^SUMMARY/i.test(line)) {
        summary = line.split(':').slice(1).join(':').trim()
      }
    }
    if (date && summary) events.push({ date, summary })
  }
  return events
}

function importCatDataIcs(text, cat) {
  const events = parseIcs(text)
  const catName = cat.name

  const newWeights   = []
  const newExams     = []
  const newHospitals = []

  for (const { date, summary } of events) {
    if (!summary.includes(catName)) continue

    const hasPh = /[pP][hH]/.test(summary)
    const kgMatch = !hasPh && summary.match(/(\d+\.?\d*)\s*kg/i)

    if (kgMatch) {
      // ── 体重 ──
      const weight = parseFloat(kgMatch[1])
      if (weight > 0) {
        newWeights.push({ id: genId(), catId: cat.id, date, weight, photo: null })
      }
    } else if (hasPh) {
      // ── 尿検査（pH）→ 通院記録 + 検査結果 ──
      const phMatch = summary.match(/[pP][hH]\s*(\d+\.?\d*)/)
      const ph = phMatch ? String(parseFloat(phMatch[1])) : ''
      newHospitals.push({
        id: genId(), catId: cat.id, date,
        hospitalId: '', contents: ['尿検査'], contentMemo: '', memo: summary,
      })
      newExams.push({
        id: genId(), catId: cat.id, date,
        urine: { ph }, blood: {},
        urinePhoto: null, bloodPhoto: null, urineMemo: '', bloodMemo: '',
      })
    } else {
      // ── その他 → 通院記録 ──
      const hasHospital = HOSPITAL_KEYWORDS.some(kw => summary.includes(kw))
      if (hasHospital) {
        const contents = CONTENT_OPTS.filter(c => summary.includes(c))
        newHospitals.push({
          id: genId(), catId: cat.id, date,
          hospitalId: '', contents, contentMemo: '', memo: summary,
        })
      }
    }
  }

  // 同日上書きで保存
  function mergeSave(ls, items) {
    if (!items.length) return
    const existing = loadLs(ls)
    const dates = new Set(items.map(r => r.date))
    const filtered = existing.filter(r => r.catId !== cat.id || !dates.has(r.date))
    localStorage.setItem(ls, JSON.stringify([...filtered, ...items]))
  }

  mergeSave(LS_WEIGHT,   newWeights)
  mergeSave(LS_HOSPITAL, newHospitals)
  mergeSave(LS_EXAM,     newExams)

  return newWeights.length + newExams.length + newHospitals.length
}

// ── アイコン定数 ──────────────────────────────────────
const TYPE_LABEL = { weight:'体重', poop:'うんち', pee:'おしっこ', vomit:'ゲロ', hospital:'通院記録' }
const TYPE_ICON  = { weight:weightSvg, poop:poopSvg, pee:peeSvg, vomit:vomitSvg, hospital:hospitalSvg }

// ── ChevronRight ──────────────────────────────────────
function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="#9CA3AF"/>
    </svg>
  )
}

// ── FilterPanel ───────────────────────────────────────
const FILTER_TYPES = ['weight', 'poop', 'pee', 'vomit', 'hospital']

function FilterPanel({ filters, onChange, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500 }} />
      <div style={{
        position: 'absolute', top: 44, right: 0, zIndex: 600,
        background: '#FFFFFF', borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        minWidth: 160, overflow: 'hidden',
      }}>
        {FILTER_TYPES.map((type, i) => {
          const checked = filters[type]
          return (
            <button
              key={type}
              onClick={() => onChange(type, !checked)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '12px 16px',
                background: 'none', border: 'none',
                borderTop: i > 0 ? '1px solid #F0F0F0' : 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                border: checked ? 'none' : '1.5px solid #D1D5DB',
                background: checked ? PRIMARY : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {checked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#FFFFFF"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 14, color: '#0F172A' }}>{TYPE_LABEL[type]}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

// ── DotMenu ───────────────────────────────────────────
function DotMenu({ onProfile, onExport, onImportJson, onImportIcs, onClose }) {
  const items = [
    { label: 'プロフィール',             action: onProfile,   enabled: true },
    { label: 'データの取り込み（.ics）', action: onImportIcs, enabled: true },
    { label: 'インポート（JSON）',        action: onImportJson,enabled: true },
    { label: 'エクスポート（JSON）',      action: onExport,    enabled: true },
  ]
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500 }} />
      <div style={{
        position: 'absolute', top: 52, right: 8, zIndex: 600,
        background: '#FFFFFF', borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        minWidth: 200, overflow: 'hidden',
      }}>
        {items.map((item, i) => (
          <button
            key={item.label}
            onClick={() => { item.action?.(); onClose() }}
            style={{
              display: 'block', width: '100%', padding: '13px 16px',
              background: 'none', border: 'none',
              borderTop: i > 0 ? '1px solid #F0F0F0' : 'none',
              cursor: 'pointer', textAlign: 'left', fontSize: 14, color: '#0F172A',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  )
}

// ── RecordRow ─────────────────────────────────────────
function RecordRow({ record, hospitals, onHospitalClick }) {
  const { type, date, data } = record

  function getRight() {
    if (type === 'weight') {
      return (
        <span style={{ fontSize: 15, color: '#0F172A' }}>
          {data.weight != null ? `${data.weight}` : '—'}
          <span style={{ fontSize: 13, color: '#9CA3AF', marginLeft: 2 }}>kg</span>
        </span>
      )
    }
    if (type === 'poop' || type === 'pee') {
      return <span style={{ fontSize: 14, color: '#0F172A' }}>{data.condition || '—'}</span>
    }
    if (type === 'vomit') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {data.photo && (
            <img src={data.photo} alt=""
              style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
          )}
          <span style={{ fontSize: 14, color: '#0F172A' }}>{data.condition || '—'}</span>
          <ChevronRight />
        </div>
      )
    }
    if (type === 'hospital') {
      const hosp = hospitals.find(h => h.id === data.hospitalId)
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 14, color: '#0F172A' }}>{hosp?.name || '—'}</span>
          <ChevronRight />
        </div>
      )
    }
    return null
  }

  return (
    <div
      onClick={type === 'hospital' ? () => onHospitalClick(data) : undefined}
      style={{
        background: '#FFFFFF', borderRadius: 12, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        cursor: type === 'hospital' ? 'pointer' : 'default',
      }}
    >
      <img src={TYPE_ICON[type]} width={20} height={20} alt={TYPE_LABEL[type]} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 14, color: '#374151', flexShrink: 0 }}>{formatDate(date)}</span>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {getRight()}
      </div>
    </div>
  )
}

// ── CatDetailScreen ───────────────────────────────────
export default function CatDetailScreen({ cat: initialCat, cats, onBack, onSaveCat }) {
  const [cat,           setCat]           = useState(initialCat)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDotMenu,   setShowDotMenu]   = useState(false)
  const [showFilter,    setShowFilter]    = useState(false)
  const [filters, setFilters] = useState({
    weight: true, poop: true, pee: true, vomit: true, hospital: true,
  })
  const [message, setMessage] = useState(null)        // { text, isError }
  const [listKey, setListKey] = useState(0)           // 一覧再描画用

  // 通院記録詳細画面
  const [hospitalVisitRecord, setHospitalVisitRecord] = useState(null)

  // 動物病院受診シート（詳細画面内からの編集用に残す）
  const [showHospitalSheet,     setShowHospitalSheet]     = useState(false)
  const [editingHospitalRecord, setEditingHospitalRecord] = useState(null)
  const [hospitalSheetKey,      setHospitalSheetKey]      = useState(0)

  // hidden file inputs
  const jsonInputRef = useRef(null)
  const icsInputRef  = useRef(null)

  const hospitals      = useMemo(loadHospitals, [])
  const allRecords     = useMemo(() => loadAllRecords(cat.id), [cat.id, listKey]) // eslint-disable-line
  const filteredRecords = useMemo(
    () => allRecords.filter(r => filters[r.type]),
    [allRecords, filters]
  )

  function showMsg(text, isError = false) {
    setMessage({ text, isError })
    setTimeout(() => setMessage(null), 3000)
  }

  function handleFilterChange(type, value) {
    setFilters(prev => ({ ...prev, [type]: value }))
  }

  function handleSaveCat(updatedCat, photo) {
    if (photo) localStorage.setItem(lsPhotoKey(updatedCat.id), photo)
    const withPhoto = {
      ...updatedCat,
      photo: photo ?? localStorage.getItem(lsPhotoKey(updatedCat.id)) ?? cat.photo,
    }
    setCat(withPhoto)
    onSaveCat?.(updatedCat, photo)
    setShowEditModal(false)
  }

  // ── エクスポート ──
  function handleExport() {
    exportCatData(cat)
  }

  // ── インポート（JSON）──
  function handleJsonImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        importCatDataJson(ev.target.result, cat)
        setListKey(k => k + 1)
        showMsg('インポートが完了しました')
      } catch {
        showMsg('ファイルの読み込みに失敗しました', true)
      }
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  // ── ICS インポート ──
  function handleIcsFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const count = importCatDataIcs(ev.target.result, cat)
        setListKey(k => k + 1)
        showMsg(`${count}件取り込みました`)
      } catch {
        showMsg('ファイルの読み込みに失敗しました', true)
      }
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  function openHospitalVisitDetail(record) {
    setHospitalVisitRecord(record)
  }

  function openHospitalSheet(record) {
    setEditingHospitalRecord(record)
    setShowHospitalSheet(true)
  }

  function closeHospitalSheet() {
    setShowHospitalSheet(false)
    setEditingHospitalRecord(null)
    setHospitalSheetKey(k => k + 1)
    setListKey(k => k + 1)   // 保存後に記録一覧を再読み込み
  }

  // 通院記録詳細画面
  if (hospitalVisitRecord) {
    return (
      <HospitalVisitDetailScreen
        cat={cat}
        hospitalRecord={hospitalVisitRecord}
        onBack={() => setHospitalVisitRecord(null)}
      />
    )
  }

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: '#F7F7F7', overflow: 'hidden',
    }}>

      {/* hidden file inputs */}
      <input ref={jsonInputRef} type="file" accept=".json" onChange={handleJsonImportFile}
        style={{ display: 'none' }} />
      <input ref={icsInputRef}  type="file" accept=".ics"  onChange={handleIcsFile}
        style={{ display: 'none' }} />

      {/* ── 固定ヘッダー ── */}
      <header style={{
        position: 'relative', flexShrink: 0,
        background: '#FFFFFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 60, padding: '0 16px',
      }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute', left: 8,
            width: 44, height: 44, borderRadius: '50%',
            border: 'none', background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img src={arrowBackSvg} width={24} height={24} alt="戻る" />
        </button>

        <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{cat.name}</span>

        <div style={{ position: 'absolute', right: 8 }}>
          <button
            onClick={() => { setShowDotMenu(v => !v); setShowFilter(false) }}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <img src={moreHorizSvg} width={24} height={24} alt="メニュー" />
          </button>
          {showDotMenu && (
            <DotMenu
              onProfile={() => setShowEditModal(true)}
              onExport={handleExport}
              onImportJson={() => jsonInputRef.current?.click()}
              onImportIcs={() => icsInputRef.current?.click()}
              onClose={() => setShowDotMenu(false)}
            />
          )}
        </div>
      </header>

      {/* ── スクロール領域 ── */}
      <div className="daily-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>

        {/* トーストメッセージ */}
        {message && (
          <div style={{
            margin: '12px 16px 0',
            padding: '12px 16px',
            borderRadius: 10,
            background: message.isError ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${message.isError ? '#FCA5A5' : '#BBF7D0'}`,
            fontSize: 14,
            color: message.isError ? '#EF4444' : '#16A34A',
          }}>
            {message.text}
          </div>
        )}

        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* フィルターボタン */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
            <button
              onClick={() => { setShowFilter(v => !v); setShowDotMenu(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                height: 36, padding: '0 12px',
                background: showFilter ? '#FFF0F5' : '#FFFFFF',
                borderRadius: 8,
                border: `1px solid ${showFilter ? PRIMARY : '#E5E7EB'}`,
                cursor: 'pointer',
              }}
            >
              <img src={tuneSvg} width={18} height={18} alt="フィルター" />
              <span style={{ fontSize: 13, color: showFilter ? PRIMARY : '#374151' }}>フィルター</span>
            </button>
            {showFilter && (
              <FilterPanel
                filters={filters}
                onChange={handleFilterChange}
                onClose={() => setShowFilter(false)}
              />
            )}
          </div>

          {/* 記録一覧 */}
          {filteredRecords.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', fontSize: 14, color: '#9CA3AF' }}>
              記録がありません
            </div>
          ) : (
            filteredRecords.map(record => (
              <RecordRow
                key={`${record.type}-${record.id}`}
                record={record}
                hospitals={hospitals}
                onHospitalClick={openHospitalVisitDetail}
              />
            ))
          )}

        </div>
      </div>

      {/* 猫編集モーダル */}
      {showEditModal && (
        <CatFormModal
          initialCat={cat}
          onSave={handleSaveCat}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* 動物病院受診シート */}
      {showHospitalSheet && editingHospitalRecord && (
        <DailyHospitalSheet
          key={hospitalSheetKey}
          cats={cats}
          catId={editingHospitalRecord.catId}
          selectedDate={editingHospitalRecord.date}
          initialRecord={editingHospitalRecord}
          onClose={closeHospitalSheet}
          onSave={closeHospitalSheet}
          onDelete={closeHospitalSheet}
        />
      )}

    </div>
  )
}
