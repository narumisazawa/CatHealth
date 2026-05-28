import { useState, useRef, useEffect } from 'react'

const LS_HOSPITALS = 'cathealth_hospitals'

const DAYS = [
  { key: 'sunday',    label: '日曜日' },
  { key: 'monday',    label: '月曜日' },
  { key: 'tuesday',   label: '火曜日' },
  { key: 'wednesday', label: '水曜日' },
  { key: 'thursday',  label: '木曜日' },
  { key: 'friday',    label: '金曜日' },
  { key: 'saturday',  label: '土曜日' },
  { key: 'holiday',   label: '祝日'   },
]

const DEFAULT_DAY = {
  closed: false,
  am: { start: '', end: '' },
  pm: { start: '', end: '' },
  amClosed: false,
  pmClosed: false,
}

// ── アイコン ─────────────────────────────────────────────
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="currentColor"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#FFFFFF"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6L18.1199 19.1234C18.0518 20.1765 17.177 21 16.1215 21H7.87855C6.82296 21 5.94818 20.1765 5.88008 19.1234L5 6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Checkbox ─────────────────────────────────────────────
function Checkbox({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      className={`w-[18px] h-[18px] rounded-sm flex items-center justify-center cursor-pointer flex-shrink-0 ${
        checked ? 'bg-[#EA5EAD]' : 'border-2 border-[#9CA3AF] bg-transparent'
      }`}
    >
      {checked && <CheckIcon />}
    </div>
  )
}

// ── TextInfoRow ───────────────────────────────────────────
function TextInfoRow({ label, value, onChange, isLast = false, type = 'text', placeholder = '入力してください' }) {
  return (
    <div>
      <div className="flex items-center gap-4 py-3 px-4 min-h-[48px]">
        <span className="text-sm font-normal text-text-primary w-20 flex-shrink-0">{label}</span>
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm font-normal text-text-primary bg-transparent border-none outline-none placeholder:text-text-placeholder"
        />
      </div>
      {!isLast && <div className="h-px bg-[#F0F0F0]" />}
    </div>
  )
}

// ── MultilineTextInfoRow（折り返し対応行） ────────────────
function MultilineTextInfoRow({ label, value, onChange, isLast = false, placeholder = '入力してください' }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])

  return (
    <div>
      <div className="flex items-start gap-4 py-3 px-4 min-h-[48px]">
        <span className="text-sm font-normal text-text-primary w-20 flex-shrink-0 pt-0.5">{label}</span>
        <textarea
          ref={textareaRef}
          value={value || ''}
          rows={1}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm font-normal text-text-primary bg-transparent border-none outline-none resize-none leading-normal placeholder:text-text-placeholder"
        />
      </div>
      {!isLast && <div className="h-px bg-[#F0F0F0]" />}
    </div>
  )
}

// ── DayEditor ─────────────────────────────────────────────
function DayEditor({ label, data, onChange, isLast = false }) {
  const d = {
    ...DEFAULT_DAY,
    ...data,
    am: { ...DEFAULT_DAY.am, ...data?.am },
    pm: { ...DEFAULT_DAY.pm, ...data?.pm },
  }

  function update(patch) {
    onChange({ ...d, ...patch })
  }

  const timeInputClass = `text-sm font-normal text-text-primary bg-[#F3F2EF] rounded-lg px-2 py-1 outline-none w-16 disabled:opacity-30`

  return (
    <div>
      <div className="px-4 pt-3 pb-4 flex flex-col gap-2">

        <span className="text-sm font-medium text-text-primary">{label}</span>

        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={d.closed} onChange={() => update({ closed: !d.closed })} />
          <span className="text-xs font-normal text-text-primary">定休日</span>
        </label>

        {/* 午前 */}
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={d.am.start}
            onChange={e => update({ am: { ...d.am, start: e.target.value } })}
            disabled={d.closed}
            className={timeInputClass}
          />
          <span className="text-sm font-normal text-text-placeholder">〜</span>
          <input
            type="time"
            value={d.am.end}
            onChange={e => update({ am: { ...d.am, end: e.target.value } })}
            disabled={d.closed}
            className={timeInputClass}
          />
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
            <Checkbox checked={d.amClosed} onChange={() => update({ amClosed: !d.amClosed })} />
            <span className="text-xs font-normal text-text-primary">午前休診</span>
          </label>
        </div>

        {/* 午後 */}
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={d.pm.start}
            onChange={e => update({ pm: { ...d.pm, start: e.target.value } })}
            disabled={d.closed}
            className={timeInputClass}
          />
          <span className="text-sm font-normal text-text-placeholder">〜</span>
          <input
            type="time"
            value={d.pm.end}
            onChange={e => update({ pm: { ...d.pm, end: e.target.value } })}
            disabled={d.closed}
            className={timeInputClass}
          />
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
            <Checkbox checked={d.pmClosed} onChange={() => update({ pmClosed: !d.pmClosed })} />
            <span className="text-xs font-normal text-text-primary">午後休診</span>
          </label>
        </div>

      </div>
      {!isLast && <div className="h-px bg-[#F0F0F0]" />}
    </div>
  )
}

