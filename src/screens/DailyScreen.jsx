import { useState, useEffect, useRef } from 'react'
import CatCareScreen from './CatCareScreen.jsx'
import CatDashboard from '../components/CatDashboard.jsx'

const LS_CATS = 'cathealth_cats'
const lsPhotoKey = id => `cathealth_photo_${id}`

function saveCatEdit(cat, photo) {
  if (photo) localStorage.setItem(lsPhotoKey(cat.id), photo)
  try {
    const prev = JSON.parse(localStorage.getItem(LS_CATS) || '[]')
    const next = prev.map(c => c.id === cat.id ? cat : c)
    localStorage.setItem(LS_CATS, JSON.stringify(next.map(({ photo: _, ...rest }) => rest)))
  } catch {}
  return { ...cat, photo: localStorage.getItem(lsPhotoKey(cat.id)) || null }
}

function loadCats() {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_CATS) || '[]')
    return arr.map(c => ({ ...c, photo: localStorage.getItem(lsPhotoKey(c.id)) || null }))
  } catch { return [] }
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateJa(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${y}年${m}月${d}日`
}

const DOW_JA = ['日', '月', '火', '水', '木', '金', '土']

function getDaysInMonth(year, month) {
  const count = new Date(year, month, 0).getDate()
  const days = []
  for (let d = 1; d <= count; d++) {
    const dt = new Date(year, month - 1, d)
    const dow = DOW_JA[dt.getDay()]
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ d, dow, dateStr, isSun: dt.getDay() === 0, isSat: dt.getDay() === 6 })
  }
  return days
}

// 6週ぶんのセルを返す（前後月の日付を含む）
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=日
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()

  const cells = []
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true })
  }
  let nextDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, isCurrentMonth: false })
  }
  const rows = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }
  return rows
}

// 猫の登録情報から表示年の範囲を算出
function getYearRange(cats) {
  const currentYear = new Date().getFullYear()
  let minYear = currentYear
  for (const cat of cats) {
    for (const d of [cat.birthday, cat.familySince].filter(Boolean)) {
      const y = parseInt(d.replace(/\//g, '-').split('-')[0])
      if (!isNaN(y) && y > 1900 && y < minYear) minYear = y
    }
  }
  return { minYear, maxYear: currentYear + 1 }
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-primary">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="currentColor"/>
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="#374151"/>
    </svg>
  )
}

// ── ミニカレンダー ────────────────────────────────────────
function MiniCalendar({ year, month, onClick }) {
  const rows = buildCalendarGrid(year, month)
  return (
    <div onClick={onClick} className="cursor-pointer">
      <div className="text-[11px] font-bold text-text-primary mb-1">{month}月</div>
      {rows.map((row, ri) => (
        <div key={ri} className="flex">
          {row.map((cell, ci) => {
            const isSun = ci === 0
            const isSat = ci === 6
            const colorClass = cell.isCurrentMonth
              ? isSun ? 'text-error' : isSat ? 'text-calendar-sat' : 'text-text-primary'
              : 'text-[#D1D5DB]'
            return (
              <div key={ci} className={`flex-1 text-center text-[9px] leading-[14px] ${colorClass}`}>
                {cell.day}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── 年カレンダービュー ────────────────────────────────────
function YearView({ cats, onMonthSelect }) {
  const { minYear, maxYear } = getYearRange(cats)
  const years = []
  for (let y = minYear; y <= maxYear; y++) years.push(y)

  const currentYear = new Date().getFullYear()
  const currentYearRef = useRef(null)

  useEffect(() => {
    currentYearRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [])

  return (
    <div className="h-dvh flex flex-col bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-20">
        {years.map(y => (
          <div key={y} ref={y === currentYear ? currentYearRef : null} className="px-4 pt-6 pb-4">
            <h2 className="text-[22px] font-bold text-text-primary mb-4">{y}年</h2>
            <div className="grid grid-cols-3 gap-x-4 gap-y-6">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <MiniCalendar
                  key={m}
                  year={y}
                  month={m}
                  onClick={() => onMonthSelect(y, m)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 月一覧ビュー ──────────────────────────────────────────
function MonthlyView({ year, month, onDateSelect, onYearNav }) {
  const days = getDaysInMonth(year, month)

  return (
    <div className="h-dvh flex flex-col bg-white overflow-hidden">
      <header className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="relative flex items-center justify-center h-[60px] px-4">
          <button
            onClick={onYearNav}
            className="absolute left-4 flex items-center gap-0.5 text-sm font-medium text-text-primary bg-transparent cursor-pointer p-0"
            style={{ border: 'none' }}
          >
            <ChevronLeft />
            {year}年
          </button>
          <span className="text-[17px] font-bold text-text-primary">
            {year}年{month}月
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {days.map(({ d, dow, dateStr, isSun, isSat }) => {
          const textColor = isSun
            ? 'text-error'
            : isSat
              ? 'text-calendar-sat'
              : 'text-text-primary'
          return (
            <div key={dateStr} className="border-b border-[#F0F0F0]">
              <button
                onClick={() => onDateSelect(dateStr)}
                className="w-full flex items-center justify-between px-4 py-[18px] bg-transparent cursor-pointer"
                style={{ border: 'none' }}
              >
                <span className={`text-[15px] font-medium ${textColor}`}>
                  {d}({dow})
                </span>
                <ChevronRight />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}


// ── 猫カード ─────────────────────────────────────────────
function CatCareCard({ cat, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl px-4 py-3 flex items-center gap-3 text-left cursor-pointer border-0"
    >
      <div className="w-12 h-12 rounded-full bg-[#E5E7EB] flex-shrink-0 overflow-hidden flex items-center justify-center">
        {cat.photo
          ? <img src={cat.photo} alt={cat.name} className="w-full h-full object-cover" />
          : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12.0001 4.99978C12.6701 4.99978 13.3501 5.08978 14.0001 5.25978C15.7801 3.25978 19.0301 2.41978 20.4201 2.99978C21.8201 3.57978 20.0001 9.99978 20.0001 9.99978C20.5701 11.0698 21.0001 12.2398 21.0001 13.4398C21.0001 17.8998 16.9701 20.9998 12.0001 20.9998C7.03008 20.9998 3.00008 17.9998 3.00008 13.4398C3.00008 12.1898 3.50008 11.0398 4.00008 9.99978C4.00008 9.99978 2.11008 3.57978 3.50008 2.99978C4.89008 2.41978 8.22008 3.22978 10.0001 5.22978C10.6561 5.07888 11.3269 5.00174 12.0001 4.99978Z"
                stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <path d="M8 14V14.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 14V14.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.25 16.25H12.75L12 17L11.25 16.25Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        }
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-base font-normal text-text-primary">{cat.name}のお世話</span>
      </div>
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary flex-shrink-0">
        <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="currentColor"/>
      </svg>
    </button>
  )
}

// ── Daily top ビュー ──────────────────────────────────────
function DailyTopView({ selectedDate, cats, onMonthNav, onCatDetail }) {
  const month = Number(selectedDate.split('-')[1])

  return (
    <div className="h-dvh flex flex-col bg-[#F7F7F7] overflow-hidden">
      <header className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="relative flex items-center justify-center h-[60px] px-4">
          <button
            onClick={onMonthNav}
            className="absolute left-4 flex items-center gap-0.5 text-sm font-medium text-text-primary bg-transparent cursor-pointer p-0"
            style={{ border: 'none' }}
          >
            <ChevronLeft />
            {month}月
          </button>
          <span className="text-[17px] font-bold text-text-primary">
            {formatDateJa(selectedDate)}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 flex flex-col gap-2">
        {cats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-text-placeholder leading-relaxed">
              まだ猫が登録されていません。<br />
              猫タブから追加してください。
            </p>
          </div>
        ) : (
          cats.map(cat => (
            <CatCareCard
              key={cat.id}
              cat={cat}
              onClick={() => onCatDetail(cat)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── DailyScreen（ルート） ────────────────────────────────
export default function DailyScreen({ onGoToCatsTab }) {
  const [view, setView] = useState('top') // 'top' | 'monthly' | 'yearly' | 'care'
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [navYear, setNavYear] = useState(() => new Date().getFullYear())
  const [navMonth, setNavMonth] = useState(() => new Date().getMonth() + 1)
  const [cats] = useState(loadCats)
  const [careCat, setCareCat] = useState(null)

  function handleMonthNav() {
    const [y, m] = selectedDate.split('-').map(Number)
    setNavYear(y)
    setNavMonth(m)
    setView('monthly')
  }

  function handleDateSelect(dateStr) {
    setSelectedDate(dateStr)
    setView('top')
  }

  function handleYearNav() {
    setView('yearly')
  }

  function handleMonthSelect(y, m) {
    setNavYear(y)
    setNavMonth(m)
    setView('monthly')
  }

  function handleCatDetail(cat) {
    setCareCat(cat)
    setView('care')
  }

  if (view === 'dashboard' && careCat) {
    return (
      <CatDashboard
        cat={careCat}
        cats={cats}
        onBack={() => setView('care')}
        onSaveCat={(updatedCat, photo) => setCareCat(saveCatEdit(updatedCat, photo))}
      />
    )
  }

  if (view === 'care' && careCat) {
    return (
      <CatCareScreen
        cat={careCat}
        date={selectedDate}
        onBack={() => setView('top')}
        onGoToDashboard={() => setView('dashboard')}
      />
    )
  }

  if (view === 'yearly') {
    return (
      <YearView
        cats={cats}
        onMonthSelect={handleMonthSelect}
      />
    )
  }

  if (view === 'monthly') {
    return (
      <MonthlyView
        year={navYear}
        month={navMonth}
        onDateSelect={handleDateSelect}
        onYearNav={handleYearNav}
      />
    )
  }

  return (
    <DailyTopView
      selectedDate={selectedDate}
      cats={cats}
      onMonthNav={handleMonthNav}
      onCatDetail={handleCatDetail}
    />
  )
}
