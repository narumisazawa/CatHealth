import { useState, useMemo } from 'react'
import editSvg from '../assets/icons/edit.svg'
import CatFormModal from '../components/CatFormModal.jsx'
import CatDetailScreen from './CatDetailScreen.jsx'
import DailyFoodSheet from '../components/DailyFoodSheet.jsx'
import DailyPoopSheet from '../components/DailyPoopSheet.jsx'
import DailyPeeSheet from '../components/DailyPeeSheet.jsx'
import DailyVomitSheet from '../components/DailyVomitSheet.jsx'
import DailyWeightSheet from '../components/DailyWeightSheet.jsx'
import DailyHospitalSheet from '../components/DailyHospitalSheet.jsx'
import DailyExamSheet from '../components/DailyExamSheet.jsx'

// ── Primary color ──────────────────────────────────
const PRIMARY = '#EA5EAD'

// ── localStorage ──────────────────────────────────
const LS_CATS        = 'cathealth_cats'
const LS_FOODS       = 'cathealth_foods'
const LS_DAILY_FOODS = 'cathealth_daily_foods'
const LS_POOP        = 'cathealth_poop_records'
const LS_PEE         = 'cathealth_daily_pee'
const LS_VOMIT       = 'cathealth_daily_vomit'
const LS_WEIGHT      = 'cathealth_daily_weight'
const LS_HOSPITAL_V  = 'cathealth_daily_hospital'
const LS_HOSPITALS   = 'cathealth_hospitals'
const lsPhotoKey = id => `cathealth_photo_${id}`

// 状態 → ドット色
const CONDITION_COLOR = {
  '良好': '#22C55E',
  '軟便': '#F59E0B',
  '下痢': '#F97316',
  '便秘': '#9333EA',
  '血便': '#EF4444',
}

function loadCats() {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_CATS) || '[]')
    return arr.map(c => ({ ...c, photo: localStorage.getItem(lsPhotoKey(c.id)) || null }))
  } catch { return [] }
}

function loadFoods() {
  try { return JSON.parse(localStorage.getItem(LS_FOODS) || '[]') } catch { return [] }
}

function loadDailySchedules() {
  try { return JSON.parse(localStorage.getItem(LS_DAILY_FOODS) || '[]') } catch { return [] }
}

// 指定猫・日付のアクティブなフードスケジュールを返す
function getActiveSchedules(catId, date) {
  return loadDailySchedules().filter(s => {
    if (s.catId !== catId) return false
    if (s.startDate > date) return false
    if (s.repeat === 'today') return s.startDate === date
    if (s.stoppedDate && s.stoppedDate <= date) return false
    return true
  })
}

function getPoopRecords(catId, date) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_POOP) || '[]')
    return all.filter(r => r.catId === catId && r.date === date)
  } catch { return [] }
}

function getPeeRecords(catId, date) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_PEE) || '[]')
    return all.filter(r => r.catId === catId && r.date === date)
  } catch { return [] }
}

function getVomitRecords(catId, date) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_VOMIT) || '[]')
    return all.filter(r => r.catId === catId && r.date === date)
  } catch { return [] }
}

function getWeightRecords(catId, date) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_WEIGHT) || '[]')
    return all.filter(r => r.catId === catId && r.date === date)
  } catch { return [] }
}

function getHospitalRecords(catId, date) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_HOSPITAL_V) || '[]')
    return all.filter(r => r.catId === catId && r.date === date)
  } catch { return [] }
}

function getLatestHospitalRecord(catId) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_HOSPITAL_V) || '[]')
    const mine = all.filter(r => r.catId === catId)
    if (!mine.length) return null
    return mine.reduce((a, b) => (a.date > b.date ? a : b))
  } catch { return null }
}

function loadHospitalsForDisplay() {
  try { return JSON.parse(localStorage.getItem(LS_HOSPITALS) || '[]') } catch { return [] }
}

// 最新の体重記録（日付問わず）
function getLatestWeightRecord(catId) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_WEIGHT) || '[]')
    const mine = all.filter(r => r.catId === catId)
    if (!mine.length) return null
    return mine.reduce((a, b) => (a.date > b.date || (a.date === b.date && a.time >= b.time) ? a : b))
  } catch { return null }
}

function saveCat(cat, photo) {
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

// ── 年齢計算 ──────────────────────────────────────
function calcAge(birthday) {
  if (!birthday) return null
  const [y, m, d] = birthday.replace(/\//g, '-').split('-').map(Number)
  if (!y || !m || !d) return null
  const now = new Date()
  let years = now.getFullYear() - y
  let months = now.getMonth() + 1 - m
  if (months < 0) { years--; months += 12 }
  if (now.getDate() < d) { months--; if (months < 0) { years--; months += 12 } }
  if (years < 0) return null
  return { years, months }
}

// ── セクションアイコン ──────────────────────────────
function FoodIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 4C14.2972 4 16.4215 4.34755 18.0078 4.94238C18.7973 5.23843 19.5062 5.61502 20.0352 6.08398C20.527 6.52015 20.9394 7.11055 20.9932 7.83887L22.9619 14.7666L23 14.9004V15.04C23 15.8285 22.4919 16.5073 21.9736 16.999C21.4138 17.5301 20.6423 18.0345 19.7285 18.4697C17.8948 19.3431 15.3605 20 12.4541 20C9.55185 19.9999 6.80672 19.3443 4.76855 18.4883C3.75243 18.0615 2.87446 17.5699 2.23145 17.0547C1.91046 16.7975 1.62045 16.5122 1.40332 16.2021C1.19108 15.899 1.00001 15.5013 1 15.04V14.8906L1.04395 14.748L3.01855 8.28906C3.00598 8.19514 3 8.09872 3 8C3 7.19722 3.43717 6.5519 3.96484 6.08398C4.49379 5.61502 5.20273 5.23843 5.99219 4.94238C7.57848 4.34755 9.70276 4 12 4ZM19.6006 10.2539C19.1422 10.5699 18.5976 10.8364 18.0078 11.0576C16.4215 11.6525 14.2972 12 12 12C9.70276 12 7.57848 11.6525 5.99219 11.0576C5.44057 10.8508 4.92929 10.603 4.49023 10.3135L3.04102 15.0527L3.04199 15.0547C3.11613 15.1606 3.25477 15.3108 3.48242 15.4932C3.93649 15.857 4.63635 16.2637 5.54297 16.6445C7.35116 17.4039 9.83383 17.9999 12.4541 18C15.0705 18 17.3099 17.4062 18.8682 16.6641C19.6501 16.2917 20.2297 15.8968 20.5967 15.5488C20.8392 15.3187 20.9342 15.1602 20.9727 15.083L19.6006 10.2539ZM12 6C9.87903 6 8.00346 6.32451 6.69434 6.81543C6.03626 7.06222 5.5727 7.33126 5.29199 7.58008C5.01013 7.82998 5 7.97447 5 8C5 8.02553 5.01013 8.17002 5.29199 8.41992C5.5727 8.66874 6.03626 8.93778 6.69434 9.18457C8.00346 9.67549 9.87903 10 12 10C14.121 10 15.9965 9.67549 17.3057 9.18457C17.9637 8.93778 18.4273 8.66874 18.708 8.41992C18.9899 8.17002 19 8.02553 19 8C19 7.97447 18.9899 7.82998 18.708 7.58008C18.4273 7.33126 17.9637 7.06222 17.3057 6.81543C15.9965 6.32451 14.121 6 12 6Z" fill="#374151"/>
    </svg>
  )
}

function PillIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <mask id="pill-icon-mask" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#pill-icon-mask)">
        <path d="M8.625 21C7.05833 21 5.72917 20.4542 4.6375 19.3625C3.54583 18.2708 3 16.9417 3 15.375C3 14.625 3.14167 13.9083 3.425 13.225C3.70833 12.5417 4.11667 11.9333 4.65 11.4L11.4 4.65C11.9333 4.11667 12.5417 3.70833 13.225 3.425C13.9083 3.14167 14.625 3 15.375 3C16.9417 3 18.2708 3.54583 19.3625 4.6375C20.4542 5.72917 21 7.05833 21 8.625C21 9.375 20.8583 10.0917 20.575 10.775C20.2917 11.4583 19.8833 12.0667 19.35 12.6L12.6 19.35C12.0667 19.8833 11.4583 20.2917 10.775 20.575C10.0917 20.8583 9.375 21 8.625 21ZM15.275 13.85L17.95 11.2C18.2833 10.8667 18.5417 10.475 18.725 10.025C18.9083 9.575 19 9.10833 19 8.625C19 7.625 18.6458 6.77083 17.9375 6.0625C17.2292 5.35417 16.375 5 15.375 5C14.8917 5 14.425 5.09167 13.975 5.275C13.525 5.45833 13.1333 5.71667 12.8 6.05L10.15 8.725L15.275 13.85ZM8.625 19C9.10833 19 9.575 18.9083 10.025 18.725C10.475 18.5417 10.8667 18.2833 11.2 17.95L13.85 15.275L8.725 10.15L6.05 12.8C5.71667 13.1333 5.45833 13.525 5.275 13.975C5.09167 14.425 5 14.8917 5 15.375C5 16.375 5.35417 17.2292 6.0625 17.9375C6.77083 18.6458 7.625 19 8.625 19Z" fill="#374151"/>
      </g>
    </svg>
  )
}

function PoopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <mask id="poop-icon-mask" fill="white">
        <path d="M16 5C16.7501 5.50189 18.9794 7.37754 19.3877 8.0332C19.796 8.6889 20 9.37631 20 10.0947C20 10.5479 19.9274 10.9798 19.7861 11.3916C20.8088 11.9683 21.5999 12.6325 22.1582 13.3848C22.7195 14.1412 22.9999 14.934 23 15.7627C23 17.4994 21.9286 18.9731 19.7861 20.1836C17.6434 21.3941 15.0479 21 12 21C8.95208 21 6.35658 21.3941 4.21387 20.1836C2.07134 18.9731 1 17.4995 1 15.7627C1.00006 14.9339 1.2805 14.1412 1.8418 13.3848C2.39994 12.6327 3.19049 11.9682 4.21289 11.3916C4.07168 10.9798 4.00002 10.5478 4 10.0947C4 9.37631 4.20397 8.6889 4.6123 8.0332C5.02074 7.3775 7.00006 6.37674 8.5 5.5C9.99465 4.62636 11.4893 2.0186 11.5 2L16 5Z"/>
      </mask>
      <path d="M16 5L17.1122 3.33774L17.1094 3.3359L16 5ZM19.3877 8.0332L21.0854 6.97596L21.0854 6.97596L19.3877 8.0332ZM20 10.0947L22 10.0948V10.0947H20ZM19.7861 11.3916L17.8943 10.7427L17.3545 12.3165L18.8038 13.1337L19.7861 11.3916ZM22.1582 13.3848L23.7643 12.193L23.7643 12.1929L22.1582 13.3848ZM23 15.7627H25V15.7625L23 15.7627ZM19.7861 20.1836L20.7699 21.9249L20.77 21.9249L19.7861 20.1836ZM12 21L12 19H12V21ZM4.21387 20.1836L3.23006 21.9249L3.2301 21.9249L4.21387 20.1836ZM1 15.7627L-1 15.7625V15.7627H1ZM1.8418 13.3848L0.235728 12.1929L0.235674 12.193L1.8418 13.3848ZM4.21289 11.3916L5.19531 13.1337L6.64441 12.3165L6.10473 10.7428L4.21289 11.3916ZM4 10.0947H2V10.0948L4 10.0947ZM4.6123 8.0332L2.9147 6.97578L2.91459 6.97596L4.6123 8.0332ZM8.5 5.5L9.50926 7.22667L9.50926 7.22667L8.5 5.5ZM11.5 2L12.6094 0.335899L10.828 -0.851688L9.76431 1.00633L11.5 2ZM16 5L14.8878 6.66226C15.153 6.83966 15.8199 7.36532 16.5059 7.96488C16.8378 8.25494 17.1447 8.53669 17.3831 8.77317C17.6663 9.05406 17.7255 9.14752 17.69 9.09045L19.3877 8.0332L21.0854 6.97596C20.8457 6.59105 20.4732 6.20419 20.2001 5.9333C19.8822 5.61801 19.5084 5.27654 19.1381 4.95299C18.4199 4.32534 17.5971 3.66223 17.1122 3.33774L16 5ZM19.3877 8.0332L17.69 9.09044C17.9159 9.45325 18 9.77773 18 10.0947H20H22C22 8.97488 21.6761 7.92456 21.0854 6.97596L19.3877 8.0332ZM20 10.0947L18 10.0947C18 10.3299 17.9631 10.5423 17.8943 10.7427L19.7861 11.3916L21.6779 12.0405C21.8917 11.4172 22 10.766 22 10.0948L20 10.0947ZM19.7861 11.3916L18.8038 13.1337C19.643 13.6069 20.198 14.0994 20.5521 14.5766L22.1582 13.3848L23.7643 12.1929C23.0019 11.1656 21.9747 10.3296 20.7684 9.64946L19.7861 11.3916ZM22.1582 13.3848L20.5521 14.5765C20.8938 15.0371 21 15.4203 21 15.7629L23 15.7627L25 15.7625C24.9999 14.4476 24.5451 13.2453 23.7643 12.193L22.1582 13.3848ZM23 15.7627H21C21 16.4955 20.6093 17.4213 18.8023 18.4423L19.7861 20.1836L20.77 21.9249C23.2478 20.5249 25 18.5033 25 15.7627H23ZM19.7861 20.1836L18.8024 18.4423C18.1256 18.8246 17.3036 19.0005 16.1512 19.0474C14.8649 19.0997 13.7573 19 12 19L12 21L12 23C13.2906 23 15.0047 23.0973 16.3138 23.0441C17.7569 22.9854 19.304 22.7531 20.7699 21.9249L19.7861 20.1836ZM12 21V19C10.2427 19 9.13513 19.0997 7.84877 19.0474C6.69644 19.0005 5.87444 18.8246 5.19763 18.4423L4.21387 20.1836L3.2301 21.9249C4.696 22.7531 6.24311 22.9854 7.6862 23.0441C8.99524 23.0973 10.7094 23 12 23V21ZM4.21387 20.1836L5.19768 18.4423C3.3906 17.4213 3 16.4956 3 15.7627H1H-1C-1 18.5033 0.752089 20.5249 3.23006 21.9249L4.21387 20.1836ZM1 15.7627L3 15.7629C3.00003 15.4202 3.1062 15.0371 3.44792 14.5766L1.8418 13.3848L0.235674 12.193C-0.545194 13.2453 -0.999897 14.4476 -1 15.7625L1 15.7627ZM1.8418 13.3848L3.44787 14.5766C3.80231 14.099 4.35706 13.6064 5.19531 13.1337L4.21289 11.3916L3.23047 9.64952C2.02392 10.3299 0.997573 11.1663 0.235728 12.1929L1.8418 13.3848ZM4.21289 11.3916L6.10473 10.7428C6.03694 10.5451 6.00001 10.3327 6 10.0947L4 10.0947L2 10.0948C2.00003 10.763 2.10643 11.4146 2.32105 12.0404L4.21289 11.3916ZM4 10.0947H6C6 9.77773 6.08409 9.45325 6.31002 9.09044L4.6123 8.0332L2.91459 6.97596C2.32386 7.92456 2 8.97488 2 10.0947H4ZM4.6123 8.0332L6.30991 9.09063C6.20311 9.26207 6.14405 9.26179 6.38076 9.08434C6.56775 8.94416 6.83394 8.77041 7.17878 8.5627C7.93695 8.10602 8.63412 7.7382 9.50926 7.22667L8.5 5.5L7.49074 3.77333C6.86594 4.13853 5.82348 4.70947 5.11489 5.13628C4.72635 5.37031 4.32738 5.6245 3.98151 5.88378C3.68535 6.10579 3.22571 6.47648 2.9147 6.97578L4.6123 8.0332ZM8.5 5.5L9.50926 7.22667C10.6384 6.56666 11.5904 5.39881 12.1673 4.61478C12.7927 3.76496 13.2117 3.03554 13.2357 2.99367L11.5 2L9.76431 1.00633C9.77763 0.983066 9.44396 1.56682 8.94566 2.24394C8.39896 2.98685 7.85622 3.5597 7.49074 3.77333L8.5 5.5ZM11.5 2L10.3906 3.6641L14.8906 6.6641L16 5L17.1094 3.3359L12.6094 0.335899L11.5 2Z" fill="#374151" mask="url(#poop-icon-mask)"/>
    </svg>
  )
}

function PeeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <mask id="pee-icon-mask" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#pee-icon-mask)">
        <path d="M12 21.5C9.78333 21.5 7.89583 20.7333 6.3375 19.2C4.77917 17.6667 4 15.8 4 13.6C4 12.55 4.20417 11.5458 4.6125 10.5875C5.02083 9.62917 5.6 8.78333 6.35 8.05L12 2.5L17.65 8.05C18.4 8.78333 18.9792 9.62917 19.3875 10.5875C19.7958 11.5458 20 12.55 20 13.6C20 15.8 19.2208 17.6667 17.6625 19.2C16.1042 20.7333 14.2167 21.5 12 21.5ZM16.25 17.7875C17.4167 16.6458 18 15.25 18 13.6C18 12.8167 17.85 12.0708 17.55 11.3625C17.25 10.6542 16.8167 10.0333 16.25 9.5L12 5.3L7.75 9.5C7.18333 10.0333 6.75 10.6542 6.45 11.3625C6.15 12.0708 6 12.8167 6 13.6C6 15.25 6.58333 16.6458 7.75 17.7875C8.91667 18.9292 10.3333 19.5 12 19.5C13.6667 19.5 15.0833 18.9292 16.25 17.7875Z" fill="#374151"/>
      </g>
    </svg>
  )
}

function VomitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M14.9551 6L14.9551 5H14.9551V6ZM22.6953 8.20312H23.6953V8.20312L22.6953 8.20312ZM21.0234 10.1709L20.6064 9.26202L19.1824 9.91545L20.3747 10.9319L21.0234 10.1709ZM22 13.0723L23 13.0723V13.0723H22ZM12.4131 17.8838L12.4131 16.8838H12.3733L12.3337 16.8869L12.4131 17.8838ZM1 14.2354L0 14.2351V14.2354H1ZM9.12695 9.37109L9.29784 10.3564L10.6095 10.1289L10.0256 8.93251L9.12695 9.37109ZM9 8.83301H8V8.83334L9 8.83301ZM14.9551 6L14.9551 7C17.1936 7.00001 19.0237 7.08179 20.277 7.3683C20.906 7.51209 21.2891 7.68652 21.4973 7.84955C21.6626 7.97901 21.6953 8.07531 21.6953 8.20313L22.6953 8.20312L23.6953 8.20312C23.6953 7.38677 23.3187 6.73561 22.7305 6.27495C22.1851 5.84787 21.4705 5.58954 20.7227 5.41859C19.2223 5.07562 17.1823 5.00001 14.9551 5L14.9551 6ZM22.6953 8.20312H21.6953C21.6953 8.44276 21.5183 8.84357 20.6064 9.26202L21.0234 10.1709L21.4405 11.0798C22.5639 10.5643 23.6953 9.65479 23.6953 8.20312H22.6953ZM21.0234 10.1709L20.3747 10.9319C20.7559 11.2569 21 11.7978 21 13.0723H22H23C23 11.6109 22.7326 10.3139 21.6722 9.4099L21.0234 10.1709ZM22 13.0723L21 13.0723C21 14.2628 20.2692 15.1884 18.6994 15.8696C17.1124 16.5583 14.8717 16.8838 12.4131 16.8838L12.4131 17.8838L12.4131 18.8838C14.997 18.8838 17.5497 18.5487 19.4956 17.7043C21.4586 16.8524 23 15.3721 23 13.0723L22 13.0723ZM12.4131 17.8838L12.3337 16.8869C8.75102 17.1723 6.05061 16.8972 4.291 16.2954C2.48773 15.6787 2 14.8659 2 14.2354H1H0C0 16.1751 1.56664 17.4774 3.64382 18.1878C5.76467 18.9131 8.7708 19.177 12.4925 18.8806L12.4131 17.8838ZM1 14.2354L2 14.2356C2.00009 13.8046 2.41932 13.0522 3.8066 12.2202C5.11575 11.435 7.02276 10.751 9.29784 10.3564L9.12695 9.37109L8.95607 8.3858C6.50748 8.81048 4.35123 9.56142 2.77792 10.505C1.28275 11.4017 0.000330806 12.6719 0 14.2351L1 14.2354ZM9.12695 9.37109L10.0256 8.93251C10.0051 8.89049 10 8.85967 10 8.83268L9 8.83301L8 8.83334C8.00011 9.17634 8.08001 9.5059 8.22826 9.80968L9.12695 9.37109ZM9 8.83301H10C10 8.5547 10.1261 8.14971 10.8008 7.76219C11.5171 7.35083 12.8065 7 14.9551 7V6V5C12.6377 5 10.9496 5.37038 9.80476 6.02788C8.61844 6.70922 8 7.72073 8 8.83301H9Z" fill="#374151"/>
    </svg>
  )
}

function WeightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21.0005 3C22.1049 3.00024 23.0005 3.89558 23.0005 5V19C23.0005 20.0355 22.2131 20.8868 21.2046 20.9893L21.0005 21H3.00049L2.79639 20.9893C1.85485 20.8938 1.10671 20.1456 1.01123 19.2041L1.00049 19V5C1.00049 3.89543 1.89592 3 3.00049 3H21.0005ZM3.00049 19H21.0005V5H3.00049V19ZM15.5005 6.25C16.1906 6.25026 16.7505 6.80981 16.7505 7.5V10.5C16.7505 11.1902 16.1906 11.7497 15.5005 11.75H8.50049C7.81013 11.75 7.25049 11.1904 7.25049 10.5V7.5C7.25049 6.80964 7.81013 6.25 8.50049 6.25H15.5005ZM8.75049 10.25H15.2505V7.75H8.75049V10.25Z" fill="#374151"/>
    </svg>
  )
}

function HospitalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <mask id="hospital-icon-mask" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#hospital-icon-mask)">
        <path fillRule="evenodd" clipRule="evenodd" d="M10.9404 2.89366C11.5888 2.48857 12.4112 2.48857 13.0596 2.89366L20.0596 7.26866C20.6442 7.63404 20.9998 8.27457 21 8.96397V19.4103C20.9999 20.5147 20.1045 21.4103 19 21.4103H5C3.89549 21.4103 3.0001 20.5147 3 19.4103V8.96397C3.00017 8.27457 3.35579 7.63404 3.94043 7.26866L10.9404 2.89366ZM5 8.96397V19.4103H19V8.96397L12 4.58995L5 8.96397ZM13 11.9103H15.5V13.9103H13V16.4103H11V13.9103H8.5V11.9103H11V9.41026H13V11.9103Z" fill="#374151"/>
      </g>
    </svg>
  )
}

