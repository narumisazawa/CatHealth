import { useState, useRef } from 'react'

const LS_FOODS = 'cathealth_foods'

const NUTRITION_FIELDS = [
  { key: 'protein',      label: 'たんぱく質',        unit: '%'         },
  { key: 'fat',          label: '脂質',              unit: '%'         },
  { key: 'fiber',        label: '粗繊維',            unit: '%'         },
  { key: 'ash',          label: '灰分',              unit: '%'         },
  { key: 'nfe',          label: '炭水化物（N.F.E）', unit: '%'         },
  { key: 'dietaryFiber', label: '食物繊維',          unit: '%'         },
  { key: 'calcium',      label: 'カルシウム',        unit: '%'         },
  { key: 'phosphorus',   label: 'リン',              unit: '%'         },
  { key: 'potassium',    label: 'カリウム',          unit: '%'         },
  { key: 'sodium',       label: 'ナトリウム',        unit: '%'         },
  { key: 'chlorine',     label: 'クロール',          unit: '%'         },
  { key: 'magnesium',    label: 'マグネシウム',      unit: '%'         },
  { key: 'iron',         label: '鉄',                unit: 'mg/kg'     },
  { key: 'copper',       label: '銅',                unit: 'mg/kg'     },
  { key: 'zinc',         label: '亜鉛',              unit: 'mg/kg'     },
  { key: 'dhaEpa',       label: 'DHA＋EPA',          unit: '%'         },
  { key: 'tryptophan',   label: 'トリプトファン',    unit: '%'         },
  { key: 'taurine',      label: 'タウリン',          unit: '%'         },
  { key: 'energy',       label: '代謝エネルギー',    unit: 'kcal/100g' },
  { key: 'origin',       label: '原産国',            unit: ''          },
]

const TYPE_OPTIONS = [
  '総合栄養食（ドライ）',
  '総合栄養食（ウェット）',
  'おやつ',
]

// ── アイコン ─────────────────────────────────────────────
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="currentColor"/>
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-text-placeholder">
      <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" fill="currentColor"/>
      <path d="M20 4H16.83L15 2H9L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" fill="currentColor"/>
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

function UpDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary flex-shrink-0">
      <path d="M7 15L12 20L17 15M7 9L12 4L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── TextInfoRow ───────────────────────────────────────────
