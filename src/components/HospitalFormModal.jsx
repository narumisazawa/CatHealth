import { useState, useEffect } from 'react'

const PRIMARY = '#EA5EAD'
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

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

const defaultDayHours = () => ({
  closed:   false,
  am:       { start: '09:30', end: '13:00' },
  pm:       { start: '16:00', end: '19:00' },
  amClosed: false,
  pmClosed: false,
})

const defaultHours = () =>
  Object.fromEntries(DAYS.map(d => [d.key, defaultDayHours()]))

// ── アイコン ─────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#FFFFFF"/>
    </svg>
  )
}

// ── Checkbox ─────────────────────────────────────────────
function Checkbox({ checked, onChange, disabled = false }) {
  return (
    <div
      onClick={disabled ? undefined : onChange}
      style={{
        width: 24, height: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer', flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 2,
        background: checked ? PRIMARY : 'transparent',
        border: checked ? 'none' : `2px solid rgba(0,0,0,${disabled ? 0.2 : 0.5})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <CheckIcon />}
      </div>
    </div>
  )
}

// ── FormRow（基本情報行） ─────────────────────────────────
function FormRow({ label, children, last = false }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', minHeight: 50, padding: '12px 24px', gap: 24 }}>
        <span className="text-text-secondary" style={{ width: 80, fontSize: 14, flexShrink: 0 }}>{label}</span>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
      {!last && <div style={{ height: 1, background: 'rgba(0,0,0,0.15)' }} />}
    </>
  )
}

const inputStyle = {
  border: 'none', outline: 'none',
  fontSize: 14,
  background: 'transparent', padding: 0,
  width: '100%',
}

// ── TimePill ─────────────────────────────────────────────
function TimePill({ value, onChange, disabled }) {
  return (
    <div style={{
      background: '#F6F6F6', borderRadius: 15, height: 32,
      display: 'flex', alignItems: 'center',
      padding: '0 10px', flexShrink: 0,
      opacity: disabled ? 0.45 : 1,
    }}>
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="text-text-primary"
        style={{
          border: 'none', outline: 'none',
          background: 'transparent',
          fontSize: 14,
          width: 70,
          cursor: disabled ? 'default' : 'pointer',
        }}
      />
    </div>
  )
}

// ── DayRow（診察時間1曜日分） ────────────────────────────
function DayRow({ label, data, onChange, last = false }) {
  const { closed, am, pm, amClosed, pmClosed } = data

  function set(path, value) {
    if (path.includes('.')) {
      const [obj, key] = path.split('.')
      onChange({ ...data, [obj]: { ...data[obj], [key]: value } })
    } else {
      onChange({ ...data, [path]: value })
    }
  }

  return (
    <>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* 行1：曜日ラベル */}
        <span className="text-text-primary" style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>

        {/* 行2：定休日 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Checkbox checked={closed} onChange={() => set('closed', !closed)} />
          <span className="text-text-primary" style={{ fontSize: 14 }}>定休日</span>
        </div>

        {/* 行3：午前 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          opacity: closed ? 0.4 : 1,
          pointerEvents: closed ? 'none' : 'auto',
        }}>
          <TimePill value={am.start} onChange={v => set('am.start', v)} disabled={amClosed} />
          <span className="text-text-primary" style={{ fontSize: 12 }}>〜</span>
          <TimePill value={am.end}   onChange={v => set('am.end',   v)} disabled={amClosed} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
            <Checkbox checked={amClosed} onChange={() => set('amClosed', !amClosed)} />
            <span className="text-text-primary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>午前休診</span>
          </div>
        </div>

        {/* 行4：午後 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          opacity: closed ? 0.4 : 1,
          pointerEvents: closed ? 'none' : 'auto',
        }}>
          <TimePill value={pm.start} onChange={v => set('pm.start', v)} disabled={pmClosed} />
          <span className="text-text-primary" style={{ fontSize: 12 }}>〜</span>
          <TimePill value={pm.end}   onChange={v => set('pm.end',   v)} disabled={pmClosed} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
            <Checkbox checked={pmClosed} onChange={() => set('pmClosed', !pmClosed)} />
            <span className="text-text-primary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>午後休診</span>
          </div>
        </div>

      </div>
      {!last && <div style={{ height: 1, background: 'rgba(0,0,0,0.15)' }} />}
    </>
  )
}

// ── HospitalFormModal ─────────────────────────────────────
// initialHospital が渡された場合は「編集モード」
export default function HospitalFormModal({ onSave, onClose, initialHospital = null }) {
  const isEdit = initialHospital !== null

  const [name,    setName]    = useState(initialHospital?.name    || '')
  const [address, setAddress] = useState(initialHospital?.address || '')
  const [phone,   setPhone]   = useState(initialHospital?.phone   || '')
  const [hours,   setHours]   = useState(() => {
    if (initialHospital?.hours) return initialHospital.hours
    return defaultHours()
  })
  const [memo,    setMemo]    = useState(initialHospital?.memo    || '')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function updateDay(key, data) {
    setHours(prev => ({ ...prev, [key]: data }))
  }

  function handleSave() {
    const hospital = {
      id:      isEdit ? initialHospital.id : genId(),
      name, address, phone, hours, memo,
    }
    try {
      const prev = JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]')
      const next = isEdit
        ? prev.map(h => h.id === hospital.id ? hospital : h)
        : [...prev, hospital]
      localStorage.setItem(LS_HOSPITALS, JSON.stringify(next))
    } catch { /* ignore */ }
    onSave(hospital)
  }

  const canSave = name.trim() !== ''

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 300,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      {/* ── モーダル本体 ── */}
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
        {/* ── 固定ヘッダー ── */}
        <div style={{ flexShrink: 0 }}>
          {/* トップバー：ドラッグハンドル ＋ × / 保存 */}
          <div style={{
            position: 'relative',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 16px 16px',
          }}>
            {/* ドラッグハンドル */}
            <div style={{
              position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
              width: 36, height: 4, borderRadius: 999, background: '#D1D5DB',
            }} />

            {/* × ボタン */}
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
                <line x1="18" y1="6"  x2="6"  y2="18"/>
                <line x1="6"  y1="6"  x2="18" y2="18"/>
              </svg>
            </button>

            {/* 保存ボタン */}
            <button
              onClick={handleSave}
              style={{
                height: 42, padding: '0 28px', borderRadius: 999,
                border: 'none', background: PRIMARY,
                color: '#FFFFFF', fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                opacity: canSave ? 1 : 0.5,
                letterSpacing: '0.04em',
              }}
            >
              保存
            </button>
          </div>
        </div>

        {/* ── スクロール領域 ── */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px 0' }}>

          {/* 基本情報カード */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
            <FormRow label="動物病院名">
              <input
                className="text-text-primary"
                style={inputStyle}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="動物病院名を入力"
              />
            </FormRow>
            <FormRow label="住所">
              <input
                className="text-text-primary"
                style={inputStyle}
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="住所を入力"
              />
            </FormRow>
            <FormRow label="電話" last>
              <input
                className="text-text-primary"
                style={inputStyle}
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="電話番号を入力"
              />
            </FormRow>
          </div>

          {/* 診察時間ラベル */}
          <div style={{ padding: '8px 8px 4px' }}>
            <span className="text-text-secondary" style={{ fontSize: 12 }}>診察時間</span>
          </div>

          {/* 診察時間カード */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
            {DAYS.map((day, i) => (
              <DayRow
                key={day.key}
                label={day.label}
                data={hours[day.key]}
                onChange={data => updateDay(day.key, data)}
                last={i === DAYS.length - 1}
              />
            ))}
          </div>

          {/* メモラベル */}
          <div style={{ padding: '8px 8px 4px' }}>
            <span className="text-text-secondary" style={{ fontSize: 12 }}>メモ</span>
          </div>

          {/* メモカード */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden', padding: 16 }}>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="メモを入力"
              rows={4}
              className="text-text-primary"
              style={{
                width: '100%', border: 'none', outline: 'none',
                resize: 'vertical',
                fontSize: 14,
                background: 'transparent', padding: 0,
                lineHeight: 1.6,
                boxSizing: 'border-box',
              }}
            />
          </div>

          </div>
        </div>

      </div>
    </div>
  )
}
