import { useState } from 'react'
import FoodFormModal from '../components/FoodFormModal.jsx'

const PRIMARY          = '#EA5EAD'
const LS_FOODS         = 'cathealth_foods'
const LS_CATS          = 'cathealth_cats'
const LS_DAILY_FOODS   = 'cathealth_daily_foods'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const lsPhotoKey = id => `cathealth_photo_${id}`

const NUTRITION_FIELDS = [
  { key: 'protein',      label: 'たんぱく質',         unit: '%'         },
  { key: 'fat',          label: '脂質',               unit: '%'         },
  { key: 'fiber',        label: '粗繊維',             unit: '%'         },
  { key: 'ash',          label: '灰分',               unit: '%'         },
  { key: 'nfe',          label: '炭水化物（N.F.E）',  unit: '%'         },
  { key: 'dietaryFiber', label: '食物繊維',           unit: '%'         },
  { key: 'calcium',      label: 'カルシウム',         unit: '%'         },
  { key: 'phosphorus',   label: 'リン',               unit: '%'         },
  { key: 'potassium',    label: 'カリウム',           unit: '%'         },
  { key: 'sodium',       label: 'ナトリウム',         unit: '%'         },
  { key: 'chlorine',     label: 'クロール',           unit: '%'         },
  { key: 'magnesium',    label: 'マグネシウム',       unit: '%'         },
  { key: 'iron',         label: '鉄',                 unit: 'mg/kg'     },
  { key: 'copper',       label: '銅',                 unit: 'mg/kg'     },
  { key: 'zinc',         label: '亜鉛',               unit: 'mg/kg'     },
  { key: 'dhaEpa',       label: 'DHA＋EPA',           unit: '%'         },
  { key: 'tryptophan',   label: 'トリプトファン',     unit: '%'         },
  { key: 'taurine',      label: 'タウリン',           unit: '%'         },
  { key: 'energy',       label: '代謝エネルギー',     unit: 'kcal/100g' },
  { key: 'origin',       label: '原産国',             unit: ''          },
]

function loadCats() {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_CATS) || '[]')
    return arr.map(c => ({ ...c, photo: localStorage.getItem(lsPhotoKey(c.id)) || null }))
  } catch { return [] }
}

// ── アイコン ─────────────────────────────────────────────
function ArrowBackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="#0F172A"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#FFFFFF"/>
    </svg>
  )
}

// ── Checkbox ─────────────────────────────────────────────
function Checkbox({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 24, height: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18,
        borderRadius: 2,
        background: checked ? PRIMARY : 'transparent',
        border: checked ? 'none' : '2px solid rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <CheckIcon />}
      </div>
    </div>
  )
}

// ── InfoRow（基本情報行） ─────────────────────────────────
function InfoRow({ label, value, last = false }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center',
        minHeight: 50, padding: '12px 24px', gap: 24,
      }}>
        <span style={{ width: 80, fontSize: 14, color: '#111827', flexShrink: 0 }}>{label}</span>
        <span style={{ flex: 1, fontSize: 14, color: '#0F172A', lineHeight: 1.5 }}>{value || '—'}</span>
      </div>
      {!last && <div style={{ height: 1, background: 'rgba(0,0,0,0.15)' }} />}
    </>
  )
}

// ── NutritionRow（栄養成分行） ────────────────────────────
function NutritionRow({ label, unit, value, last = false }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 50, padding: '0 24px', gap: 24,
      }}>
        <span style={{ flex: 1, fontSize: 14, color: '#0F172A' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{
            fontSize: 14, color: '#0F172A',
            textAlign: 'right', minWidth: 52,
          }}>
            {(value !== '' && value != null) ? value : '—'}
          </span>
          <span style={{
            fontSize: 12, color: '#0F172A',
            width: 56, flexShrink: 0,
          }}>
            {unit}
          </span>
        </div>
      </div>
      {!last && <div style={{ height: 1, background: 'rgba(0,0,0,0.15)' }} />}
    </>
  )
}