function TextInfoRow({ label, value, onChange, placeholder = '', isLast = false }) {
  return (
    <div>
      <div className="flex items-center gap-4 py-3 px-4 min-h-[48px]">
        <span className="text-sm font-normal text-text-primary w-16 flex-shrink-0">{label}</span>
        <input
          type="text"
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

// ── TypeRow ───────────────────────────────────────────────
function TypeRow({ value, onChange }) {
  const hasValue = Boolean(value)
  return (
    <div>
      <label className="flex items-center gap-4 py-3 px-4 min-h-[48px] cursor-pointer">
        <span className="text-sm font-normal text-text-primary w-16 flex-shrink-0">種類</span>
        <div className="flex-1 relative flex items-center">
          <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className={`flex-1 text-sm font-normal bg-transparent outline-none appearance-none cursor-pointer pr-6 ${hasValue ? 'text-text-primary' : 'text-text-placeholder'}`}
          >
            <option value="" disabled>選択してください</option>
            {TYPE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="absolute right-0 pointer-events-none">
            <UpDownIcon />
          </div>
        </div>
      </label>
      <div className="h-px bg-[#F0F0F0]" />
    </div>
  )
}

// ── NutritionRow ──────────────────────────────────────────
function NutritionRow({ label, unit, value, onChange, isLast = false }) {
  return (
    <div>
      <div className="flex items-center gap-4 py-3 px-4 min-h-[48px]">
        <span className="flex-1 text-sm font-normal text-text-primary">{label}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="number"
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            className="text-sm font-normal text-text-primary bg-[#F3F2EF] rounded-lg px-3 py-0.5 w-[72px] text-right outline-none"
          />
          {unit && (
            <span className="text-xs font-normal text-text-placeholder w-14 flex-shrink-0">{unit}</span>
          )}
        </div>
      </div>
      {!isLast && <div className="h-px bg-[#F0F0F0]" />}
    </div>
  )
}

// ── FoodDetailScreen ──────────────────────────────────────
// isNew=true のとき：プレースホルダー表示、削除ボタン無効
// isNew=false のとき：データ表示、削除ボタン有効
export default function FoodDetailScreen({ food: initialFood, isNew = false, onBack }) {
  const [food, setFood] = useState(initialFood)
  const imageInputRef   = useRef(null)
  // 新規フードを localStorage に挿入済みかを追跡
  const isInsertedRef   = useRef(!isNew)

  function saveFoodToLS(updatedFood) {
    try {
      const foods = JSON.parse(localStorage.getItem(LS_FOODS) || '[]')
      if (!isInsertedRef.current) {
        localStorage.setItem(LS_FOODS, JSON.stringify([...foods, updatedFood]))
        isInsertedRef.current = true
      } else {
        localStorage.setItem(LS_FOODS, JSON.stringify(foods.map(f => f.id === updatedFood.id ? updatedFood : f)))
      }
    } catch { /* ignore */ }
  }

  function updateField(key, value) {
    const updated = { ...food, [key]: value }
    setFood(updated)
    saveFoodToLS(updated)
  }

  function updateNutrition(key, value) {
    const updated = { ...food, nutrition: { ...(food.nutrition || {}), [key]: value } }
    setFood(updated)
    saveFoodToLS(updated)
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { updateField('image', ev.target.result) }
    reader.readAsDataURL(file)
  }

  function handleDelete() {
    const label = food.name || food.maker || 'このフード'
    if (!window.confirm(`「${label}」を削除しますか？`)) return
    try {
      const foods = JSON.parse(localStorage.getItem(LS_FOODS) || '[]')
      localStorage.setItem(LS_FOODS, JSON.stringify(foods.filter(f => f.id !== food.id)))
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
        <span className="text-base font-semibold text-text-primary">フード</span>
      </header>

      {/* ── スクロール領域 ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="flex flex-col gap-4 px-4 pt-6">

          {/* フード画像セクション */}
          <div>
            <span className="text-xs font-normal text-text-placeholder px-1 mb-2 block">フード画像</span>
            <div
              className="bg-white rounded-2xl overflow-hidden p-4 cursor-pointer"
              onClick={() => imageInputRef.current?.click()}
            >
              {food.image ? (
                <img
                  src={food.image}
                  alt="food"
                  className="w-full aspect-[4/3] object-contain rounded-xl"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-[#F3F4F6] rounded-xl flex flex-col items-center justify-center gap-2">
                  <CameraIcon />
                  <span className="text-xs font-normal text-text-placeholder">タップして画像を追加</span>
                </div>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* 基本情報カード */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <TextInfoRow
              label="メーカー"
              value={food.maker}
              onChange={v => updateField('maker', v)}
              placeholder="メーカー名を入力"
            />
            <TypeRow
              value={food.type}
              onChange={v => updateField('type', v)}
            />
            <TextInfoRow
              label="フード名"
              value={food.name}
              onChange={v => updateField('name', v)}
              placeholder="表示名を入力"
              isLast
            />
          </div>

          {/* 栄養成分セクション */}
          <div>
            <span className="text-sm font-medium text-text-primary px-1 mb-2 block">栄養成分</span>
            <div className="bg-white rounded-2xl overflow-hidden">
              {NUTRITION_FIELDS.map((f, i) => (
                <NutritionRow
                  key={f.key}
                  label={f.label}
                  unit={f.unit}
                  value={food.nutrition?.[f.key]}
                  onChange={v => updateNutrition(f.key, v)}
                  isLast={i === NUTRITION_FIELDS.length - 1}
                />
              ))}
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
