import { useState, useEffect, useMemo } from 'react'

const PRIMARY     = '#EA5EAD'
const LS_FOODS        = 'cathealth_foods'
const LS_DAILY_FOODS  = 'cathealth_daily_foods'

const GROUPS = ['健康猫', 'ストルバイト', '腎臓サポート']

const REPEAT_OPTIONS = [
  { value: 'forever', label: '変更するまで継続' },
  { value: 'today',   label: '今日だけ' },
]

function loadFoods() {
  try { return JSON.parse(localStorage.getItem(LS_FOODS) || '[]') } catch { return [] }
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// ── アイコン ─────────────────────────────────────────────
function ExpandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22L6 16L7.425 14.575L12 19.15L16.575 14.575L18 16L12 22ZM7.45 9.4L6 8L12 2L18 8L16.55 9.4L12 4.85L7.45 9.4Z" fill="#9CA3AF"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" fill={PRIMARY}/>
    </svg>
  )
}

// ── SelectFormRow（行全体がタップ領域の選択行）────────────
function SelectFormRow({ label, value, displayText, options, onChange, placeholder = '選択してください', last = false }) {
  return (
    <>
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          minHeight: 52, padding: '0 16px', gap: 12,
        }}>
          <span style={{ fontSize: 14, color: '#111827', flexShrink: 0, width: 80 }}>{label}</span>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 14, color: value ? '#0F172A' : '#9CA3AF' }}>
              {displayText || placeholder}
            </span>
            <ExpandIcon />
          </div>
        </div>
        {/* 透明なselectが行全体を覆う */}
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            position: 'absolute', inset: 0,
            opacity: 0, cursor: 'pointer', width: '100%',
          }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(o => (
            <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
              {typeof o === 'string' ? o : o.label}
            </option>
          ))}
        </select>
      </div>
      {!last && <div style={{ height: 1, background: '#F0F0F0' }} />}
    </>
  )
}