// ── FoodDetailScreen ──────────────────────────────────────
export default function FoodDetailScreen({ food: initialFood, onBack }) {
  const [food,     setFood]     = useState(initialFood)
  const [showEdit, setShowEdit] = useState(false)
  const cats = loadCats()
  const feedingCatIds = food.feedingCatIds || []

  function toggleCat(catId) {
    const isAdding = !feedingCatIds.includes(catId)
    const next = isAdding
      ? [...feedingCatIds, catId]
      : feedingCatIds.filter(id => id !== catId)
    const updated = { ...food, feedingCatIds: next }
    try {
      const foods = JSON.parse(localStorage.getItem(LS_FOODS) || '[]')
      localStorage.setItem(LS_FOODS, JSON.stringify(foods.map(f => f.id === food.id ? updated : f)))
    } catch { /* ignore */ }

    // 給餌中に追加した場合、Dailyのフードスケジュールに追加する
    if (isAdding) {
      try {
        const today = todayStr()
        const schedules = JSON.parse(localStorage.getItem(LS_DAILY_FOODS) || '[]')
        const alreadyExists = schedules.some(
          s => s.catId === catId && s.foodId === food.id && s.repeat === 'forever' && (!s.stoppedDate || s.stoppedDate > today)
        )
        if (!alreadyExists) {
          const newSchedule = {
            id: genId(),
            catId,
            foodId: food.id,
            amount: 0,
            repeat: 'forever',
            startDate: today,
            stoppedDate: null,
          }
          localStorage.setItem(LS_DAILY_FOODS, JSON.stringify([...schedules, newSchedule]))
        }
      } catch { /* ignore */ }
    }

    setFood(updated)
  }

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: '#F7F7F7',
      overflow: 'hidden',
    }}>

      {/* ── 固定ヘッダー ── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#F7F7F7',
      }}>
        {/* 戻るボタン */}
        <button
          onClick={onBack}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            border: 'none', background: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ArrowBackIcon />
        </button>

        {/* 編集ボタン */}
        <button
          onClick={() => setShowEdit(true)}
          style={{
            height: 45, padding: '0 24px', borderRadius: 999,
            border: `1.5px solid ${PRIMARY}`, background: '#FFFFFF',
            color: PRIMARY, fontSize: 14, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.04em',
          }}
        >
          編集
        </button>
      </div>

      {/* ── スクロール領域 ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 16px 16px' }}>

          {/* 給餌中チェックボックス */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              minHeight: 50, padding: '0 24px', gap: 24,
            }}>
              <span style={{ width: 80, fontSize: 14, color: 'rgba(0,0,0,0.7)', flexShrink: 0 }}>給餌中</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                {cats.map(cat => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Checkbox
                      checked={feedingCatIds.includes(cat.id)}
                      onChange={() => toggleCat(cat.id)}
                    />
                    <span style={{ fontSize: 14, color: '#0F172A' }}>{cat.name}</span>
                  </div>
                ))}
                {cats.length === 0 && (
                  <span style={{ fontSize: 14, color: '#9CA3AF' }}>猫が登録されていません</span>
                )}
              </div>
            </div>
          </div>

          {/* フード画像 */}
          <div style={{
            background: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '12px 24px',
          }}>
            {food.image
              ? (
                <img
                  src={food.image}
                  alt="food"
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'contain' }}
                />
              ) : (
                <div style={{
                  width: '100%', aspectRatio: '4/3',
                  background: '#F3F4F6', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>画像なし</span>
                </div>
              )
            }
          </div>

          {/* 基本情報カード */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
            <InfoRow label="グループ" value={food.group} />
            <InfoRow label="メーカー" value={food.maker} />
            <InfoRow label="種類"     value={food.type}  />
            <InfoRow label="フード名" value={food.name}  last />
          </div>

          {/* 栄養成分ラベル */}
          <div>
            <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>栄養成分</span>
          </div>

          {/* 栄養成分カード */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
            {NUTRITION_FIELDS.map((f, i) => (
              <NutritionRow
                key={f.key}
                label={f.label}
                unit={f.unit}
                value={food.nutrition?.[f.key]}
                last={i === NUTRITION_FIELDS.length - 1}
              />
            ))}
          </div>

        </div>
      </div>

      {/* 編集モーダル */}
      {showEdit && (
        <FoodFormModal
          initialFood={food}
          onSave={updated => {
            setFood(updated)
            setShowEdit(false)
          }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
