import { useState, useRef, useEffect } from 'react'

const LS_CATS = 'cathealth_cats'
const lsPhotoKey = id => `cathealth_photo_${id}`

async function compressImage(base64, maxWidth = 400, quality = 0.75) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = base64
  })
}

function getDiseaseGroup(name) {
  if (name === 'ストルバイト') return '療法食 ストルバイト猫'
  if (name === '慢性腎臓病') return '療法食 腎臓サポート'
  return '健康猫'
}

// ── アイコン ─────────────────────────────────────────────
function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="currentColor"/>
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-primary">
      <path d="M12 22L6 16L7.425 14.575L12 19.15L16.575 14.575L18 16L12 22ZM7.45 9.4L6 8L12 2L18 8L16.55 9.4L12 4.85L7.45 9.4Z" fill="currentColor"/>
    </svg>
  )
}

function MoreHorizIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-placeholder">
      <circle cx="5" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  )
}

function CatPlaceholderIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
      <path
        d="M12.0001 4.99978C12.6701 4.99978 13.3501 5.08978 14.0001 5.25978C15.7801 3.25978 19.0301 2.41978 20.4201 2.99978C21.8201 3.57978 20.0001 9.99978 20.0001 9.99978C20.5701 11.0698 21.0001 12.2398 21.0001 13.4398C21.0001 17.8998 16.9701 20.9998 12.0001 20.9998C7.03008 20.9998 3.00008 17.9998 3.00008 13.4398C3.00008 12.1898 3.50008 11.0398 4.00008 9.99978C4.00008 9.99978 2.11008 3.57978 3.50008 2.99978C4.89008 2.41978 8.22008 3.22978 10.0001 5.22978C10.6561 5.07888 11.3269 5.00174 12.0001 4.99978Z"
        stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M8 14V14.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 14V14.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
      <path d="M11.25 16.25H12.75L12 17L11.25 16.25Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── InfoRow ───────────────────────────────────────────────
function InfoRow({ label, last = false, children }) {
  return (
    <>
      <div className="flex items-center px-4 py-3 gap-3">
        <span className="text-sm font-normal text-text-primary w-28 flex-shrink-0">{label}</span>
        <div className="flex-1 flex items-center justify-end gap-2">
          {children}
        </div>
      </div>
      {!last && <div className="h-px bg-[#F0F0F0]" />}
    </>
  )
}

