import { useState } from 'react'
import FoodDetailScreen from './FoodDetailScreen.jsx'

const LS_FOODS = 'cathealth_foods'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function loadFoods() {
  try { return JSON.parse(localStorage.getItem(LS_FOODS) || '[]') } catch { return [] }
}

const TYPE_LABEL = {
  '総合栄養食（ドライ）':  'ドライ',
  '総合栄養食（ウェット）': 'ウェット',
  'おやつ':               'おやつ',
}

// ── アイコン ─────────────────────────────────────────────
function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="currentColor"/>
    </svg>
  )
}

// ── FoodRow ────────────────────────────────────────────
function FoodRow({ food, onSelect }) {
  const tag  = TYPE_LABEL[food.type] ?? food.type
  const name = [food.maker, food.name].filter(Boolean).join('　')

  return (
    <div
      onClick={() => onSelect(food)}
      className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl cursor-pointer"
    >
      {tag && (
        <span className="text-xs font-medium bg-[#F3F4F6] text-text-primary px-1.5 py-0.5 rounded flex-shrink-0">
          {tag}
        </span>
      )}
      <span className="flex-1 text-sm font-normal text-text-primary">{name}</span>
      <ChevronRight />
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex items-center justify-center px-8 py-20">
      <p className="text-sm font-normal text-text-placeholder text-center leading-relaxed">
        まだフードが登録されていません。<br />
        右上の「+ フードを追加」から追加してください。
      </p>
    </div>
  )
}

// ── FoodsScreen ───────────────────────────────────────
export default function FoodsScreen() {
  const [foods,        setFoods]        = useState(loadFoods)
  const [selectedFood, setSelectedFood] = useState(null)
  const [isNewFood,    setIsNewFood]    = useState(false)

  function handleAddNew() {
    const blank = { id: genId(), maker: '', type: '', name: '', nutrition: {} }
    setSelectedFood(blank)
    setIsNewFood(true)
  }

  function handleSelectFood(food) {
    setSelectedFood(food)
    setIsNewFood(false)
  }

  function handleBack() {
    setFoods(loadFoods())
    setSelectedFood(null)
    setIsNewFood(false)
  }

  if (selectedFood) {
    return (
      <FoodDetailScreen
        food={selectedFood}
        isNew={isNewFood}
        onBack={handleBack}
      />
    )
  }

  return (
    <div className="flex flex-col h-dvh bg-[#F7F7F7] overflow-hidden">

      {/* ── 固定ヘッダー ── */}
      <header className="relative flex items-center justify-center h-[60px] px-4 bg-white border-b border-black/10 flex-shrink-0">
        <span className="text-base font-semibold text-text-primary">フード</span>
        <button
          onClick={handleAddNew}
          className="absolute right-4 flex items-center gap-1 bg-transparent border-0 cursor-pointer text-sm font-semibold text-primary p-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          フードを追加
        </button>
      </header>

      {/* ── スクロール領域 ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        {foods.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="px-4 pt-4 space-y-2">
            {foods.map(food => (
              <FoodRow
                key={food.id}
                food={food}
                onSelect={handleSelectFood}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
