import { useState } from 'react'
import FoodFormModal from '../components/FoodFormModal.jsx'
import FoodDetailScreen from './FoodDetailScreen.jsx'

const PRIMARY = '#EA5EAD'
const LS_FOODS = 'cathealth_foods'
const LS_CATS  = 'cathealth_cats'
const lsPhotoKey = id => `cathealth_photo_${id}`

// ── localStorage ──────────────────────────────────────
function loadFoods() {
  try { return JSON.parse(localStorage.getItem(LS_FOODS) || '[]') } catch { return [] }
}

function loadCats() {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_CATS) || '[]')
    return arr.map(c => ({ ...c, photo: localStorage.getItem(lsPhotoKey(c.id)) || null }))
  } catch { return [] }
}

// ── グループ定義（表示順・ラベル） ───────────────────────
const GROUPS = [
  { value: '健康猫',     label: '健康猫' },
  { value: 'ストルバイト', label: 'ストルバイト猫' },
  { value: '腎臓サポート', label: '腎臓サポート' },
]

// 種類 → 短縮ラベル
const TYPE_LABEL = {
  '総合栄養食（ドライ）':  'ドライ',
  '総合栄養食（ウェット）': 'ウェット',
  'おやつ':               'おやつ',
}

// ── アイコン ────────────────────────────────────────────
function FoodBowlIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 4C14.2972 4 16.4215 4.34755 18.0078 4.94238C18.7973 5.23843 19.5062 5.61502 20.0352 6.08398C20.527 6.52015 20.9394 7.11055 20.9932 7.83887L22.9619 14.7666L23 14.9004V15.04C23 15.8285 22.4919 16.5073 21.9736 16.999C21.4138 17.5301 20.6423 18.0345 19.7285 18.4697C17.8948 19.3431 15.3605 20 12.4541 20C9.55185 19.9999 6.80672 19.3443 4.76855 18.4883C3.75243 18.0615 2.87446 17.5699 2.23145 17.0547C1.91046 16.7975 1.62045 16.5122 1.40332 16.2021C1.19108 15.899 1.00001 15.5013 1 15.04V14.8906L1.04395 14.748L3.01855 8.28906C3.00598 8.19514 3 8.09872 3 8C3 7.19722 3.43717 6.5519 3.96484 6.08398C4.49379 5.61502 5.20273 5.23843 5.99219 4.94238C7.57848 4.34755 9.70276 4 12 4ZM19.6006 10.2539C19.1422 10.5699 18.5976 10.8364 18.0078 11.0576C16.4215 11.6525 14.2972 12 12 12C9.70276 12 7.57848 11.6525 5.99219 11.0576C5.44057 10.8508 4.92929 10.603 4.49023 10.3135L3.04102 15.0527L3.04199 15.0547C3.11613 15.1606 3.25477 15.3108 3.48242 15.4932C3.93649 15.857 4.63635 16.2637 5.54297 16.6445C7.35116 17.4039 9.83383 17.9999 12.4541 18C15.0705 18 17.3099 17.4062 18.8682 16.6641C19.6501 16.2917 20.2297 15.8968 20.5967 15.5488C20.8392 15.3187 20.9342 15.1602 20.9727 15.083L19.6006 10.2539ZM12 6C9.87903 6 8.00346 6.32451 6.69434 6.81543C6.03626 7.06222 5.5727 7.33126 5.29199 7.58008C5.01013 7.82998 5 7.97447 5 8C5 8.02553 5.01013 8.17002 5.29199 8.41992C5.5727 8.66874 6.03626 8.93778 6.69434 9.18457C8.00346 9.67549 9.87903 10 12 10C14.121 10 15.9965 9.67549 17.3057 9.18457C17.9637 8.93778 18.4273 8.66874 18.708 8.41992C18.9899 8.17002 19 8.02553 19 8C19 7.97447 18.9899 7.82998 18.708 7.58008C18.4273 7.33126 17.9637 7.06222 17.3057 6.81543C15.9965 6.32451 14.121 6 12 6Z" fill="#374151"/>
    </svg>
  )
}

function SnackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M14.1875 21L5 5.54879L9.90113 3L19 18.3022L14.1875 21Z" stroke="#374151" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  )
}

function TuneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <mask id="tune-mask" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#tune-mask)">
        <path d="M11 21V15H13V17H21V19H13V21H11ZM3 19V17H9V19H3ZM7 15V13H3V11H7V9H9V15H7ZM11 13V11H21V13H11ZM15 9V3H17V5H21V7H17V9H15ZM3 7V5H13V7H3Z" fill="#374151"/>
      </g>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="#9CA3AF"/>
    </svg>
  )
}

// ── TypeIcon：アイコン＋ラベルの縦スタック ──────────────
function TypeIcon({ type }) {
  const label = TYPE_LABEL[type] ?? type
  const isSnack = type === 'おやつ'
  return (
    <div style={{
      width: 36,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      flexShrink: 0,
    }}>
      {isSnack ? <SnackIcon /> : <FoodBowlIcon />}
      <span style={{ fontSize: 9, color: '#111827', lineHeight: 1 }}>{label}</span>
    </div>
  )
}

// ── FoodRow ────────────────────────────────────────────
function FoodRow({ food, cats, isLast, onSelect }) {
  const feedingCats = cats.filter(c => food.feedingCatIds?.includes(c.id))

  return (
    <>
      <div
        onClick={() => onSelect(food)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          gap: 12,
          minHeight: 56,
          cursor: 'pointer',
        }}
      >
        {/* 種類アイコン */}
        <TypeIcon type={food.type} />

        {/* メーカー・フード名 */}
        <div style={{
          flex: 1,
          fontSize: 14,
          color: '#111827',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          <span style={{ color: '#374151' }}>{food.maker}</span>
          {food.maker && food.name ? '　' : ''}
          <span>{food.name}</span>
        </div>

        {/* 給餌中の猫名 + 矢印 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}>
          {feedingCats.length > 0 && (
            <span style={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>
              {feedingCats.map(c => c.name).join(' ')}
            </span>
          )}
          <ChevronRight />
        </div>
      </div>
      {!isLast && <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px' }} />}
    </>
  )
}

// ── EmptyState ────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 32px',
    }}>
      <p style={{ margin: 0, fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.6 }}>
        まだフードが登録されていません。<br />
        右上の「+ フードを追加」から追加してください。
      </p>
    </div>
  )
}

// ── FoodsScreen ───────────────────────────────────────
export default function FoodsScreen() {
  const [foods,        setFoods]        = useState(loadFoods)
  const [cats]                          = useState(loadCats)
  const [showModal,    setShowModal]    = useState(false)
  const [selectedFood, setSelectedFood] = useState(null)

  function handleSave(food) {
    setFoods(prev => [...prev, food])
    setShowModal(false)
  }

  // 詳細画面表示中
  if (selectedFood) {
    return (
      <FoodDetailScreen
        food={selectedFood}
        onBack={() => {
          // 詳細画面で給餌中が変更された可能性があるのでリロード
          setFoods(loadFoods())
          setSelectedFood(null)
        }}
      />
    )
  }

  // グループ別に振り分け（登録フードが存在するグループのみ表示）
  const groupedFoods = GROUPS
    .map(g => ({
      ...g,
      foods: foods.filter(f => f.group === g.value),
    }))
    .filter(g => g.foods.length > 0)

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: '#F7F7F7',
      overflow: 'hidden',
    }}>

      {/* ── 固定ヘッダー ── */}
      <div style={{ flexShrink: 0, background: '#F7F7F7' }}>
        {/* タイトル行 */}
        <header style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 60,
          padding: '0 16px',
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>
            Foods
          </span>
          <button
            onClick={() => setShowModal(true)}
            style={{
              position: 'absolute',
              right: 16,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: PRIMARY,
              fontSize: 14,
              fontWeight: 600,
              padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            フードを追加
          </button>
        </header>

        {/* フィルターアイコン行 */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '8px 16px 4px',
        }}>
          <button style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}>
            <TuneIcon />
          </button>
        </div>
      </div>

      {/* ── スクロール領域 ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {foods.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '8px 0 0' }}>
            {groupedFoods.map(group => (
              <section key={group.value}>
                {/* グループ見出し */}
                <div style={{
                  padding: '0 16px 8px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#111827',
                }}>
                  {group.label}
                </div>

                {/* フードリストカード */}
                <div style={{
                  margin: '0 16px',
                  background: '#FFFFFF',
                  borderRadius: 16,
                  overflow: 'hidden',
                }}>
                  {group.foods.map((food, i) => (
                    <FoodRow
                      key={food.id}
                      food={food}
                      cats={cats}
                      isLast={i === group.foods.length - 1}
                      onSelect={setSelectedFood}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <FoodFormModal
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
