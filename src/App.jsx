import { useState } from 'react'
import DailyScreen from './screens/DailyScreen.jsx'
import FoodsScreen from './screens/FoodsScreen.jsx'
import HospitalScreen from './screens/HospitalScreen.jsx'
import BottomNav from './components/BottomNav.jsx'

export default function App() {
  const [tab, setTab] = useState('daily')

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', position: 'relative' }}>
      {tab === 'daily'    && <DailyScreen />}
      {tab === 'foods'    && <FoodsScreen />}
      {tab === 'hospital' && <HospitalScreen />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
