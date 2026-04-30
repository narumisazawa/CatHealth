import { useState, useEffect, useRef } from 'react'
import cameraSvg from '../assets/icons/camera.svg'

const PRIMARY = '#EA5EAD'
const ERROR   = '#EF4444'
const LS_EXAM = 'cathealth_exam_results'

const QUAL_OPTIONS = ['－', '±', '１＋', '２＋', '３＋']

const URINE_ITEMS = [
  { key: 'specificGravity', label: '比重',             ref: '1.035-1.050', type: 'number', step: '0.001', refMin: 1.035, refMax: 1.050 },
  { key: 'ph',              label: 'pH',               ref: '4.8-7.5',     type: 'number', step: '0.1',   refMin: 4.8,   refMax: 7.5 },
  { key: 'protein',         label: '蛋白',             ref: '',            type: 'select' },
  { key: 'occultBlood',     label: '潜血',             ref: '',            type: 'select' },
  { key: 'glucose',         label: 'ブドウ糖',         ref: '',            type: 'select' },
  { key: 'ketone',          label: 'ケトン体',         ref: '',            type: 'select' },
  { key: 'bilirubin',       label: 'ビリルビン',       ref: '',            type: 'select' },
  { key: 'urobilinogen',    label: 'ウロビリノーゲン', ref: '',            type: 'select' },
  { key: 'rbc',             label: '赤血球',           ref: '',            type: 'select' },
  { key: 'wbc',             label: '白血球',           ref: '',            type: 'select' },
  { key: 'bacteria',        label: '細菌の有無',       ref: '',            type: 'select' },
  { key: 'crystals',        label: '結晶',             ref: '',            type: 'select' },
]

const BLOOD_ITEMS = [
  { key: 'glu',     abbr: 'GLU',      name: 'グルコース',               refLabel: '71-159',  refMin: 71,  refMax: 159,  unit: 'mg/dL' },
  { key: 'crea',    abbr: 'CREA',     name: 'クレアチニン',             refLabel: '0.8-2.4', refMin: 0.8, refMax: 2.4,  unit: 'mg/dL' },
  { key: 'bun',     abbr: 'BUN',      name: '尿素窒素',                 refLabel: '16-36',   refMin: 16,  refMax: 36,   unit: 'mg/dL' },
  { key: 'bunCrea', abbr: 'BUN/CREA', name: '尿素窒素/クレアチニン比', refLabel: '10-30',   refMin: 10,  refMax: 30,   unit: '' },
  { key: 'tp',      abbr: 'TP',       name: '総蛋白',                   refLabel: '5.7-8.9', refMin: 5.7, refMax: 8.9,  unit: 'g/dL' },
  { key: 'alb',     abbr: 'ALB',      name: 'アルブミン',               refLabel: '2.3-3.9', refMin: 2.3, refMax: 3.9,  unit: 'g/dL' },
  { key: 'glob',    abbr: 'GLOB',     name: 'グロブリン',               refLabel: '2.8-5.1', refMin: 2.8, refMax: 5.1,  unit: 'g/dL' },
  { key: 'albGlob', abbr: 'ALB/GLOB', name: 'アルブミン/グロブリン比', refLabel: '0.6-1.2', refMin: 0.6, refMax: 1.2,  unit: '' },
  { key: 'alt',     abbr: 'ALT',      name: 'アラニンアミノトランスフェラーゼ', refLabel: '12-130', refMin: 12, refMax: 130, unit: 'U/L' },
  { key: 'alkp',    abbr: 'ALKP',     name: 'アルカリフォスファターゼ', refLabel: '14-111',  refMin: 14,  refMax: 111,  unit: 'U/L' },
  { key: 'sdma',    abbr: 'SDMA',     name: '対称性ジメチルアルギニン', refLabel: '0-14',    refMin: 0,   refMax: 14,   unit: 'μg/dL' },
]

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

async function compressImage(base64, maxWidth = 400, quality = 0.75) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = img.width  * scale
      canvas.height = img.height * scale
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = base64
  })
}

function isOutOfRange(value, refMin, refMax) {
  if (value === '' || value == null) return false
  const num = Number(value)
  return !isNaN(num) && (num < refMin || num > refMax)
}

// ── アイコン ─────────────────────────────────────────────
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" fill={PRIMARY}/>
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 22L6 16L7.425 14.575L12 19.15L16.575 14.575L18 16L12 22ZM7.45 9.4L6 8L12 2L18 8L16.55 9.4L12 4.85L7.45 9.4Z" fill="#9CA3AF"/>
    </svg>
  )
}

