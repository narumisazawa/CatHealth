import { useState, useRef, useEffect } from 'react'

const PRIMARY = '#EA5EAD'

// ── ユーティリティ ──────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

async function compressImage(base64, maxWidth = 600, quality = 0.8) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = img.width  * scale
      canvas.height = img.height * scale
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = base64
  })
}

// ── 定数 ────────────────────────────────────────────────
const GROUP_OPTIONS = ['健康猫', 'ストルバイト', '腎臓サポート']
const TYPE_OPTIONS  = ['総合栄養食（ドライ）', '総合栄養食（ウェット）', 'おやつ']

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

// ── アイコン ─────────────────────────────────────────────
function CameraIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 17.5C13.25 17.5 14.3125 17.0625 15.1875 16.1875C16.0625 15.3125 16.5 14.25 16.5 13C16.5 11.75 16.0625 10.6875 15.1875 9.8125C14.3125 8.9375 13.25 8.5 12 8.5C10.75 8.5 9.6875 8.9375 8.8125 9.8125C7.9375 10.6875 7.5 11.75 7.5 13C7.5 14.25 7.9375 15.3125 8.8125 16.1875C9.6875 17.0625 10.75 17.5 12 17.5ZM4 21C3.45 21 2.97917 20.8042 2.5875 20.4125C2.19583 20.0208 2 19.55 2 19V7C2 6.45 2.19583 5.97917 2.5875 5.5875C2.97917 5.19583 3.45 5 4 5H7.15L9 3H15L16.85 5H20C20.55 5 21.0208 5.19583 21.4125 5.5875C21.8042 5.97917 22 6.45 22 7V19C22 19.55 21.8042 20.0208 21.4125 20.4125C21.0208 20.8042 20.55 21 20 21H4Z"
        fill="#9CA3AF"
      />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22L6 16L7.425 14.575L12 19.15L16.575 14.575L18 16L12 22ZM7.45 9.4L6 8L12 2L18 8L16.55 9.4L12 4.85L7.45 9.4Z" fill="#9CA3AF"/>
    </svg>
  )
}

// ── 共通スタイル ─────────────────────────────────────────
const inputStyle = {
  border: 'none', outline: 'none',
  fontSize: 14,
  background: 'transparent', padding: 0,
  width: '100%',
}

const numInputStyle = {
  border: 'none', outline: 'none',
  fontSize: 14,
  background: 'transparent', padding: 0,
  textAlign: 'right', width: '80px',
}

// ── FormRow ──────────────────────────────────────────────
function FormRow({ label, children, last = false }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', minHeight: 52, padding: '0 16px', gap: 12 }}>
        <span className="text-text-primary" style={{ width: 100, fontSize: 14, flexShrink: 0 }}>{label}</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>{children}</div>
      </div>
      {!last && <div style={{ height: 1, background: '#F0F0F0' }} />}
    </>
  )
}

