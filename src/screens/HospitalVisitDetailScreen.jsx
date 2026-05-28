import { useState, useMemo } from 'react'
import arrowBackSvg from '../assets/icons/arrow_back.svg'
import DailyHospitalSheet from '../components/DailyHospitalSheet'

const PRIMARY      = '#EA5EAD'
const ERROR        = '#EF4444'
const LS_EXAM      = 'cathealth_exam_results'
const LS_HOSPITALS = 'cathealth_hospitals'
const LS_HOSPITAL  = 'cathealth_daily_hospital'
const LS_CATS      = 'cathealth_cats'

// ── 定数 ─────────────────────────────────────────────
const URINE_ITEMS = [
  { key: 'specificGravity', label: '比重',             ref: '1.035-1.050', type: 'number', refMin: 1.035, refMax: 1.050 },
  { key: 'ph',              label: 'pH',               ref: '4.8-7.5',     type: 'number', refMin: 4.8,   refMax: 7.5   },
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
  { key: 'glu',     abbr: 'GLU',      name: 'グルコース',               ref: '71-159',   refMin: 71,  refMax: 159,  unit: 'mg/dL' },
  { key: 'crea',    abbr: 'CREA',     name: 'クレアチニン',             ref: '0.8-2.4',  refMin: 0.8, refMax: 2.4,  unit: 'mg/dL' },
  { key: 'bun',     abbr: 'BUN',      name: '尿素窒素',                 ref: '16-36',    refMin: 16,  refMax: 36,   unit: 'mg/dL' },
  { key: 'bunCrea', abbr: 'BUN/CREA', name: '尿素窒素/クレアチニン比', ref: '10-30',    refMin: 10,  refMax: 30,   unit: ''      },
  { key: 'tp',      abbr: 'TP',       name: '総蛋白',                   ref: '5.7-8.9',  refMin: 5.7, refMax: 8.9,  unit: 'g/dL'  },
  { key: 'alb',     abbr: 'ALB',      name: 'アルブミン',               ref: '2.3-3.9',  refMin: 2.3, refMax: 3.9,  unit: 'g/dL'  },
  { key: 'glob',    abbr: 'GLOB',     name: 'グロブリン',               ref: '2.8-5.1',  refMin: 2.8, refMax: 5.1,  unit: 'g/dL'  },
  { key: 'albGlob', abbr: 'ALB/GLOB', name: 'アルブミン/グロブリン比', ref: '0.6-1.2',  refMin: 0.6, refMax: 1.2,  unit: ''      },
  { key: 'alt',     abbr: 'ALT',      name: 'アラニンアミノトランスフェラーゼ', ref: '12-130', refMin: 12, refMax: 130, unit: 'U/L' },
  { key: 'alkp',    abbr: 'ALKP',     name: 'アルカリフォスファターゼ', ref: '14-111',   refMin: 14,  refMax: 111,  unit: 'U/L'   },
  { key: 'sdma',    abbr: 'SDMA',     name: '対称性ジメチルアルギニン', ref: '0-14',     refMin: 0,   refMax: 14,   unit: 'μg/dL' },
]

