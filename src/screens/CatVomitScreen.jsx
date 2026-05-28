import { useState } from 'react'
import TimePill from '../components/TimePill.jsx'

const LS_VOMIT = 'cathealth_vomit_records'

const CONDITION_OPTIONS = [
  { value: '透明',         label: '透明' },
  { value: 'フード',       label: 'フード' },
  { value: '毛玉',         label: '毛玉' },
  { value: '茶色',         label: '茶色' },
  { value: '緑',           label: '緑' },
  { value: 'ピンクまたは赤', label: 'ピンクまたは赤' },
]

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function resizeImage(dataUrl, maxWidth = 480, quality = 0.6) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = img.width > maxWidth ? maxWidth / img.width : 1
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataUrl
  })
}

function loadRecords() {
  try { return JSON.parse(localStorage.getItem(LS_VOMIT) || '[]') } catch { return [] }
}

function getDayRecords(catId, date) {
  return loadRecords().filter(r => r.catId === catId && r.date === date)
}

function persistRecord(record) {
  try {
    const prev = loadRecords()
    const exists = prev.some(r => r.id === record.id)
    const next = exists
      ? prev.map(r => r.id === record.id ? record : r)
      : [...prev, record]
    localStorage.setItem(LS_VOMIT, JSON.stringify(next))
    return { ok: true }
  } catch (e) {
    const isQuota = e instanceof DOMException &&
      (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    console.error('[Vomit] 保存エラー:', e)
    return { ok: false, quotaExceeded: isQuota }
  }
}

function removeRecord(id) {
  try {
    localStorage.setItem(LS_VOMIT, JSON.stringify(loadRecords().filter(r => r.id !== id)))
  } catch {}
}

// ── アイコン ─────────────────────────────────────────────
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-primary">
      <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="currentColor"/>
    </svg>
  )
}


function ExpandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-text-placeholder flex-shrink-0">
      <path d="M12 22L6 16L7.425 14.575L12 19.15L16.575 14.575L18 16L12 22ZM7.45 9.4L6 8L12 2L18 8L16.55 9.4L12 4.85L7.45 9.4Z"/>
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-text-placeholder">
      <path d="M9 3L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5H16.83L15 3H9ZM12 18C9.24 18 7 15.76 7 13C7 10.24 9.24 8 12 8C14.76 8 17 10.24 17 13C17 15.76 14.76 18 12 18Z" fill="currentColor"/>
      <circle cx="12" cy="13" r="3" fill="currentColor"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"/>
    </svg>
  )
}

