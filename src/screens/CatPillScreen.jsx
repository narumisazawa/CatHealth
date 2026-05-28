import { useState, useEffect, useMemo } from 'react'
import TimePill from '../components/TimePill.jsx'

const LS_PILLS = 'cathealth_daily_meds'

const FREQUENCY_OPTIONS = [
  { value: 'daily',    label: '毎日' },
  { value: 'twice',    label: '1日2回' },
  { value: 'three',    label: '1日3回' },
  { value: 'every2d',  label: '2日に1回' },
  { value: 'weekly',   label: '週1回' },
  { value: 'other',    label: 'その他' },
]

const UNTIL_OPTIONS = [
  { value: 'forever',  label: '変更するまで継続' },
  { value: 'improved', label: '症状が改善されるまで' },
  { value: 'stop',     label: '終了する' },
]

const UNIT_OPTIONS = [
  { value: 'ml',  label: 'ml' },
  { value: '錠',  label: '錠' },
  { value: '粒',  label: '粒' },
  { value: 'g',   label: 'g' },
  { value: '滴',  label: '滴' },
]

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function loadSchedules() {
  try { return JSON.parse(localStorage.getItem(LS_PILLS) || '[]') } catch { return [] }
}

function getActiveSchedules(catId, date) {
  return loadSchedules()
    .filter(s => s.catId === catId && s.date === date && !s.stoppedDate)
    .map(s => ({ unit: 'ml', ...s }))
}

function persistSchedule(schedule) {
  try {
    const prev = loadSchedules()
    const exists = prev.some(s => s.id === schedule.id)
    const next = exists
      ? prev.map(s => s.id === schedule.id ? schedule : s)
      : [...prev, schedule]
    localStorage.setItem(LS_PILLS, JSON.stringify(next))
  } catch {}
}

function terminateSchedule(id, date) {
  try {
    const prev = loadSchedules()
    const next = prev.map(s => s.id === id ? { ...s, stoppedDate: date } : s)
    localStorage.setItem(LS_PILLS, JSON.stringify(next))
  } catch {}
}

// ── アイコン ─────────────────────────────────────────────
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-primary">
      <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="currentColor"/>
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-text-primary">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"/>
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-text-placeholder flex-shrink-0">
      <path d="M12 22L6 16L7.425 14.575L12 19.15L16.575 14.575L18 16L12 22ZM7.45 9.4L6 8L12 2L18 8L16.55 9.4L12 4.85L7.45 9.4Z"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-text-placeholder flex-shrink-0">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function PillRowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-primary flex-shrink-0">
      <path d="M8.625 21C7.05833 21 5.72917 20.4542 4.6375 19.3625C3.54583 18.2708 3 16.9417 3 15.375C3 14.625 3.14167 13.9083 3.425 13.225C3.70833 12.5417 4.11667 11.9333 4.65 11.4L11.4 4.65C11.9333 4.11667 12.5417 3.70833 13.225 3.425C13.9083 3.14167 14.625 3 15.375 3C16.9417 3 18.2708 3.54583 19.3625 4.6375C20.4542 5.72917 21 7.05833 21 8.625C21 9.375 20.8583 10.0917 20.575 10.775C20.2917 11.4583 19.8833 12.0667 19.35 12.6L12.6 19.35C12.0667 19.8833 11.4583 20.2917 10.775 20.575C10.0917 20.8583 9.375 21 8.625 21ZM15.275 13.85L17.95 11.2C18.2833 10.8667 18.5417 10.475 18.725 10.025C18.9083 9.575 19 9.10833 19 8.625C19 7.625 18.6458 6.77083 17.9375 6.0625C17.2292 5.35417 16.375 5 15.375 5C14.8917 5 14.425 5.09167 13.975 5.275C13.525 5.45833 13.1333 5.71667 12.8 6.05L10.15 8.725L15.275 13.85ZM8.625 19C9.10833 19 9.575 18.9083 10.025 18.725C10.475 18.5417 10.8667 18.2833 11.2 17.95L13.85 15.275L8.725 10.15L6.05 12.8C5.71667 13.1333 5.45833 13.525 5.275 13.975C5.09167 14.425 5 14.8917 5 15.375C5 16.375 5.35417 17.2292 6.0625 17.9375C6.77083 18.6458 7.625 19 8.625 19Z" fill="currentColor"/>
    </svg>
  )
}

