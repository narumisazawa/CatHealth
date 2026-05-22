import { useState } from 'react'
import CatsTab      from './components/CatsTab.jsx'
import DailyScreen  from './screens/DailyScreen.jsx'
import FoodsScreen  from './screens/FoodsScreen.jsx'
import HospitalScreen from './screens/HospitalScreen.jsx'
import BottomNav    from './components/BottomNav.jsx'

export default function App() {
  const [tab, setTab] = useState('cats')

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', position: 'relative' }}>
      {tab === 'cats'     && <CatsTab />}
      {tab === 'daily'    && <DailyScreen onGoToCatsTab={() => setTab('cats')} />}
      {tab === 'foods'    && <FoodsScreen />}
      {tab === 'hospital' && <HospitalScreen />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
