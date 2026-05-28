import { useState, useRef } from 'react'
import DatePill from '../components/DatePill.jsx'
import TimePill from '../components/TimePill.jsx'

const LS_HOSPITALS     = 'cathealth_hospitals'
const LS_VISIT_RECORDS = 'cathealth_visit_records'

const FREQ_OPTIONS = [
  { value: 'once',   label: '1日1回' },
  { value: 'twice',  label: '毎日2回（朝夜）' },
  { value: 'three',  label: '1日3回' },
  { value: 'every2', label: '2日に1回' },
  { value: 'weekly', label: '週1回' },
  { value: 'other',  label: 'その他' },
]

const UNIT_OPTIONS = [
  { value: 'ml', label: 'ml' },
  { value: '錠', label: '錠' },
  { value: '粒', label: '粒' },
  { value: 'g',  label: 'g' },
  { value: '滴', label: '滴' },
]

const END_OPTIONS = [
  { value: 'forever',  label: '変更するまで継続' },
  { value: 'improved', label: '症状が改善されるまで' },
  { value: 'stop',     label: '終了する' },
]

const NEXT_VISIT_OPTIONS = [
  { value: '1w', label: '1週間後' },
  { value: '2w', label: '2週間後' },
  { value: '1m', label: '1ヶ月後' },
  { value: '2m', label: '2ヶ月後' },
  { value: '3m', label: '3ヶ月後' },
  { value: '6m', label: '6ヶ月後' },
  { value: '1y', label: '1年後' },
]

const VISIT_TYPES = [
  { key: 'checkup', label: '健康診断' },
  { key: 'urine',   label: '尿検査' },
  { key: 'blood',   label: '血液検査' },
  { key: 'vaccine', label: 'ワクチン' },
  { key: 'other',   label: 'その他' },
]

const URINE_PRIMARY = [
  { key: 'sg',      abbr: 'SG / USG',     name: '尿比重',     ref: '1.035-1.050', type: 'numeric', min: 1.035, max: 1.050 },
  { key: 'ph',      abbr: 'pH',            name: '',           ref: '4.8-7.5',     type: 'numeric', min: 4.8,   max: 7.5   },
  { key: 'protein', abbr: '蛋白',          name: '尿タンパク', ref: '±',           type: 'select',  options: ['-', '±', '+', '2+', '3+'], normalVals: ['-', '±'] },
  { key: 'bld',     abbr: 'BLD / BLD/ER', name: '潜血',       ref: '-',           type: 'select',  options: ['-', '+/-', '+', '2+', '3+'], normalVals: ['-'] },
]

const URINE_SECONDARY = [
  { key: 'wbc',     abbr: 'WBC',          name: '白血球',           ref: '-',  type: 'select', options: ['-', '+/-', '+', '2+', '3+'], normalVals: ['-'] },
  { key: 'rbc_u',   abbr: 'RBC',          name: '赤血球',           ref: '-',  type: 'select', options: ['-', '+/-', '+', '2+', '3+'], normalVals: ['-'] },
  { key: 'bacteria',abbr: 'Bacteria',     name: '細菌',             ref: '-',  type: 'select', options: ['-', '+/-', '+', '2+', '3+'], normalVals: ['-'] },
  { key: 'nitrite', abbr: 'Nitrite',      name: '亜硝酸',           ref: '-',  type: 'select', options: ['-', '+/-', '+'], normalVals: ['-'] },
  { key: 'ketone',  abbr: 'Ketone',       name: 'ケトン',           ref: '-',  type: 'select', options: ['-', '+/-', '+', '2+', '3+'], normalVals: ['-'] },
  { key: 'bili',    abbr: 'Bilirubin',    name: 'ビリルビン',       ref: '-',  type: 'select', options: ['-', '+/-', '+', '2+', '3+'], normalVals: ['-'] },
  { key: 'ubg',     abbr: 'Urobilinogen', name: 'ウロビリノーゲン', ref: '±',  type: 'select', options: ['-', '±', '+', '2+', '3+'], normalVals: ['-', '±'] },
  { key: 'glucose_u',abbr: 'Glucose',     name: '尿糖',             ref: '-',  type: 'select', options: ['-', '+/-', '+', '2+', '3+'], normalVals: ['-'] },
]

