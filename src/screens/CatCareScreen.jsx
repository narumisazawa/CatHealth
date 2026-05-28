import { useCallback, useMemo, useState } from 'react'
import CatCard from '../components/CatCard.jsx'
import CatMealScreen from './CatMealScreen.jsx'
import CatPillScreen from './CatPillScreen.jsx'
import CatPoopScreen from './CatPoopScreen.jsx'
import CatPeeScreen from './CatPeeScreen.jsx'
import CatVomitScreen from './CatVomitScreen.jsx'
import CatSupplementScreen from './CatSupplementScreen.jsx'
import VisitScreen from './VisitScreen.jsx'

// ── localStorage ─────────────────────────────────────────
const LS_FOODS        = 'cathealth_foods'
const LS_DAILY_FOODS  = 'cathealth_daily_foods'
const LS_POOP         = 'cathealth_poop_records'
const LS_PEE          = 'cathealth_pee_records'
const LS_VOMIT        = 'cathealth_vomit_records'
const LS_WEIGHT       = 'cathealth_daily_weight'
const LS_HOSPITAL_V   = 'cathealth_daily_hospital'
const LS_MEDS         = 'cathealth_daily_meds'
const LS_SUPPLEMENTS  = 'cathealth_supplement_records'

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

// ── ユーティリティ ────────────────────────────────────────
function formatDateJa(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${y}年${m}月${d}日`
}

function formatDateSlash(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${y}/${m}/${d}`
}

function shortType(type) {
  if (!type) return null
  if (type.includes('ドライ'))   return 'ドライ'
  if (type.includes('ウェット')) return 'ウェット'
  if (type.includes('おやつ'))   return 'おやつ'
  return null
}

// ── データ取得 ────────────────────────────────────────────
function getActiveFoodSchedules(catId, date) {
  return load(LS_DAILY_FOODS).filter(s => {
    if (s.catId !== catId) return false
    if (s.startDate > date) return false
    if (s.repeat === 'today') return s.startDate === date
    if (s.stoppedDate && s.stoppedDate <= date) return false
    return true
  })
}

function getLastHospitalDate(catId, date) {
  const prev = load(LS_HOSPITAL_V).filter(r => r.catId === catId && r.date < date)
  if (!prev.length) return null
  return prev.reduce((a, b) => a.date > b.date ? a : b).date
}

function getDayRecords(key, catId, date) {
  return load(key).filter(r => r.catId === catId && r.date === date)
}

function getLastWeightRecord(catId, date) {
  const prev = load(LS_WEIGHT).filter(r => r.catId === catId && r.date < date)
  if (!prev.length) return null
  return prev.reduce((a, b) =>
    a.date > b.date || (a.date === b.date && a.time >= b.time) ? a : b
  )
}

// ── アイコン ─────────────────────────────────────────────
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-primary">
      <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="currentColor"/>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-placeholder">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="currentColor"/>
    </svg>
  )
}


function HospitalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.9404 2.89366C11.5888 2.48857 12.4112 2.48857 13.0596 2.89366L20.0596 7.26866C20.6442 7.63404 20.9998 8.27457 21 8.96397V19.4103C20.9999 20.5147 20.1045 21.4103 19 21.4103H5C3.89549 21.4103 3.0001 20.5147 3 19.4103V8.96397C3.00017 8.27457 3.35579 7.63404 3.94043 7.26866L10.9404 2.89366ZM5 8.96397V19.4103H19V8.96397L12 4.58995L5 8.96397ZM13 11.9103H15.5V13.9103H13V16.4103H11V13.9103H8.5V11.9103H11V9.41026H13V11.9103Z" fill="#374151"/>
    </svg>
  )
}

function FoodIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 4C14.2972 4 16.4215 4.34755 18.0078 4.94238C18.7973 5.23843 19.5062 5.61502 20.0352 6.08398C20.527 6.52015 20.9394 7.11055 20.9932 7.83887L23 14.9004V15.04C23 15.8285 22.4919 16.5073 21.9736 16.999C21.4138 17.5301 20.6423 18.0345 19.7285 18.4697C17.8948 19.3431 15.3605 20 12.4541 20C9.55185 19.9999 6.80672 19.3443 4.76855 18.4883C3.75243 18.0615 2.87446 17.5699 2.23145 17.0547C1.91046 16.7975 1.62045 16.5122 1.40332 16.2021C1.19108 15.899 1.00001 15.5013 1 15.04V14.8906L1.04395 14.748L3.01855 8.28906C3.00598 8.19514 3 8.09872 3 8C3 7.19722 3.43717 6.5519 3.96484 6.08398C4.49379 5.61502 5.20273 5.23843 5.99219 4.94238C7.57848 4.34755 9.70276 4 12 4ZM19.6006 10.2539C19.1422 10.5699 18.5976 10.8364 18.0078 11.0576C16.4215 11.6525 14.2972 12 12 12C9.70276 12 7.57848 11.6525 5.99219 11.0576C5.44057 10.8508 4.92929 10.603 4.49023 10.3135L3.04102 15.0527L3.04199 15.0547C3.11613 15.1606 3.25477 15.3108 3.48242 15.4932C3.93649 15.857 4.63635 16.2637 5.54297 16.6445C7.35116 17.4039 9.83383 17.9999 12.4541 18C15.0705 18 17.3099 17.4062 18.8682 16.6641C19.6501 16.2917 20.2297 15.8968 20.5967 15.5488C20.8392 15.3187 20.9342 15.1602 20.9727 15.083L19.6006 10.2539ZM12 6C9.87903 6 8.00346 6.32451 6.69434 6.81543C6.03626 7.06222 5.5727 7.33126 5.29199 7.58008C5.01013 7.82998 5 7.97447 5 8C5 8.02553 5.01013 8.17002 5.29199 8.41992C5.5727 8.66874 6.03626 8.93778 6.69434 9.18457C8.00346 9.67549 9.87903 10 12 10C14.121 10 15.9965 9.67549 17.3057 9.18457C17.9637 8.93778 18.4273 8.66874 18.708 8.41992C18.9899 8.17002 19 8.02553 19 8C19 7.97447 18.9899 7.82998 18.708 7.58008C18.4273 7.33126 17.9637 7.06222 17.3057 6.81543C15.9965 6.32451 14.121 6 12 6Z" fill="#374151"/>
    </svg>
  )
}

function PillIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M8.625 21C7.05833 21 5.72917 20.4542 4.6375 19.3625C3.54583 18.2708 3 16.9417 3 15.375C3 14.625 3.14167 13.9083 3.425 13.225C3.70833 12.5417 4.11667 11.9333 4.65 11.4L11.4 4.65C11.9333 4.11667 12.5417 3.70833 13.225 3.425C13.9083 3.14167 14.625 3 15.375 3C16.9417 3 18.2708 3.54583 19.3625 4.6375C20.4542 5.72917 21 7.05833 21 8.625C21 9.375 20.8583 10.0917 20.575 10.775C20.2917 11.4583 19.8833 12.0667 19.35 12.6L12.6 19.35C12.0667 19.8833 11.4583 20.2917 10.775 20.575C10.0917 20.8583 9.375 21 8.625 21ZM15.275 13.85L17.95 11.2C18.2833 10.8667 18.5417 10.475 18.725 10.025C18.9083 9.575 19 9.10833 19 8.625C19 7.625 18.6458 6.77083 17.9375 6.0625C17.2292 5.35417 16.375 5 15.375 5C14.8917 5 14.425 5.09167 13.975 5.275C13.525 5.45833 13.1333 5.71667 12.8 6.05L10.15 8.725L15.275 13.85ZM8.625 19C9.10833 19 9.575 18.9083 10.025 18.725C10.475 18.5417 10.8667 18.2833 11.2 17.95L13.85 15.275L8.725 10.15L6.05 12.8C5.71667 13.1333 5.45833 13.525 5.275 13.975C5.09167 14.425 5 14.8917 5 15.375C5 16.375 5.35417 17.2292 6.0625 17.9375C6.77083 18.6458 7.625 19 8.625 19Z" fill="#374151"/>
    </svg>
  )
}

function PoopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C11.4893 2.0186 9.99465 4.62636 8.5 5.5C7.00006 6.37674 5.02074 7.3775 4.6123 8.0332C4.20397 8.6889 4 9.37631 4 10.0947C4.00002 10.5478 4.07168 10.9798 4.21289 11.3916C3.19049 11.9682 2.39994 12.6327 1.8418 13.3848C1.2805 14.1412 1.00006 14.9339 1 15.7627C1 17.4995 2.07134 18.9731 4.21387 20.1836C6.35658 21.3941 8.95208 21 12 21C15.0479 21 17.6434 21.3941 19.7861 20.1836C21.9286 18.9731 23 17.4994 23 15.7627C22.9999 14.934 22.7195 14.1412 22.1582 13.3848C21.5999 12.6325 20.8088 11.9683 19.7861 11.3916C19.9274 10.9798 20 10.5479 20 10.0947C20 9.37631 19.796 8.6889 19.3877 8.0332C18.9794 7.37754 16.7501 5.50189 16 5L12 2Z" stroke="#374151" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}

function PeeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 21.5C9.78333 21.5 7.89583 20.7333 6.3375 19.2C4.77917 17.6667 4 15.8 4 13.6C4 12.55 4.20417 11.5458 4.6125 10.5875C5.02083 9.62917 5.6 8.78333 6.35 8.05L12 2.5L17.65 8.05C18.4 8.78333 18.9792 9.62917 19.3875 10.5875C19.7958 11.5458 20 12.55 20 13.6C20 15.8 19.2208 17.6667 17.6625 19.2C16.1042 20.7333 14.2167 21.5 12 21.5ZM16.25 17.7875C17.4167 16.6458 18 15.25 18 13.6C18 12.8167 17.85 12.0708 17.55 11.3625C17.25 10.6542 16.8167 10.0333 16.25 9.5L12 5.3L7.75 9.5C7.18333 10.0333 6.75 10.6542 6.45 11.3625C6.15 12.0708 6 12.8167 6 13.6C6 15.25 6.58333 16.6458 7.75 17.7875C8.91667 18.9292 10.3333 19.5 12 19.5C13.6667 19.5 15.0833 18.9292 16.25 17.7875Z" fill="#374151"/>
    </svg>
  )
}

function VomitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 8.83C9 7.72 9.618 6.71 10.805 6.028C11.95 5.37 13.638 5 15.955 5C18.172 5 20.202 5.076 21.473 5.419C22.149 5.589 22.695 5.848 23.073 6.275C23.449 6.699 23.695 7.384 23.695 8.203C23.695 9.655 22.564 10.564 21.44 11.08L21.023 10.171C20.38 10.899 21 11.61 21 13.072C21 15.372 19.459 16.852 17.496 17.704C15.55 18.549 13.297 18.884 12.493 18.884C8.771 19.177 5.764 18.913 3.644 18.188C1.567 17.477 0 16.175 0 14.235C0 12.672 1.283 11.402 2.778 10.505C4.351 9.561 6.508 8.81 8.956 8.386L9.127 9.371C8.08 9.51 8.000 10.333 8.000 10.095V8.833L9 8.833" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function WeightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21.0005 3C22.1049 3.00024 23.0005 3.89558 23.0005 5V19C23.0005 20.0355 22.2131 20.8868 21.2046 20.9893L21.0005 21H3.00049L2.79639 20.9893C1.85485 20.8938 1.10671 20.1456 1.01123 19.2041L1.00049 19V5C1.00049 3.89543 1.89592 3 3.00049 3H21.0005ZM3.00049 19H21.0005V5H3.00049V19ZM15.5005 6.25C16.1906 6.25026 16.7505 6.80981 16.7505 7.5V10.5C16.7505 11.1902 16.1906 11.7497 15.5005 11.75H8.50049C7.81013 11.75 7.25049 11.1904 7.25049 10.5V7.5C7.25049 6.80964 7.81013 6.25 8.50049 6.25H15.5005ZM8.75049 10.25H15.2505V7.75H8.75049V10.25Z" fill="#374151"/>
    </svg>
  )
}

function PhotoBadgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-text-placeholder flex-shrink-0">
      <path d="M5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H19C19.55 3 20.0208 3.19583 20.4125 3.5875C20.8042 3.97917 21 4.45 21 5V19C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8042 19.55 21 19 21H5ZM5 19H19V5H5V19ZM6 17H18L14.25 12L11.25 16L9 13L6 17ZM9.5625 9.5625C9.85417 9.27083 10 8.91667 10 8.5C10 8.08333 9.85417 7.72917 9.5625 7.4375C9.27083 7.14583 8.91667 7 8.5 7C8.08333 7 7.72917 7.14583 7.4375 7.4375C7.14583 7.72917 7 8.08333 7 8.5C7 8.91667 7.14583 9.27083 7.4375 9.5625C7.72917 9.85417 8.08333 10 8.5 10C8.91667 10 9.27083 9.85417 9.5625 9.5625Z" fill="currentColor"/>
    </svg>
  )
}

// ── 共通パーツ ────────────────────────────────────────────
function CategoryRow({ icon, label, action }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 text-text-primary">{icon}</div>
      <span className="flex-1 text-sm font-medium text-text-primary">{label}</span>
      {action}
    </div>
  )
}


function ActionChevron({ onClick }) {
  return (
    <button onClick={onClick} className="p-1 bg-transparent cursor-pointer" style={{ border: 'none' }}>
      <ChevronRight />
    </button>
  )
}