// ── DrugPickerSheet ──────────────────────────────────────────
function DrugPickerSheet({ currentName, onSave, onClose }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(currentName || '')

  const pastDrugs = useMemo(() => {
    const seen = new Set()
    const names = []
    for (const s of loadSchedules()) {
      if (s.drugName && !seen.has(s.drugName)) {
        seen.add(s.drugName)
        names.push(s.drugName)
      }
    }
    return names
  }, [])

  const filtered = pastDrugs.filter(name =>
    query === '' || name.includes(query)
  )

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const canSave = selected.trim() !== ''

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed bottom-0 inset-x-0 z-50 max-w-[430px] mx-auto bg-[#F7F7F7] rounded-t-2xl max-h-[80dvh] min-h-[60vh] flex flex-col overflow-hidden">

        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-[#D1D5DB]" />
        </div>

        {/* ヘッダー */}
        <div className="relative flex items-center justify-center px-4 py-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute left-4 w-[42px] h-[42px] rounded-full bg-white border-0 cursor-pointer flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <span className="text-base font-semibold text-text-primary">くすり</span>
          <button
            onClick={() => canSave && onSave(selected.trim())}
            disabled={!canSave}
            className={`absolute right-4 h-[42px] px-6 rounded-full border-0 text-white text-sm font-semibold bg-[#EA5EAD] transition-opacity ${
              canSave ? 'opacity-100 cursor-pointer' : 'opacity-40 cursor-default'
            }`}
          >
            保存
          </button>
        </div>

        {/* スクロールエリア */}
        <div className="flex-1 overflow-y-auto px-4 pb-20">

          {/* 検索セクション */}
          <div className="mb-4">
            <p className="text-xs font-normal text-text-placeholder mb-2">くすりを検索</p>
            <div className="flex items-center gap-2 bg-[#F3F2EF] rounded-xl px-3 py-2.5">
              <SearchIcon />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="検索"
                className="flex-1 text-sm font-normal text-text-primary bg-transparent border-0 outline-none placeholder:text-text-placeholder"
              />
            </div>
          </div>

          {/* 過去に使ったくすりリスト */}
          {filtered.length > 0 && (
            <div>
              <p className="text-xs font-normal text-text-placeholder mb-2">過去に使ったくすり</p>
              <div className="bg-white rounded-xl overflow-hidden">
                {filtered.map((name, i) => (
                  <button
                    key={name}
                    onClick={() => setSelected(name === selected ? '' : name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-0 bg-white cursor-pointer text-left ${
                      i > 0 ? 'border-t border-[#E5E5E5]' : ''
                    }`}
                  >
                    <PillRowIcon />
                    <span className="flex-1 text-sm font-normal text-text-primary">{name}</span>
                    {selected === name && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary flex-shrink-0">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── PillEntryCard ──────────────────────────────────────────
function PillEntryCard({ schedule, onUpdate, onStop, onOpenDrugPicker }) {
  const canStop = !!schedule.drugName

  function update(field, value) {
    onUpdate({ ...schedule, [field]: value })
  }

  const frequencyLabel = FREQUENCY_OPTIONS.find(o => o.value === schedule.frequency)?.label ?? ''
  const untilLabel     = UNTIL_OPTIONS.find(o => o.value === schedule.until)?.label ?? ''

  return (
    <div className="bg-white rounded-xl overflow-hidden">

      {/* 時間 */}
      <div className="flex items-center px-4 py-3 gap-3 border-b border-[#E5E5E5]">
        <span className="text-sm font-normal text-text-primary flex-shrink-0">時間</span>
        <div className="flex-1 flex items-center justify-end">
          <TimePill value={schedule.time || ''} onChange={v => update('time', v)} />
        </div>
      </div>

      {/* くすりの名前 */}
      <div className="flex items-center px-4 py-3 gap-3 border-b border-[#E5E5E5]">
        <span className="text-sm font-normal text-text-primary flex-1">くすりの名前</span>
        {schedule.drugName ? (
          <>
            <span className="text-sm font-normal text-text-primary truncate max-w-[120px]">
              {schedule.drugName}
            </span>
            <button
              onClick={onOpenDrugPicker}
              className="flex-shrink-0 cursor-pointer bg-transparent px-3 py-1 rounded-full border border-[#EA5EAD] text-primary text-sm font-normal"
            >
              変更
            </button>
          </>
        ) : (
          <button
            onClick={onOpenDrugPicker}
            className="flex-shrink-0 border-0 bg-transparent cursor-pointer p-0 text-text-primary"
          >
            <PlusIcon />
          </button>
        )}
      </div>

      {/* くすりの量 */}
      <div className="flex items-center px-4 py-3 gap-3 border-b border-[#E5E5E5]">
        <span className="text-sm font-normal text-text-primary flex-1">くすりの量</span>
        <div className="bg-[#F3F2EF] rounded-full flex items-center px-3 py-1">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            value={schedule.amount || ''}
            onChange={e => update('amount', e.target.value)}
            className="w-14 text-right text-sm font-normal text-text-primary bg-transparent border-0 outline-none"
          />
        </div>
        <div className="relative flex items-center gap-1">
          <span className="text-sm font-normal text-text-primary">{schedule.unit || 'ml'}</span>
          <ExpandIcon />
          <select
            value={schedule.unit || 'ml'}
            onChange={e => update('unit', e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full border-0"
          >
            {UNIT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 投与の頻度 */}
      <div className="relative flex items-center px-4 py-3 gap-3 border-b border-[#E5E5E5]">
        <span className="text-sm font-normal text-text-primary w-20 flex-shrink-0">投与の頻度</span>
        <div className="flex-1 flex items-center justify-end gap-2">
          <span className={`text-sm font-normal ${schedule.frequency ? 'text-text-primary' : 'text-text-placeholder'}`}>
            {frequencyLabel || '選んでください'}
          </span>
          <ExpandIcon />
        </div>
        <select
          value={schedule.frequency || ''}
          onChange={e => update('frequency', e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full border-0"
        >
          <option value="" disabled>選んでください</option>
          {FREQUENCY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* いつまで */}
      <div className="relative flex items-center px-4 py-3 gap-3 border-b border-[#E5E5E5]">
        <span className="text-sm font-normal text-text-primary w-16 flex-shrink-0">いつまで</span>
        <div className="flex-1 flex items-center justify-end gap-2">
          <span className={`text-sm font-normal ${schedule.until ? 'text-text-primary' : 'text-text-placeholder'}`}>
            {untilLabel || '選んでください'}
          </span>
          <ExpandIcon />
        </div>
        <select
          value={schedule.until || ''}
          onChange={e => update('until', e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full border-0"
        >
          <option value="" disabled>選んでください</option>
          {UNTIL_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* 削除する */}
      <button
        onClick={canStop ? onStop : undefined}
        disabled={!canStop}
        className={`w-full flex items-center justify-center gap-2 py-3 border-0 bg-transparent ${
          canStop ? 'cursor-pointer text-primary' : 'cursor-default text-text-placeholder'
        }`}
      >
        <TrashIcon />
        <span className="text-sm font-normal">削除する</span>
      </button>
    </div>
  )
}

// ── CatPillScreen ──────────────────────────────────────────
export default function CatPillScreen({ cat, date, onBack }) {
  const [schedules, setSchedules] = useState(() => {
    const loaded = getActiveSchedules(cat.id, date)
    if (loaded.length > 0) return loaded
    const initial = {
      id: genId(), catId: cat.id, date, drugName: '', amount: '', unit: 'ml', time: '',
      frequency: '', until: 'forever', stoppedDate: null,
    }
    persistSchedule(initial)
    return [initial]
  })
  const [pickerForId, setPickerForId] = useState(null)

  function handleUpdate(updated) {
    persistSchedule(updated)
    setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  function handleStop(id) {
    terminateSchedule(id, date)
    setSchedules(prev => prev.filter(s => s.id !== id))
  }

  function handleAddPill() {
    const newSchedule = {
      id: genId(), catId: cat.id, date, drugName: '', amount: '', unit: 'ml', time: '',
      frequency: '', until: 'forever', stoppedDate: null,
    }
    persistSchedule(newSchedule)
    setSchedules(prev => [...prev, newSchedule])
  }

  function handleSaveDrug(name) {
    if (!pickerForId) return
    const schedule = schedules.find(s => s.id === pickerForId)
    if (!schedule) return
    handleUpdate({ ...schedule, drugName: name })
    setPickerForId(null)
  }

  function handleStopFromPicker() {
    if (!pickerForId) return
    handleStop(pickerForId)
    setPickerForId(null)
  }

  return (
    <div className="flex flex-col h-dvh bg-[#F7F7F7] overflow-hidden">

      {/* ヘッダー */}
      <header className="relative flex items-center justify-center h-[60px] px-4 bg-white border-b border-black/10 flex-shrink-0">
        <button
          onClick={onBack}
          className="absolute left-4 flex items-center justify-center bg-transparent border-0 cursor-pointer p-1"
        >
          <BackIcon />
        </button>
        <span className="text-base font-semibold text-text-primary">投与</span>
      </header>

      {/* スクロールエリア */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 pt-4 space-y-3">
          {schedules.map(schedule => (
            <PillEntryCard
              key={schedule.id}
              schedule={schedule}
              onUpdate={handleUpdate}
              onStop={() => handleStop(schedule.id)}
              onOpenDrugPicker={() => setPickerForId(schedule.id)}
            />
          ))}
        </div>

        {/* ＋ くすりを追加 */}
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={handleAddPill}
            className="flex items-center gap-1 text-sm font-semibold text-primary bg-transparent border-0 cursor-pointer p-0"
          >
            ＋ くすりを追加
          </button>
        </div>
      </div>

      {/* くすり選択シート */}
      {pickerForId !== null && (
        <DrugPickerSheet
          currentName={schedules.find(s => s.id === pickerForId)?.drugName || ''}
          onSave={handleSaveDrug}
          onClose={() => setPickerForId(null)}
        />
      )}
    </div>
  )
}