// ── SelectField ───────────────────────────────────────────
function SelectField({ value, onChange, options }) {
  return (
    <div className="relative flex items-center gap-2">
      <span className={`text-sm font-normal ${value ? 'text-text-primary' : 'text-text-placeholder'}`}>
        {value || '選択してください'}
      </span>
      <ExpandIcon />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-0 bg-transparent"
      >
        <option value="" disabled>選択してください</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

// ── CatProfileEditScreen ──────────────────────────────────
// isNew=true：新規追加モード（写真追加ボタン・空欄表示）
// isNew=false：編集モード（登録済みデータ表示）
export default function CatProfileEditScreen({ cat, isNew = false, onBack, onSave }) {
  const [name, setName]           = useState(cat.name       ?? '')
  const [birthday, setBirthday]   = useState(cat.birthday   ?? '')
  const [sex, setSex]             = useState(cat.sex        ?? '')
  const [neutered, setNeutered]   = useState(cat.neutered   ?? '')
  const [microchip, setMicrochip] = useState(cat.microchip  ?? '')
  const [aipo, setAipo]           = useState(cat.aipo       ?? '')
  const [photo, setPhoto]         = useState(cat.photo      ?? null)
  const [diseases, setDiseases]   = useState(() => {
    if (!cat.diseases || cat.diseases.length === 0) return ['']
    return cat.diseases.map(d => typeof d === 'string' ? d : (d.name || ''))
  })

  const fileRef = useRef(null)
  const isInsertedRef = useRef(!isNew)

  useEffect(() => {
    if (!isNew || !name.trim()) return
    const diseaseList = diseases
      .filter(d => d.trim() !== '')
      .map(d => ({ name: d, foodsGroup: getDiseaseGroup(d) }))
    const current = { id: cat.id, name: name.trim(), birthday, sex, neutered, microchip, aipo, diseases: diseaseList }
    if (photo) localStorage.setItem(lsPhotoKey(cat.id), photo)
    try {
      const prev = JSON.parse(localStorage.getItem(LS_CATS) || '[]')
      if (!isInsertedRef.current) {
        localStorage.setItem(LS_CATS, JSON.stringify([...prev, current]))
        isInsertedRef.current = true
      } else {
        localStorage.setItem(LS_CATS, JSON.stringify(prev.map(c => c.id === cat.id ? current : c)))
      }
    } catch {}
  }, [isNew, cat.id, name, birthday, sex, neutered, microchip, aipo, diseases, photo])

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      const compressed = await compressImage(ev.target.result)
      setPhoto(compressed)
    }
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!name.trim()) return
    const diseaseList = diseases
      .filter(d => d.trim() !== '')
      .map(d => ({ name: d, foodsGroup: getDiseaseGroup(d) }))
    const updatedCat = { ...cat, name: name.trim(), birthday, sex, neutered, microchip, aipo, diseases: diseaseList }
    onSave(updatedCat, photo)
  }

  function setDisease(index, value) {
    setDiseases(prev => prev.map((d, i) => i === index ? value : d))
  }

  function removeDisease(index) {
    setDiseases(prev => {
      const next = prev.filter((_, i) => i !== index)
      return next.length === 0 ? [''] : next
    })
  }

  return (
    <div className="flex flex-col h-dvh bg-[#F7F7F7] overflow-hidden">

      {/* ヘッダー */}
      <header className="relative flex items-center justify-center h-[60px] px-4 bg-white border-b border-black/10 flex-shrink-0">
        <button
          onClick={onBack}
          className="absolute left-4 flex items-center justify-center bg-transparent border-0 cursor-pointer p-1"
        >
          <ChevronLeft />
        </button>
        <span className="text-base font-semibold text-text-primary">プロフィール</span>
        {!isNew && (
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="absolute right-4 text-sm font-semibold text-primary bg-transparent border-0 cursor-pointer disabled:opacity-40"
          >
            保存
          </button>
        )}
      </header>

      {/* スクロールエリア */}
      <div className="flex-1 overflow-y-auto pb-20">

        {/* 写真セクション */}
        <div className="flex flex-col items-center pt-8 pb-6 gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-32 h-32 rounded-full bg-[#E5E7EB] overflow-hidden flex items-center justify-center border-0 cursor-pointer p-0 flex-shrink-0"
          >
            {photo ? (
              <img src={photo} alt={cat.name} className="w-full h-full object-cover" />
            ) : isNew ? (
              null
            ) : (
              <CatPlaceholderIcon />
            )}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-5 py-1.5 rounded-full border border-[#EA5EAD] text-sm font-semibold text-primary bg-transparent cursor-pointer"
          >
            {isNew ? '写真を追加' : '写真を差し替え'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </div>

        {/* 基本情報カード */}
        <div className="mx-4 bg-white rounded-xl overflow-hidden">
          <InfoRow label="名前">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 text-right text-sm font-normal text-text-primary bg-transparent border-0 outline-none p-0"
            />
          </InfoRow>
          <InfoRow label="誕生日">
            <input
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              className="flex-1 text-right text-sm font-normal text-text-primary bg-transparent border-0 outline-none p-0"
            />
          </InfoRow>
          <InfoRow label="性別">
            <SelectField
              value={sex}
              onChange={setSex}
              options={['オス', 'メス']}
            />
          </InfoRow>
          <InfoRow label="避妊・去勢">
            <SelectField
              value={neutered}
              onChange={setNeutered}
              options={['している', 'していない']}
            />
          </InfoRow>
          <InfoRow label="マイクロチップ">
            <input
              value={microchip}
              onChange={e => setMicrochip(e.target.value)}
              className="flex-1 text-right text-sm font-normal text-text-primary bg-transparent border-0 outline-none p-0"
            />
          </InfoRow>
          <InfoRow label="AIPO登録コード" last>
            <input
              value={aipo}
              onChange={e => setAipo(e.target.value)}
              className="flex-1 text-right text-sm font-normal text-text-primary bg-transparent border-0 outline-none p-0"
            />
          </InfoRow>
        </div>

        {/* 疾患カード */}
        <div className="mt-3 mx-4 bg-white rounded-xl overflow-hidden">
          {diseases.map((disease, i) => (
            <div key={i}>
              <div className="flex items-center px-4 py-3 gap-3">
                <span className="text-sm font-normal text-text-primary w-28 flex-shrink-0">疾患{i + 1}</span>
                <input
                  value={disease}
                  onChange={e => setDisease(i, e.target.value)}
                  className="flex-1 text-right text-sm font-normal text-text-primary bg-transparent border-0 outline-none p-0"
                />
                <button
                  onClick={() => removeDisease(i)}
                  className="flex-shrink-0 bg-transparent border-0 cursor-pointer p-0 flex items-center"
                >
                  <MoreHorizIcon />
                </button>
              </div>
              {i < diseases.length - 1 && <div className="h-px bg-[#F0F0F0]" />}
            </div>
          ))}
        </div>

        {/* ＋ 疾患を追加 */}
        <div className="flex justify-end px-4 pt-2">
          <button
            onClick={() => setDiseases(prev => [...prev, ''])}
            className="flex items-center gap-1 text-sm font-semibold text-primary bg-transparent border-0 cursor-pointer p-0"
          >
            ＋ 疾患を追加
          </button>
        </div>

      </div>
    </div>
  )
}