// ── ユーティリティ ────────────────────────────────────
function isOutOfRange(value, refMin, refMax) {
  if (value === '' || value == null) return false
  const num = Number(value)
  return !isNaN(num) && (num < refMin || num > refMax)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${y}/${m}/${d}`
}

function loadHospitals() {
  try { return JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]') } catch { return [] }
}

function loadCats() {
  try { return JSON.parse(localStorage.getItem(LS_CATS) || '[]') } catch { return [] }
}

function loadExamForDate(catId, date) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_EXAM) || '[]')
    return all.find(r => r.catId === catId && r.date === date) ?? null
  } catch { return null }
}

function loadPrevExam(catId, currentDate) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_EXAM) || '[]')
    const earlier = all
      .filter(r => r.catId === catId && r.date < currentDate)
      .sort((a, b) => b.date.localeCompare(a.date))
    return earlier[0] ?? null
  } catch { return null }
}

// ── InfoRow ───────────────────────────────────────────
function InfoRow({ label, value, last = false }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center',
        minHeight: 48, padding: '12px 16px', gap: 16,
      }}>
        <span className="text-text-primary" style={{ width: 72, fontSize: 14, flexShrink: 0 }}>{label}</span>
        <span className="text-text-primary" style={{ flex: 1, fontSize: 14, lineHeight: 1.5 }}>{value || '—'}</span>
      </div>
      {!last && <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px' }} />}
    </>
  )
}

// ── TableHeader ───────────────────────────────────────
function TableHeader({ isBlood = false }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 36, padding: '0 16px', gap: 8,
        background: '#F9FAFB',
      }}>
        <span className="text-text-placeholder" style={{ flex: 1, fontSize: 11 }}>検査項目</span>
        <span className="text-text-placeholder" style={{ width: isBlood ? 64 : 80, fontSize: 11, textAlign: 'right' }}>基準値</span>
        <span className="text-text-placeholder" style={{ width: 64, fontSize: 11, textAlign: 'right' }}>今回</span>
        <span className="text-text-placeholder" style={{ width: 44, fontSize: 11, textAlign: 'right' }}>前回</span>
        {isBlood && <span className="text-text-placeholder" style={{ width: 44, fontSize: 11 }}> </span>}
      </div>
      <div style={{ height: 1, background: '#F0F0F0' }} />
    </>
  )
}

// ── UrineTable ────────────────────────────────────────
function UrineTable({ data, prevData }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
      <TableHeader />
      {URINE_ITEMS.map((item, i) => {
        const value      = data?.[item.key] ?? ''
        const prevValue  = prevData?.[item.key] ?? ''
        const isEmpty    = value === '' || value == null
        const isPrevEmpty = prevValue === '' || prevValue == null
        const outOfRange     = item.type === 'number' ? isOutOfRange(value, item.refMin, item.refMax) : false
        const prevOutOfRange = item.type === 'number' ? isOutOfRange(prevValue, item.refMin, item.refMax) : false

        return (
          <div key={item.key}>
            <div style={{
              display: 'flex', alignItems: 'center',
              minHeight: 46, padding: '8px 16px', gap: 8,
            }}>
              <span className="text-text-primary" style={{ flex: 1, fontSize: 14 }}>{item.label}</span>
              <span className="text-text-primary" style={{ width: 80, fontSize: 14, textAlign: 'right' }}>
                {item.ref}
              </span>
              <span style={{
                width: 64, textAlign: 'right', fontSize: 14,
                fontWeight: outOfRange ? 700 : 400,
                color: isEmpty ? '#D1D5DB' : outOfRange ? ERROR : '#111827',
              }}>
                {isEmpty ? '—' : value}
              </span>
              <span style={{
                width: 44, textAlign: 'right', fontSize: 14,
                fontWeight: prevOutOfRange ? 700 : 400,
                color: isPrevEmpty ? '#D1D5DB' : prevOutOfRange ? ERROR : '#9CA3AF',
              }}>
                {isPrevEmpty ? '—' : prevValue}
              </span>
            </div>
            {i < URINE_ITEMS.length - 1 && (
              <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── BloodTable ────────────────────────────────────────
function BloodTable({ data, prevData }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
      <TableHeader isBlood />
      {BLOOD_ITEMS.map((item, i) => {
        const value      = data?.[item.key] ?? ''
        const prevValue  = prevData?.[item.key] ?? ''
        const isEmpty    = value === '' || value == null
        const isPrevEmpty = prevValue === '' || prevValue == null
        const outOfRange     = isOutOfRange(value, item.refMin, item.refMax)
        const prevOutOfRange = isOutOfRange(prevValue, item.refMin, item.refMax)

        return (
          <div key={item.key}>
            <div style={{
              display: 'flex', alignItems: 'center',
              minHeight: 46, padding: '8px 16px', gap: 8,
            }}>
              <div style={{ flex: 1 }}>
                <div className="text-text-primary" style={{ fontSize: 14, fontWeight: 700 }}>{item.abbr}</div>
                <div className="text-text-primary" style={{ fontSize: 12, marginTop: 1, opacity: 0.55 }}>{item.name}</div>
              </div>
              <span className="text-text-primary" style={{ width: 64, fontSize: 14, textAlign: 'right' }}>
                {item.ref}
              </span>
              <span style={{
                width: 64, textAlign: 'right', fontSize: 14,
                fontWeight: outOfRange ? 700 : 400,
                color: isEmpty ? '#D1D5DB' : outOfRange ? ERROR : '#111827',
              }}>
                {isEmpty ? '—' : value}
              </span>
              <span style={{
                width: 44, textAlign: 'right', fontSize: 14,
                fontWeight: prevOutOfRange ? 700 : 400,
                color: isPrevEmpty ? '#D1D5DB' : prevOutOfRange ? ERROR : '#9CA3AF',
              }}>
                {isPrevEmpty ? '—' : prevValue}
              </span>
              <span className="text-text-primary" style={{ width: 44, fontSize: 14 }}>
                {item.unit}
              </span>
            </div>
            {i < BLOOD_ITEMS.length - 1 && (
              <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── HospitalVisitDetailScreen ─────────────────────────
export default function HospitalVisitDetailScreen({ cat, hospitalRecord, onBack }) {
  const [tab,           setTab]           = useState('urine')
  const [record,        setRecord]        = useState(hospitalRecord)
  const [dataKey,       setDataKey]       = useState(0)
  const [showEditSheet, setShowEditSheet] = useState(false)

  const hospitals = useMemo(loadHospitals, [])
  const cats      = useMemo(loadCats, [])

  const exam = useMemo(
    () => loadExamForDate(record.catId, record.date),
    [record.catId, record.date, dataKey]
  )
  const prevExam = useMemo(
    () => loadPrevExam(record.catId, record.date),
    [record.catId, record.date]
  )

  const hospital      = hospitals.find(h => h.id === record.hospitalId)
  const urineData     = exam?.urine ?? {}
  const bloodData     = exam?.blood ?? {}
  const prevUrineData = prevExam?.urine ?? {}
  const prevBloodData = prevExam?.blood ?? {}
  const photo = tab === 'urine' ? exam?.urinePhoto : exam?.bloodPhoto
  const memo  = tab === 'urine' ? exam?.urineMemo  : exam?.bloodMemo

  const contentsText = record.contents?.length
    ? record.contents.join('・') + (record.contentMemo ? `（${record.contentMemo}）` : '')
    : '—'

  const presc = record.prescription ?? {}

  function handleSheetSave(updatedRecord) {
    setRecord(updatedRecord)
    setDataKey(k => k + 1)
    setShowEditSheet(false)
  }

  function handleSheetDelete() {
    setShowEditSheet(false)
    onBack()
  }

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: '#F7F7F7', overflow: 'hidden',
    }}>

      {/* ── 固定ヘッダー ── */}
      <header style={{
        position: 'relative', flexShrink: 0,
        background: '#FFFFFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 60, padding: '0 16px',
      }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute', left: 8,
            width: 44, height: 44, borderRadius: '50%',
            border: 'none', background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img src={arrowBackSvg} width={24} height={24} alt="戻る" />
        </button>

        <span className="text-text-primary" style={{ fontSize: 16, fontWeight: 700 }}>{cat.name}</span>

        <button
          onClick={() => setShowEditSheet(true)}
          className="text-primary"
          style={{
            position: 'absolute', right: 16,
            height: 34, padding: '0 16px', borderRadius: 999,
            border: `1.5px solid ${PRIMARY}`, background: '#FFFFFF',
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          編集
        </button>
      </header>

      {/* ── スクロール領域 ── */}
      <div className="daily-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 受診情報カード */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
            <InfoRow label="受診日"     value={formatDate(record.date)} />
            <InfoRow label="動物病院名" value={hospital?.name} />
            <InfoRow label="受診内容"   value={contentsText} last />
          </div>

          {/* 処方エリア */}
          <div style={{ padding: '0 4px', marginBottom: -8 }}>
            <span className="text-text-secondary" style={{ fontSize: 12 }}>処方</span>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px' }}>
              <div className="text-text-primary" style={{ fontSize: 14, marginBottom: 6 }}>薬の名前</div>
              <div className="text-text-primary" style={{ fontSize: 14 }}>{presc.name || '—'}</div>
            </div>
            <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px' }} />
            <div style={{ padding: '14px 16px' }}>
              <div className="text-text-primary" style={{ fontSize: 14, marginBottom: 6 }}>頻度</div>
              <div className="text-text-primary" style={{ fontSize: 14 }}>{presc.frequency || '—'}</div>
            </div>
            <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px' }} />
            <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
              <span className="text-text-primary" style={{ fontSize: 14 }}>
                {presc.amount ? `${presc.amount} ml` : '—'}
              </span>
            </div>
            <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px' }} />
            <div style={{ padding: '14px 16px' }}>
              <div className="text-text-primary" style={{ fontSize: 14, marginBottom: 6 }}>メモ</div>
              <div className="text-text-primary" style={{ fontSize: 14, lineHeight: 1.6 }}>{presc.memo || '—'}</div>
            </div>
          </div>

          {/* タブ */}
          <div style={{
            background: '#F0F0F0', borderRadius: 999,
            padding: 4, display: 'flex', gap: 0,
          }}>
            {[
              { key: 'urine', label: '尿検査' },
              { key: 'blood', label: '血液検査' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={tab === t.key ? 'text-text-primary' : 'text-text-placeholder'}
                style={{
                  flex: 1, padding: '8px 0',
                  borderRadius: 999, border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
                  background: tab === t.key ? '#FFFFFF' : 'transparent',
                  boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 検査結果ラベル */}
          <div style={{ padding: '0 4px', marginBottom: -8 }}>
            <span className="text-text-secondary" style={{ fontSize: 12 }}>検査結果</span>
          </div>

          {/* 検査テーブル */}
          {tab === 'urine' ? (
            <UrineTable data={urineData} prevData={prevUrineData} />
          ) : (
            <BloodTable data={bloodData} prevData={prevBloodData} />
          )}

          {/* 写真エリア（登録時のみ） */}
          {photo && (
            <>
              <div style={{ padding: '0 4px', marginBottom: -8 }}>
                <span className="text-text-secondary" style={{ fontSize: 12 }}>写真</span>
              </div>
              <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 16 }}>
                <img
                  src={photo}
                  alt="検査写真"
                  style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', display: 'block' }}
                />
              </div>
            </>
          )}

          {/* メモエリア（登録時のみ） */}
          {memo && (
            <>
              <div style={{ padding: '0 4px', marginBottom: -8 }}>
                <span className="text-text-secondary" style={{ fontSize: 12 }}>メモ</span>
              </div>
              <div className="text-text-primary" style={{
                background: '#FFFFFF', borderRadius: 12, padding: '14px 16px',
                fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
              }}>
                {memo}
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── 編集シート ── */}
      {showEditSheet && (
        <DailyHospitalSheet
          cats={cats}
          catId={record.catId}
          selectedDate={record.date}
          onClose={() => setShowEditSheet(false)}
          onSave={handleSheetSave}
          onDelete={handleSheetDelete}
          onExamOpen={null}
          initialRecord={record}
        />
      )}
    </div>
  )
}
