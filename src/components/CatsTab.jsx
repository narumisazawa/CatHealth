import { useState, useCallback } from 'react'
import CatFormModal   from './CatFormModal.jsx'
import CatDashboard   from './CatDashboard.jsx'

// ── localStorage ──────────────────────────────────────
const LS_CATS = 'cathealth_cats'
const lsPhotoKey = id => `cathealth_photo_${id}`

function loadCats() {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_CATS) || '[]')
    return arr.map(c => ({ ...c, photo: localStorage.getItem(lsPhotoKey(c.id)) || null }))
  } catch { return [] }
}

function saveCatNew(cat, photo) {
  if (photo) localStorage.setItem(lsPhotoKey(cat.id), photo)
  const prev = loadCats()
  const next = [...prev, cat]
  localStorage.setItem(LS_CATS, JSON.stringify(next.map(({ photo: _, ...rest }) => rest)))
  return next.map(c => ({ ...c, photo: localStorage.getItem(lsPhotoKey(c.id)) || null }))
}

function saveCatEdit(cat, photo) {
  if (photo) localStorage.setItem(lsPhotoKey(cat.id), photo)
  const prev = loadCats()
  const next = prev.map(c => c.id === cat.id ? cat : c)
  localStorage.setItem(LS_CATS, JSON.stringify(next.map(({ photo: _, ...rest }) => rest)))
  return next.map(c => ({ ...c, photo: localStorage.getItem(lsPhotoKey(c.id)) || null }))
}

// ── 年齢計算 ──────────────────────────────────────────
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

// ── ChevronRight ──────────────────────────────────────
function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#374151]">
      <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="currentColor"/>
    </svg>
  )
}

// ── CatAvatar ─────────────────────────────────────────
function CatAvatar({ photo, size = 48 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#E5E7EB',
      overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {photo ? (
        <img src={photo} alt="cat" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
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

// ── CatsTab ───────────────────────────────────────────
export default function CatsTab() {
  const [cats, setCats]               = useState(() => loadCats())
  const [showAddModal, setShowAddModal] = useState(false)
  const [detailCat, setDetailCat]     = useState(null)

  const handleAdd = useCallback((cat, photo) => {
    const next = saveCatNew(cat, photo)
    setCats(next)
    setShowAddModal(false)
  }, [])

  const handleSaveEdit = useCallback((cat, photo) => {
    const next = saveCatEdit(cat, photo)
    setCats(next)
    const updated = next.find(c => c.id === cat.id)
    if (updated) setDetailCat(updated)
  }, [])

  // 猫ダッシュボード
  if (detailCat) {
    return (
      <CatDashboard
        cat={detailCat}
        cats={cats}
        onBack={() => setDetailCat(null)}
        onSaveCat={handleSaveEdit}
      />
    )
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#F7F7F7', overflow: 'hidden' }}>

      {/* ── ヘッダー ── */}
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 52, flexShrink: 0,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Cats</span>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            position: 'absolute', right: 16,
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#EA5EAD', fontSize: 13, fontWeight: 600, padding: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EA5EAD" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          猫を追加
        </button>
      </div>

      {/* ── スクロールエリア ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>
        {cats.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60, fontSize: 14, color: '#9CA3AF' }}>
            猫が登録されていません
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cats.map((cat) => {
              const age = calcAge(cat.birthday)
              return (
                <div key={cat.id} style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden' }}>
                  <button
                    onClick={() => setDetailCat(cat)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      width: '100%', padding: '12px 16px', gap: 12,
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <CatAvatar photo={cat.photo} size={48} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>
                        {cat.name}
                      </div>
                      {age && (
                        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                          {age.years}歳 {age.months}ヶ月
                        </div>
                      )}
                    </div>
                    <ChevronRight />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 猫追加モーダル */}
      {showAddModal && (
        <CatFormModal
          onSave={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
