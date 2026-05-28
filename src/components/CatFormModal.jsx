import { useState, useRef, useEffect } from 'react'

// ── ユーティリティ ──────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

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

// ── camera.svg パス（アバタープレースホルダー）────────
function CameraIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 17.5C13.25 17.5 14.3125 17.0625 15.1875 16.1875C16.0625 15.3125 16.5 14.25 16.5 13C16.5 11.75 16.0625 10.6875 15.1875 9.8125C14.3125 8.9375 13.25 8.5 12 8.5C10.75 8.5 9.6875 8.9375 8.8125 9.8125C7.9375 10.6875 7.5 11.75 7.5 13C7.5 14.25 7.9375 15.3125 8.8125 16.1875C9.6875 17.0625 10.75 17.5 12 17.5ZM4 21C3.45 21 2.97917 20.8042 2.5875 20.4125C2.19583 20.0208 2 19.55 2 19V7C2 6.45 2.19583 5.97917 2.5875 5.5875C2.97917 5.19583 3.45 5 4 5H7.15L9 3H15L16.85 5H20C20.55 5 21.0208 5.19583 21.4125 5.5875C21.8042 5.97917 22 6.45 22 7V19C22 19.55 21.8042 20.0208 21.4125 20.4125C21.0208 20.8042 20.55 21 20 21H4Z"
        fill="#9CA3AF"
      />
    </svg>
  )
}

// ── expand_all.svg パス（セレクト用シェブロン）──────
function ExpandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22L6 16L7.425 14.575L12 19.15L16.575 14.575L18 16L12 22ZM7.45 9.4L6 8L12 2L18 8L16.55 9.4L12 4.85L7.45 9.4Z" fill="#9CA3AF"/>
    </svg>
  )
}

// ── FormRow ─────────────────────────────────────────
// ラベル: 12px / 104px幅、ラベル〜入力間: 12px gap
function FormRow({ label, children, last = false }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center',
        minHeight: 52, padding: '0 16px', gap: 12,
      }}>
        <span className="text-text-primary" style={{ width: 104, fontSize: 14, flexShrink: 0 }}>
          {label}
        </span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {children}
        </div>
      </div>
      {!last && <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px' }} />}
    </>
  )
}

// ── テキスト入力スタイル ─────────────────────────────
const inputStyle = {
  width: '100%',
  border: 'none',
  outline: 'none',
  fontSize: 14,
  background: 'transparent',
  padding: 0,
}

// ── SelectRow: アイコン含めてタップ領域全体がセレクト ─
// 透明な <select> をエリア全体に絶対配置し、
// 見た目は表示テキスト + ExpandIcon で構成する
function SelectRow({ value, onChange, placeholder, options }) {
  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* 表示テキスト */}
      <span className={value ? 'text-text-primary' : 'text-text-placeholder'} style={{
        flex: 1, fontSize: 14,
        pointerEvents: 'none',
      }}>
        {value || placeholder}
      </span>
      {/* アイコン（クリック無効：select が上に重なる） */}
      <span style={{ pointerEvents: 'none' }}>
        <ExpandIcon />
      </span>
      {/* 透明な select：エリア全体を覆う */}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          opacity: 0, cursor: 'pointer',
          fontSize: 14,
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── 疾患→Foodsグループ対応 ──────────────────────────────
const PRESET_DISEASES = ['ストルバイト', '慢性腎臓病', '便秘']

function getDiseaseGroup(mode, value) {
  if (mode === 'select') {
    if (value === 'ストルバイト') return '療法食 ストルバイト猫'
    if (value === '慢性腎臓病')   return '療法食 腎臓サポート'
  }
  return '健康猫' // 便秘・自由入力
}

