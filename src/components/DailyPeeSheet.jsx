import { useState, useEffect, useRef } from 'react'

const PRIMARY   = '#EA5EAD'
const LS_PEE    = 'cathealth_daily_pee'

const CONDITION_OPTIONS = [
  { value: '正常',         label: '正常' },
  { value: '血尿',         label: '血尿' },
  { value: '頻尿',         label: '頻尿' },
  { value: '少量',         label: '少量' },
  { value: '無尿',         label: '無尿' },
  { value: 'other',        label: 'その他（自由入力）' },
]

const PRESET_VALUES = ['正常', '血尿', '頻尿', '少量', '無尿']

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function nowTimeStr() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function compressImage(base64, maxWidth = 400, quality = 0.75) {
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

// ── アイコン ─────────────────────────────────────────────
function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 17.5C13.25 17.5 14.3125 17.0625 15.1875 16.1875C16.0625 15.3125 16.5 14.25 16.5 13C16.5 11.75 16.0625 10.6875 15.1875 9.8125C14.3125 8.9375 13.25 8.5 12 8.5C10.75 8.5 9.6875 8.9375 8.8125 9.8125C7.9375 10.6875 7.5 11.75 7.5 13C7.5 14.25 7.9375 15.3125 8.8125 16.1875C9.6875 17.0625 10.75 17.5 12 17.5ZM4 21C3.45 21 2.97917 20.8042 2.5875 20.4125C2.19583 20.0208 2 19.55 2 19V7C2 6.45 2.19583 5.97917 2.5875 5.5875C2.97917 5.19583 3.45 5 4 5H7.15L9 3H15L16.85 5H20C20.55 5 21.0208 5.19583 21.4125 5.5875C21.8042 5.97917 22 6.45 22 7V19C22 19.55 21.8042 20.0208 21.4125 20.4125C21.0208 20.8042 20.55 21 20 21H4Z" fill="#9CA3AF"/>
    </svg>
  )
}

function ExpandAllIcon() {
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

// ── FormRow ───────────────────────────────────────────────
function FormRow({ label, children, last = false }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center',
        minHeight: 52, padding: '0 16px', gap: 12,
      }}>
        <span className="text-text-primary" style={{ fontSize: 14, flexShrink: 0 }}>{label}</span>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>{children}</div>
      </div>
      {!last && <div style={{ height: 1, background: '#F0F0F0' }} />}
    </>
  )
}

// ── DailyPeeSheet ─────────────────────────────────────────
export default function DailyPeeSheet({
  catId,
  selectedDate,
  onClose,
  onSave,
  onDelete,
  initialRecord = null,
}) {
  const isEdit  = initialRecord !== null
  const fileRef = useRef(null)

  const [time,           setTime]           = useState(initialRecord?.time ?? nowTimeStr())
  const [photo,          setPhoto]          = useState(initialRecord?.photo ?? null)

  const savedCondition = initialRecord?.condition ?? '正常'
  const isCustom = savedCondition && !PRESET_VALUES.includes(savedCondition)
  const [condition,       setCondition]       = useState(isCustom ? 'other' : savedCondition)
  const [customCondition, setCustomCondition] = useState(isCustom ? savedCondition : '')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      const compressed = await compressImage(ev.target.result)
      setPhoto(compressed)
    }
    reader.readAsDataURL(file)
  }

  function handleSave() {
    const savedCond = condition === 'other' ? customCondition.trim() : condition
    if (!savedCond) return
    const record = {
      id:        isEdit ? initialRecord.id : genId(),
      catId,
      date:      selectedDate,
      time,
      condition: savedCond,
      photo:     photo ?? null,
    }
    try {
      const prev = JSON.parse(localStorage.getItem(LS_PEE) || '[]')
      const next = isEdit
        ? prev.map(r => r.id === record.id ? record : r)
        : [...prev, record]
      localStorage.setItem(LS_PEE, JSON.stringify(next))
    } catch { /* ignore */ }
    onSave(record)
  }

  function handleDelete() {
    if (!initialRecord) return
    try {
      const prev = JSON.parse(localStorage.getItem(LS_PEE) || '[]')
      localStorage.setItem(LS_PEE, JSON.stringify(prev.filter(r => r.id !== initialRecord.id)))
    } catch { /* ignore */ }
    onDelete(initialRecord.id)
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
          width: '100%', maxWidth: 430,
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

            <span className="text-text-primary" style={{ fontSize: 16, fontWeight: 700 }}>
              おしっこ記録
            </span>

            <button
              onClick={handleSave}
              style={{
                position: 'absolute', right: 16,
                height: 42, padding: '0 24px', borderRadius: 999,
                border: 'none', background: PRIMARY,
                color: '#FFFFFF', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.04em',
              }}
            >
              保存
            </button>
          </div>
        </div>

        {/* ── スクロール領域 ── */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 16px 0' }}>

            {/* おしっこ確認ラベル */}
            <div style={{ padding: '4px 4px 2px' }}>
              <span className="text-text-secondary" style={{ fontSize: 12 }}>おしっこ確認</span>
            </div>

            {/* 入力カード */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>

              {/* 時間 */}
              <FormRow label="時間">
                <div style={{
                  background: '#F6F6F6', borderRadius: 15, height: 32,
                  display: 'flex', alignItems: 'center', padding: '0 10px',
                }}>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="text-text-primary"
                    style={{
                      border: 'none', outline: 'none',
                      background: 'transparent',
                      fontSize: 14,
                      width: 70,
                    }}
                  />
                </div>
              </FormRow>

              {/* 状態（行全体がタップ領域） */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  minHeight: 52, padding: '0 16px', gap: 12,
                }}>
                  <span className="text-text-primary" style={{ fontSize: 14, flexShrink: 0 }}>状態</span>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                    <span className="text-text-primary" style={{ fontSize: 14 }}>
                      {condition === 'other'
                        ? 'その他（自由入力）'
                        : CONDITION_OPTIONS.find(o => o.value === condition)?.label ?? condition}
                    </span>
                    <ExpandAllIcon />
                  </div>
                </div>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  style={{
                    position: 'absolute', inset: 0,
                    opacity: 0, cursor: 'pointer', width: '100%',
                  }}
                >
                  {CONDITION_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* その他：自由入力欄 */}
              {condition === 'other' && (
                <>
                  <div style={{ height: 1, background: '#F0F0F0' }} />
                  <div style={{ padding: '10px 16px' }}>
                    <input
                      type="text"
                      value={customCondition}
                      onChange={e => setCustomCondition(e.target.value)}
                      placeholder="状態を入力"
                      autoFocus
                      className="text-text-primary"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        border: 'none', outline: 'none',
                        fontSize: 14,
                        background: 'transparent', padding: 0,
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* 写真を撮るラベル */}
            <div style={{ padding: '8px 4px 2px' }}>
              <span className="text-text-secondary" style={{ fontSize: 12 }}>写真を撮る</span>
            </div>

            {/* 写真エリアカード */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 16 }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  width: 80, height: 80, borderRadius: 8,
                  border: '1.5px solid #E5E7EB',
                  background: '#F9FAFB',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', padding: 0,
                }}
              >
                {photo
                  ? <img src={photo} alt="pee" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <CameraIcon />
                }
              </button>
            </div>

            {/* 削除するボタン（編集モードのみ） */}
            {isEdit && (
              <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={handleDelete}
                  className="text-primary"
                  style={{
                    height: 48, padding: '0 32px', borderRadius: 999,
                    border: `1.5px solid ${PRIMARY}`, background: '#FFFFFF',
                    fontSize: 14, fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <TrashIcon />
                  削除する
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