// ── CatTabs ──────────────────────────────────────────
function CatTabs({ cats, selectedId, onSelect }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      {cats.map(cat => {
        const isSelected = cat.id === selectedId
        const initials = cat.name?.[0] ?? '?'
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              height: 42,
              background: isSelected ? PRIMARY : '#FFFFFF',
              border: isSelected ? `2px solid ${PRIMARY}` : 'none',
              borderRadius: 21,
              paddingLeft: 6,
              paddingRight: 12,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {/* アバター */}
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: cat.photo ? 'transparent' : (isSelected ? 'rgba(255,255,255,0.3)' : '#D1D5DB'),
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: '#FFFFFF',
            }}>
              {cat.photo
                ? <img src={cat.photo} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>
            {/* 名前 */}
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: isSelected ? '#FFFFFF' : PRIMARY,
              whiteSpace: 'nowrap',
            }}>
              {cat.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── CatProfileCard ────────────────────────────────────
function CatProfileCard({ cat, onClick }) {
  const age = calcAge(cat.birthday)
  const initials = cat.name?.[0] ?? '?'
  return (
    <div
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        padding: '18px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 80,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* アバター */}
      <div style={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: cat.photo ? 'transparent' : '#D1D5DB',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 700,
        color: '#FFFFFF',
      }}>
        {cat.photo
          ? <img src={cat.photo} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials
        }
      </div>
      {/* 名前・年齢 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{cat.name}</div>
        {age && (
          <div style={{ fontSize: 12, color: '#111827' }}>
            <span style={{ fontSize: 14 }}>{age.years}</span>歳
            <span style={{ fontSize: 14 }}> {age.months}</span>ヶ月
          </div>
        )}
      </div>
      {/* 右矢印 */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="#9CA3AF"/>
      </svg>
    </div>
  )
}

// ── PlusButton ────────────────────────────────────────
function PlusButton({ onPlus }) {
  return (
    <button
      onClick={onPlus}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  )
}

// ── SectionCard（単独の白カード）────────────────────────
function SectionCard({ icon, label, onPlus }) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, color: '#0F172A' }}>{label}</span>
      <PlusButton onPlus={onPlus} />
    </div>
  )
}

// ── FoodSection ───────────────────────────────────────
// ── EditIcon ──────────────────────────────────────────
function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="#9CA3AF"/>
    </svg>
  )
}

