import { useState } from 'react'
import HospitalDetailScreen from './HospitalDetailScreen.jsx'

const LS_HOSPITALS = 'cathealth_hospitals'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function loadHospitals() {
  try { return JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]') } catch { return [] }
}

// ── アイコン ─────────────────────────────────────────────
function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="currentColor"/>
    </svg>
  )
}

// ── HospitalRow ──────────────────────────────────────────
function HospitalRow({ hospital, onSelect }) {
  return (
    <div
      onClick={() => onSelect(hospital)}
      className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl cursor-pointer"
    >
      <span className="flex-1 text-sm font-normal text-text-primary">{hospital.name}</span>
      <ChevronRight />
    </div>
  )
}

// ── EmptyState ───────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex items-center justify-center px-8 py-20">
      <p className="text-sm font-normal text-text-placeholder text-center leading-relaxed">
        まだ動物病院が登録されていません。
      </p>
    </div>
  )
}

// ── HospitalScreen ───────────────────────────────────────
export default function HospitalScreen() {
  const [hospitals,        setHospitals]        = useState(loadHospitals)
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [isNewHospital,    setIsNewHospital]    = useState(false)

  function handleAddNew() {
    const blank = { id: genId(), name: '', address: '', phone: '', hours: {}, memo: '' }
    setSelectedHospital(blank)
    setIsNewHospital(true)
  }

  function handleSelectHospital(hospital) {
    setSelectedHospital(hospital)
    setIsNewHospital(false)
  }

  function handleBack() {
    setHospitals(loadHospitals())
    setSelectedHospital(null)
    setIsNewHospital(false)
  }

  if (selectedHospital) {
    return (
      <HospitalDetailScreen
        hospital={selectedHospital}
        isNew={isNewHospital}
        onBack={handleBack}
        onUpdate={updated => {
          setHospitals(prev => {
            const exists = prev.some(h => h.id === updated.id)
            return exists
              ? prev.map(h => h.id === updated.id ? updated : h)
              : [...prev, updated]
          })
          setSelectedHospital(updated)
        }}
      />
    )
  }

  return (
    <div className="flex flex-col h-dvh bg-[#F7F7F7] overflow-hidden">

      {/* ── 固定ヘッダー ── */}
      <header className="relative flex items-center justify-center h-[60px] px-4 bg-white border-b border-black/10 flex-shrink-0">
        <span className="text-base font-semibold text-text-primary">動物病院</span>
        <button
          onClick={handleAddNew}
          className="absolute right-4 flex items-center gap-1 bg-transparent border-0 cursor-pointer text-sm font-semibold text-primary p-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          動物病院を追加
        </button>
      </header>

      {/* ── スクロール領域 ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        {hospitals.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="px-4 pt-4 space-y-2">
            {hospitals.map(hospital => (
              <HospitalRow
                key={hospital.id}
                hospital={hospital}
                onSelect={handleSelectHospital}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