const BLOOD_PRIMARY = [
  { key: 'glu',     abbr: 'GLU',      name: 'グルコース',              ref: '71-159',  type: 'numeric', min: 71,   max: 159   },
  { key: 'crea',    abbr: 'CREA',     name: 'クレアチニン',            ref: '0.8-2.4', type: 'numeric', min: 0.8,  max: 2.4   },
  { key: 'bun',     abbr: 'BUN',      name: '尿素窒素',                ref: '16-36',   type: 'numeric', min: 16,   max: 36    },
  { key: 'buncrea', abbr: 'BUN/CREA', name: '尿素窒素/クレアチニン比', ref: '10-30',   type: 'numeric', min: 10,   max: 30    },
  { key: 'sdma',    abbr: 'SDMA',     name: '対称性ジメチルアルギニン', ref: '0-14',   type: 'numeric', min: 0,    max: 14    },
]

const BLOOD_SECONDARY = [
  { key: 'tp',   abbr: 'TP',   name: '総タンパク',     ref: '5.7-8.9',   type: 'numeric', min: 5.7,  max: 8.9   },
  { key: 'alb',  abbr: 'ALB',  name: 'アルブミン',     ref: '2.6-3.9',   type: 'numeric', min: 2.6,  max: 3.9   },
  { key: 'alt',  abbr: 'ALT',  name: '肝酵素',         ref: '12-130',    type: 'numeric', min: 12,   max: 130   },
  { key: 'alp',  abbr: 'ALP',  name: 'アルカリフォスファターゼ', ref: '14-111', type: 'numeric', min: 14, max: 111 },
  { key: 'ast',  abbr: 'AST',  name: 'アスパラギン酸',  ref: '0-48',     type: 'numeric', min: 0,    max: 48    },
  { key: 'chol', abbr: 'CHOL', name: 'コレステロール',  ref: '77-258',    type: 'numeric', min: 77,   max: 258   },
  { key: 'ca',   abbr: 'Ca',   name: 'カルシウム',      ref: '8.2-11.8',  type: 'numeric', min: 8.2,  max: 11.8  },
  { key: 'p',    abbr: 'P',    name: 'リン',            ref: '3.1-7.5',   type: 'numeric', min: 3.1,  max: 7.5   },
  { key: 'k',    abbr: 'K',    name: 'カリウム',        ref: '3.5-5.8',   type: 'numeric', min: 3.5,  max: 5.8   },
  { key: 'na',   abbr: 'Na',   name: 'ナトリウム',      ref: '149-164',   type: 'numeric', min: 149,  max: 164   },
  { key: 'hct',  abbr: 'HCT',  name: 'ヘマトクリット',  ref: '30-52',     type: 'numeric', min: 30,   max: 52    },
  { key: 'hgb',  abbr: 'HGB',  name: 'ヘモグロビン',    ref: '9.8-16.2',  type: 'numeric', min: 9.8,  max: 16.2  },
  { key: 'rbc',  abbr: 'RBC',  name: '赤血球数',        ref: '5.35-10.35',type: 'numeric', min: 5.35, max: 10.35 },
  { key: 'wbc_b',abbr: 'WBC',  name: '白血球数',        ref: '2.87-17.02',type: 'numeric', min: 2.87, max: 17.02 },
  { key: 'plt',  abbr: 'PLT',  name: '血小板',          ref: '151-600',   type: 'numeric', min: 151,  max: 600   },
]

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function loadHospitals() {
  try { return JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]') } catch { return [] }
}

function saveRecord(record) {
  try {
    const prev = JSON.parse(localStorage.getItem(LS_VISIT_RECORDS) || '[]')
    const exists = prev.some(r => r.id === record.id)
    const next = exists ? prev.map(r => r.id === record.id ? record : r) : [...prev, record]
    localStorage.setItem(LS_VISIT_RECORDS, JSON.stringify(next))
  } catch {}
}