// ── VomitEntryCard ────────────────────────────────────────
function VomitEntryCard({ record, onUpdate, onDelete }) {
  const hasContent = !!(record.time || record.condition || record.photo || record.memo)
  const conditionLabel = CONDITION_OPTIONS.find(o => o.value === record.condition)?.label ?? ''

  function update(field, value) {
    onUpdate({ ...record, [field]: value })
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      const compressed = await resizeImage(ev.target.result)
      update('photo', compressed)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden">

      {/* 時間 */}
      <div className="flex items-center px-4 py-3 gap-3 border-b border-black/15">
        <span className="text-sm font-normal text-text-primary flex-shrink-0">時間</span>
        <div className="flex-1 flex items-center justify-end">
          <TimePill value={record.time || ''} onChange={v => update('time', v)} />
        </div>
      </div>

      {/* 状態 */}
      <div className="relative flex items-center px-4 py-3 gap-3 border-b border-black/15">
        <span className="text-sm font-normal text-text-primary flex-shrink-0">状態</span>
        <div className="flex-1 flex items-center justify-end gap-2">
          <span className={`text-sm font-normal ${record.condition ? 'text-text-primary' : 'text-text-placeholder'}`}>
            {conditionLabel || '選んでください'}
          </span>
          <ExpandIcon />
        </div>
        <select
          value={record.condition || ''}
          onChange={e => update('condition', e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full border-0"
        >
          <option value="" disabled>選んでください</option>
          {CONDITION_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* 写真エリア */}
      <div className="px-4 pt-4 pb-3">
        {record.photo ? (
          <label className="block w-full rounded-xl cursor-pointer overflow-hidden">
            <img src={record.photo} alt="" className="w-full object-cover rounded-xl" />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        ) : (
          <label className="w-16 h-16 rounded-xl border-2 border-dashed border-black/15 cursor-pointer flex items-center justify-center bg-[#FAFAFA]">
            <CameraIcon />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        )}
      </div>

      {/* ゲロメモ */}
      <div className="px-4 pt-1 pb-3 border-b border-black/15">
        <p className="text-xs font-normal text-text-placeholder mb-2">ゲロメモ</p>
        <textarea
          value={record.memo || ''}
          onChange={e => update('memo', e.target.value)}
          rows={3}
          className="w-full text-sm font-normal text-text-primary bg-transparent border-0 outline-none resize-none placeholder:text-text-placeholder"
        />
      </div>

      {/* 削除する */}
      <button
        onClick={hasContent ? onDelete : undefined}
        disabled={!hasContent}
        className={`w-full flex items-center justify-center gap-2 py-3 border-0 bg-transparent ${
          hasContent ? 'cursor-pointer text-primary' : 'cursor-default text-text-placeholder'
        }`}
      >
        <TrashIcon />
        <span className="text-sm font-normal">削除する</span>
      </button>
    </div>
  )
}

// ── CatVomitScreen ────────────────────────────────────────
export default function CatVomitScreen({ cat, date, onBack }) {
  const [records, setRecords] = useState(() => {
    const loaded = getDayRecords(cat.id, date)
    if (loaded.length > 0) return loaded
    const initial = {
      id: genId(), catId: cat.id, date,
      time: '', condition: '', photo: null, memo: '',
    }
    persistRecord(initial)
    return [initial]
  })
  const [saveError, setSaveError] = useState(null)

  function handleUpdate(updated) {
    const result = persistRecord(updated)
    if (!result.ok) {
      setSaveError(result.quotaExceeded ? '写真のデータが大きすぎて保存できませんでした。' : '保存に失敗しました。')
      return
    }
    setSaveError(null)
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  function handleDelete(id) {
    removeRecord(id)
    setRecords(prev => {
      const next = prev.filter(r => r.id !== id)
      if (next.length > 0) return next
      const blank = {
        id: genId(), catId: cat.id, date,
        time: '', condition: '', photo: null, memo: '',
      }
      persistRecord(blank)
      return [blank]
    })
  }

  function handleAdd() {
    const newRecord = {
      id: genId(), catId: cat.id, date,
      time: '', condition: '', photo: null, memo: '',
    }
    const result = persistRecord(newRecord)
    if (!result.ok) {
      setSaveError('追加に失敗しました。')
      return
    }
    setSaveError(null)
    setRecords(prev => [...prev, newRecord])
  }

  return (
    <div className="flex flex-col h-dvh bg-[#F7F7F7] overflow-hidden">

      {/* ヘッダー */}
      <header className="relative flex items-center justify-center h-[60px] px-4 bg-white border-b border-black/10 flex-shrink-0">
        <button
          onClick={onBack}
          className="absolute left-4 flex items-center justify-center bg-transparent border-0 cursor-pointer p-1"
        >
          <BackIcon />
        </button>
        <span className="text-base font-semibold text-text-primary">ゲロ</span>
      </header>

      {/* エラー通知 */}
      {saveError && (
        <div className="px-4 py-3 bg-white border-b border-black/10 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-normal text-primary">{saveError}</span>
          <button
            onClick={() => setSaveError(null)}
            className="bg-transparent border-0 cursor-pointer p-1 text-text-placeholder"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      )}

      {/* スクロールエリア */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 pt-4 space-y-3">
          {records.map(record => (
            <VomitEntryCard
              key={record.id}
              record={record}
              onUpdate={handleUpdate}
              onDelete={() => handleDelete(record.id)}
            />
          ))}
        </div>

        {/* ＋ ゲロを追加 */}
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 text-sm font-semibold text-primary bg-transparent border-0 cursor-pointer p-0"
          >
            ＋ ゲロを追加
          </button>
        </div>
      </div>
    </div>
  )
}