// ── 写真・メモ・削除（共通） ──────────────────────────────
function PhotoMemoDelete({ photo, setPhoto, memo, setMemo, isEdit, onDelete }) {
  const fileRef = useRef(null)

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

  return (
    <>
      <div style={{ padding: '8px 4px 2px' }}>
        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>写真を撮る</span>
      </div>
      <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 16 }}>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: 'none' }} />
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            width: 80, height: 80, borderRadius: 8,
            border: '1.5px solid #E5E7EB', background: '#F9FAFB',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', padding: 0,
          }}
        >
          {photo
            ? <img src={photo} alt="exam" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <img src={cameraSvg} width={32} height={32} alt="camera" />
          }
        </button>
      </div>

      <div style={{ padding: '8px 4px 2px' }}>
        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>メモ</span>
      </div>
      <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 16 }}>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="メモを入力"
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            border: 'none', outline: 'none', resize: 'none',
            fontSize: 14, color: '#0F172A', lineHeight: 1.6,
            background: 'transparent', padding: 0,
          }}
        />
      </div>

      {isEdit && (
        <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onDelete}
            style={{
              height: 48, padding: '0 32px', borderRadius: 999,
              border: `1.5px solid ${PRIMARY}`, background: '#FFFFFF',
              color: PRIMARY, fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <TrashIcon />
            削除する
          </button>
        </div>
      )}
    </>
  )
}

