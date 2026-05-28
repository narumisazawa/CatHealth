import { useState, useMemo, useRef } from 'react'
import CatProfileEditScreen from '../screens/CatProfileEditScreen.jsx'
import CatCard from './CatCard.jsx'
import moreHorizSvg from '../assets/icons/more_horiz.svg'

const PRIMARY          = '#EA5EAD'
const LS_WEIGHT        = 'cathealth_daily_weight'
const LS_HOSPITAL      = 'cathealth_daily_hospital'
const LS_HOSPITALS     = 'cathealth_hospitals'
const LS_FOODS         = 'cathealth_foods'
const LS_DAILY_FOODS   = 'cathealth_daily_foods'
const LS_DAILY_MEDS    = 'cathealth_daily_meds'
const LS_DAILY_SUPPS   = 'cathealth_daily_supplements'

const TYPE_LABEL = {
  '総合栄養食（ドライ）':  'ドライ',
  '総合栄養食（ウェット）': 'ウェット',
  'おやつ':               'おやつ',
}

// ── ユーティリティ ────────────────────────────────────
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.replace(/\//g, '-').split('-').map(Number)
  return `${y}/${m}/${d}`
}

function formatNextDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 2) return `${parts[0]}年${parseInt(parts[1])}月`
  if (parts.length >= 3) return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`
  return dateStr
}


// ── データ読み込み ────────────────────────────────────
function loadWeight(catId) {
  try {
    return JSON.parse(localStorage.getItem(LS_WEIGHT) || '[]')
      .filter(r => String(r.catId) === String(catId) && parseFloat(r.weight) > 0)
      .map(r => ({ date: r.date, time: r.time || '', value: parseFloat(r.weight) }))
      .filter(r => !isNaN(r.value) && r.date)
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch { return [] }
}

function loadHospitalVisits(catId) {
  try {
    return JSON.parse(localStorage.getItem(LS_HOSPITAL) || '[]')
      .filter(r => String(r.catId) === String(catId))
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch { return [] }
}

function loadHospitals() {
  try { return JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]') } catch { return [] }
}

function loadActiveFoodSchedules(catId) {
  try {
    const today = todayStr()
    const foods = JSON.parse(localStorage.getItem(LS_FOODS) || '[]')
    const schedules = JSON.parse(localStorage.getItem(LS_DAILY_FOODS) || '[]')
    return schedules
      .filter(s => String(s.catId) === String(catId) && (!s.stoppedDate || s.stoppedDate > today))
      .map(s => ({ ...s, food: foods.find(f => f.id === s.foodId) || null }))
  } catch { return [] }
}

function loadActiveMeds(catId) {
  try {
    const today = todayStr()
    return JSON.parse(localStorage.getItem(LS_DAILY_MEDS) || '[]')
      .filter(s => String(s.catId) === String(catId) && (!s.stoppedDate || s.stoppedDate > today))
  } catch { return [] }
}

function loadActiveSupplements(catId) {
  try {
    const today = todayStr()
    return JSON.parse(localStorage.getItem(LS_DAILY_SUPPS) || '[]')
      .filter(s => String(s.catId) === String(catId) && (!s.stoppedDate || s.stoppedDate > today))
  } catch { return [] }
}

// ── アイコン ─────────────────────────────────────────────
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="currentColor"/>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="currentColor"/>
    </svg>
  )
}

function HospitalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M10.9404 2.89366C11.5888 2.48857 12.4112 2.48857 13.0596 2.89366L20.0596 7.26866C20.6442 7.63404 20.9998 8.27457 21 8.96397V19.4103C20.9999 20.5147 20.1045 21.4103 19 21.4103H5C3.89549 21.4103 3.0001 20.5147 3 19.4103V8.96397C3.00017 8.27457 3.35579 7.63404 3.94043 7.26866L10.9404 2.89366ZM5 8.96397V19.4103H19V8.96397L12 4.58995L5 8.96397ZM13 11.9103H15.5V13.9103H13V16.4103H11V13.9103H8.5V11.9103H11V9.41026H13V11.9103Z"
        fill="currentColor"
      />
    </svg>
  )
}

function FoodIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 4C14.2972 4 16.4215 4.34755 18.0078 4.94238C18.7973 5.23843 19.5062 5.61502 20.0352 6.08398C20.527 6.52015 20.9394 7.11055 20.9932 7.83887L23 14.9004V15.04C23 15.8285 22.4919 16.5073 21.9736 16.999C21.4138 17.5301 20.6423 18.0345 19.7285 18.4697C17.8948 19.3431 15.3605 20 12.4541 20C9.55185 19.9999 6.80672 19.3443 4.76855 18.4883C3.75243 18.0615 2.87446 17.5699 2.23145 17.0547C1.91046 16.7975 1.62045 16.5122 1.40332 16.2021C1.19108 15.899 1.00001 15.5013 1 15.04V14.8906L1.04395 14.748L3.01855 8.28906C3.00598 8.19514 3 8.09872 3 8C3 7.19722 3.43717 6.5519 3.96484 6.08398C4.49379 5.61502 5.20273 5.23843 5.99219 4.94238C7.57848 4.34755 9.70276 4 12 4ZM19.6006 10.2539C19.1422 10.5699 18.5976 10.8364 18.0078 11.0576C16.4215 11.6525 14.2972 12 12 12C9.70276 12 7.57848 11.6525 5.99219 11.0576C5.44057 10.8508 4.92929 10.603 4.49023 10.3135L3.04102 15.0527L3.04199 15.0547C3.11613 15.1606 3.25477 15.3108 3.48242 15.4932C3.93649 15.857 4.63635 16.2637 5.54297 16.6445C7.35116 17.4039 9.83383 17.9999 12.4541 18C15.0705 18 17.3099 17.4062 18.8682 16.6641C19.6501 16.2917 20.2297 15.8968 20.5967 15.5488C20.8392 15.3187 20.9342 15.1602 20.9727 15.083L19.6006 10.2539ZM12 6C9.87903 6 8.00346 6.32451 6.69434 6.81543C6.03626 7.06222 5.5727 7.33126 5.29199 7.58008C5.01013 7.82998 5 7.97447 5 8C5 8.02553 5.01013 8.17002 5.29199 8.41992C5.5727 8.66874 6.03626 8.93778 6.69434 9.18457C8.00346 9.67549 9.87903 10 12 10C14.121 10 15.9965 9.67549 17.3057 9.18457C17.9637 8.93778 18.4273 8.66874 18.708 8.41992C18.9899 8.17002 19 8.02553 19 8C19 7.97447 18.9899 7.82998 18.708 7.58008C18.4273 7.33126 17.9637 7.06222 17.3057 6.81543C15.9965 6.32451 14.121 6 12 6Z" fill="currentColor"/>
    </svg>
  )
}

function PillIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M8.625 21C7.05833 21 5.72917 20.4542 4.6375 19.3625C3.54583 18.2708 3 16.9417 3 15.375C3 14.625 3.14167 13.9083 3.425 13.225C3.70833 12.5417 4.11667 11.9333 4.65 11.4L11.4 4.65C11.9333 4.11667 12.5417 3.70833 13.225 3.425C13.9083 3.14167 14.625 3 15.375 3C16.9417 3 18.2708 3.54583 19.3625 4.6375C20.4542 5.72917 21 7.05833 21 8.625C21 9.375 20.8583 10.0917 20.575 10.775C20.2917 11.4583 19.8833 12.0667 19.35 12.6L12.6 19.35C12.0667 19.8833 11.4583 20.2917 10.775 20.575C10.0917 20.8583 9.375 21 8.625 21ZM15.275 13.85L17.95 11.2C18.2833 10.8667 18.5417 10.475 18.725 10.025C18.9083 9.575 19 9.10833 19 8.625C19 7.625 18.6458 6.77083 17.9375 6.0625C17.2292 5.35417 16.375 5 15.375 5C14.8917 5 14.425 5.09167 13.975 5.275C13.525 5.45833 13.1333 5.71667 12.8 6.05L10.15 8.725L15.275 13.85ZM8.625 19C9.10833 19 9.575 18.9083 10.025 18.725C10.475 18.5417 10.8667 18.2833 11.2 17.95L13.85 15.275L8.725 10.15L6.05 12.8C5.71667 13.1333 5.45833 13.525 5.275 13.975C5.09167 14.425 5 14.8917 5 15.375C5 16.375 5.35417 17.2292 6.0625 17.9375C6.77083 18.6458 7.625 19 8.625 19Z" fill="currentColor"/>
    </svg>
  )
}

function SupplementIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M8.625 21C7.05833 21 5.72917 20.4542 4.6375 19.3625C3.54583 18.2708 3 16.9417 3 15.375C3 14.625 3.14167 13.9083 3.425 13.225C3.70833 12.5417 4.11667 11.9333 4.65 11.4L11.4 4.65C11.9333 4.11667 12.5417 3.70833 13.225 3.425C13.9083 3.14167 14.625 3 15.375 3C16.9417 3 18.2708 3.54583 19.3625 4.6375C20.4542 5.72917 21 7.05833 21 8.625C21 9.375 20.8583 10.0917 20.575 10.775C20.2917 11.4583 19.8833 12.0667 19.35 12.6L12.6 19.35C12.0667 19.8833 11.4583 20.2917 10.775 20.575C10.0917 20.8583 9.375 21 8.625 21ZM15.275 13.85L17.95 11.2C18.2833 10.8667 18.5417 10.475 18.725 10.025C18.9083 9.575 19 9.10833 19 8.625C19 7.625 18.6458 6.77083 17.9375 6.0625C17.2292 5.35417 16.375 5 15.375 5C14.8917 5 14.425 5.09167 13.975 5.275C13.525 5.45833 13.1333 5.71667 12.8 6.05L10.15 8.725L15.275 13.85ZM8.625 19C9.10833 19 9.575 18.9083 10.025 18.725C10.475 18.5417 10.8667 18.2833 11.2 17.95L13.85 15.275L8.725 10.15L6.05 12.8C5.71667 13.1333 5.45833 13.525 5.275 13.975C5.09167 14.425 5 14.8917 5 15.375C5 16.375 5.35417 17.2292 6.0625 17.9375C6.77083 18.6458 7.625 19 8.625 19Z" fill="currentColor"/>
    </svg>
  )
}

function PoopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M12 2C11.4893 2.0186 9.99465 4.62636 8.5 5.5C7.00006 6.37674 5.02074 7.3775 4.6123 8.0332C4.20397 8.6889 4 9.37631 4 10.0947C4.00002 10.5478 4.07168 10.9798 4.21289 11.3916C3.19049 11.9682 2.39994 12.6327 1.8418 13.3848C1.2805 14.1412 1.00006 14.9339 1 15.7627C1 17.4995 2.07134 18.9731 4.21387 20.1836C6.35658 21.3941 8.95208 21 12 21C15.0479 21 17.6434 21.3941 19.7861 20.1836C21.9286 18.9731 23 17.4994 23 15.7627C22.9999 14.934 22.7195 14.1412 22.1582 13.3848C21.5999 12.6325 20.8088 11.9683 19.7861 11.3916C19.9274 10.9798 20 10.5479 20 10.0947C20 9.37631 19.796 8.6889 19.3877 8.0332C18.9794 7.37754 16.7501 5.50189 16 5L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}

function PeeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M12 21.5C9.78333 21.5 7.89583 20.7333 6.3375 19.2C4.77917 17.6667 4 15.8 4 13.6C4 12.55 4.20417 11.5458 4.6125 10.5875C5.02083 9.62917 5.6 8.78333 6.35 8.05L12 2.5L17.65 8.05C18.4 8.78333 18.9792 9.62917 19.3875 10.5875C19.7958 11.5458 20 12.55 20 13.6C20 15.8 19.2208 17.6667 17.6625 19.2C16.1042 20.7333 14.2167 21.5 12 21.5ZM16.25 17.7875C17.4167 16.6458 18 15.25 18 13.6C18 12.8167 17.85 12.0708 17.55 11.3625C17.25 10.6542 16.8167 10.0333 16.25 9.5L12 5.3L7.75 9.5C7.18333 10.0333 6.75 10.6542 6.45 11.3625C6.15 12.0708 6 12.8167 6 13.6C6 15.25 6.58333 16.6458 7.75 17.7875C8.91667 18.9292 10.3333 19.5 12 19.5C13.6667 19.5 15.0833 18.9292 16.25 17.7875Z" fill="currentColor"/>
    </svg>
  )
}

function VomitIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M9 8.83C9 7.72 9.618 6.71 10.805 6.028C11.95 5.37 13.638 5 15.955 5C18.172 5 20.202 5.076 21.473 5.419C22.149 5.589 22.695 5.848 23.073 6.275C23.449 6.699 23.695 7.384 23.695 8.203C23.695 9.655 22.564 10.564 21.44 11.08L21.023 10.171C20.38 10.899 21 11.61 21 13.072C21 15.372 19.459 16.852 17.496 17.704C15.55 18.549 13.297 18.884 12.493 18.884C8.771 19.177 5.764 18.913 3.644 18.188C1.567 17.477 0 16.175 0 14.235C0 12.672 1.283 11.402 2.778 10.505C4.351 9.561 6.508 8.81 8.956 8.386L9.127 9.371C8.08 9.51 8.000 10.333 8.000 10.095V8.833L9 8.833" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function WeightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M21 3C22.1049 3 23 3.89543 23 5V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V5C1 3.89543 1.89543 3 3 3H21ZM3 19H21V5H3V19ZM15.5 6.25C16.1904 6.25 16.75 6.80964 16.75 7.5V10.5C16.75 11.1904 16.1904 11.75 15.5 11.75H8.5C7.80964 11.75 7.25 11.1904 7.25 10.5V7.5C7.25 6.80964 7.80964 6.25 8.5 6.25H15.5ZM8.75 10.25H15.25V7.75H8.75V10.25Z" fill="currentColor"/>
    </svg>
  )
}


// ── DotMenu ───────────────────────────────────────────
function DotMenu({ onImportIcs }) {
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef(null)

  const close = fn => () => { setOpen(false); fn() }
  const item = (label, fn) => (
    <button onClick={close(fn)} className="block w-full px-4 py-3 text-left text-sm font-normal text-text-primary hover:bg-[#F9FAFB]">
      {label}
    </button>
  )

  const handleImportClick = () => {
    setOpen(false)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (!window.confirm('既存のデータをインポートしたデータで上書きします。よろしいですか？')) {
          e.target.value = ''
          return
        }
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
        })
        window.location.reload()
      } catch {
        alert('JSONファイルの読み込みに失敗しました。')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleExportJson = () => {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('cathealth_')) {
        try { data[key] = JSON.parse(localStorage.getItem(key)) }
        catch { data[key] = localStorage.getItem(key) }
      }
    }
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cathealth_backup_${dateStr}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="p-1">
        <img src={moreHorizSvg} width={24} height={24} alt="menu" />
      </button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-50" />
          <div className="absolute top-8 right-0 z-[60] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] min-w-[220px] overflow-hidden">
            {item('データの取り込み（.ics）', onImportIcs)}
            <button onClick={handleImportClick} className="block w-full px-4 py-3 text-left text-sm font-normal text-text-primary hover:bg-[#F9FAFB]">
              インポート（JSON）
            </button>
            {item('エクスポート（JSON）', handleExportJson)}
          </div>
        </>
      )}
    </div>
  )
}

// ── CategoryCard ──────────────────────────────────────
function CategoryCard({ icon, title, onPress, children }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <button
        onClick={onPress}
        className="flex items-center gap-3 px-4 py-3 w-full text-left bg-transparent border-0 cursor-pointer"
      >
        {icon}
        <span className="flex-1 text-sm font-medium text-text-primary">{title}</span>
        <ChevronRight />
      </button>
      {children && (
        <>
          <div className="h-px bg-[#F0F0F0]" />
          {children}
        </>
      )}
    </div>
  )
}

// ── CatDashboard ──────────────────────────────────────
export default function CatDashboard({ cat, cats, onBack, onSaveCat }) {
  const [view, setView] = useState('dashboard')

  const weightPts      = useMemo(() => loadWeight(cat.id), [cat.id])
  const hospitalVisits = useMemo(() => loadHospitalVisits(cat.id), [cat.id])
  const hospitals      = useMemo(() => loadHospitals(), [])
  const foodSchedules  = useMemo(() => loadActiveFoodSchedules(cat.id), [cat.id])
  const meds           = useMemo(() => loadActiveMeds(cat.id), [cat.id])
  const supplements    = useMemo(() => loadActiveSupplements(cat.id), [cat.id])

  const latestVisit        = hospitalVisits[0] || null
  const latestHospitalName = latestVisit
    ? (hospitals.find(h => String(h.id) === String(latestVisit.hospitalId))?.name || '不明')
    : null
  const latestWeight = weightPts.length > 0 ? weightPts[weightPts.length - 1] : null

  if (view === 'profile-edit') {
    return (
      <CatProfileEditScreen
        cat={cat}
        onBack={() => setView('dashboard')}
        onSave={(updatedCat, photo) => {
          onSaveCat(updatedCat, photo)
          setView('dashboard')
        }}
      />
    )
  }

  return (
    <div className="flex flex-col h-dvh bg-[#F7F7F7] overflow-hidden">

      {/* ── ヘッダー ── */}
      <header className="relative flex items-center justify-center h-[60px] px-4 bg-white border-b border-black/10 flex-shrink-0">
        <button onClick={onBack} className="absolute left-4 flex items-center justify-center bg-transparent border-0 cursor-pointer p-1">
          <BackIcon />
        </button>
        <span className="text-base font-semibold text-text-primary">{cat.name}</span>
        <div className="absolute right-3">
          <DotMenu
            onImportIcs={() => {}}
          />
        </div>
      </header>

      {/* ── スクロールエリア ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 pt-4 space-y-2">

          {/* プロフィールカード */}
          <div className="bg-white rounded-xl overflow-hidden">
            <CatCard cat={cat} onClick={() => setView('profile-edit')} />
            <div className="h-px bg-[#F0F0F0]" />
            <div className="flex items-center gap-4 px-4 py-3">
              <span className="text-xs font-normal text-text-placeholder w-14 flex-shrink-0">誕生日</span>
              <span className="text-sm font-normal text-text-primary">{formatDate(cat.birthday) || '—'}</span>
            </div>
            <div className="h-px bg-[#F0F0F0]" />
            <div className="flex items-center gap-4 px-4 py-3">
              <span className="text-xs font-normal text-text-placeholder w-14 flex-shrink-0">疾患</span>
              <span className="text-sm font-normal text-text-primary">
                {cat.diseases?.length > 0
                  ? cat.diseases.map(d => typeof d === 'string' ? d : (d.name || '')).filter(Boolean).join('、')
                  : (cat.disease || '—')}
              </span>
            </div>
          </div>

          {/* 受診カード */}
          <CategoryCard icon={<HospitalIcon />} title="受診" onPress={() => {}}>
            <div className="px-4 py-3 flex flex-col gap-2">
              {latestVisit ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-normal text-text-placeholder flex-shrink-0">前回の受診</span>
                    <div className="text-right">
                      <div className="text-sm font-normal text-text-primary">
                        {formatDate(latestVisit.date)}{latestVisit.time ? ` ${latestVisit.time}` : ''}
                      </div>
                      <div className="text-sm font-normal text-text-primary">{latestHospitalName}</div>
                    </div>
                  </div>
                  {(latestVisit.nextDate || latestVisit.nextVisitDate) && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-normal text-text-placeholder flex-shrink-0">次回の受診予定</span>
                      <span className="text-sm font-normal text-text-primary">
                        {formatNextDate(latestVisit.nextDate || latestVisit.nextVisitDate)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-sm font-normal text-text-placeholder">記録がありません</span>
              )}
            </div>
          </CategoryCard>

          {/* 食事カード */}
          <CategoryCard icon={<FoodIcon />} title="食事" onPress={() => {}}>
            <div className="px-4 pb-3 pt-2 flex flex-col gap-1">
              <span className="text-xs font-normal text-text-placeholder mb-1">最近の食事</span>
              {foodSchedules.length > 0 ? (
                foodSchedules.map(s => {
                  const food = s.food
                  const tag  = food ? (TYPE_LABEL[food.type] ?? food.type) : null
                  const name = food ? [food.maker, food.name].filter(Boolean).join('　') : ''
                  return (
                    <div key={s.id} className="flex items-center gap-2 py-1">
                      {tag && (
                        <span className="text-xs font-medium bg-[#F3F4F6] text-text-primary px-1.5 py-0.5 rounded flex-shrink-0">{tag}</span>
                      )}
                      <span className="flex-1 text-sm font-normal text-text-primary">{name}</span>
                      {s.amount && (
                        <span className="text-sm font-normal text-text-primary flex-shrink-0">{s.amount} {s.unit || 'g'}</span>
                      )}
                    </div>
                  )
                })
              ) : (
                <span className="text-sm font-normal text-text-placeholder">記録がありません</span>
              )}
            </div>
          </CategoryCard>

          {/* 投与カード */}
          <CategoryCard icon={<PillIcon />} title="投与" onPress={() => {}}>
            <div className="px-4 pb-3 pt-2 flex flex-col gap-1">
              <span className="text-xs font-normal text-text-placeholder mb-1">現在あたえているくすり</span>
              {meds.length > 0 ? (
                meds.map(m => (
                  <div key={m.id} className="flex items-center gap-2 py-1">
                    <span className="flex-1 text-sm font-normal text-text-primary">{m.name}</span>
                    <span className="text-sm font-normal text-text-primary flex-shrink-0">
                      {[m.frequency, m.amount, m.unit].filter(Boolean).join(' ')}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-sm font-normal text-text-placeholder">記録がありません</span>
              )}
            </div>
          </CategoryCard>

          {/* 補給カード */}
          <CategoryCard icon={<SupplementIcon />} title="補給" onPress={() => {}}>
            <div className="px-4 pb-3 pt-2 flex flex-col gap-1">
              <span className="text-xs font-normal text-text-placeholder mb-1">現在あたえているサプリ</span>
              {supplements.length > 0 ? (
                supplements.map(s => (
                  <div key={s.id} className="flex items-center gap-2 py-1">
                    <span className="flex-1 text-sm font-normal text-text-primary">{s.name}</span>
                    <span className="text-sm font-normal text-text-primary flex-shrink-0">
                      {[s.frequency, s.amount, s.unit].filter(Boolean).join(' ')}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-sm font-normal text-text-placeholder">記録がありません</span>
              )}
            </div>
          </CategoryCard>

          {/* うんちカード */}
          <CategoryCard icon={<PoopIcon />} title="うんち" onPress={() => {}}>
            <div className="px-4 py-6 flex items-center justify-center">
              <span className="text-sm font-normal text-text-placeholder">カレンダーは後で実装</span>
            </div>
          </CategoryCard>

          {/* おしっこカード */}
          <CategoryCard icon={<PeeIcon />} title="おしっこ" onPress={() => {}}>
            <div className="px-4 py-6 flex items-center justify-center">
              <span className="text-sm font-normal text-text-placeholder">カレンダーは後で実装</span>
            </div>
          </CategoryCard>

          {/* ゲロカード */}
          <CategoryCard icon={<VomitIcon />} title="ゲロ" onPress={() => {}}>
            <div className="px-4 py-6 flex items-center justify-center">
              <span className="text-sm font-normal text-text-placeholder">カレンダーは後で実装</span>
            </div>
          </CategoryCard>

          {/* 体重カード */}
          <CategoryCard icon={<WeightIcon />} title="体重" onPress={() => {}}>
            <div className="px-4 pb-3 pt-2">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-normal text-text-placeholder flex-shrink-0">前回の体重測定</span>
                {latestWeight ? (
                  <div className="text-right">
                    <div className="text-sm font-normal text-text-primary">
                      {formatDate(latestWeight.date)}{latestWeight.time ? ` ${latestWeight.time}` : ''}
                    </div>
                    <div className="text-sm font-normal text-text-primary">{latestWeight.value.toFixed(1)} kg</div>
                  </div>
                ) : (
                  <span className="text-sm font-normal text-text-placeholder">記録がありません</span>
                )}
              </div>
            </div>
          </CategoryCard>

        </div>
      </div>

    </div>
  )
}
