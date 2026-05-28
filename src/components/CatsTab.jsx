import { useState, useCallback } from 'react'
import CatDashboard from './CatDashboard.jsx'
import CatProfileEditScreen from '../screens/CatProfileEditScreen.jsx'
import CatCard from './CatCard.jsx'

// ── localStorage ──────────────────────────────────────
const LS_CATS = 'cathealth_cats'
const lsPhotoKey = id => `cathealth_photo_${id}`

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

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

// ── CatsTab ───────────────────────────────────────────
export default function CatsTab() {
  const [cats, setCats]         = useState(() => loadCats())
  const [detailCat, setDetailCat] = useState(null)
  const [newCatDraft, setNewCatDraft] = useState(null)

  function handleShowAddScreen() {
    setNewCatDraft({
      id: genId(),
      name: '', birthday: '', sex: '', neutered: '',
      microchip: '', aipo: '', diseases: [], photo: null,
    })
  }

  const handleAdd = useCallback((cat, photo) => {
    const next = saveCatNew(cat, photo)
    setCats(next)
    setNewCatDraft(null)
  }, [])

  const handleSaveEdit = useCallback((cat, photo) => {
    const next = saveCatEdit(cat, photo)
    setCats(next)
    const updated = next.find(c => c.id === cat.id)
    if (updated) setDetailCat(updated)
  }, [])

  // 新規追加画面
  if (newCatDraft) {
    return (
      <CatProfileEditScreen
        cat={newCatDraft}
        isNew
        onBack={() => { setCats(loadCats()); setNewCatDraft(null) }}
        onSave={handleAdd}
      />
    )
  }

  // ダッシュボード
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
    <div className="flex flex-col h-dvh bg-[#F7F7F7] overflow-hidden">

      {/* ── ヘッダー ── */}
      <header className="relative flex items-center justify-center h-[60px] px-4 bg-white border-b border-black/10 flex-shrink-0">
        <span className="text-base font-semibold text-text-primary">猫</span>
        <button
          onClick={handleShowAddScreen}
          className="absolute right-4 flex items-center gap-1 bg-transparent border-0 cursor-pointer text-sm font-semibold text-primary p-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          猫を追加
        </button>
      </header>

      {/* ── スクロールエリア ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        {cats.length === 0 ? (
          <div className="flex items-center justify-center px-8 py-20">
            <p className="text-sm font-normal text-text-placeholder text-center leading-relaxed">
              猫が登録されていません
            </p>
          </div>
        ) : (
          <div className="px-4 pt-4 space-y-2">
            {cats.map(cat => (
              <CatCard
                key={cat.id}
                cat={cat}
                onClick={() => setDetailCat(cat)}
                className="bg-white rounded-xl"
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