// ── 尿検査タブ ────────────────────────────────────────────
function UrineTab({ data, onChange, photo, setPhoto, memo, setMemo, isEdit, onDelete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 16px 0' }}>
      <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
        {URINE_ITEMS.map((item, idx) => {
          const value = data[item.key]
          return (
            <div key={item.key}>
              {idx > 0 && <div style={{ height: 1, background: '#F0F0F0' }} />}
              <div style={{ display: 'flex', alignItems: 'center', minHeight: 48, padding: '0 16px', gap: 8 }}>
                {/* ラベル */}
                <div style={{ flex: 1, fontSize: 14, color: '#111827' }}>{item.label}</div>
                {/* 基準値 */}
                <div style={{ width: 88, fontSize: 12, color: '#9CA3AF', flexShrink: 0, textAlign: 'center' }}>
                  {item.ref}
                </div>
                {/* 入力 */}
                <div style={{ width: 72, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  {item.type === 'number' ? (
                    <input
                      type="number"
                      inputMode="decimal"
                      value={value}
                      onChange={e => onChange(item.key, e.target.value)}
                      step={item.step}
                      placeholder="—"
                      style={{
                        width: '100%', textAlign: 'right',
                        border: 'none', outline: 'none',
                        background: 'transparent',
                        fontSize: 14,
                        color: '#111827',
                      }}
                    />
                  ) : (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: 14, color: '#111827' }}>{value || '－'}</span>
                      <ExpandIcon />
                      <select
                        value={value || '－'}
                        onChange={e => onChange(item.key, e.target.value)}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                      >
                        {QUAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <PhotoMemoDelete
        photo={photo} setPhoto={setPhoto}
        memo={memo}   setMemo={setMemo}
        isEdit={isEdit} onDelete={onDelete}
      />
    </div>
  )
}

// ── 血液検査タブ ──────────────────────────────────────────
function BloodTab({ data, onChange, photo, setPhoto, memo, setMemo, isEdit, onDelete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 16px 0' }}>
      <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
        {BLOOD_ITEMS.map((item, idx) => {
          const value = data[item.key]
          return (
            <div key={item.key}>
              {idx > 0 && <div style={{ height: 1, background: '#F0F0F0' }} />}
              <div style={{ display: 'flex', alignItems: 'center', minHeight: 52, padding: '0 16px', gap: 8 }}>
                {/* ラベル */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.abbr}</div>
                  <div style={{ fontSize: 12, color: '#111827', lineHeight: 1.3 }}>{item.name}</div>
                </div>
                {/* 基準値 */}
                <div style={{ width: 64, fontSize: 12, color: '#9CA3AF', flexShrink: 0, textAlign: 'center' }}>
                  {item.refLabel}
                </div>
                {/* 入力値 */}
                <div style={{ width: 56, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={value}
                    onChange={e => onChange(item.key, e.target.value)}
                    step="any"
                    placeholder="—"
                    style={{
                      width: '100%', textAlign: 'right',
                      border: 'none', outline: 'none',
                      background: 'transparent',
                      fontSize: 14,
                      color: '#111827',
                    }}
                  />
                </div>
                {/* 単位 */}
                <div style={{ width: 48, flexShrink: 0, fontSize: 12, color: '#111827', textAlign: 'right' }}>
                  {item.unit}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <PhotoMemoDelete
        photo={photo} setPhoto={setPhoto}
        memo={memo}   setMemo={setMemo}
        isEdit={isEdit} onDelete={onDelete}
      />
    </div>
  )
}

// ── DailyExamSheet ────────────────────────────────────────
export default function DailyExamSheet({
  catId,
  date,
  onClose,
  onSave,
  onDelete,
  initialRecord = null,
}) {
  const isEdit = initialRecord !== null

  const [tab, setTab] = useState('urine')

  const initUrineData = () => {
    const base = {}
    URINE_ITEMS.forEach(i => { base[i.key] = '' })
    return initialRecord?.urine ? { ...base, ...initialRecord.urine } : base
  }
  const initBloodData = () => {
    const base = {}
    BLOOD_ITEMS.forEach(i => { base[i.key] = '' })
    return initialRecord?.blood ? { ...base, ...initialRecord.blood } : base
  }

  const [urineData,  setUrineData]  = useState(initUrineData)
  const [bloodData,  setBloodData]  = useState(initBloodData)
  const [urinePhoto, setUrinePhoto] = useState(initialRecord?.urinePhoto ?? null)
  const [bloodPhoto, setBloodPhoto] = useState(initialRecord?.bloodPhoto ?? null)
  const [urineMemo,  setUrineMemo]  = useState(initialRecord?.urineMemo ?? '')
  const [bloodMemo,  setBloodMemo]  = useState(initialRecord?.bloodMemo ?? '')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function setUrineField(key, value) {
    setUrineData(prev => ({ ...prev, [key]: value }))
  }
  function setBloodField(key, value) {
    setBloodData(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    const record = {
      id:         isEdit ? initialRecord.id : genId(),
      catId,
      date,
      urine:      urineData,
      blood:      bloodData,
      urinePhoto,
      bloodPhoto,
      urineMemo,
      bloodMemo,
    }
    try {
      const prev = JSON.parse(localStorage.getItem(LS_EXAM) || '[]')
      const next = isEdit
        ? prev.map(r => r.id === record.id ? record : r)
        : [...prev, record]
      localStorage.setItem(LS_EXAM, JSON.stringify(next))
    } catch { /* ignore */ }
    onSave(record)
  }

  function handleDelete() {
    if (!initialRecord) return
    try {
      const prev = JSON.parse(localStorage.getItem(LS_EXAM) || '[]')
      localStorage.setItem(LS_EXAM, JSON.stringify(prev.filter(r => r.id !== initialRecord.id)))
    } catch { /* ignore */ }
    onDelete(initialRecord.id)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 500,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 375,
          background: '#F7F7F7',
          borderRadius: '20px 20px 0 0',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── ヘッダー ── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: '#D1D5DB' }} />
          </div>

          <div style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px 16px',
          }}>
            <button
              onClick={onClose}
              style={{
                position: 'absolute', left: 16,
                width: 42, height: 42, borderRadius: '50%',
                border: 'none', background: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6"  y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>診察結果</span>

            <button
              onClick={handleSave}
              style={{
                position: 'absolute', right: 16,
                height: 42, padding: '0 24px', borderRadius: 999,
                border: 'none', background: PRIMARY,
                color: '#FFFFFF', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.04em',
              }}
            >
              保存
            </button>
          </div>

          {/* タブ */}
          <div style={{
            display: 'flex',
            background: '#F3F2EF',
            borderRadius: 999,
            padding: 4,
            margin: '0 16px 12px',
          }}>
            {[
              { key: 'urine', label: '尿検査' },
              { key: 'blood', label: '血液検査' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, height: 36,
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: tab === t.key ? 600 : 400,
                  color: tab === t.key ? '#0F172A' : '#9CA3AF',
                  background: tab === t.key ? '#FFFFFF' : 'transparent',
                  boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── スクロール領域 ── */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
          {tab === 'urine' && (
            <UrineTab
              data={urineData}  onChange={setUrineField}
              photo={urinePhoto} setPhoto={setUrinePhoto}
              memo={urineMemo}  setMemo={setUrineMemo}
              isEdit={isEdit}   onDelete={handleDelete}
            />
          )}
          {tab === 'blood' && (
            <BloodTab
              data={bloodData}  onChange={setBloodField}
              photo={bloodPhoto} setPhoto={setBloodPhoto}
              memo={bloodMemo}  setMemo={setBloodMemo}
              isEdit={isEdit}   onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