// ── SelectRow ────────────────────────────────────────────
function SelectRow({ value, onChange, placeholder, options }) {
  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span className={value ? 'text-text-primary' : 'text-text-placeholder'} style={{ flex: 1, fontSize: 14, pointerEvents: 'none' }}>
        {value || placeholder}
      </span>
      <span style={{ pointerEvents: 'none' }}><ExpandIcon /></span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', fontSize: 14 }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ── NutritionRow ─────────────────────────────────────────
// unit === '' のとき原産国（テキスト入力）として扱う
function NutritionRow({ label, unit, value, onChange, last = false }) {
  const isText = unit === ''
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', height: 50, padding: '0 24px', gap: 24 }}>
        <span className="text-text-primary" style={{ flex: 1, fontSize: 14 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* 入力ピル */}
          <div style={{
            background: '#F6F6F6',
            borderRadius: 16,
            width: 60,
            padding: '6px 12px',
            display: 'flex', alignItems: 'center',
          }}>
            <input
              type={isText ? 'text' : 'number'}
              inputMode={isText ? 'text' : 'decimal'}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="—"
              className="text-text-primary"
              style={{
                border: 'none', outline: 'none',
                fontSize: 14,
                background: 'transparent', padding: 0,
                textAlign: 'right', width: '100%',
              }}
            />
          </div>
          {/* 単位（42px 固定幅） */}
          <div style={{ width: 42, flexShrink: 0 }}>
            {unit && (
              <span className="text-text-primary" style={{ fontSize: 12, fontWeight: 'normal' }}>{unit}</span>
            )}
          </div>
        </div>
      </div>
      {!last && <div style={{ height: 1, background: 'rgba(0,0,0,0.15)' }} />}
    </>
  )
}

// ── FoodFormModal ─────────────────────────────────────────
// initialFood が渡された場合は「編集モード」（既存データを更新）
export default function FoodFormModal({ onSave, onClose, initialFood = null }) {
  const isEdit = initialFood !== null
  const [image,  setImage]  = useState(initialFood?.image  || null)
  const [group,  setGroup]  = useState(initialFood?.group  || '')
  const [maker,  setMaker]  = useState(initialFood?.maker  || '')
  const [type,   setType]   = useState(initialFood?.type   || '')
  const [name,   setName]   = useState(initialFood?.name   || '')
  const [nutrition, setNutrition] = useState(() => {
    const blank = Object.fromEntries(NUTRITION_FIELDS.map(f => [f.key, '']))
    return initialFood?.nutrition ? { ...blank, ...initialFood.nutrition } : blank
  })

  const fileRef = useRef(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  async function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      const compressed = await compressImage(ev.target.result)
      setImage(compressed)
    }
    reader.readAsDataURL(file)
  }

  function setNutritionField(key, val) {
    setNutrition(prev => ({ ...prev, [key]: val }))
  }

  function handleSave() {
    const food = {
      id:           isEdit ? initialFood.id : genId(),
      feedingCatIds: isEdit ? (initialFood.feedingCatIds || []) : [],
      image: image || '',
      group,
      maker,
      type,
      name,
      nutrition,
    }
    try {
      const prev = JSON.parse(localStorage.getItem('cathealth_foods') || '[]')
      const next = isEdit
        ? prev.map(f => f.id === food.id ? food : f)
        : [...prev, food]
      localStorage.setItem('cathealth_foods', JSON.stringify(next))
    } catch { /* ignore */ }
    onSave(food)
  }

  const canSave = name.trim() !== ''

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
    {/* モーダル本体 */}
    <div
      onClick={e => e.stopPropagation()}
      style={{
        width: '100%', maxWidth: 430,
        background: '#F7F7F7',
        borderRadius: '20px 20px 0 0',
        maxHeight: '95dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >

      {/* ── 固定エリア：ヘッダーのみ ── */}
      <div style={{ flexShrink: 0 }}>

        {/* ヘッダー：ドラッグハンドル + × / 保存 */}
        <div style={{
          position: 'relative',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 16px',
        }}>
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            width: 36, height: 4, borderRadius: 999, background: '#D1D5DB',
          }} />
          <button
            onClick={onClose}
            style={{
              width: 42, height: 42, borderRadius: '50%',
              border: 'none', background: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <button
            onClick={handleSave}
            style={{
              height: 42, padding: '0 28px', borderRadius: 999,
              border: 'none', background: PRIMARY,
              color: '#FFFFFF', fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
              opacity: canSave ? 1 : 0.5,
            }}
          >
            保存
          </button>
        </div>
      </div>

      {/* ── スクロール領域：画像エリア＋フォーム ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 48 }}>

        {/* 画像エリア */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          padding: '0 24px 20px',
        }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%',
              aspectRatio: '4/3',
              background: '#FFFFFF',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden',
            }}
          >
            {image
              ? <img src={image} alt="food" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <CameraIcon />
            }
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-primary"
            style={{
              padding: '6px 24px', borderRadius: 999,
              border: `1.5px solid ${PRIMARY}`, background: 'transparent',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            画像登録
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </div>

        {/* 基本情報カード */}
        <div style={{ margin: '0 16px 16px', background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
          <FormRow label="グループ">
            <SelectRow
              value={group}
              onChange={setGroup}
              placeholder="選択してください"
              options={GROUP_OPTIONS}
            />
          </FormRow>

          <FormRow label="メーカー">
            <input
              className="text-text-primary"
              style={inputStyle}
              value={maker}
              onChange={e => setMaker(e.target.value)}
              placeholder="メーカーを入力"
            />
          </FormRow>

          <FormRow label="種類">
            <SelectRow
              value={type}
              onChange={setType}
              placeholder="選択してください"
              options={TYPE_OPTIONS}
            />
          </FormRow>

          <FormRow label="フード名" last>
            <input
              className="text-text-primary"
              style={inputStyle}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="フード名を入力"
            />
          </FormRow>
        </div>

        {/* 栄養成分ラベル（カード外） */}
        <div style={{ padding: '0 16px 8px' }}>
          <span className="text-text-secondary" style={{ fontSize: 12 }}>栄養成分</span>
        </div>

        {/* 栄養成分カード */}
        <div style={{ margin: '0 16px', background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
          {NUTRITION_FIELDS.map((f, i) => (
            <NutritionRow
              key={f.key}
              label={f.label}
              unit={f.unit}
              value={nutrition[f.key]}
              onChange={val => setNutritionField(f.key, val)}
              last={i === NUTRITION_FIELDS.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
    </div>
  )
}
