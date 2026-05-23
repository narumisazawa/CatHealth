import { useState } from 'react'
import HospitalFormModal from '../components/HospitalFormModal.jsx'
import HospitalDetailScreen from './HospitalDetailScreen.jsx'

const PRIMARY = '#EA5EAD'
const LS_HOSPITALS = 'cathealth_hospitals'

// ── localStorage ──────────────────────────────────────
function loadHospitals() {
  try { return JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]') } catch { return [] }
}

// ── アイコン ─────────────────────────────────────────────
function AddIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z" fill={PRIMARY}/>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#374151]">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="currentColor"/>
    </svg>
  )
}

// ── HospitalRow ──────────────────────────────────────────
function HospitalRow({ hospital, onSelect }) {
  return (
    <div
      onClick={() => onSelect(hospital)}
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        margin: '0 16px',
      }}
    >
      <span style={{ fontSize: 14, color: '#0F172A', fontWeight: 500 }}>
        {hospital.name}
      </span>
      <ChevronRight />
    </div>
  )
}

// ── EmptyState ───────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 32px',
    }}>
      <p style={{ margin: 0, fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.6 }}>
        まだ動物病院が登録されていません。
      </p>
    </div>
  )
}

// ── HospitalScreen ───────────────────────────────────────
export default function HospitalScreen() {
  const [hospitals,        setHospitals]        = useState(loadHospitals)
  const [showModal,        setShowModal]        = useState(false)
  const [selectedHospital, setSelectedHospital] = useState(null)

  function handleSave(hospital) {
    setHospitals(prev => {
      const exists = prev.some(h => h.id === hospital.id)
      return exists ? prev.map(h => h.id === hospital.id ? hospital : h) : [...prev, hospital]
    })
    setShowModal(false)
  }

  // 詳細画面
  if (selectedHospital) {
    return (
      <HospitalDetailScreen
        hospital={selectedHospital}
        onBack={() => {
          setHospitals(loadHospitals())
          setSelectedHospital(null)
        }}
        onUpdate={updated => {
          setHospitals(prev => prev.map(h => h.id === updated.id ? updated : h))
          setSelectedHospital(updated)
        }}
      />
    )
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
      <div style={{ flexShrink: 0 }}>
        <header style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 60,
          padding: '0 24px',
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>
            Hospital
          </span>
          <button
            onClick={() => setShowModal(true)}
            style={{
              position: 'absolute',
              right: 24,
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
              letterSpacing: '0.04em',
            }}
          >
            <AddIcon />
            動物病院を追加
          </button>
        </header>
      </div>

      {/* ── スクロール領域 ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {hospitals.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 0 0' }}>
            {hospitals.map(hospital => (
              <HospitalRow key={hospital.id} hospital={hospital} onSelect={setSelectedHospital} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <HospitalFormModal
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