// ── DailyFoodSheet ────────────────────────────────────────
export default function DailyFoodSheet({
  catId,
  selectedDate,
  onClose,
  onSave,
  onStop,
  initialSchedule = null,
}) {
  const isEdit   = initialSchedule !== null
  const allFoods = useMemo(loadFoods, [])

  // 編集時：既存フードから初期化 / 新規時：給餌中の猫IDが一致するフードを自動選択
  const initialFood = isEdit
    ? allFoods.find(f => f.id === initialSchedule.foodId)
    : allFoods.find(f => f.feedingCatIds?.includes(catId)) ?? null

  const [group,  setGroup]  = useState(initialFood?.group  ?? '')
  const [maker,  setMaker]  = useState(initialFood?.maker  ?? '')
  const [type,   setType]   = useState(initialFood?.type   ?? '')
  const [foodId, setFoodId] = useState(initialSchedule?.foodId ?? initialFood?.id ?? '')
  const [amount, setAmount] = useState(initialSchedule?.amount ?? '')
  const [repeat, setRepeat] = useState(initialSchedule?.repeat ?? 'forever')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // ── カスケード絞り込み ──────────────────────────────────
  const foodsByGroup = useMemo(
    () => group ? allFoods.filter(f => f.group === group) : allFoods,
    [allFoods, group]
  )
  const uniqueMakers = useMemo(
    () => [...new Set(foodsByGroup.map(f => f.maker).filter(Boolean))].sort(),
    [foodsByGroup]
  )
  const foodsByMaker = useMemo(
    () => maker ? foodsByGroup.filter(f => f.maker === maker) : foodsByGroup,
    [foodsByGroup, maker]
  )
  const uniqueTypes = useMemo(
    () => [...new Set(foodsByMaker.map(f => f.type).filter(Boolean))].sort(),
    [foodsByMaker]
  )
  const foodsByType = useMemo(
    () => type ? foodsByMaker.filter(f => f.type === type) : foodsByMaker,
    [foodsByMaker, type]
  )
  // フード名の選択肢（{ value: id, label: name }）
  const foodOptions = useMemo(
    () => foodsByType.map(f => ({ value: f.id, label: f.name })),
    [foodsByType]
  )

  const selectedFood = useMemo(
    () => allFoods.find(f => f.id === foodId) ?? null,
    [allFoods, foodId]
  )

  const canSave = foodId && amount !== '' && Number(amount) > 0

  // ── ハンドラ ───────────────────────────────────────────
  function handleGroupChange(v) {
    setGroup(v)

    if (!v) {
      setMaker(''); setType(''); setFoodId('')
      return
    }

    const inGroup = allFoods.filter(f => f.group === v)

    // フード0件
    if (inGroup.length === 0) {
      setMaker(''); setType(''); setFoodId('')
      return
    }

    // フード1件 → 全フィールド自動選択
    if (inGroup.length === 1) {
      const f = inGroup[0]
      setMaker(f.maker ?? ''); setType(f.type ?? ''); setFoodId(f.id)
      return
    }

    // 複数件：メーカー→種類→フード名 の順に絞り込める範囲まで自動選択
    const makers = [...new Set(inGroup.map(f => f.maker).filter(Boolean))]
    if (makers.length !== 1) {
      // メーカーが複数 → ユーザーに選ばせる
      setMaker(''); setType(''); setFoodId('')
      return
    }

    const oneMaker = makers[0]
    setMaker(oneMaker)

    const byMaker = inGroup.filter(f => f.maker === oneMaker)
    if (byMaker.length === 1) {
      setType(byMaker[0].type ?? ''); setFoodId(byMaker[0].id)
      return
    }

    const types = [...new Set(byMaker.map(f => f.type).filter(Boolean))]
    if (types.length !== 1) {
      // 種類が複数 → ユーザーに選ばせる
      setType(''); setFoodId('')
      return
    }

    const oneType = types[0]
    setType(oneType)

    const byType = byMaker.filter(f => f.type === oneType)
    setFoodId(byType.length === 1 ? byType[0].id : '')
  }

  function handleMakerChange(v) {
    setMaker(v)
    setType('')
    setFoodId('')
  }

  function handleTypeChange(v) {
    setType(v)
    setFoodId('')
  }

  function handleSave() {
    if (!canSave) return
    const schedule = {
      id:          isEdit ? initialSchedule.id : genId(),
      catId,
      foodId,
      amount:      Number(amount),
      repeat,
      startDate:   isEdit ? initialSchedule.startDate : selectedDate,
      stoppedDate: null,
    }
    try {
      const prev = JSON.parse(localStorage.getItem(LS_DAILY_FOODS) || '[]')
      const next = isEdit
        ? prev.map(s => s.id === schedule.id ? schedule : s)
        : [...prev, schedule]
      localStorage.setItem(LS_DAILY_FOODS, JSON.stringify(next))
    } catch { /* ignore */ }
    onSave(schedule)
  }

  function handleStop() {
    if (!initialSchedule) return
    try {
      const prev = JSON.parse(localStorage.getItem(LS_DAILY_FOODS) || '[]')
      const next = prev.map(s =>
        s.id === initialSchedule.id ? { ...s, stoppedDate: selectedDate } : s
      )
      localStorage.setItem(LS_DAILY_FOODS, JSON.stringify(next))
    } catch { /* ignore */ }
    onStop(initialSchedule.id)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 400,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 375,
          background: '#F7F7F7',
          borderRadius: '20px 20px 0 0',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── ヘッダー ── */}
        <div style={{ flexShrink: 0 }}>
          {/* ドラッグハンドル */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: '#D1D5DB' }} />
          </div>

          {/* ×・タイトル・保存 */}
          <div style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px 16px 16px',
          }}>
            {/* × ボタン（左） */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', left: 16,
                width: 42, height: 42, borderRadius: '50%',
                border: 'none', background: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6"  y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* タイトル（中央） */}
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
              {isEdit ? 'フードアイテムを編集' : 'フードアイテムを追加'}
            </span>

            {/* 保存ボタン（右） */}
            <button
              onClick={handleSave}
              style={{
                position: 'absolute', right: 16,
                height: 42, padding: '0 24px', borderRadius: 999,
                border: 'none',
                background: PRIMARY,
                color: '#FFFFFF', fontSize: 14, fontWeight: 700,
                cursor: canSave ? 'pointer' : 'default',
                opacity: canSave ? 1 : 0.5,
                letterSpacing: '0.04em',
              }}
            >
              保存
            </button>
          </div>
        </div>

        {/* ── スクロール領域 ── */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 16px 0' }}>

            {/* フードアイテム ラベル */}
            <div style={{ padding: '4px 4px 2px' }}>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>フードアイテム</span>
            </div>

            {/* フードアイテム カード */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
              <SelectFormRow
                label="グループ"
                value={group}
                displayText={group}
                options={GROUPS}
                onChange={handleGroupChange}
                last={group !== '' && foodsByGroup.length === 0}
              />
              {group !== '' && foodsByGroup.length === 0 ? (
                <div style={{ padding: '12px 16px', fontSize: 14, color: '#9CA3AF' }}>
                  このグループにフードが登録されていません
                </div>
              ) : (
                <>
                  <SelectFormRow
                    label="メーカー"
                    value={maker}
                    displayText={maker}
                    options={uniqueMakers}
                    onChange={handleMakerChange}
                  />
                  <SelectFormRow
                    label="種類"
                    value={type}
                    displayText={type}
                    options={uniqueTypes}
                    onChange={handleTypeChange}
                  />
                  <SelectFormRow
                    label="フード名"
                    value={foodId}
                    displayText={selectedFood?.name ?? ''}
                    options={foodOptions}
                    onChange={setFoodId}
                    last
                  />
                </>
              )}
            </div>

            {/* スケジュール ラベル */}
            <div style={{ padding: '8px 4px 2px' }}>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>スケジュール</span>
            </div>

            {/* スケジュール カード */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
              {/* 1日あたりの量 */}
              <div style={{
                display: 'flex', alignItems: 'center',
                minHeight: 52, padding: '0 16px', gap: 12,
              }}>
                <span style={{ fontSize: 14, color: '#111827', flexShrink: 0, width: 120 }}>1日あたりの量</span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    background: '#F6F6F6', borderRadius: 15, height: 32,
                    display: 'flex', alignItems: 'center', padding: '0 10px',
                  }}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0"
                      style={{
                        border: 'none', outline: 'none',
                        background: 'transparent',
                        fontSize: 14, color: '#0F172A',
                        width: 56, textAlign: 'right',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 14, color: '#9CA3AF', flexShrink: 0 }}>g</span>
                </div>
              </div>

              <div style={{ height: 1, background: '#F0F0F0' }} />

              {/* 繰り返し */}
              <SelectFormRow
                label="繰り返し"
                value={repeat}
                displayText={REPEAT_OPTIONS.find(r => r.value === repeat)?.label ?? ''}
                options={REPEAT_OPTIONS}
                onChange={setRepeat}
                last
              />
            </div>

            {/* 停止するボタン（編集モードのみ） */}
            {isEdit && (
              <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={handleStop}
                  style={{
                    height: 48, padding: '0 32px', borderRadius: 999,
                    border: `1.5px solid ${PRIMARY}`, background: '#FFFFFF',
                    color: PRIMARY, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <TrashIcon />
                  停止する
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
