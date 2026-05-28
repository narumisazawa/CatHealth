import { useState, useEffect } from 'react'
import TimePill from '../components/TimePill.jsx'

const LS_DAILY_FOODS = 'cathealth_daily_foods'
const LS_FOODS       = 'cathealth_foods'

const REPEAT_OPTIONS = [
  { value: 'forever', label: '変更するまで継続' },
  { value: 'stop',    label: '終了する' },
]

const TYPE_LABEL = {
  '総合栄養食（ドライ）':  'ドライ',
  '総合栄養食（ウェット）': 'ウェット',
  'おやつ':               'おやつ',
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function loadSchedules() {
  try { return JSON.parse(localStorage.getItem(LS_DAILY_FOODS) || '[]') } catch { return [] }
}

function loadFoods() {
  try { return JSON.parse(localStorage.getItem(LS_FOODS) || '[]') } catch { return [] }
}

function getActiveSchedules(catId, date) {
  return loadSchedules().filter(s => {
    if (s.catId !== catId) return false
    if (s.startDate > date) return false
    if (s.repeat === 'today') return s.startDate === date
    if (s.stoppedDate && s.stoppedDate <= date) return false
    return true
  })
}

function persistSchedule(schedule) {
  try {
    const prev = loadSchedules()
    const exists = prev.some(s => s.id === schedule.id)
    const next = exists
      ? prev.map(s => s.id === schedule.id ? schedule : s)
      : [...prev, schedule]
    localStorage.setItem(LS_DAILY_FOODS, JSON.stringify(next))
  } catch {}
}

function terminateSchedule(id, date) {
  try {
    const prev = loadSchedules()
    const next = prev.map(s => s.id === id ? { ...s, stoppedDate: date } : s)
    localStorage.setItem(LS_DAILY_FOODS, JSON.stringify(next))
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

// ── FoodPickerSheet ────────────────────────────────────────
function FoodPickerSheet({ foods, onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const filtered = query.trim() === ''
    ? foods
    : foods.filter(f => {
        const q = query.toLowerCase()
        return (
          (f.name?.toLowerCase() ?? '').includes(q) ||
          (f.maker?.toLowerCase() ?? '').includes(q) ||
          (TYPE_LABEL[f.type]?.toLowerCase() ?? '').includes(q)
        )
      })

  function handleSave() {
    if (!selectedId) return
    onSelect(selectedId)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed bottom-0 inset-x-0 z-50 max-w-[430px] mx-auto bg-[#F7F7F7] rounded-t-2xl max-h-[80dvh] flex flex-col overflow-hidden">

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

          <span className="text-base font-semibold text-text-primary">フード</span>

          <button
            onClick={handleSave}
            className={`absolute right-4 h-[42px] px-6 rounded-full border-0 text-white text-sm font-semibold bg-[#EA5EAD] transition-opacity ${
              selectedId ? 'opacity-100 cursor-pointer' : 'opacity-40 cursor-default'
            }`}
          >
            保存
          </button>
        </div>

        {/* スクロール領域 */}
        <div className="flex-1 overflow-y-auto bg-white">

          {/* 検索セクション */}
          <div className="px-4 pt-3 pb-3">
            <p className="text-xs font-normal text-text-placeholder mb-2">フードを検索</p>
            <div className="flex items-center gap-2 bg-[#F3F2EF] rounded-full px-3 py-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="検索"
                className="flex-1 text-sm font-normal text-text-primary bg-transparent border-0 outline-none placeholder:text-text-placeholder"
              />
            </div>
          </div>

          {/* 最近与えたフードラベル */}
          <div className="px-4 pb-2">
            <p className="text-xs font-normal text-text-placeholder">最近与えたフード</p>
          </div>

          {/* フードリスト */}
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-12 px-8">
              <p className="text-sm font-normal text-text-placeholder text-center leading-relaxed">
                フードが登録されていません。<br />フードタブから追加してください。
              </p>
            </div>
          ) : (
            filtered.map(food => {
              const tag = TYPE_LABEL[food.type] ?? null
              const name = [food.maker, food.name].filter(Boolean).join('　')
              const isSelected = selectedId === food.id
              return (
                <div
                  key={food.id}
                  onClick={() => setSelectedId(food.id)}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-[#E5E5E5] cursor-pointer ${
                    isSelected ? 'bg-[#FFF0F5]' : 'bg-white'
                  }`}
                >
                  {tag && (
                    <span className="text-xs font-medium bg-[#374151] text-white px-1.5 py-0.5 rounded flex-shrink-0">
                      {tag}
                    </span>
                  )}
                  <span className="flex-1 text-sm font-normal text-text-primary">{name}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

// ── MealEntryCard ──────────────────────────────────────────
function MealEntryCard({ schedule, allFoods, onUpdate, onStop, onOpenFoodPicker }) {
  const food        = allFoods.find(f => f.id === schedule.foodId) ?? null
  const typeTag     = food ? (TYPE_LABEL[food.type] ?? null) : null
  const foodName    = food ? [food.maker, food.name].filter(Boolean).join('　') : ''
  const repeatLabel = REPEAT_OPTIONS.find(o => o.value === schedule.repeat)?.label ?? ''
  const canStop     = !!schedule.foodId

  function update(field, value) {
    onUpdate({ ...schedule, [field]: value })
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden">

      {/* 時間 */}
      <div className="flex items-center px-4 py-3 gap-3">
        <span className="text-sm font-normal text-text-primary w-16 flex-shrink-0">時間</span>
        <div className="flex-1 flex items-center justify-end">
          <TimePill value={schedule.time || ''} onChange={v => update('time', v)} />
        </div>
      </div>
      <div className="h-px bg-[#F0F0F0]" />

      {/* フード */}
      <div className="flex items-center px-4 py-3 gap-3">
        <span className="text-sm font-normal text-text-primary w-16 flex-shrink-0">フード</span>
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          {typeTag && (
            <span className="text-xs font-medium bg-[#F3F4F6] text-text-primary px-1.5 py-0.5 rounded flex-shrink-0">
              {typeTag}
            </span>
          )}
          {foodName && (
            <span className="text-sm font-normal text-text-primary truncate">{foodName}</span>
          )}
        </div>
        <button
          onClick={onOpenFoodPicker}
          className="flex-shrink-0 border-0 bg-transparent cursor-pointer p-0 text-text-primary"
        >
          <PlusIcon />
        </button>
      </div>
      <div className="h-px bg-[#F0F0F0]" />

      {/* 食事量 */}
      <div className="flex items-center px-4 py-3 gap-3">
        <span className="text-sm font-normal text-text-primary w-16 flex-shrink-0">食事量</span>
        <div className="flex-1 flex items-center justify-end">
          <div className="bg-[#F3F2EF] rounded-full flex items-center px-3 py-1 gap-1">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={schedule.amount || ''}
              onChange={e => update('amount', e.target.value)}
              className="w-14 text-right text-sm font-normal text-text-primary bg-transparent border-0 outline-none"
            />
            <span className="text-sm font-normal text-text-placeholder">g</span>
          </div>
        </div>
      </div>
      <div className="h-px bg-[#F0F0F0]" />

      {/* いつまで */}
      <div className="relative flex items-center px-4 py-3 gap-3">
        <span className="text-sm font-normal text-text-primary w-16 flex-shrink-0">いつまで</span>
        <div className="flex-1 flex items-center justify-end gap-2">
          <span className={`text-sm font-normal ${schedule.repeat ? 'text-text-primary' : 'text-text-placeholder'}`}>
            {repeatLabel || '選んでください'}
          </span>
          <ExpandIcon />
        </div>
        <select
          value={schedule.repeat || ''}
          onChange={e => e.target.value === 'stop' ? onStop() : update('repeat', e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full border-0"
        >
          <option value="" disabled>選んでください</option>
          {REPEAT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="h-px bg-[#F0F0F0]" />

      {/* 終了する */}
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

// ── CatMealScreen ─────────────────────────────────────────
export default function CatMealScreen({ cat, date, onBack }) {
  const [schedules,    setSchedules]    = useState(() => {
    const loaded = getActiveSchedules(cat.id, date)
    if (loaded.length > 0) return loaded
    return [{
      id: genId(), catId: cat.id, foodId: '', amount: '', time: '',
      repeat: 'forever', startDate: date, stoppedDate: null,
    }]
  })
  const [allFoods]                      = useState(loadFoods)
  const [pickerForId,  setPickerForId]  = useState(null)

  function handleUpdate(updated) {
    persistSchedule(updated)
    setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  function handleStop(id) {
    terminateSchedule(id, date)
    setSchedules(prev => prev.filter(s => s.id !== id))
  }

  function handleAddMeal() {
    const newSchedule = {
      id: genId(), catId: cat.id, foodId: '', amount: '', time: '',
      repeat: 'forever', startDate: date, stoppedDate: null,
    }
    setSchedules(prev => [...prev, newSchedule])
  }

  function handleSelectFood(foodId) {
    if (!pickerForId) return
    const schedule = schedules.find(s => s.id === pickerForId)
    if (!schedule) return
    handleUpdate({ ...schedule, foodId })
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
        <span className="text-base font-semibold text-text-primary">食事</span>
      </header>

      {/* スクロールエリア */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 pt-4 space-y-3">
          {schedules.map(schedule => (
            <MealEntryCard
              key={schedule.id}
              schedule={schedule}
              allFoods={allFoods}
              onUpdate={handleUpdate}
              onStop={() => handleStop(schedule.id)}
              onOpenFoodPicker={() => setPickerForId(schedule.id)}
            />
          ))}
        </div>

        {/* ＋ 食事を追加 */}
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={handleAddMeal}
            className="flex items-center gap-1 text-sm font-semibold text-primary bg-transparent border-0 cursor-pointer p-0"
          >
            ＋ 食事を追加
          </button>
        </div>
      </div>

      {/* フードピッカー */}
      {pickerForId !== null && (
        <FoodPickerSheet
          foods={allFoods}
          onSelect={handleSelectFood}
          onClose={() => setPickerForId(null)}
        />
      )}
    </div>
  )
}
