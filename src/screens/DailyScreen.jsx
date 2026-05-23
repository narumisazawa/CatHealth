import { useState, useEffect, useRef } from 'react'
import CatCareScreen from './CatCareScreen.jsx'

const LS_CATS = 'cathealth_cats'
const lsPhotoKey = id => `cathealth_photo_${id}`

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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#374151]">
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
      <div className="text-[11px] font-bold text-[#111827] mb-1">{month}月</div>
      {rows.map((row, ri) => (
        <div key={ri} className="flex">
          {row.map((cell, ci) => {
            const isSun = ci === 0
            const isSat = ci === 6
            const colorClass = cell.isCurrentMonth
              ? isSun ? 'text-[#F40404]' : isSat ? 'text-[#006FE5]' : 'text-[#111827]'
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
            <h2 className="text-[22px] font-bold text-[#111827] mb-4">{y}年</h2>
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
        <div className="relative flex items-center justify-center h-14 px-4">
          <button
            onClick={onYearNav}
            className="absolute left-4 flex items-center gap-0.5 text-sm font-medium text-[#374151] bg-transparent cursor-pointer p-0"
            style={{ border: 'none' }}
          >
            <ChevronLeft />
            {year}年
          </button>
          <span className="text-[17px] font-bold text-[#111827]">
            {year}年{month}月
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {days.map(({ d, dow, dateStr, isSun, isSat }) => {
          const textColor = isSun
            ? 'text-[#F40404]'
            : isSat
              ? 'text-[#006FE5]'
              : 'text-[#111827]'
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
  const initials = cat.name?.[0] ?? '?'
  // TODO: 当日の投薬通知を取得する
  const notification = null

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-3 text-left cursor-pointer"
      style={{ border: 'none' }}
    >
      <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-bold text-lg">
        {cat.photo
          ? <img src={cat.photo} alt={cat.name} className="w-full h-full object-cover" />
          : initials
        }
      </div>
      <div className="flex-1 flex flex-col gap-0.5">
        <span className="text-[15px] font-semibold text-[#111827]">{cat.name}のお世話</span>
        {notification && (
          <span className="text-xs text-[#9CA3AF]">{notification}</span>
        )}
      </div>
      <ChevronRight />
    </button>
  )
}

// ── Daily top ビュー ──────────────────────────────────────
function DailyTopView({ selectedDate, cats, onMonthNav, onCatDetail }) {
  const month = Number(selectedDate.split('-')[1])

  return (
    <div className="h-dvh flex flex-col bg-[#F7F7F7] overflow-hidden">
      <header className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="relative flex items-center justify-center h-14 px-4">
          <button
            onClick={onMonthNav}
            className="absolute left-4 flex items-center gap-0.5 text-sm font-medium text-[#374151] bg-transparent cursor-pointer p-0"
            style={{ border: 'none' }}
          >
            <ChevronLeft />
            {month}月
          </button>
          <span className="text-[17px] font-bold text-[#111827]">
            {formatDateJa(selectedDate)}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 flex flex-col gap-3">
        {cats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
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

  if (view === 'care' && careCat) {
    return (
      <CatCareScreen
        cat={careCat}
        date={selectedDate}
        onBack={() => setView('top')}
        onGoToCatsTab={onGoToCatsTab}
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
