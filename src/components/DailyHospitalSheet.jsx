import { useState, useEffect } from 'react'
import DailyExamSheet from './DailyExamSheet'

const PRIMARY        = '#EA5EAD'
const LS_HOSPITAL    = 'cathealth_daily_hospital'
const LS_HOSPITALS   = 'cathealth_hospitals'
const LS_EXAM        = 'cathealth_exam_results'

const CONTENT_OPTIONS = ['健康診断', '尿検査', '血液検査', 'ワクチン', 'その他']

const PRESC_FREQ_OPTIONS = [
  { value: '毎日1回',         label: '毎日1回' },
  { value: '毎日2回（朝夜）',  label: '毎日2回（朝夜）' },
  { value: '毎日3回（朝昼夜）', label: '毎日3回（朝昼夜）' },
  { value: '毎日4回',         label: '毎日4回' },
  { value: '隔日1回',         label: '隔日1回' },
  { value: '週1回',           label: '週1回' },
  { value: 'その他',          label: 'その他' },
]

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function loadHospitals() {
  try { return JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]') } catch { return [] }
}

function loadExamForDate(catId, date) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_EXAM) || '[]')
    return all.find(r => r.catId === catId && r.date === date) ?? null
  } catch { return null }
}

// ── アイコン ─────────────────────────────────────────────
function ExpandAllIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22L6 16L7.425 14.575L12 19.15L16.575 14.575L18 16L12 22ZM7.45 9.4L6 8L12 2L18 8L16.55 9.4L12 4.85L7.45 9.4Z" fill="#9CA3AF"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" fill={PRIMARY}/>
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="#9CA3AF"/>
    </svg>
  )
}

// ── Checkbox ──────────────────────────────────────────────
function Checkbox({ checked }) {
  if (checked) {
    return (
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        background: PRIMARY,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 16.1716L4.82843 12L3.41421 13.4142L9 19L20.4142 7.58579L19 6.17157L9 16.1716Z" fill="#FFFFFF"/>
        </svg>
      </div>
    )
  }
  return (
    <div style={{
      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
      border: '1.5px solid #D1D5DB',
      background: '#FFFFFF',
    }} />
  )
}

// ── FormRow（select用） ────────────────────────────────────
function SelectFormRow({ label, value, displayText, options, onChange, placeholder, last = false }) {
  return (
    <>
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          minHeight: 52, padding: '0 16px', gap: 12,
        }}>
          <span className="text-text-primary" style={{ fontSize: 14, flexShrink: 0, width: 56 }}>{label}</span>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
            <span className={value ? 'text-text-primary' : 'text-text-placeholder'} style={{ fontSize: 14 }}>
              {displayText || placeholder}
            </span>
            <ExpandAllIcon />
          </div>
        </div>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
        >
          <option value="">{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {!last && <div style={{ height: 1, background: '#F0F0F0' }} />}
    </>
  )
}

