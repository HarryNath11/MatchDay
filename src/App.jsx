import { useState } from 'react'
import './App.css'
import AFLPage from './AFLPage'
import NRLPage from './NRLPage'
import EPLPage from './EPLPage'
import MLBPage from './MLBPage'
import NFLPage from './NFLPage'

const SPORTS = [
  { id: 'afl', label: 'AFL', colour: '#003087', logo: '/afl-logo.png' },
  { id: 'nrl', label: 'NRL', colour: '#00843D', logo: '/nrl-logo.png' },
  { id: 'epl', label: 'Premier League', colour: '#37003C', logo: '/epl-logo.png' },
  { id: 'mlb', label: 'MLB', colour: '#041E42', logo: '/mlb-logo.png' },
  { id: 'nfl', label: 'NFL', colour: '#013369', logo: '/nfl-logo.png' },
]

function Home({ onSelectSport }) {
  return (
    <div className="home-screen">
      <h1 className="home-brand">MatchDay</h1>
      <p className="home-subtitle">Pick a competition to get started</p>
      <div className="home-sport-grid">
        {SPORTS.map(sport => (
          <button
            key={sport.id}
            className="home-sport-tile"
            style={{ background: `linear-gradient(150deg, ${sport.colour} 0%, ${sport.colour}cc 60%, #05050a 130%)` }}
            onClick={() => onSelectSport(sport.id)}
          >
            <img src={sport.logo} alt={sport.label} className="home-sport-tile-logo" onError={e => e.target.style.display = 'none'} />
            <span className="home-sport-tile-label">{sport.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [sport, setSport] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  function openMenu() {
    setMenuOpen(true)
  }

  function selectSport(id) {
    setSport(id)
    setMenuOpen(false)
  }

  function goHome() {
    setSport(null)
    setMenuOpen(false)
  }

  return (
    <>
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="menu-drawer" onClick={e => e.stopPropagation()}>
            <button className="menu-drawer-close" onClick={() => setMenuOpen(false)}>✕</button>
            <div className="menu-drawer-title">Sports</div>
            <button className="menu-drawer-item" onClick={goHome}>🏠 Home</button>
            {SPORTS.map(s => (
              <button
                key={s.id}
                className={`menu-drawer-item${sport === s.id ? ' active' : ''}`}
                onClick={() => selectSport(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {sport === null && <Home onSelectSport={selectSport} />}
      {sport === 'afl' && <AFLPage onOpenMenu={openMenu} />}
      {sport === 'nrl' && <NRLPage onOpenMenu={openMenu} />}
      {sport === 'epl' && <EPLPage onOpenMenu={openMenu} />}
      {sport === 'mlb' && <MLBPage onOpenMenu={openMenu} />}
      {sport === 'nfl' && <NFLPage onOpenMenu={openMenu} />}
    </>
  )
}

export default App