function isOutOfRange(item, value) {
  if (!value && value !== 0) return false
  if (item.type === 'numeric') {
    const n = parseFloat(value)
    return !isNaN(n) && (n < item.min || n > item.max)
  }
  if (item.type === 'select' && item.normalVals) {
    return value !== '' && !item.normalVals.includes(value)
  }
  return false
}

// ── Icons ────────────────────────────────────────────────────
function ArrowForwardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-primary flex-shrink-0">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z"/>
    </svg>
  )
}

function ChevronUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-primary flex-shrink-0">
      <path d="M12 10.8L7.4 15.4L6 14L12 8L18 14L16.6 15.4L12 10.8Z"/>
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-primary">
      <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="currentColor"/>
    </svg>
  )
}


function ExpandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-text-primary flex-shrink-0">
      <path d="M12 22L6 16L7.425 14.575L12 19.15L16.575 14.575L18 16L12 22ZM7.45 9.4L6 8L12 2L18 8L16.55 9.4L12 4.85L7.45 9.4Z"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-text-placeholder">
      <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"/>
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#C3C3C3]">
      <path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z"/>
    </svg>
  )
}

// ── SectionLabel ─────────────────────────────────────────────
function SectionLabel({ label }) {
  return <p className="text-sm font-medium text-text-primary mb-2 px-1">{label}</p>
}