// ── DailyHospitalSheet ────────────────────────────────────
export default function DailyHospitalSheet({
  cats = [],
  catId,
  selectedDate,
  onClose,
  onSave,
  onDelete,
  onExamOpen,
  initialRecord = null,
}) {
  const isEdit = initialRecord !== null
  const hospitals = loadHospitals()

  const [selectedCatId,   setSelectedCatId]   = useState(initialRecord?.catId ?? catId ?? cats[0]?.id ?? '')
  const [date,            setDate]            = useState(initialRecord?.date ?? selectedDate ?? '')
  const [hospitalId,      setHospitalId]      = useState(initialRecord?.hospitalId ?? '')
  const [contents,        setContents]        = useState(initialRecord?.contents ?? [])
  const [contentMemo,     setContentMemo]     = useState(initialRecord?.contentMemo ?? '')
  const [memo,            setMemo]            = useState(initialRecord?.memo ?? '')
  const [prescName,       setPrescName]       = useState(initialRecord?.prescription?.name ?? '')
  const [prescFrequency,  setPrescFrequency]  = useState(initialRecord?.prescription?.frequency ?? '')
  const [prescAmount,     setPrescAmount]     = useState(initialRecord?.prescription?.amount ?? '')
  const [prescMemo,       setPrescMemo]       = useState(initialRecord?.prescription?.memo ?? '')
  const [showExamSheet,   setShowExamSheet]   = useState(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function toggleContent(item) {
    setContents(prev =>
      prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]
    )
    // 「その他」を外したらメモをクリア
    if (item === 'その他' && contents.includes('その他')) {
      setContentMemo('')
    }
  }

  function handleSave() {
    const record = {
      id:          isEdit ? initialRecord.id : genId(),
      catId:       selectedCatId,
      date,
      hospitalId,
      contents,
      contentMemo: contents.includes('その他') ? contentMemo.trim() : '',
      memo:        memo.trim(),
      prescription: {
        name:      prescName.trim(),
        frequency: prescFrequency,
        amount:    prescAmount,
        memo:      prescMemo.trim(),
      },
    }
    try {
      const prev = JSON.parse(localStorage.getItem(LS_HOSPITAL) || '[]')
      const next = isEdit
        ? prev.map(r => r.id === record.id ? record : r)
        : [...prev, record]
      localStorage.setItem(LS_HOSPITAL, JSON.stringify(next))
    } catch { /* ignore */ }
    onSave(record)
  }

  function handleDelete() {
    if (!initialRecord) return
    try {
      const prev = JSON.parse(localStorage.getItem(LS_HOSPITAL) || '[]')
      localStorage.setItem(LS_HOSPITAL, JSON.stringify(prev.filter(r => r.id !== initialRecord.id)))
    } catch { /* ignore */ }
    onDelete(initialRecord.id)
  }

  const catOptions      = cats.map(c => ({ value: c.id, label: c.name }))
  const hospitalOptions = hospitals.map(h => ({ value: h.id, label: h.name }))

  const catName      = cats.find(c => c.id === selectedCatId)?.name ?? ''
  const hospitalName = hospitals.find(h => h.id === hospitalId)?.name ?? ''

  return (
    <>
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 400,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 430,
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
          {/* ドラッグハンドル */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: '#D1D5DB' }} />
          </div>

          {/* ×・タイトル・保存 */}
          <div style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px 16px 16px',
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

            <span className="text-text-primary" style={{ fontSize: 16, fontWeight: 700 }}>
              動物病院受診
            </span>

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
        </div>

        {/* ── スクロール領域 ── */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 16px 0' }}>

            {/* 猫・受診日カード */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
              {/* 猫 */}
              <SelectFormRow
                label="猫"
                value={selectedCatId}
                displayText={catName}
                options={catOptions}
                onChange={setSelectedCatId}
                placeholder="選択してください"
              />

              {/* 受診日 */}
              <div style={{
                display: 'flex', alignItems: 'center',
                minHeight: 52, padding: '0 16px', gap: 12,
              }}>
                <span className="text-text-primary" style={{ fontSize: 14, flexShrink: 0, width: 56 }}>受診日</span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    background: '#F6F6F6', borderRadius: 15, height: 32,
                    display: 'flex', alignItems: 'center', padding: '0 10px',
                  }}>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="text-text-primary"
                      style={{
                        border: 'none', outline: 'none',
                        background: 'transparent',
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 動物病院ラベル */}
            <div style={{ padding: '4px 4px 2px' }}>
              <span className="text-text-secondary" style={{ fontSize: 12 }}>動物病院</span>
            </div>

            {/* 動物病院カード */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
              <SelectFormRow
                label="病院名"
                value={hospitalId}
                displayText={hospitalName}
                options={hospitalOptions}
                onChange={setHospitalId}
                placeholder="選択してください"
                last
              />
            </div>

            {/* 受診内容ラベル */}
            <div style={{ padding: '4px 4px 2px' }}>
              <span className="text-text-secondary" style={{ fontSize: 12 }}>受診内容</span>
            </div>

            {/* 受診内容カード */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
              {CONTENT_OPTIONS.map((item, idx) => {
                const checked = contents.includes(item)
                return (
                  <div key={item}>
                    {idx > 0 && <div style={{ height: 1, background: '#F0F0F0' }} />}
                    <button
                      onClick={() => toggleContent(item)}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center',
                        minHeight: 52, padding: '0 16px', gap: 12,
                        background: 'transparent',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <Checkbox checked={checked} />
                      <span className="text-text-primary" style={{ flex: 1, fontSize: 14 }}>{item}</span>
                    </button>
                    {/* その他：自由入力欄 */}
                    {item === 'その他' && checked && (
                      <>
                        <div style={{ height: 1, background: '#F0F0F0' }} />
                        <div style={{ padding: '10px 16px 10px 50px', background: 'transparent' }}>
                          <input
                            type="text"
                            value={contentMemo}
                            onChange={e => setContentMemo(e.target.value)}
                            placeholder="内容を入力"
                            autoFocus
                            className="text-text-primary"
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              border: 'none', outline: 'none',
                              fontSize: 14,
                              background: 'transparent', padding: 0,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 診察結果ラベル */}
            <div style={{ padding: '4px 4px 2px' }}>
              <span className="text-text-secondary" style={{ fontSize: 12 }}>診察結果</span>
            </div>

            {/* 診察結果カード */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
              {/* 検査結果登録 */}
              <button
                onClick={() => {
                  if (onExamOpen) {
                    onExamOpen(selectedCatId, date)
                  } else {
                    setShowExamSheet(true)
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center',
                  minHeight: 52, padding: '0 16px', gap: 12,
                  background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span className="text-text-primary" style={{ flex: 1, fontSize: 14 }}>検査結果登録</span>
                <ChevronRightIcon />
              </button>
            </div>

            {/* 処方ラベル */}
            <div style={{ padding: '4px 4px 2px' }}>
              <span className="text-text-secondary" style={{ fontSize: 12 }}>処方</span>
            </div>

            {/* 処方カード */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
              {/* 薬の名前 */}
              <div style={{
                display: 'flex', alignItems: 'center',
                minHeight: 52, padding: '0 16px', gap: 12,
              }}>
                <span className="text-text-primary" style={{ fontSize: 14, flexShrink: 0, width: 72 }}>薬の名前</span>
                <input
                  type="text"
                  value={prescName}
                  onChange={e => setPrescName(e.target.value)}
                  placeholder="入力してください"
                  className="text-text-primary"
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    fontSize: 14, background: 'transparent',
                    textAlign: 'right',
                  }}
                />
              </div>

              <div style={{ height: 1, background: '#F0F0F0' }} />

              {/* 頻度 */}
              <SelectFormRow
                label="頻度"
                value={prescFrequency}
                displayText={prescFrequency}
                options={PRESC_FREQ_OPTIONS}
                onChange={setPrescFrequency}
                placeholder="選択してください"
              />

              <div style={{ height: 1, background: '#F0F0F0' }} />

              {/* 量 */}
              <div style={{
                display: 'flex', alignItems: 'center',
                minHeight: 52, padding: '0 16px', gap: 12,
              }}>
                <span className="text-text-primary" style={{ fontSize: 14, flexShrink: 0, width: 72 }}>量</span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    background: '#F6F6F6', borderRadius: 15, height: 32,
                    display: 'flex', alignItems: 'center', padding: '0 10px',
                  }}>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={prescAmount}
                      onChange={e => setPrescAmount(e.target.value)}
                      placeholder="0"
                      className="text-text-primary"
                      style={{
                        border: 'none', outline: 'none',
                        background: 'transparent',
                        fontSize: 14,
                        width: 56, textAlign: 'right',
                      }}
                    />
                  </div>
                  <span className="text-text-placeholder" style={{ fontSize: 14, flexShrink: 0 }}>ml</span>
                </div>
              </div>

              <div style={{ height: 1, background: '#F0F0F0' }} />

              {/* メモ */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span className="text-text-primary" style={{ fontSize: 14, flexShrink: 0, width: 72, paddingTop: 2 }}>メモ</span>
                  <textarea
                    value={prescMemo}
                    onChange={e => setPrescMemo(e.target.value)}
                    placeholder="入力してください"
                    rows={2}
                    className="text-text-primary"
                    style={{
                      flex: 1, border: 'none', outline: 'none', resize: 'none',
                      fontSize: 14, lineHeight: 1.6,
                      background: 'transparent', padding: 0,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* メモラベル */}
            <div style={{ padding: '4px 4px 2px' }}>
              <span className="text-text-secondary" style={{ fontSize: 12 }}>メモ</span>
            </div>

            {/* メモカード */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 16 }}>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="メモを入力"
                rows={3}
                className="text-text-primary"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: 'none', outline: 'none', resize: 'none',
                  fontSize: 14, lineHeight: 1.6,
                  background: 'transparent', padding: 0,
                }}
              />
            </div>

            {/* 削除するボタン（編集モードのみ） */}
            {isEdit && (
              <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={handleDelete}
                  className="text-primary"
                  style={{
                    height: 48, padding: '0 32px', borderRadius: 999,
                    border: `1.5px solid ${PRIMARY}`, background: '#FFFFFF',
                    fontSize: 14, fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <TrashIcon />
                  削除する
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>

    {showExamSheet && (
      <DailyExamSheet
        catId={selectedCatId}
        date={date}
        onClose={() => setShowExamSheet(false)}
        onSave={() => setShowExamSheet(false)}
        onDelete={() => setShowExamSheet(false)}
        initialRecord={loadExamForDate(selectedCatId, date)}
      />
    )}
    </>
  )
}