// ── CatCareScreen ─────────────────────────────────────────
export default function CatCareScreen({ cat, date, onBack, onGoToDashboard }) {
  const [view, setView] = useState('main')

  const [weight, setWeight] = useState(() => {
    const recs = load(LS_WEIGHT).filter(r => r.catId === cat.id && r.date === date)
    if (!recs.length) return ''
    const latest = recs.reduce((a, b) => (a.time ?? '') >= (b.time ?? '') ? a : b)
    return latest.weight ?? ''
  })

  const lastHospitalDate = useMemo(() => getLastHospitalDate(cat.id, date), [cat.id, date])
  const foodSchedules    = useMemo(() => getActiveFoodSchedules(cat.id, date), [cat.id, date])
  const allFoods         = useMemo(() => load(LS_FOODS), [])
  const [poopRecords,  setPoopRecords]  = useState(() => getDayRecords(LS_POOP,  cat.id, date))
  const [peeRecords,   setPeeRecords]   = useState(() => getDayRecords(LS_PEE,   cat.id, date))
  const [vomitRecords, setVomitRecords] = useState(() => getDayRecords(LS_VOMIT, cat.id, date))
  const lastWeight       = useMemo(() => getLastWeightRecord(cat.id, date),             [cat.id, date])
  const [medRecords, setMedRecords] = useState(() => getDayRecords(LS_MEDS, cat.id, date))
  const [suppRecords, setSuppRecords] = useState(() =>
    getDayRecords(LS_SUPPLEMENTS, cat.id, date).filter(s => !s.stoppedDate)
  )

  const handleBackFromPill = useCallback(() => {
    setMedRecords(getDayRecords(LS_MEDS, cat.id, date))
    setView('main')
  }, [cat.id, date])

  const handleBackFromPoop = () => {
    setPoopRecords(getDayRecords(LS_POOP, cat.id, date))
    setView('main')
  }

  const handleBackFromPee = () => {
    setPeeRecords(getDayRecords(LS_PEE, cat.id, date))
    setView('main')
  }

  const handleBackFromVomit = () => {
    setVomitRecords(getDayRecords(LS_VOMIT, cat.id, date))
    setView('main')
  }

  const handleBackFromSupplement = () => {
    setSuppRecords(getDayRecords(LS_SUPPLEMENTS, cat.id, date).filter(s => !s.stoppedDate))
    setView('main')
  }

  if (view === 'meal') {
    return <CatMealScreen cat={cat} date={date} onBack={() => setView('main')} />
  }
  if (view === 'pill') {
    return <CatPillScreen cat={cat} date={date} onBack={handleBackFromPill} />
  }
  if (view === 'poop') {
    return <CatPoopScreen cat={cat} date={date} onBack={handleBackFromPoop} />
  }
  if (view === 'pee') {
    return <CatPeeScreen cat={cat} date={date} onBack={handleBackFromPee} />
  }
  if (view === 'vomit') {
    return <CatVomitScreen cat={cat} date={date} onBack={handleBackFromVomit} />
  }
  if (view === 'supplement') {
    return <CatSupplementScreen cat={cat} date={date} onBack={handleBackFromSupplement} />
  }
  if (view === 'visit') {
    return <VisitScreen cat={cat} date={date} onBack={() => setView('main')} />
  }

  return (
    <div className="h-dvh flex flex-col bg-[#F7F7F7] overflow-hidden">

      {/* ヘッダー */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="relative flex items-center justify-center h-[60px] px-4">
          <button
            onClick={onBack}
            className="absolute left-4 flex items-center bg-transparent cursor-pointer p-1"
            style={{ border: 'none' }}
          >
            <BackIcon />
          </button>
          <span className="text-base font-semibold text-text-primary">お世話</span>
        </div>
      </header>

      {/* スクロール領域 */}
      <div className="flex-1 overflow-y-auto pb-20">

        {/* 猫カード */}
        <div className="px-4 pt-4 pb-3">
          <CatCard cat={cat} onClick={onGoToDashboard} className="bg-white rounded-2xl" />
        </div>

        {/* 日付 */}
        <div className="text-center py-2">
          <span className="text-lg font-bold text-text-primary">{formatDateJa(date)}</span>
        </div>

        {/* カテゴリカード */}
        <div className="space-y-3 px-4">

          {/* 受診 */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="px-4 py-3">
              <CategoryRow
                icon={<HospitalIcon />}
                label="受診"
                action={<ActionChevron onClick={() => setView('visit')} />}
              />
            </div>
            {lastHospitalDate && (
              <div className="flex justify-end px-4 py-3">
                <span className="text-sm font-normal text-text-primary">前回　{formatDateSlash(lastHospitalDate)}</span>
              </div>
            )}
          </div>

          {/* 食事 */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="px-4 py-3">
              <CategoryRow
                icon={<FoodIcon />}
                label="食事"
                action={<ActionChevron onClick={() => setView('meal')} />}
              />
            </div>
            {foodSchedules.length > 0 && foodSchedules.map(s => {
              const food      = allFoods.find(f => f.id === s.foodId)
              const typeBadge = food ? shortType(food.type) : null
              return (
                <div key={s.id}>
                  <div className="h-px bg-[#F0F0F0]" />
                  <div className="flex items-center gap-2 px-4 py-3">
                    {s.time && (
                      <span className="text-sm font-normal text-text-primary flex-shrink-0">{s.time}</span>
                    )}
                    {typeBadge && (
                      <span className="text-xs font-medium bg-[#F3F4F6] text-text-primary px-1.5 py-0.5 rounded flex-shrink-0">
                        {typeBadge}
                      </span>
                    )}
                    <span className="flex-1 text-sm font-normal text-text-primary line-clamp-2">{food?.name ?? ''}</span>
                    {s.amount && (
                      <span className="text-sm font-normal text-text-primary flex-shrink-0">{s.amount} g</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 投与 */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="px-4 py-3">
              <CategoryRow
                icon={<PillIcon />}
                label="投与"
                action={<ActionChevron onClick={() => setView('pill')} />}
              />
            </div>
            {medRecords.map(r => (
              <div key={r.id}>
                <div className="h-px bg-[#F0F0F0]" />
                <div className="flex items-center gap-2 px-4 py-3">
                  {r.time && (
                    <span className="text-sm font-normal text-text-primary flex-shrink-0">{r.time}</span>
                  )}
                  <span className="flex-1 text-sm font-normal text-text-primary">{r.drugName ?? ''}</span>
                  {r.amount && (
                    <span className="text-sm font-normal text-text-primary flex-shrink-0">
                      {r.amount}{r.unit ? ` ${r.unit}` : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 補給 */}
          {(() => {
            const rows = suppRecords.filter(r => r.name)
            return (
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="px-4 py-3">
                  <CategoryRow
                    icon={<PillIcon />}
                    label="補給"
                    action={<ActionChevron onClick={() => setView('supplement')} />}
                  />
                </div>
                {rows.map(r => (
                  <div key={r.id}>
                    <div className="h-px bg-[#F0F0F0]" />
                    <div className="flex items-center gap-2 px-4 py-3">
                      <span className="flex-1 text-sm font-normal text-text-primary">{r.name}</span>
                      {r.dailyAmount && (
                        <span className="text-sm font-normal text-text-primary flex-shrink-0">
                          {r.dailyAmount}{r.unit ? ` ${r.unit}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* うんち */}
          {(() => {
            const rows = poopRecords.filter(r => r.time || r.condition || r.photo || r.memo)
            return (
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="px-4 py-3">
                  <CategoryRow
                    icon={<PoopIcon />}
                    label="うんち"
                    action={<ActionChevron onClick={() => setView('poop')} />}
                  />
                </div>
                {rows.map(r => (
                  <div key={r.id}>
                    <div className="h-px bg-[#F0F0F0]" />
                    <div className="flex items-center gap-2 px-4 py-3">
                      {r.time && (
                        <span className="text-sm font-normal text-text-primary flex-shrink-0">{r.time}</span>
                      )}
                      <div className="flex-1" />
                      {r.photo && <PhotoBadgeIcon />}
                      {r.condition && (
                        <span className="text-sm font-normal text-text-primary flex-shrink-0">{r.condition}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* おしっこ */}
          {(() => {
            const rows = peeRecords.filter(r => r.time || r.condition || r.photo || r.memo)
            return (
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="px-4 py-3">
                  <CategoryRow
                    icon={<PeeIcon />}
                    label="おしっこ"
                    action={<ActionChevron onClick={() => setView('pee')} />}
                  />
                </div>
                {rows.map(r => (
                  <div key={r.id}>
                    <div className="h-px bg-[#F0F0F0]" />
                    <div className="flex items-center gap-2 px-4 py-3">
                      {r.time && (
                        <span className="text-sm font-normal text-text-primary flex-shrink-0">{r.time}</span>
                      )}
                      <div className="flex-1" />
                      {r.photo && <PhotoBadgeIcon />}
                      {r.condition && (
                        <span className="text-sm font-normal text-text-primary flex-shrink-0">{r.condition}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* ゲロ */}
          {(() => {
            const rows = vomitRecords.filter(r => r.time || r.condition || r.photo || r.memo)
            return (
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="px-4 py-3">
                  <CategoryRow
                    icon={<VomitIcon />}
                    label="ゲロ"
                    action={<ActionChevron onClick={() => setView('vomit')} />}
                  />
                </div>
                {rows.map(r => (
                  <div key={r.id}>
                    <div className="h-px bg-[#F0F0F0]" />
                    <div className="flex items-center gap-2 px-4 py-3">
                      {r.time && (
                        <span className="text-sm font-normal text-text-primary flex-shrink-0">{r.time}</span>
                      )}
                      <div className="flex-1" />
                      {r.photo && <PhotoBadgeIcon />}
                      {r.condition && (
                        <span className="text-sm font-normal text-text-primary flex-shrink-0">{r.condition}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* 体重 */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex-shrink-0 text-text-primary"><WeightIcon /></div>
              <span className="flex-1 text-sm font-medium text-text-primary">体重</span>
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder=""
                className="bg-[#F3F2EF] rounded-lg px-3 py-1 w-16 text-right text-sm font-normal text-text-primary outline-none"
              />
              <span className="text-sm font-normal text-text-primary">kg</span>
            </div>
            {lastWeight && (
              <div className="flex justify-end gap-3 px-4 py-3">
                <span className="text-sm font-normal text-text-primary">前回</span>
                <span className="text-sm font-normal text-text-primary">{formatDateSlash(lastWeight.date)}</span>
                <span className="text-sm font-normal text-text-primary">{lastWeight.weight} kg</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
