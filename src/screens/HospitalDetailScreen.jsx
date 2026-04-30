import { useState } from 'react'
import HospitalFormModal from '../components/HospitalFormModal.jsx'

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

// "09:30" → "9:30"
function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  return `${parseInt(h, 10)}:${m}`
}

// ── アイコン ─────────────────────────────────────────────
function ArrowBackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="#0F172A"/>
    </svg>
  )
}

// ── InfoRow ───────────────────────────────────────────────
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

// ── DayRow（診察時間 表示行） ─────────────────────────────
function DayRow({ label, data, last = false }) {
  const { closed, am, pm, amClosed, pmClosed } = data

  function renderHours() {
    if (closed) {
      return <span style={{ fontSize: 14, color: '#0F172A' }}>定休日</span>
    }

    const amStr = `${formatTime(am.start)} 〜 ${formatTime(am.end)}`
    const pmStr = `${formatTime(pm.start)} 〜 ${formatTime(pm.end)}`

    if (amClosed && pmClosed) {
      return <span style={{ fontSize: 14, color: '#0F172A' }}>定休日</span>
    }
    if (amClosed) {
      return <span style={{ fontSize: 14, color: '#0F172A' }}>{pmStr}</span>
    }
    if (pmClosed) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: '#0F172A' }}>{amStr}</span>
          <span style={{ fontSize: 14, color: '#9CA3AF' }}>午後休診</span>
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 14, color: '#0F172A' }}>{amStr}</span>
        <span style={{ fontSize: 14, color: '#0F172A' }}>{pmStr}</span>
      </div>
    )
  }

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center',
        minHeight: 50, padding: '12px 24px', gap: 24,
      }}>
        <span style={{ width: 80, fontSize: 14, color: '#111827', flexShrink: 0 }}>{label}</span>
        <div style={{ flex: 1 }}>{renderHours()}</div>
      </div>
      {!last && <div style={{ height: 1, background: 'rgba(0,0,0,0.15)' }} />}
    </>
  )
}

// ── HospitalDetailScreen ──────────────────────────────────
export default function HospitalDetailScreen({ hospital: initialHospital, onBack, onUpdate }) {
  const [hospital, setHospital] = useState(initialHospital)
  const [showEdit, setShowEdit] = useState(false)

  function handleSave(updated) {
    setHospital(updated)
    setShowEdit(false)
    onUpdate?.(updated)
  }

  const hours = hospital.hours || {}

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
            height: 42, padding: '0 24px', borderRadius: 999,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px 16px' }}>

          {/* 基本情報カード */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
            <InfoRow label="動物病院名" value={hospital.name} />
            <InfoRow label="住所"       value={hospital.address} />
            <InfoRow label="電話"       value={hospital.phone} last />
          </div>

          {/* 診察時間ラベル */}
          <div style={{ padding: '8px 8px 4px' }}>
            <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>診察時間</span>
          </div>

          {/* 診察時間カード */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
            {DAYS.map((day, i) => (
              <DayRow
                key={day.key}
                label={day.label}
                data={hours[day.key] || { closed: false, am: { start: '', end: '' }, pm: { start: '', end: '' }, amClosed: false, pmClosed: false }}
                last={i === DAYS.length - 1}
              />
            ))}
          </div>

          {/* メモラベル */}
          <div style={{ padding: '8px 8px 4px' }}>
            <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>メモ</span>
          </div>

          {/* メモカード */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden', padding: '12px 24px' }}>
            {hospital.memo
              ? <p style={{ margin: 0, fontSize: 14, color: '#0F172A', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{hospital.memo}</p>
              : <p style={{ margin: 0, fontSize: 14, color: '#9CA3AF' }}>—</p>
            }
          </div>

        </div>
      </div>

      {/* 編集モーダル */}
      {showEdit && (
        <HospitalFormModal
          initialHospital={hospital}
          onSave={handleSave}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
