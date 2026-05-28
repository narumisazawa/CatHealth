export default function TimePill({ value, onChange }) {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`bg-surface-bg rounded-2xl px-3 py-1 text-sm font-medium border-0 outline-none cursor-pointer ${value ? 'text-text-primary' : 'text-transparent'}`}
      />
      {!value && (
        <span className="absolute left-3 text-sm font-medium text-text-placeholder pointer-events-none select-none">
          --:--
        </span>
      )}
    </div>
  )
}