// ── PrescriptionCard ──────────────────────────────────────────
function PrescriptionCard({ rx, onChange, onRemove }) {
  function set(field, value) { onChange({ ...rx, [field]: value }) }
  const freqLabel = FREQ_OPTIONS.find(o => o.value === rx.frequency)?.label ?? ''
  const unitLabel = UNIT_OPTIONS.find(o => o.value === rx.unit)?.label ?? 'ml'
  const endLabel  = END_OPTIONS.find(o => o.value === rx.endDate)?.label ?? ''

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* 薬の名前 */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-[rgba(0,0,0,0.15)]">
        <span className="text-sm font-normal text-text-primary w-20 flex-shrink-0">薬の名前</span>
        <input
          type="text"
          value={rx.name}
          onChange={e => set('name', e.target.value)}
          placeholder="入力してください"
          className="flex-1 text-sm font-normal text-text-primary placeholder:text-text-placeholder bg-transparent outline-none text-right"
        />
      </div>
      {/* 頻度 */}
      <div className="relative flex items-center gap-3 py-3 px-4 border-b border-[rgba(0,0,0,0.15)]">
        <span className="text-sm font-normal text-text-primary w-20 flex-shrink-0">頻度</span>
        <div className="flex-1 flex items-center justify-end gap-2">
          <span className={`text-sm font-normal ${rx.frequency ? 'text-text-primary' : 'text-text-placeholder'}`}>
            {freqLabel || '選んでください'}
          </span>
          <ExpandIcon />
        </div>
        <select value={rx.frequency} onChange={e => set('frequency', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full">
          <option value="" disabled>選んでください</option>
          {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {/* 量 */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-[rgba(0,0,0,0.15)]">
        <span className="text-sm font-normal text-text-primary w-20 flex-shrink-0">量</span>
        <div className="flex-1 flex items-center justify-end gap-3">
          <div className="bg-[#F3F2EF] rounded-full px-3 py-1">
            <input
              type="number"
              inputMode="decimal"
              value={rx.amount}
              onChange={e => set('amount', e.target.value)}
              className="w-14 text-right text-sm font-normal text-text-primary bg-transparent outline-none"
            />
          </div>
          <div className="relative flex items-center gap-1">
            <span className="text-sm font-normal text-text-primary">{unitLabel}</span>
            <ExpandIcon />
            <select value={rx.unit} onChange={e => set('unit', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full">
              {UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>
      {/* 投薬開始 */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-[rgba(0,0,0,0.15)]">
        <span className="text-sm font-normal text-text-primary w-20 flex-shrink-0">投薬開始</span>
        <div className="flex-1 flex items-center justify-end">
          <DatePill value={rx.startDate} onChange={v => set('startDate', v)} />
        </div>
      </div>
      {/* 投薬終了 */}
      <div className="relative flex items-center gap-3 py-3 px-4 border-b border-[rgba(0,0,0,0.15)]">
        <span className="text-sm font-normal text-text-primary w-20 flex-shrink-0">投薬終了</span>
        <div className="flex-1 flex items-center justify-end gap-2">
          <span className={`text-sm font-normal ${rx.endDate ? 'text-text-primary' : 'text-text-placeholder'}`}>
            {endLabel || '選んでください'}
          </span>
          <ExpandIcon />
        </div>
        <select value={rx.endDate} onChange={e => set('endDate', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full">
          <option value="" disabled>選んでください</option>
          {END_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {/* 処方メモ */}
      <div className="py-3 px-4 border-b border-[rgba(0,0,0,0.15)]">
        <input
          type="text"
          value={rx.memo}
          onChange={e => set('memo', e.target.value)}
          placeholder="処方メモ"
          className="w-full text-sm font-normal text-text-primary placeholder:text-text-placeholder bg-transparent outline-none"
        />
      </div>
      {/* 削除 */}
      <button
        onClick={onRemove}
        className="w-full flex items-center justify-center gap-2 py-3 bg-transparent border-0 cursor-pointer"
      >
        <TrashIcon />
        <span className="text-sm font-normal text-text-placeholder">削除する</span>
      </button>
    </div>
  )
}

// ── TestItemRow ───────────────────────────────────────────────
function TestItemRow({ item, value, onChange }) {
  const outOfRange = isOutOfRange(item, value)
  const valColor = outOfRange ? 'text-error' : 'text-text-primary'

  return (
    <div className="flex items-center border-b border-[rgba(0,0,0,0.15)] py-3 px-4 gap-2">
      <div className="w-28 flex-shrink-0">
        <p className="text-sm font-bold text-text-primary leading-tight">{item.abbr}</p>
        {item.name && <p className="text-xs font-normal text-text-secondary leading-tight mt-0.5">{item.name}</p>}
      </div>
      <div className="flex-1 text-xs font-normal text-text-placeholder text-center">{item.ref}</div>
      <div className="w-20 flex-shrink-0 flex justify-end">
        {item.type === 'numeric' ? (
          <input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full text-right text-sm font-normal ${valColor} bg-transparent outline-none`}
          />
        ) : (
          <div className="relative flex items-center gap-1">
            <span className={`text-sm font-normal ${value ? valColor : 'text-text-placeholder'}`}>
              {value || '-'}
            </span>
            <ExpandIcon />
            <select
              value={value}
              onChange={e => onChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            >
              <option value="">-</option>
              {item.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

// ── PhotoArea ─────────────────────────────────────────────────
function PhotoArea({ photos, onChange }) {
  const inputRef = useRef(null)

  function handleFile(e) {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => onChange(prev => [...prev, ev.target.result])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  return (
    <div className="py-3 px-4 flex gap-2 flex-wrap">
      {photos.map((src, i) => (
        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[rgba(0,0,0,0.15)] flex-shrink-0">
          <img src={src} alt="" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange(prev => prev.filter((_, idx) => idx !== i))}
            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center border-0 cursor-pointer"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={() => inputRef.current?.click()}
        className="w-16 h-16 rounded-lg border border-dashed border-[rgba(0,0,0,0.15)] flex items-center justify-center bg-[#F7F7F7] cursor-pointer flex-shrink-0"
        style={{ borderStyle: 'dashed' }}
      >
        <CameraIcon />
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── TestSection ───────────────────────────────────────────────
function TestSection({ label, primaryItems, secondaryItems, items, onItemChange, photos, onPhotosChange, memo, onMemoChange }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? [...primaryItems, ...secondaryItems] : primaryItems

  return (
    <div>
      <SectionLabel label={label + '項目'} />
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="flex items-center py-2 px-4 bg-[#F7F7F7] border-b border-[rgba(0,0,0,0.15)]">
          <div className="w-28 flex-shrink-0 text-xs font-normal text-text-placeholder">検査項目</div>
          <div className="flex-1 text-xs font-normal text-text-placeholder text-center">基準値</div>
          <div className="w-20 flex-shrink-0 text-xs font-normal text-text-placeholder text-right">今回</div>
        </div>
        {visible.map(item => (
          <TestItemRow
            key={item.key}
            item={item}
            value={items[item.key] ?? ''}
            onChange={v => onItemChange(item.key, v)}
          />
        ))}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center gap-1 py-3 px-4 bg-transparent border-0 cursor-pointer"
        >
          {expanded ? <ChevronUpIcon /> : <ArrowForwardIcon />}
          <span className="text-sm font-normal text-primary">
            {expanded ? '表示を減らす' : '全て見る'}
          </span>
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden mt-3">
        <div className="py-3 px-4 border-b border-[rgba(0,0,0,0.15)]">
          <span className="text-sm font-medium text-text-primary">{label}結果写真</span>
        </div>
        <PhotoArea photos={photos} onChange={onPhotosChange} />
      </div>

      <div className="bg-white rounded-xl overflow-hidden mt-3">
        <div className="py-3 px-4">
          <textarea
            value={memo}
            onChange={e => onMemoChange(e.target.value)}
            placeholder={label + 'メモ'}
            rows={3}
            className="w-full text-sm font-normal text-text-primary placeholder:text-text-placeholder bg-transparent outline-none resize-none"
          />
        </div>
      </div>
    </div>
  )
}

// ── VisitScreen ───────────────────────────────────────────────
export default function VisitScreen({ cat, date: initialDate = '', onBack }) {
  const hospitals = loadHospitals()

  const [date,       setDate]       = useState(initialDate)
  const [time,       setTime]       = useState('')
  const [hospitalId, setHospitalId] = useState('')
  const [visitTypes, setVisitTypes] = useState([])
  const [otherText,  setOtherText]  = useState('')

  const newRx = () => ({
    id: genId(), name: '', frequency: '', amount: '', unit: 'ml',
    startDate: '', endDate: '', memo: '',
  })
  const [prescriptions, setPrescriptions] = useState([newRx()])

  const [urineItems,  setUrineItems]  = useState({})
  const [urinePhotos, setUrinePhotos] = useState([])
  const [urineMemo,   setUrineMemo]   = useState('')

  const [bloodItems,  setBloodItems]  = useState({})
  const [bloodPhotos, setBloodPhotos] = useState([])
  const [bloodMemo,   setBloodMemo]   = useState('')

  const [nextVisit, setNextVisit] = useState('')

  function toggleVisitType(key) {
    setVisitTypes(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  function handleSave() {
    const record = {
      id: genId(), catId: cat.id,
      date, time, hospitalId,
      visitTypes, otherText,
      prescriptions,
      urineTest: { items: urineItems, photos: urinePhotos, memo: urineMemo },
      bloodTest:  { items: bloodItems, photos: bloodPhotos, memo: bloodMemo },
      nextVisit,
    }
    saveRecord(record)
    onBack()
  }

  const hospitalName   = hospitals.find(h => h.id === hospitalId)?.name ?? ''
  const nextVisitLabel = NEXT_VISIT_OPTIONS.find(o => o.value === nextVisit)?.label ?? ''

  return (
    <div className="flex flex-col h-dvh bg-[#F7F7F7] overflow-hidden">

      {/* ヘッダー */}
      <header className="relative flex items-center justify-center h-[60px] px-4 bg-white border-b border-[rgba(0,0,0,0.15)] flex-shrink-0">
        <button
          onClick={onBack}
          className="absolute left-4 flex items-center justify-center bg-transparent border-0 cursor-pointer p-1"
        >
          <BackIcon />
        </button>
        <span className="text-base font-semibold text-text-primary">受診</span>
      </header>

      {/* スクロールエリア */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 pt-4 space-y-4">

          {/* 受診日 */}
          <div>
            <SectionLabel label="受診日" />
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 py-3 px-4 border-b border-[rgba(0,0,0,0.15)]">
                <span className="text-sm font-normal text-text-primary w-16 flex-shrink-0">年月日</span>
                <div className="flex-1 flex items-center justify-end">
                  <DatePill value={date} onChange={setDate} />
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 px-4">
                <span className="text-sm font-normal text-text-primary w-16 flex-shrink-0">時間</span>
                <div className="flex-1 flex items-center justify-end">
                  <TimePill value={time} onChange={setTime} />
                </div>
              </div>
            </div>
          </div>

          {/* 動物病院 */}
          <div>
            <SectionLabel label="動物病院" />
            <div className="relative bg-white rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 py-3 px-4">
                <span className={`flex-1 text-sm font-normal ${hospitalId ? 'text-text-primary' : 'text-text-placeholder'}`}>
                  {hospitalName || '選んでください'}
                </span>
                <ExpandIcon />
              </div>
              <select
                value={hospitalId}
                onChange={e => setHospitalId(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                <option value="" disabled>選んでください</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </div>

          {/* 受診内容 */}
          <div>
            <SectionLabel label="受診内容" />
            <div className="bg-white rounded-xl overflow-hidden">
              {VISIT_TYPES.map((vt, i) => (
                <div key={vt.key}>
                  {i > 0 && <div className="h-px bg-[rgba(0,0,0,0.08)] mx-4" />}
                  <label className="flex items-center gap-3 py-3 px-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visitTypes.includes(vt.key)}
                      onChange={() => toggleVisitType(vt.key)}
                      className="w-4 h-4 rounded accent-[#EA5EAD] flex-shrink-0 cursor-pointer"
                    />
                    <span className="text-sm font-normal text-text-primary">{vt.label}</span>
                    {vt.key === 'other' && visitTypes.includes('other') && (
                      <input
                        type="text"
                        value={otherText}
                        onChange={e => setOtherText(e.target.value)}
                        placeholder="入力してください"
                        onClick={e => e.stopPropagation()}
                        className="flex-1 text-sm font-normal text-text-primary placeholder:text-text-placeholder bg-transparent outline-none text-right"
                      />
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 処方 */}
          <div>
            <SectionLabel label="処方" />
            <div className="space-y-3">
              {prescriptions.map(rx => (
                <PrescriptionCard
                  key={rx.id}
                  rx={rx}
                  onChange={updated => setPrescriptions(prev => prev.map(r => r.id === updated.id ? updated : r))}
                  onRemove={() => setPrescriptions(prev => prev.filter(r => r.id !== rx.id))}
                />
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPrescriptions(prev => [...prev, newRx()])}
                className="flex items-center gap-1 text-sm font-semibold text-primary bg-transparent border-0 cursor-pointer"
              >
                ＋ 処方を追加
              </button>
            </div>
          </div>

          {/* 尿検査 */}
          <TestSection
            label="尿検査"
            primaryItems={URINE_PRIMARY}
            secondaryItems={URINE_SECONDARY}
            items={urineItems}
            onItemChange={(key, val) => setUrineItems(prev => ({ ...prev, [key]: val }))}
            photos={urinePhotos}
            onPhotosChange={setUrinePhotos}
            memo={urineMemo}
            onMemoChange={setUrineMemo}
          />

          {/* 血液検査 */}
          <TestSection
            label="血液検査"
            primaryItems={BLOOD_PRIMARY}
            secondaryItems={BLOOD_SECONDARY}
            items={bloodItems}
            onItemChange={(key, val) => setBloodItems(prev => ({ ...prev, [key]: val }))}
            photos={bloodPhotos}
            onPhotosChange={setBloodPhotos}
            memo={bloodMemo}
            onMemoChange={setBloodMemo}
          />

          {/* 次回の予定 */}
          <div>
            <SectionLabel label="次回の予定" />
            <div className="relative bg-white rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 py-3 px-4">
                <span className="text-sm font-normal text-text-primary flex-shrink-0">次回受診予定</span>
                <div className="flex-1 flex items-center justify-end gap-2">
                  <span className={`text-sm font-normal ${nextVisit ? 'text-text-primary' : 'text-text-placeholder'}`}>
                    {nextVisitLabel || '選んでください'}
                  </span>
                  <ExpandIcon />
                </div>
              </div>
              <select
                value={nextVisit}
                onChange={e => setNextVisit(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                <option value="" disabled>選んでください</option>
                {NEXT_VISIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