// ── DiseaseSelectRow: 末尾に「+ 疾患を追加」オプション ──
function DiseaseSelectRow({ value, onChange }) {
  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span className={value ? 'text-text-primary' : 'text-text-placeholder'} style={{
        flex: 1, fontSize: 14,
        pointerEvents: 'none',
      }}>
        {value || '選択してください'}
      </span>
      <span style={{ pointerEvents: 'none' }}>
        <ExpandIcon />
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          opacity: 0, cursor: 'pointer', fontSize: 14,
        }}
      >
        <option value="" disabled>選択してください</option>
        {PRESET_DISEASES.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
        <option value="__custom__">疾患を追加（自由入力）</option>
      </select>
    </div>
  )
}

// ── 疾患配列を初期化用に変換 ─────────────────────────────
function initDiseases(diseasesArr) {
  if (!diseasesArr || diseasesArr.length === 0) return [{ mode: 'select', value: '' }]
  return diseasesArr.map(d => ({
    mode: PRESET_DISEASES.includes(d.name) ? 'select' : 'text',
    value: d.name,
  }))
}

// ── CatFormModal ─────────────────────────────────────
export default function CatFormModal({ onSave, onClose, initialCat = null }) {
  const isEdit = initialCat !== null
  const [name, setName]           = useState(initialCat?.name       ?? '')
  const [birthday, setBirthday]   = useState(initialCat?.birthday   ?? '')
  const [sex, setSex]             = useState(initialCat?.sex        ?? '')
  const [neutered, setNeutered]   = useState(initialCat?.neutered   ?? '')
  const [microchip, setMicrochip] = useState(initialCat?.microchip  ?? '')
  const [aipo, setAipo]           = useState(initialCat?.aipo       ?? '')
  const [photo, setPhoto]         = useState(initialCat?.photo      ?? null)
  // { mode: 'select' | 'text', value: string }
  const [diseases, setDiseases]   = useState(() => initDiseases(initialCat?.diseases))

  const fileRef = useRef(null)

  // モーダル表示中は背景スクロールを無効化
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

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

  function handleDiseaseSelectChange(index, val) {
    if (val === '__custom__') {
      // テキスト入力モードに切り替え
      setDiseases(prev => prev.map((d, i) => i === index ? { mode: 'text', value: '' } : d))
    } else {
      setDiseases(prev => prev.map((d, i) => i === index ? { mode: 'select', value: val } : d))
    }
  }

  function handleDiseaseTextChange(index, val) {
    setDiseases(prev => prev.map((d, i) => i === index ? { ...d, value: val } : d))
  }

  function handleAddDisease() {
    setDiseases(prev => [...prev, { mode: 'select', value: '' }])
  }

  function handleRemoveDisease(index) {
    setDiseases(prev => {
      const next = prev.filter((_, i) => i !== index)
      return next.length === 0 ? [{ mode: 'select', value: '' }] : next
    })
  }

  function handleSave() {
    if (!name.trim()) return
    const id = isEdit ? initialCat.id : genId()
    const diseaseList = diseases
      .filter(d => d.value.trim() !== '')
      .map(d => ({ name: d.value, foodsGroup: getDiseaseGroup(d.mode, d.value) }))
    const cat = { id, name: name.trim(), birthday, sex, neutered, microchip, aipo, diseases: diseaseList }
    onSave(cat, photo)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 200,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      {/* モーダル本体 */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 430,
          background: '#F7F7F7',
          borderRadius: '20px 20px 0 0',
          maxHeight: '95dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── 固定ヘッダー：ドラッグハンドル + × / 保存 + 写真エリア ── */}
        <div style={{ flexShrink: 0 }}>
          {/* トップバー */}
          <div style={{
            position: 'relative',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 16px 16px',
          }}>
            <div style={{
              position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
              width: 36, height: 4, borderRadius: 999, background: '#D1D5DB',
            }} />
            {/* × ボタン：白い丸、枠線なし、高さ42px */}
            <button
              onClick={onClose}
              style={{
                width: 42, height: 42, borderRadius: '50%',
                border: 'none',
                background: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* 保存ボタン：高さ42px */}
            <button
              onClick={handleSave}
              style={{
                height: 42, padding: '0 28px', borderRadius: 999,
                border: 'none', background: '#EA5EAD',
                color: '#FFFFFF', fontSize: 15, fontWeight: 700,
                cursor: 'pointer',
                opacity: name.trim() ? 1 : 0.5,
              }}
            >
              保存
            </button>
          </div>

          {/* アバター + 写真追加 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBottom: 24 }}>
            {/* 円形アバター */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: 96, height: 96, borderRadius: '50%',
                background: '#D1D5DB',
                border: 'none', cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
              }}
            >
              {photo
                ? <img src={photo} alt="cat" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <CameraIcon />
              }
            </button>

            {/* 写真を追加ボタン */}
            <button
              onClick={() => fileRef.current?.click()}
              className="text-primary"
              style={{
                padding: '6px 20px', borderRadius: 999,
                border: '1.5px solid #EA5EAD', background: 'transparent',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              写真を追加
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </div>
        </div>

        {/* ── スクロール領域：名前以降のフォーム ── */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>

        {/* フォームカード */}
        <div style={{ margin: '0 16px', background: '#FFFFFF', borderRadius: 16, overflow: 'hidden' }}>
          <FormRow label="名前">
            <input
              className="text-text-primary"
              style={inputStyle}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="名前"
            />
          </FormRow>

          <FormRow label="誕生日">
            <input
              className="text-text-primary"
              style={inputStyle}
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              placeholder="yyyy/mm/dd"
            />
          </FormRow>

          <FormRow label="性別">
            <SelectRow
              value={sex}
              onChange={setSex}
              placeholder="選択してください"
              options={[
                { value: 'オス', label: 'オス' },
                { value: 'メス', label: 'メス' },
              ]}
            />
          </FormRow>

          <FormRow label="避妊・去勢">
            <SelectRow
              value={neutered}
              onChange={setNeutered}
              placeholder="選択してください"
              options={[
                { value: 'している', label: 'している' },
                { value: 'していない', label: 'していない' },
              ]}
            />
          </FormRow>

          <FormRow label="マイクロチップ">
            <input
              className="text-text-primary"
              style={inputStyle}
              value={microchip}
              onChange={e => setMicrochip(e.target.value)}
              placeholder="---"
            />
          </FormRow>

          <FormRow label="AIPO登録コード" last>
            <input
              className="text-text-primary"
              style={inputStyle}
              value={aipo}
              onChange={e => setAipo(e.target.value)}
              placeholder="---"
            />
          </FormRow>
        </div>

        {/* 疾患カード */}
        <div style={{ margin: '16px 16px 0', background: '#FFFFFF', borderRadius: 16, overflow: 'hidden' }}>
          {diseases.map((disease, index) => (
            <div key={index}>
              <div style={{
                display: 'flex', alignItems: 'center',
                minHeight: 52, padding: '0 16px', gap: 12,
              }}>
                <span className="text-text-primary" style={{ width: 104, fontSize: 14, flexShrink: 0 }}>疾患</span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  {disease.mode === 'text' ? (
                    <input
                      className="text-text-primary"
                      style={inputStyle}
                      value={disease.value}
                      onChange={e => handleDiseaseTextChange(index, e.target.value)}
                      placeholder="疾患名を入力"
                      autoFocus
                    />
                  ) : (
                    <DiseaseSelectRow
                      value={disease.value}
                      onChange={val => handleDiseaseSelectChange(index, val)}
                    />
                  )}
                </div>
                {/* × ボタン：テキスト行は常に表示、セレクト行は複数あるとき */}
                {(disease.mode === 'text' || diseases.length > 1) && (
                  <button
                    onClick={() => handleRemoveDisease(index)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              {index < diseases.length - 1 && (
                <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px' }} />
              )}
            </div>
          ))}
        </div>

        {/* + 疾患を追加 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }}>
          <button
            onClick={handleAddDisease}
            className="text-primary"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 13, fontWeight: 600, padding: '4px 0',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EA5EAD" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            疾患を追加
          </button>
        </div>

        {/* スクロール領域ここまで */}
        </div>
      </div>
    </div>
  )
}