// ── HospitalDetailScreen ──────────────────────────────────
// isNew=true のとき：プレースホルダー表示、削除ボタン無効
// isNew=false のとき：データ表示、削除ボタン有効
export default function HospitalDetailScreen({ hospital: initialHospital, isNew = false, onBack, onUpdate }) {
  const [hospital, setHospital] = useState(initialHospital)
  // 新規病院を localStorage に挿入済みかを追跡
  const isInsertedRef = useRef(!isNew)

  function saveHospitalToLS(updated) {
    try {
      const hospitals = JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]')
      if (!isInsertedRef.current) {
        localStorage.setItem(LS_HOSPITALS, JSON.stringify([...hospitals, updated]))
        isInsertedRef.current = true
      } else {
        localStorage.setItem(LS_HOSPITALS, JSON.stringify(hospitals.map(h => h.id === updated.id ? updated : h)))
      }
    } catch { /* ignore */ }
  }

  function updateField(key, value) {
    const updated = { ...hospital, [key]: value }
    setHospital(updated)
    saveHospitalToLS(updated)
    onUpdate?.(updated)
  }

  function updateHours(dayKey, dayData) {
    const updated = { ...hospital, hours: { ...(hospital.hours || {}), [dayKey]: dayData } }
    setHospital(updated)
    saveHospitalToLS(updated)
    onUpdate?.(updated)
  }

  function handleDelete() {
    const label = hospital.name || 'この動物病院'
    if (!window.confirm(`「${label}」を削除しますか？`)) return
    try {
      const hospitals = JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]')
      localStorage.setItem(LS_HOSPITALS, JSON.stringify(hospitals.filter(h => h.id !== hospital.id)))
    } catch { /* ignore */ }
    onBack()
  }

  return (
    <div className="flex flex-col h-dvh bg-[#F7F7F7] overflow-hidden">

      {/* ── 固定ヘッダー ── */}
      <header className="relative flex items-center justify-center h-[60px] px-4 bg-white border-b border-black/10 flex-shrink-0">
        <button
          onClick={onBack}
          className="absolute left-4 flex items-center justify-center bg-transparent border-0 cursor-pointer p-1"
        >
          <BackIcon />
        </button>
        <span className="text-base font-semibold text-text-primary">動物病院</span>
      </header>

      {/* ── スクロール領域 ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="flex flex-col gap-4 px-4 pt-6">

          {/* 基本情報カード */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <TextInfoRow
              label="動物病院名"
              value={hospital.name}
              onChange={v => updateField('name', v)}
            />
            <MultilineTextInfoRow
              label="住所"
              value={hospital.address}
              onChange={v => updateField('address', v)}
            />
            <TextInfoRow
              label="電話"
              value={hospital.phone}
              onChange={v => updateField('phone', v)}
              type="tel"
              isLast
            />
          </div>

          {/* 診察時間セクション */}
          <div>
            <span className="text-sm font-medium text-text-primary px-1 mb-2 block">診察時間</span>
            <div className="bg-white rounded-2xl overflow-hidden">
              {DAYS.map((day, i) => (
                <DayEditor
                  key={day.key}
                  label={day.label}
                  data={(hospital.hours || {})[day.key]}
                  onChange={d => updateHours(day.key, d)}
                  isLast={i === DAYS.length - 1}
                />
              ))}
            </div>
          </div>

          {/* 動物病院メモ */}
          <div>
            <span className="text-sm font-medium text-text-primary px-1 mb-2 block">動物病院メモ</span>
            <div className="bg-white rounded-2xl overflow-hidden p-4">
              <textarea
                value={hospital.memo || ''}
                onChange={e => updateField('memo', e.target.value)}
                rows={4}
                placeholder="メモを入力..."
                className="w-full text-sm font-normal text-text-primary bg-transparent border-none outline-none resize-none leading-relaxed placeholder:text-text-placeholder"
              />
            </div>
          </div>

          {/* 削除ボタン */}
          <div className="flex justify-center py-2">
            {isNew ? (
              <span className="flex items-center gap-2 text-sm font-normal text-text-placeholder cursor-not-allowed select-none">
                <TrashIcon />
                削除する
              </span>
            ) : (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-sm font-normal text-primary bg-transparent border-0 cursor-pointer p-0"
              >
                <TrashIcon />
                削除する
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