// ── PoopSection ───────────────────────────────────────
function PoopSection({ catId, selectedDate, onAdd, onEdit }) {
  const records = useMemo(
    () => getPoopRecords(catId, selectedDate),
    [catId, selectedDate] // eslint-disable-line
  )

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
      {/* ヘッダー行 */}
      <div style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ display: 'flex', flexShrink: 0 }}><PoopIcon /></span>
        <span style={{ flex: 1, fontSize: 14, color: '#0F172A' }}>うんち</span>
        <PlusButton onPlus={onAdd} />
      </div>

      {/* 記録行 */}
      {records.map(r => {
        return (
          <div key={r.id}>
            <div style={{ height: 1, background: '#F0F0F0' }} />
            <div style={{
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {/* 状態テキスト */}
              <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>
                {r.condition}
              </span>
              {/* 写真サムネイル（写真がある時のみ表示） */}
              {r.photo && (
                <div style={{
                  width: 36, height: 36, borderRadius: 6,
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  <img src={r.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              {/* 編集アイコン */}
              <button
                onClick={() => onEdit(r)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <EditIcon />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FoodSection({ catId, selectedDate, onAdd, onEdit }) {
  const schedules = useMemo(
    () => getActiveSchedules(catId, selectedDate),
    [catId, selectedDate] // eslint-disable-line
  )
  const allFoods = useMemo(loadFoods, [])

  function getFoodLabel(schedule) {
    const food = allFoods.find(f => f.id === schedule.foodId)
    const name = food?.name || ''
    const amountStr = schedule.amount ? `${schedule.amount} g` : ''
    if (!name) return amountStr
    return amountStr ? `${name}　${amountStr}` : name
  }

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
      {/* ヘッダー行 */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ display: 'flex', flexShrink: 0 }}><FoodIcon /></span>
        <span style={{ flex: 1, fontSize: 14, color: '#0F172A' }}>フード</span>
        <PlusButton onPlus={onAdd} />
      </div>

      {/* スケジュール行 */}
      {schedules.map((s, i) => (
        <div key={s.id}>
          <div style={{ height: 1, background: '#F0F0F0' }} />
          <div
            onClick={() => onEdit(s)}
            style={{
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              gap: 8,
            }}
          >
            <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>
              {getFoodLabel(s)}
            </span>
            <EditIcon />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── PeeSection ────────────────────────────────────────
function PeeSection({ catId, selectedDate, onAdd, onEdit }) {
  const records = useMemo(
    () => getPeeRecords(catId, selectedDate),
    [catId, selectedDate] // eslint-disable-line
  )

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ display: 'flex', flexShrink: 0 }}><PeeIcon /></span>
        <span style={{ flex: 1, fontSize: 14, color: '#0F172A' }}>おしっこ</span>
        <PlusButton onPlus={onAdd} />
      </div>
      {records.map(r => (
        <div key={r.id}>
          <div style={{ height: 1, background: '#F0F0F0' }} />
          <div style={{
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{r.condition}</span>
            {r.photo && (
              <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                <img src={r.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <button
              onClick={() => onEdit(r)}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', padding: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <EditIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── VomitSection ──────────────────────────────────────
function VomitSection({ catId, selectedDate, onAdd, onEdit }) {
  const records = useMemo(
    () => getVomitRecords(catId, selectedDate),
    [catId, selectedDate] // eslint-disable-line
  )

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ display: 'flex', flexShrink: 0 }}><VomitIcon /></span>
        <span style={{ flex: 1, fontSize: 14, color: '#0F172A' }}>ゲロ</span>
        <PlusButton onPlus={onAdd} />
      </div>
      {records.map(r => (
        <div key={r.id}>
          <div style={{ height: 1, background: '#F0F0F0' }} />
          <div style={{
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{r.condition}</span>
            {r.photo && (
              <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                <img src={r.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <button
              onClick={() => onEdit(r)}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', padding: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <EditIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── WeightSection ─────────────────────────────────────
function WeightSection({ catId, selectedDate, onAdd, onEdit }) {
  const records = useMemo(
    () => getWeightRecords(catId, selectedDate),
    [catId, selectedDate] // eslint-disable-line
  )
  const latest = useMemo(
    () => getLatestWeightRecord(catId),
    [catId] // eslint-disable-line
  )

  // 「前回」表示：選択日以外の最新レコード
  const prevRecord = useMemo(() => {
    try {
      const all = JSON.parse(localStorage.getItem(LS_WEIGHT) || '[]')
      const others = all.filter(r => r.catId === catId && r.date !== selectedDate)
      if (!others.length) return null
      return others.reduce((a, b) => (a.date > b.date || (a.date === b.date && a.time >= b.time) ? a : b))
    } catch { return null }
  }, [catId, selectedDate]) // eslint-disable-line

  const prevDate  = prevRecord ? prevRecord.date.replace(/-/g, '/') : 'yyyy/mm/dd'
  const prevValue = prevRecord ? prevRecord.weight : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
        {/* ヘッダー行 */}
        <div style={{
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ display: 'flex', flexShrink: 0 }}><WeightIcon /></span>
          <span style={{ flex: 1, fontSize: 14, color: '#0F172A' }}>体重</span>
          <PlusButton onPlus={onAdd} />
        </div>

        {/* 今日の記録行 */}
        {records.map(r => (
          <div key={r.id}>
            <div style={{ height: 1, background: '#F0F0F0' }} />
            <div style={{
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{r.weight} kg</span>
              {r.photo && (
                <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={r.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <button
                onClick={() => onEdit(r)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <EditIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 前回表示 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
        height: 20,
        padding: '0 16px',
      }}>
        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>前回</span>
        <span style={{ fontSize: 12, color: '#111827' }}>{prevDate}</span>
        <span style={{ fontSize: 12, color: '#111827' }}>
          {prevValue != null ? `${prevValue} kg` : '-- kg'}
        </span>
      </div>
    </div>
  )
}

// ── HospitalSection ───────────────────────────────────────
function HospitalSection({ catId, selectedDate, onAdd, onEdit }) {
  const records = useMemo(
    () => getHospitalRecords(catId, selectedDate),
    [catId, selectedDate] // eslint-disable-line
  )
  const prevRecord = useMemo(
    () => {
      try {
        const all = JSON.parse(localStorage.getItem(LS_HOSPITAL_V) || '[]')
        const others = all.filter(r => r.catId === catId && r.date !== selectedDate)
        if (!others.length) return null
        return others.reduce((a, b) => (a.date > b.date ? a : b))
      } catch { return null }
    },
    [catId, selectedDate] // eslint-disable-line
  )
  const hospitals = useMemo(loadHospitalsForDisplay, [])

  function getHospitalName(hospitalId) {
    if (!hospitalId) return ''
    return hospitals.find(h => h.id === hospitalId)?.name ?? ''
  }

  const prevDate = prevRecord ? prevRecord.date.replace(/-/g, '/') : 'yyyy/mm/dd'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
        {/* ヘッダー行 */}
        <div style={{
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ display: 'flex', flexShrink: 0 }}><HospitalIcon /></span>
          <span style={{ flex: 1, fontSize: 14, color: '#0F172A' }}>動物病院</span>
          <PlusButton onPlus={onAdd} />
        </div>

        {/* 記録行 */}
        {records.map(r => {
          const name = getHospitalName(r.hospitalId)
          return (
            <div key={r.id}>
              <div style={{ height: 1, background: '#F0F0F0' }} />
              <div style={{
                padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>
                  {name || '—'}
                </span>
                <button
                  onClick={() => onEdit(r)}
                  style={{
                    background: 'none', border: 'none',
                    cursor: 'pointer', padding: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img src={editSvg} width={18} height={18} alt="edit" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 前回表示 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
        height: 20,
        padding: '0 16px',
      }}>
        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>前回</span>
        <span style={{ fontSize: 12, color: '#111827' }}>{prevDate}</span>
        {prevRecord && getHospitalName(prevRecord.hospitalId) && (
          <span style={{ fontSize: 12, color: '#111827' }}>{getHospitalName(prevRecord.hospitalId)}</span>
        )}
        {prevRecord && prevRecord.contents?.length > 0 && (
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>{prevRecord.contents.join('、')}</span>
        )}
      </div>
    </div>
  )
}

// ── SectionsArea ──────────────────────────────────────
function SectionsArea({
  catId, selectedDate,
  onFoodAdd,     onFoodEdit,
  onPoopAdd,     onPoopEdit,
  onPeeAdd,      onPeeEdit,
  onVomitAdd,    onVomitEdit,
  onWeightAdd,   onWeightEdit,
  onHospitalAdd, onHospitalEdit,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FoodSection     catId={catId} selectedDate={selectedDate} onAdd={onFoodAdd}     onEdit={onFoodEdit} />
      <SectionCard     icon={<PillIcon />} label="くすりやサプリ" />
      <PoopSection     catId={catId} selectedDate={selectedDate} onAdd={onPoopAdd}     onEdit={onPoopEdit} />
      <PeeSection      catId={catId} selectedDate={selectedDate} onAdd={onPeeAdd}      onEdit={onPeeEdit} />
      <VomitSection    catId={catId} selectedDate={selectedDate} onAdd={onVomitAdd}    onEdit={onVomitEdit} />
      <WeightSection   catId={catId} selectedDate={selectedDate} onAdd={onWeightAdd}   onEdit={onWeightEdit} />
      <HospitalSection catId={catId} selectedDate={selectedDate} onAdd={onHospitalAdd} onEdit={onHospitalEdit} />
    </div>
  )
}

// ── 日付ユーティリティ ──────────────────────────────────
function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

const DOW_JA = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function buildWeek(centerDate) {
  const days = []
  for (let i = -3; i <= 3; i++) {
    const dateStr = addDays(centerDate, i)
    const dt = new Date(dateStr + 'T00:00:00')
    days.push({
      dateStr,
      dow: DOW_JA[dt.getDay()],
      day: dt.getDate(),
      isSun: dt.getDay() === 0,
      isSat: dt.getDay() === 6,
    })
  }
  return days
}

// ── WeekStrip ──────────────────────────────────────
function WeekStrip({ selected, onChange }) {
  const today = todayStr()
  const [weekAnchor, setWeekAnchor] = useState(today)
  const week = useMemo(() => buildWeek(weekAnchor), [weekAnchor])

  function prev() { setWeekAnchor(d => addDays(d, -7)) }
  function next() { setWeekAnchor(d => addDays(d, 7)) }

  const [anchorYear, anchorMonth] = weekAnchor.split('-').map(Number)

  return (
    <div style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
    }}>
      {/* Row 1：年月（左・上下センター） + Todayバッジ（下寄せ、日付列に合わせる） */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '6px 4px 0',
        height: 25,
      }}>
        <span style={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 16,
          fontWeight: 600,
          color: '#111827',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {anchorYear}年{anchorMonth}月
        </span>

        <div style={{ width: 26, flexShrink: 0 }} />

        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {week.map(d => (
            <div key={d.dateStr} style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              minWidth: 36,
              padding: '0 6px',
            }}>
              {d.dateStr === today && (
                <span style={{
                  background: PRIMARY,
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  lineHeight: 1,
                  padding: '2px 6px',
                  borderRadius: 999,
                }}>Today</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ width: 26, flexShrink: 0 }} />
      </div>

      {/* Row 2：矢印 + 7日 */}
      <div style={{
        padding: '4px 4px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}>
        <button onClick={prev} style={arrowBtnStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 20L7 12L15 4L16.4167 5.41667L9.83333 12L16.4167 18.5833L15 20Z" fill="#9CA3AF"/>
          </svg>
        </button>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {week.map(d => {
            const isSelected = d.dateStr === selected
            // Figmaに合わせた曜日色
            const textColor = d.isSun ? '#F40404' : d.isSat ? '#006FE5' : '#111827'
            return (
              <button
                key={d.dateStr}
                onClick={() => onChange(d.dateStr)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 6px 8px',
                  borderRadius: 8,
                  position: 'relative',
                  minWidth: 36,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 500, color: textColor, lineHeight: 1 }}>
                  {d.dow}
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: textColor, lineHeight: 1.2 }}>
                  {d.day}
                </span>
                {isSelected && (
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 48,
                    height: 4,
                    background: PRIMARY,
                    borderRadius: 999,
                  }} />
                )}
              </button>
            )
          })}
        </div>

        <button onClick={next} style={arrowBtnStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M8.99674 20L7.58008 18.5833L14.1634 12L7.58008 5.41667L8.99674 4L16.9967 12L8.99674 20Z" fill="#9CA3AF"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

const arrowBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
}

// ── EmptyState ────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 32px',
      gap: 12,
      textAlign: 'center',
    }}>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#9CA3AF' }}>
        まだ猫が登録されていません。<br />
        右上の「猫追加」から追加してください。
      </p>
    </div>
  )
}

// ── DailyScreen ───────────────────────────────────
export default function DailyScreen() {
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [cats, setCats] = useState(loadCats)
  const [selectedCatId, setSelectedCatId] = useState(() => loadCats()[0]?.id ?? null)
  const [showModal, setShowModal] = useState(false)

  // 猫詳細画面
  const [catDetailCat, setCatDetailCat] = useState(null)

  // フードシート
  const [showFoodSheet,    setShowFoodSheet]    = useState(false)
  const [editingSchedule,  setEditingSchedule]  = useState(null)   // null = 新規
  const [foodSheetKey,     setFoodSheetKey]      = useState(0)      // 再レンダリング用

  // うんちシート
  const [showPoopSheet,   setShowPoopSheet]   = useState(false)
  const [editingPoop,     setEditingPoop]     = useState(null)
  const [poopSheetKey,    setPoopSheetKey]    = useState(0)

  // おしっこシート
  const [showPeeSheet,    setShowPeeSheet]    = useState(false)
  const [editingPee,      setEditingPee]      = useState(null)
  const [peeSheetKey,     setPeeSheetKey]     = useState(0)

  // ゲロシート
  const [showVomitSheet,  setShowVomitSheet]  = useState(false)
  const [editingVomit,    setEditingVomit]    = useState(null)
  const [vomitSheetKey,   setVomitSheetKey]   = useState(0)

  // 体重シート
  const [showWeightSheet, setShowWeightSheet] = useState(false)
  const [editingWeight,   setEditingWeight]   = useState(null)
  const [weightSheetKey,  setWeightSheetKey]  = useState(0)

  // 動物病院シート
  const [showHospitalSheet, setShowHospitalSheet] = useState(false)
  const [editingHospital,   setEditingHospital]   = useState(null)
  const [hospitalSheetKey,  setHospitalSheetKey]  = useState(0)

  // 診察結果シート
  const [showExamSheet, setShowExamSheet] = useState(false)
  const [examContext,   setExamContext]   = useState({ catId: null, date: null })
  const [examSheetKey,  setExamSheetKey]  = useState(0)

  const selectedCat = useMemo(
    () => cats.find(c => c.id === selectedCatId) ?? cats[0] ?? null,
    [cats, selectedCatId]
  )

  function handleSave(cat, photo) {
    const next = saveCat(cat, photo)
    setCats(next)
    if (!selectedCatId) setSelectedCatId(cat.id)
    setShowModal(false)
  }

  function openCatDetail(cat) {
    setCatDetailCat(cat)
  }

  function openFoodAdd() {
    setEditingSchedule(null)
    setShowFoodSheet(true)
  }

  function openFoodEdit(schedule) {
    setEditingSchedule(schedule)
    setShowFoodSheet(true)
  }

  function closeFoodSheet() {
    setShowFoodSheet(false)
    setEditingSchedule(null)
    setFoodSheetKey(k => k + 1)  // FoodSection を再レンダリング
  }

  function handleFoodSave() {
    closeFoodSheet()
  }

  function handleFoodStop() {
    closeFoodSheet()
  }

  function openPoopAdd() {
    setEditingPoop(null)
    setShowPoopSheet(true)
  }

  function openPoopEdit(record) {
    setEditingPoop(record)
    setShowPoopSheet(true)
  }

  function closePoopSheet() {
    setShowPoopSheet(false)
    setEditingPoop(null)
    setPoopSheetKey(k => k + 1)
  }

  function openPeeAdd() {
    setEditingPee(null)
    setShowPeeSheet(true)
  }

  function openPeeEdit(record) {
    setEditingPee(record)
    setShowPeeSheet(true)
  }

  function closePeeSheet() {
    setShowPeeSheet(false)
    setEditingPee(null)
    setPeeSheetKey(k => k + 1)
  }

  function openVomitAdd() {
    setEditingVomit(null)
    setShowVomitSheet(true)
  }

  function openVomitEdit(record) {
    setEditingVomit(record)
    setShowVomitSheet(true)
  }

  function closeVomitSheet() {
    setShowVomitSheet(false)
    setEditingVomit(null)
    setVomitSheetKey(k => k + 1)
  }

  function openWeightAdd() {
    setEditingWeight(null)
    setShowWeightSheet(true)
  }

  function openWeightEdit(record) {
    setEditingWeight(record)
    setShowWeightSheet(true)
  }

  function closeWeightSheet() {
    setShowWeightSheet(false)
    setEditingWeight(null)
    setWeightSheetKey(k => k + 1)
  }

  function openHospitalAdd() {
    setEditingHospital(null)
    setShowHospitalSheet(true)
  }

  function openHospitalEdit(record) {
    setEditingHospital(record)
    setShowHospitalSheet(true)
  }

  function closeHospitalSheet() {
    setShowHospitalSheet(false)
    setEditingHospital(null)
    setHospitalSheetKey(k => k + 1)
  }

  function openExamSheet(catId, date) {
    setExamContext({ catId, date })
    setShowExamSheet(true)
  }

  function closeExamSheet() {
    setShowExamSheet(false)
    setExamSheetKey(k => k + 1)
  }

  // 猫詳細画面
  if (catDetailCat) {
    return (
      <CatDetailScreen
        cat={catDetailCat}
        cats={cats}
        onBack={() => setCatDetailCat(null)}
        onSaveCat={(cat, photo) => {
          const next = saveCatEdit(cat, photo)
          setCats(next)
          const updated = next.find(c => c.id === cat.id)
          if (updated) setCatDetailCat(updated)
        }}
      />
    )
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#F7F7F7', overflow: 'hidden' }}>

      {/* ── 固定エリア（ヘッダー + WeekStrip のみ）── */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ background: '#FFFFFF' }}>
          <header style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 60,
            padding: '0 16px',
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>Daily</span>
            <button
              onClick={() => setShowModal(true)}
              style={{
                position: 'absolute',
                right: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: PRIMARY,
                fontSize: 14,
                fontWeight: 600,
                padding: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              猫追加
            </button>
          </header>
          <WeekStrip selected={selectedDate} onChange={setSelectedDate} />
        </div>
      </div>

      {/* ── スクロール領域 ── */}
      <div className="daily-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {cats.length === 0 ? (
          <EmptyState />
        ) : (
          selectedCat && (
            <div style={{
              padding: '16px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              {/* 猫タブ */}
              <CatTabs
                cats={cats}
                selectedId={selectedCat?.id}
                onSelect={setSelectedCatId}
              />
              <CatProfileCard cat={selectedCat} onClick={() => openCatDetail(selectedCat)} />
              <SectionsArea
                key={`${foodSheetKey}-${poopSheetKey}-${peeSheetKey}-${vomitSheetKey}-${weightSheetKey}-${hospitalSheetKey}`}
                catId={selectedCat.id}
                selectedDate={selectedDate}
                onFoodAdd={openFoodAdd}
                onFoodEdit={openFoodEdit}
                onPoopAdd={openPoopAdd}
                onPoopEdit={openPoopEdit}
                onPeeAdd={openPeeAdd}
                onPeeEdit={openPeeEdit}
                onVomitAdd={openVomitAdd}
                onVomitEdit={openVomitEdit}
                onWeightAdd={openWeightAdd}
                onWeightEdit={openWeightEdit}
                onHospitalAdd={openHospitalAdd}
                onHospitalEdit={openHospitalEdit}
              />
            </div>
          )
        )}
      </div>

      {showModal && (
        <CatFormModal
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {showFoodSheet && selectedCat && (
        <DailyFoodSheet
          catId={selectedCat.id}
          selectedDate={selectedDate}
          initialSchedule={editingSchedule}
          onClose={closeFoodSheet}
          onSave={handleFoodSave}
          onStop={handleFoodStop}
        />
      )}

      {showPoopSheet && selectedCat && (
        <DailyPoopSheet
          catId={selectedCat.id}
          selectedDate={selectedDate}
          initialRecord={editingPoop}
          onClose={closePoopSheet}
          onSave={closePoopSheet}
          onDelete={closePoopSheet}
        />
      )}

      {showPeeSheet && selectedCat && (
        <DailyPeeSheet
          catId={selectedCat.id}
          selectedDate={selectedDate}
          initialRecord={editingPee}
          onClose={closePeeSheet}
          onSave={closePeeSheet}
          onDelete={closePeeSheet}
        />
      )}

      {showVomitSheet && selectedCat && (
        <DailyVomitSheet
          catId={selectedCat.id}
          selectedDate={selectedDate}
          initialRecord={editingVomit}
          onClose={closeVomitSheet}
          onSave={closeVomitSheet}
          onDelete={closeVomitSheet}
        />
      )}

      {showWeightSheet && selectedCat && (
        <DailyWeightSheet
          catId={selectedCat.id}
          selectedDate={selectedDate}
          initialRecord={editingWeight}
          onClose={closeWeightSheet}
          onSave={closeWeightSheet}
          onDelete={closeWeightSheet}
        />
      )}

      {showHospitalSheet && selectedCat && (
        <DailyHospitalSheet
          cats={cats}
          catId={selectedCat.id}
          selectedDate={selectedDate}
          initialRecord={editingHospital}
          onClose={closeHospitalSheet}
          onSave={closeHospitalSheet}
          onDelete={closeHospitalSheet}
          onExamOpen={openExamSheet}
        />
      )}

      {showExamSheet && examContext.catId && (
        <DailyExamSheet
          key={examSheetKey}
          catId={examContext.catId}
          date={examContext.date}
          onClose={closeExamSheet}
          onSave={closeExamSheet}
          onDelete={closeExamSheet}
        />
      )}

    </div>
  )
}
