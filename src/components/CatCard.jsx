function calcAge(birthday) {
  if (!birthday) return null
  const [y, m, d] = birthday.replace(/\//g, '-').split('-').map(Number)
  if (!y || !m || !d) return null
  const now = new Date()
  let years  = now.getFullYear() - y
  let months = now.getMonth() + 1 - m
  if (months < 0)        { years--;  months += 12 }
  if (now.getDate() < d) { months--; if (months < 0) { years--; months += 12 } }
  if (years < 0) return null
  return { years, months }
}

function CatAvatar({ photo }) {
  return (
    <div className="w-12 h-12 rounded-full bg-[#E5E7EB] overflow-hidden flex-shrink-0 flex items-center justify-center">
      {photo ? (
        <img src={photo} alt="cat" className="w-full h-full object-cover" />
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12.0001 4.99978C12.6701 4.99978 13.3501 5.08978 14.0001 5.25978C15.7801 3.25978 19.0301 2.41978 20.4201 2.99978C21.8201 3.57978 20.0001 9.99978 20.0001 9.99978C20.5701 11.0698 21.0001 12.2398 21.0001 13.4398C21.0001 17.8998 16.9701 20.9998 12.0001 20.9998C7.03008 20.9998 3.00008 17.9998 3.00008 13.4398C3.00008 12.1898 3.50008 11.0398 4.00008 9.99978C4.00008 9.99978 2.11008 3.57978 3.50008 2.99978C4.89008 2.41978 8.22008 3.22978 10.0001 5.22978C10.6561 5.07888 11.3269 5.00174 12.0001 4.99978Z"
            stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
          <path d="M8 14V14.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 14V14.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.25 16.25H12.75L12 17L11.25 16.25Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="currentColor"/>
    </svg>
  )
}

export default function CatCard({ cat, onClick, className = '' }) {
  const age = calcAge(cat.birthday)
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer text-left border-0 bg-transparent ${className}`}
    >
      <CatAvatar photo={cat.photo} />
      <div className="flex-1 min-w-0">
        <div className="text-base font-bold text-text-primary leading-snug">{cat.name}</div>
        {age && (
          <div className="text-sm font-normal text-text-primary mt-0.5">{age.years}歳 {age.months}ヶ月</div>
        )}
      </div>
      <ChevronRight />
    </button>
  )
}
