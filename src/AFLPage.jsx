import { useState, useEffect } from 'react'
import './App.css'

function AFLPage({ onOpenMenu }) {
  const [page, setPage] = useState('ladder')
  const [ladder, setLadder] = useState([])
  const [results, setResults] = useState([])
  const [fixtures, setFixtures] = useState([])
  const [teams, setTeams] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentResultsRound, setCurrentResultsRound] = useState(null)
  const [currentFixturesRound, setCurrentFixturesRound] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [closingTeam, setClosingTeam] = useState(false)
  const [liveGames, setLiveGames] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [historicalResults, setHistoricalResults] = useState([])

  function handleBack() {
    setClosingTeam(true)
    setTimeout(() => {
      setSelectedTeam(null)
      setClosingTeam(false)
    }, 300)
  }

  function goToPage(newPage) {
    setSelectedTeam(null)
    setSelectedGame(null)
    setClosingTeam(false)
    setPage(newPage)
  }

  const aflLogos = {
    'Adelaide':               '/logos/Adelaide.png',
    'Brisbane Lions':         '/logos/Brisbane-Lions.png',
    'Carlton':                '/logos/Carlton.png',
    'Collingwood':            '/logos/Collingwood.png',
    'Essendon':               '/logos/Essendon.png',
    'Fremantle':              '/logos/Fremantle.png',
    'Geelong':                '/logos/Geelong.png',
    'Gold Coast':             '/logos/Gold-Coast.png',
    'Greater Western Sydney': '/logos/Greater-Western-Sydney.png',
    'Hawthorn':               '/logos/Hawthorn.png',
    'Melbourne':              '/logos/Melbourne.png',
    'North Melbourne':        '/logos/North-Melbourne.png',
    'Port Adelaide':          '/logos/Port-Adelaide.png',
    'Richmond':               '/logos/Richmond.png',
    'St Kilda':               '/logos/St-Kilda.png',
    'Sydney':                 '/logos/Sydney.png',
    'West Coast':             '/logos/West-Coast.png',
    'Western Bulldogs':       '/logos/Western-Bulldogs.png',
  }

  function fetchAllData(year, teamMap) {
    return Promise.all([
      fetch(`/api/?q=standings;year=${year}`).then(r => r.json()),
      fetch(`/api/?q=games;year=${year};complete=100`).then(r => r.json()),
      fetch(`/api/?q=games;year=${year};complete=0`).then(r => r.json()),
      fetch(`/api/?q=games;year=${year}`).then(r => r.json()),
    ]).then(([ladderData, resultsData, fixturesData, allGamesData]) => {
      const allResults = resultsData.games || []
      const allFixtures = fixturesData.games || []
      const live = (allGamesData.games || []).filter(g => g.complete > 0 && g.complete < 100)

      setLadder(ladderData.standings || [])
      setResults(allResults)
      setFixtures(allFixtures)
      setLiveGames(live)

      if (allResults.length > 0) {
        const rounds = allResults.map(g => g.round)
        setCurrentResultsRound(Math.max(...rounds))
      }
      if (allFixtures.length > 0) {
        const rounds = allFixtures.map(g => g.round)
        setCurrentFixturesRound(Math.min(...rounds))
      }
    })
  }

  useEffect(() => {
    const year = 2026

    fetch(`/api/?q=teams`).then(r => r.json()).then(teamsData => {
      const teamMap = {}
      ;(teamsData.teams || []).forEach(t => {
        teamMap[t.name] = { ...t, logo: aflLogos[t.name] || null }
      })
      setTeams(teamMap)

      fetchAllData(year, teamMap)
        .then(() => setLoading(false))
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })

      Promise.all(
        [2021, 2022, 2023, 2024, 2025].map(y =>
          fetch(`/api/?q=games;year=${y};complete=100`).then(r => r.json())
        )
      ).then(years => {
        const all = years.flatMap(d => d.games || [])
        setHistoricalResults(all)
      }).catch(() => {})

      const interval = setInterval(() => {
        fetchAllData(year, teamMap).catch(() => {})
      }, 30000)

      return () => clearInterval(interval)
    }).catch(err => {
      setError(err.message)
      setLoading(false)
    })
  }, [])

  // Calculate form record (eg. "3-2") over last 5 games for each team
  function getForm(teamName) {
    const teamGames = results
      .filter(g => g.hteam === teamName || g.ateam === teamName)
      .sort((a, b) => a.round - b.round)
      .slice(-5)

    let wins = 0, losses = 0
    teamGames.forEach(g => {
      const isHome = g.hteam === teamName
      const scored = isHome ? g.hscore : g.ascore
      const conceded = isHome ? g.ascore : g.hscore
      if (scored > conceded) wins++
      else if (scored < conceded) losses++
    })
    return `${wins}-${losses}`
  }

  // Find teams that had a bye in a given round
  function getByeTeams(games, round) {
    const roundGames = games.filter(g => g.round === round)
    const playingTeams = new Set()
    roundGames.forEach(g => {
      playingTeams.add(g.hteam)
      playingTeams.add(g.ateam)
    })
    return Object.keys(teams).filter(name => !playingTeams.has(name) && teams[name])
  }

  const teamInfo = {
    'Adelaide':               { coach: 'Matthew Nicks',     captain: 'Jordan Dawson' },
    'Brisbane Lions':         { coach: 'Chris Fagan',       captain: 'Dayne Zorko' },
    'Carlton':                { coach: 'Michael Voss',      captain: 'Patrick Cripps' },
    'Collingwood':            { coach: 'Craig McRae',       captain: 'Scott Pendlebury' },
    'Essendon':               { coach: 'Brad Scott',        captain: 'Zach Merrett' },
    'Fremantle':              { coach: 'Justin Longmuir',   captain: 'Alex Pearce' },
    'Geelong':                { coach: 'Chris Scott',       captain: 'Patrick Dangerfield' },
    'Gold Coast':             { coach: 'Damien Hardwick',   captain: 'Touk Miller' },
    'Greater Western Sydney': { coach: 'Adam Kingsley',     captain: 'Toby Greene' },
    'Hawthorn':               { coach: 'Sam Mitchell',      captain: 'James Sicily' },
    'Melbourne':              { coach: 'Simon Goodwin',     captain: 'Max Gawn' },
    'North Melbourne':        { coach: 'Alastair Clarkson', captain: 'Luke Davies-Uniacke' },
    'Port Adelaide':          { coach: 'Ken Hinkley',       captain: 'Connor Rozee' },
    'Richmond':               { coach: 'Adem Yze',          captain: 'Toby Nankervis' },
    'St Kilda':               { coach: 'Ross Lyon',         captain: 'Jack Steele' },
    'Sydney':                 { coach: 'John Longmire',     captain: 'Callum Mills' },
    'West Coast':             { coach: 'Andrew McQualter',  captain: 'Elliot Yeo' },
    'Western Bulldogs':       { coach: 'Luke Beveridge',    captain: 'Marcus Bontempelli' },
  }

  const teamColours = {
    'Adelaide':               '#002B5C',
    'Brisbane Lions':         '#A30046',
    'Carlton':                '#0E1F5B',
    'Collingwood':            '#000000',
    'Essendon':               '#CC2031',
    'Fremantle':              '#2C1654',
    'Geelong':                '#1C3C63',
    'Gold Coast':             '#E2141E',
    'Greater Western Sydney': '#F15C22',
    'Hawthorn':               '#4D2004',
    'Melbourne':              '#CC2031',
    'North Melbourne':        '#003087',
    'Port Adelaide':          '#008AAB',
    'Richmond':               '#FFD200',
    'St Kilda':               '#ED0F05',
    'Sydney':                 '#E2141E',
    'West Coast':             '#002B5C',
    'Western Bulldogs':       '#014896',
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
    const day = date.getDate()
    const suffix = day === 1 || day === 21 || day === 31 ? 'st'
                 : day === 2 || day === 22 ? 'nd'
                 : day === 3 || day === 23 ? 'rd' : 'th'
    return `${days[date.getDay()]} ${day}${suffix} ${months[date.getMonth()]}`
  }

  function displayName(name) {
    if (name === 'Greater Western Sydney') return 'GWS'
    return name
  }

  function formatTime(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }

  const resultsRounds = [...new Set(results.map(g => g.round))].sort((a, b) => a - b)
  const fixturesRounds = [...new Set(fixtures.map(g => g.round))].sort((a, b) => a - b)
  const gamesForRound = (games, round) => games.filter(g => g.round === round)

  function RoundNav({ round, rounds, onChange }) {
    const idx = rounds.indexOf(round)
    return (
      <div className="round-nav">
        <button className="round-arrow" onClick={() => onChange(rounds[idx - 1])} disabled={idx === 0}>&#8249;</button>
        <span className="round-label">Round {round}</span>
        <button className="round-arrow" onClick={() => onChange(rounds[idx + 1])} disabled={idx === rounds.length - 1}>&#8250;</button>
      </div>
    )
  }

  function ByeTeams({ round, allGames }) {
    const byeTeams = getByeTeams(allGames, round)
    if (byeTeams.length === 0) return null
    return (
      <div className="bye-section">
        <h3 className="bye-title">Bye this round</h3>
        <div className="bye-teams">
          {byeTeams.map(name => (
            <div key={name} className="bye-team">
              {teams[name]?.logo
                ? <img src={teams[name].logo} alt={name} className="team-logo" />
                : <span className="bye-team-name">{name}</span>
              }
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <button className="menu-button" onClick={onOpenMenu}>☰</button>
        <img src="/afl-logo.png" alt="AFL Logo" className="afl-logo" />
        <nav className="nav">
          <button className={page === 'ladder' ? 'active' : ''} onClick={() => goToPage('ladder')}>Ladder</button>
          <button className={page === 'results' ? 'active' : ''} onClick={() => goToPage('results')}>Results</button>
          <button className={page === 'fixtures' ? 'active' : ''} onClick={() => goToPage('fixtures')}>Fixtures</button>
        </nav>
      </header>

      {selectedGame && (() => {
        const g = selectedGame
        const homeColour = teamColours[g.hteam] || '#333'
        const awayColour = teamColours[g.ateam] || '#333'
        const homeLadder = ladder.findIndex(t => t.name === g.hteam) + 1
        const awayLadder = ladder.findIndex(t => t.name === g.ateam) + 1
        const allGames = [...historicalResults, ...results]
        const h2h = allGames.filter(r =>
          (r.hteam === g.hteam && r.ateam === g.ateam) ||
          (r.hteam === g.ateam && r.ateam === g.hteam)
        )
        const h2hHome = h2h.filter(r => {
          const scored = r.hteam === g.hteam ? r.hscore : r.ascore
          const conceded = r.hteam === g.hteam ? r.ascore : r.hscore
          return scored > conceded
        }).length
        const h2hAway = h2h.filter(r => {
          const scored = r.hteam === g.ateam ? r.hscore : r.ascore
          const conceded = r.hteam === g.ateam ? r.ascore : r.hscore
          return scored > conceded
        }).length
        const h2hDraws = h2h.length - h2hHome - h2hAway

        const allTimeHome = allGames.filter(r => r.hteam === g.hteam || r.ateam === g.hteam)
        const allTimeHomeWins = allTimeHome.filter(r => {
          const scored = r.hteam === g.hteam ? r.hscore : r.ascore
          const conceded = r.hteam === g.hteam ? r.ascore : r.hscore
          return scored > conceded
        }).length

        const allTimeAway = allGames.filter(r => r.hteam === g.ateam || r.ateam === g.ateam)
        const allTimeAwayWins = allTimeAway.filter(r => {
          const scored = r.hteam === g.ateam ? r.hscore : r.ascore
          const conceded = r.hteam === g.ateam ? r.ascore : r.hscore
          return scored > conceded
        }).length

        const daysUntil = Math.ceil((new Date(g.date) - new Date()) / (1000 * 60 * 60 * 24))

        const homeSeasonData = ladder.find(t => t.name === g.hteam)
        const awaySeasonData = ladder.find(t => t.name === g.ateam)

        function getLast5(teamName) {
          return results
            .filter(r => r.hteam === teamName || r.ateam === teamName)
            .sort((a, b) => a.round - b.round)
            .slice(-5)
            .map(r => {
              const scored = r.hteam === teamName ? r.hscore : r.ascore
              const conceded = r.hteam === teamName ? r.ascore : r.hscore
              if (scored > conceded) return 'W'
              if (scored < conceded) return 'L'
              return 'D'
            })
        }

        const homeForm = getLast5(g.hteam)
        const awayForm = getLast5(g.ateam)

        return (
          <div className="game-page" style={{ animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            <button className="game-page-back" onClick={() => setSelectedGame(null)}>← Back</button>

            <div className="game-page-hero">
              <div className="game-page-hero-team">
                {teams[g.hteam]?.logo && <img src={teams[g.hteam].logo} alt={g.hteam} className="game-page-logo" />}
                <span className="game-page-team-name" style={{ color: homeColour }}>{displayName(g.hteam)}</span>
              </div>
              <div className="game-page-hero-vs">
                <span className="game-page-vs">VS</span>
                <span className="game-page-round">Round {g.round}</span>
              </div>
              <div className="game-page-hero-team">
                {teams[g.ateam]?.logo && <img src={teams[g.ateam].logo} alt={g.ateam} className="game-page-logo" />}
                <span className="game-page-team-name" style={{ color: awayColour }}>{displayName(g.ateam)}</span>
              </div>
            </div>

            <div className="game-page-body">
              <div className="game-page-info-card">
                <div className="game-page-info-row">
                  <span className="game-page-info-label">📅</span>
                  <span>{formatDate(g.date)} · {formatTime(g.date)}</span>
                </div>
                <div className="game-page-info-row">
                  <span className="game-page-info-label">📍</span>
                  <span>{g.venue}</span>
                </div>
                {daysUntil >= 0 && (
                  <div className="game-page-info-row">
                    <span className="game-page-info-label">⏳</span>
                    <span>{daysUntil === 0 ? 'Today!' : daysUntil === 1 ? '1 day to go' : `${daysUntil} days to go`}</span>
                  </div>
                )}
              </div>

              <div className="game-page-section-title">Team Info</div>
              <div className="game-page-info-grid" style={{ borderTop: `4px solid transparent`, borderImage: `linear-gradient(to right, ${homeColour} 50%, ${awayColour} 50%) 1` }}>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Coach</span>
                    <span className="game-page-compare-value">{teamInfo[g.hteam]?.coach ?? '—'}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Coach</span>
                    <span className="game-page-compare-value">{teamInfo[g.ateam]?.coach ?? '—'}</span>
                  </div>
                </div>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Captain</span>
                    <span className="game-page-compare-value">{teamInfo[g.hteam]?.captain ?? '—'}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Captain</span>
                    <span className="game-page-compare-value">{teamInfo[g.ateam]?.captain ?? '—'}</span>
                  </div>
                </div>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Ladder</span>
                    <span className="game-page-compare-value" style={{ color: homeColour }}>#{homeLadder}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Ladder</span>
                    <span className="game-page-compare-value" style={{ color: awayColour }}>#{awayLadder}</span>
                  </div>
                </div>
              </div>

              <div className="game-page-section-title">2026 Season Record</div>
              <div className="game-page-info-grid" style={{ borderTop: `4px solid transparent`, borderImage: `linear-gradient(to right, ${homeColour} 50%, ${awayColour} 50%) 1` }}>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Wins</span>
                    <span className="game-page-compare-value" style={{ color: '#2a9d2a' }}>{homeSeasonData?.wins ?? '—'}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Wins</span>
                    <span className="game-page-compare-value" style={{ color: '#2a9d2a' }}>{awaySeasonData?.wins ?? '—'}</span>
                  </div>
                </div>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Losses</span>
                    <span className="game-page-compare-value" style={{ color: '#cc3333' }}>{homeSeasonData?.losses ?? '—'}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Losses</span>
                    <span className="game-page-compare-value" style={{ color: '#cc3333' }}>{awaySeasonData?.losses ?? '—'}</span>
                  </div>
                </div>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Points</span>
                    <span className="game-page-compare-value">{homeSeasonData?.pts ?? '—'}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Points</span>
                    <span className="game-page-compare-value">{awaySeasonData?.pts ?? '—'}</span>
                  </div>
                </div>
              </div>

              <div className="game-page-section-title">Current Form (last 5)</div>
              <div className="game-page-form-card">
                <div className="game-page-form-row">
                  <span className="game-page-form-team" style={{ color: homeColour }}>{displayName(g.hteam)}</span>
                  <div className="game-page-form-badges">
                    {homeForm.map((r, i) => <span key={i} className={`form-badge form-${r}`}>{r}</span>)}
                  </div>
                </div>
                <div className="game-page-form-row">
                  <span className="game-page-form-team" style={{ color: awayColour }}>{displayName(g.ateam)}</span>
                  <div className="game-page-form-badges">
                    {awayForm.map((r, i) => <span key={i} className={`form-badge form-${r}`}>{r}</span>)}
                  </div>
                </div>
              </div>

              <div className="game-page-section-title">All Time Record (2021–present)</div>
              <div className="game-page-compare">
                <div className="game-page-compare-col" style={{ borderTop: `4px solid ${homeColour}` }}>
                  <span className="game-page-compare-label">{displayName(g.hteam)}</span>
                  <span className="game-page-compare-value" style={{ color: homeColour }}>{allTimeHomeWins}W</span>
                  <span className="game-page-compare-label" style={{ marginTop: 4 }}>{allTimeHome.length - allTimeHomeWins}L from {allTimeHome.length}</span>
                </div>
                <div className="game-page-compare-divider" />
                <div className="game-page-compare-col" style={{ borderTop: `4px solid ${awayColour}` }}>
                  <span className="game-page-compare-label">{displayName(g.ateam)}</span>
                  <span className="game-page-compare-value" style={{ color: awayColour }}>{allTimeAwayWins}W</span>
                  <span className="game-page-compare-label" style={{ marginTop: 4 }}>{allTimeAway.length - allTimeAwayWins}L from {allTimeAway.length}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {selectedTeam && (() => {
        const teamData = ladder.find(t => t.name === selectedTeam)
        const ladderPos = ladder.findIndex(t => t.name === selectedTeam) + 1

        const teamResults = results
          .filter(g => g.hteam === selectedTeam || g.ateam === selectedTeam)
          .sort((a, b) => a.round - b.round)

        const last10 = teamResults.slice(-10).map(g => {
            const isHome = g.hteam === selectedTeam
            const scored = isHome ? g.hscore : g.ascore
            const conceded = isHome ? g.ascore : g.hscore
            if (scored > conceded) return 'W'
            if (scored < conceded) return 'L'
            return 'D'
          })

        const last3Results = teamResults.slice(-3).reverse()

        const nextFixture = fixtures
          .filter(g => g.hteam === selectedTeam || g.ateam === selectedTeam)
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null

        const daysUntilNext = nextFixture
          ? Math.ceil((new Date(nextFixture.date) - new Date()) / (1000 * 60 * 60 * 24))
          : null

        const teamColour = teamColours[selectedTeam] || '#333'
        const wins = teamData?.wins ?? 0
        const losses = teamData?.losses ?? 0
        const totalGames = wins + losses + (teamData?.draws ?? 0)
        const winRate = totalGames > 0 ? wins / totalGames : 0

        const heroTextColour = teamColour

        return (
          <div className={`team-page${closingTeam ? ' closing' : ''}`} style={{ background: 'white' }}>
            <button className="back-button" onClick={handleBack} style={{ background: `${teamColour}18`, color: teamColour }}>← Back</button>

            <div className="team-hero">
              {teams[selectedTeam]?.logo && (
                <img src={teams[selectedTeam].logo} alt={selectedTeam} className="team-hero-logo" />
              )}
              <h2 className="team-page-name" style={{ color: heroTextColour }}>{selectedTeam}</h2>
              <div className="team-hero-stats" style={{ background: `${teamColour}18` }}>
                <div className="team-hero-stat">
                  <span className="team-hero-stat-value" style={{ color: teamColour }}>#{ladderPos}</span>
                  <span className="team-hero-stat-label" style={{ color: `${teamColour}99` }}>Position</span>
                </div>
                <div className="team-hero-divider" style={{ background: `${teamColour}40` }} />
                <div className="team-hero-stat">
                  <span className="team-hero-stat-value" style={{ color: teamColour }}>{teamData?.pts ?? '-'}</span>
                  <span className="team-hero-stat-label" style={{ color: `${teamColour}99` }}>Points</span>
                </div>
                <div className="team-hero-divider" style={{ background: `${teamColour}40` }} />
                <div className="team-hero-stat">
                  <span className="team-hero-stat-value" style={{ color: teamColour }}>{teamData?.percentage != null ? teamData.percentage.toFixed(1) + '%' : '-'}</span>
                  <span className="team-hero-stat-label" style={{ color: `${teamColour}99` }}>Percentage</span>
                </div>
              </div>
            </div>

            <div className="team-page-body" style={{ background: teamColour }}>
              <div className="team-info-row">
                <div className="team-info-item">
                  <span className="team-info-label">Coach</span>
                  <span className="team-info-value">{teamInfo[selectedTeam]?.coach ?? '—'}</span>
                </div>
                <div className="team-info-item">
                  <span className="team-info-label">Captain</span>
                  <span className="team-info-value">{teamInfo[selectedTeam]?.captain ?? '—'}</span>
                </div>
              </div>

              <div className="team-stats">
                <div className="stat-card stat-card-wins">
                  <span className="stat-label">Wins</span>
                  <span className="stat-value">{teamData?.wins ?? '-'}</span>
                </div>
                <div className="stat-card stat-card-losses">
                  <span className="stat-label">Losses</span>
                  <span className="stat-value">{teamData?.losses ?? '-'}</span>
                </div>
                <div className="stat-card stat-card-draws">
                  <span className="stat-label">Draws</span>
                  <span className="stat-value">{teamData?.draws ?? '-'}</span>
                </div>
                <div className="stat-card" style={{ borderTop: `4px solid ${teamColour}` }}>
                  <span className="stat-label">Form (last 5)</span>
                  <span className="stat-value" style={{ fontSize: '16px' }}>{getForm(selectedTeam)}</span>
                </div>
              </div>

              <div className="team-section-card">
                <h3 className="team-section-title">Win Rate</h3>
                <div className="win-rate-bar-track">
                  <div className="win-rate-bar-fill" style={{ width: `${winRate * 100}%`, background: teamColour }} />
                </div>
                <div className="win-rate-label">{Math.round(winRate * 100)}% from {totalGames} games</div>
              </div>

              {nextFixture && (
                <div className="team-section-card" style={{ cursor: 'pointer' }} onClick={() => { setSelectedTeam(null); setSelectedGame(nextFixture) }}>
                  <h3 className="team-section-title">Next Game</h3>
                  {daysUntilNext !== null && (
                    <div className="countdown-badge" style={{ background: teamColour }}>
                      {daysUntilNext <= 0 ? 'Today!' : daysUntilNext === 1 ? '1 day to go' : `${daysUntilNext} days to go`}
                    </div>
                  )}
                  <div className="next-fixture-teams">
                    <div className="next-fixture-team">
                      {teams[nextFixture.hteam]?.logo && <img src={teams[nextFixture.hteam].logo} alt={nextFixture.hteam} className="next-fixture-logo" />}
                      <span className="next-fixture-name">{nextFixture.hteam}</span>
                    </div>
                    <span className="next-fixture-vs">vs</span>
                    <div className="next-fixture-team">
                      {teams[nextFixture.ateam]?.logo && <img src={teams[nextFixture.ateam].logo} alt={nextFixture.ateam} className="next-fixture-logo" />}
                      <span className="next-fixture-name">{nextFixture.ateam}</span>
                    </div>
                  </div>
                  <div className="next-fixture-details">
                    <span>Round {nextFixture.round}</span>
                    <span>{formatDate(nextFixture.date)}</span>
                    <span>{formatTime(nextFixture.date)}</span>
                    <span>{nextFixture.venue}</span>
                  </div>
                </div>
              )}

              <div className="team-section-card">
                <h3 className="team-section-title">Recent Results</h3>
                {last3Results.map(g => {
                  const isHome = g.hteam === selectedTeam
                  const scored = isHome ? g.hscore : g.ascore
                  const conceded = isHome ? g.ascore : g.hscore
                  const opponent = isHome ? g.ateam : g.hteam
                  const won = scored > conceded
                  const drew = scored === conceded
                  const outcome = won ? 'W' : drew ? 'D' : 'L'
                  const borderColour = won ? '#2a9d2a' : drew ? '#888' : '#cc3333'
                  return (
                    <div key={g.id} className="recent-result" style={{ borderLeft: `4px solid ${borderColour}` }}>
                      <span className={`recent-result-badge form-${outcome}`}>{outcome}</span>
                      <div className="recent-result-info">
                        <span className="recent-result-opponent">
                          {teams[opponent]?.logo && <img src={teams[opponent].logo} alt={opponent} className="recent-result-logo" />}
                          {opponent}
                        </span>
                        <span className="recent-result-venue">Round {g.round} · {g.venue}</span>
                      </div>
                      <span className="recent-result-score">{scored} – {conceded}</span>
                    </div>
                  )
                })}
              </div>

              <div className="team-form-section">
                <h3 className="team-form-title">Last 10 Games</h3>
                <div className="team-form">
                  {last10.map((result, i) => (
                    <span key={i} className={`form-badge form-${result}`}>{result}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      <main className="main" style={{ display: selectedTeam || selectedGame ? 'none' : 'block' }}>
        {loading && <p className="loading">Loading data...</p>}
        {error && <p className="loading" style={{color: 'red'}}>Error: {error}</p>}

        {!loading && page === 'ladder' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>W</th>
                  <th>L</th>
                  <th>D</th>
                  <th>Pts</th>
                  <th>Form</th>
                </tr>
              </thead>
              <tbody>
                {ladder.map((team, i) => {
                  const colour = teamColours[team.name] || '#333'
                  return (
                    <tr key={team.name} className={i < 8 ? 'finals' : ''} style={{ borderLeft: `8px solid ${colour}`, cursor: 'pointer' }} onClick={() => setSelectedTeam(team.name)}>
                      <td>
                        <span className="rank-circle" style={{ backgroundColor: colour }}>{i + 1}</span>
                      </td>
                      <td className="team-name clickable-team">{team.name}</td>
                      <td>{team.wins}</td>
                      <td>{team.losses}</td>
                      <td>{team.draws}</td>
                      <td><strong>{team.pts}</strong></td>
                      <td className="form-record">{getForm(team.name)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="legend">Highlighted rows are in the top 8 (finals)</p>
          </div>
        )}

        {!loading && page === 'results' && currentResultsRound !== null && (
          <>
            <RoundNav round={currentResultsRound} rounds={resultsRounds} onChange={setCurrentResultsRound} />
            {liveGames.length > 0 && (
              <div className="live-section">
                <div className="live-section-header">
                  <span className="live-dot" />
                  Live Now
                </div>
                {liveGames.map(game => (
                  <div key={game.id} className="game-card live-card" style={{ borderLeft: `8px solid ${teamColours[game.hteam] || '#ccc'}`, borderRight: `8px solid ${teamColours[game.ateam] || '#ccc'}` }}>
                    <div className="result-sides">
                      <div className="result-side">
                        {teams[game.hteam]?.logo && <img src={teams[game.hteam].logo} alt="" className="result-logo" />}
                        <span className="result-team">{displayName(game.hteam)}</span>
                        <span className="result-score">{game.hscore}</span>
                      </div>
                      <div className="result-side">
                        {teams[game.ateam]?.logo && <img src={teams[game.ateam].logo} alt="" className="result-logo" />}
                        <span className="result-team">{displayName(game.ateam)}</span>
                        <span className="result-score">{game.ascore}</span>
                      </div>
                    </div>
                    <div className="venue">{game.venue}</div>
                    <div className="live-progress">Q{Math.ceil(game.complete / 25)} · {game.complete}%</div>
                  </div>
                ))}
              </div>
            )}

            <div className="games">
              {gamesForRound(results, currentResultsRound).map(game => {
                const homeWon = game.hscore > game.ascore
                const drew = game.hscore === game.ascore
                const winner = homeWon ? game.hteam : game.ateam
                const margin = Math.abs(game.hscore - game.ascore)
                const resultSummary = drew
                  ? 'Match drawn'
                  : `${displayName(winner)} won by ${margin} point${margin === 1 ? '' : 's'}`
                return (
                  <div key={game.id} className="game-card result-card" style={{ borderLeft: `8px solid ${teamColours[homeWon ? game.hteam : game.ateam] || '#ccc'}`, borderRight: `8px solid ${teamColours[homeWon ? game.ateam : game.hteam] || '#ccc'}` }}>
                    <div className="result-sides">
                      <div className="result-side side-win">
                        {teams[homeWon ? game.hteam : game.ateam]?.logo && <img src={teams[homeWon ? game.hteam : game.ateam].logo} alt={homeWon ? game.hteam : game.ateam} className="result-logo" />}
                        <span className="result-team">{displayName(homeWon ? game.hteam : game.ateam)}</span>
                        <span className="result-score">{homeWon ? game.hscore : game.ascore}</span>
                      </div>
                      <div className="result-side side-loss">
                        {teams[homeWon ? game.ateam : game.hteam]?.logo && <img src={teams[homeWon ? game.ateam : game.hteam].logo} alt={homeWon ? game.ateam : game.hteam} className="result-logo" />}
                        <span className="result-team">{displayName(homeWon ? game.ateam : game.hteam)}</span>
                        <span className="result-score">{homeWon ? game.ascore : game.hscore}</span>
                      </div>
                    </div>
                    <div className="result-summary">{resultSummary}</div>
                    <div className="venue">{game.venue}</div>
                  </div>
                )
              })}
            </div>
            <ByeTeams round={currentResultsRound} allGames={results} />
          </>
        )}

        {!loading && page === 'fixtures' && currentFixturesRound !== null && (
          <>
            <RoundNav round={currentFixturesRound} rounds={fixturesRounds} onChange={setCurrentFixturesRound} />
            <div className="games">
              {gamesForRound(fixtures, currentFixturesRound).map(game => (
                <div key={game.id} className="game-card fixture-card" style={{ borderLeft: `8px solid ${teamColours[game.hteam] || '#ccc'}`, borderRight: `8px solid ${teamColours[game.ateam] || '#ccc'}`, cursor: 'pointer' }} onClick={() => setSelectedGame(game)}>
                  <div className="fixture-matchup">
                    <span className="fixture-team">
                      {teams[game.hteam]?.logo && <img src={teams[game.hteam].logo} alt={game.hteam} className="fixture-logo" />}
                      {displayName(game.hteam)}
                    </span>
                    <span className="fixture-vs">vs</span>
                    <span className="fixture-team">
                      {teams[game.ateam]?.logo && <img src={teams[game.ateam].logo} alt={game.ateam} className="fixture-logo" />}
                      {displayName(game.ateam)}
                    </span>
                  </div>
                  <div className="fixture-info">
                    <div className="fixture-info-row">{game.venue}</div>
                    <div className="fixture-info-row">{formatDate(game.date)}</div>
                    <div className="fixture-info-row">{formatTime(game.date)}</div>
                  </div>
                </div>
              ))}
            </div>
            <ByeTeams round={currentFixturesRound} allGames={[...results, ...fixtures]} />
          </>
        )}
      </main>
    </div>
  )
}

export default AFLPage
