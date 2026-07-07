import { useState, useEffect } from 'react'
import './App.css'

function EPLPage({ onOpenMenu }) {
  const [page, setPage] = useState('ladder')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentResultsRound, setCurrentResultsRound] = useState(null)
  const [currentFixturesRound, setCurrentFixturesRound] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [historicalGames, setHistoricalGames] = useState([])

  function goToPage(newPage) {
    setSelectedTeam(null)
    setSelectedGame(null)
    setPage(newPage)
  }

  const teamLogos = {
    'Arsenal':        'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/330px-Arsenal_FC.svg.png',
    'Aston Villa':    'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Aston_Villa_FC_new_crest.svg/330px-Aston_Villa_FC_new_crest.svg.png',
    'Bournemouth':    'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/AFC_Bournemouth_%282013%29.svg/330px-AFC_Bournemouth_%282013%29.svg.png',
    'Brentford':      'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Brentford_FC_crest.svg/330px-Brentford_FC_crest.svg.png',
    'Brighton':       'https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/Brighton_and_Hove_Albion_FC_crest.svg/330px-Brighton_and_Hove_Albion_FC_crest.svg.png',
    'Chelsea':        'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/330px-Chelsea_FC.svg.png',
    'Coventry':       'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Coventry_City_FC_crest.svg/330px-Coventry_City_FC_crest.svg.png',
    'Crystal Palace': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Crystal_Palace_FC_logo_%282022%29.svg/330px-Crystal_Palace_FC_logo_%282022%29.svg.png',
    'Everton':        'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/330px-Everton_FC_logo.svg.png',
    'Fulham':         'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Fulham_FC_%28shield%29.svg/330px-Fulham_FC_%28shield%29.svg.png',
    'Hull':           'https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Hull_City_A.F.C._logo.svg/330px-Hull_City_A.F.C._logo.svg.png',
    'Ipswich':        'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Ipswich_Town.svg/330px-Ipswich_Town.svg.png',
    'Leeds':          'https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Leeds_United_F.C._logo.svg/330px-Leeds_United_F.C._logo.svg.png',
    'Liverpool':      'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/330px-Liverpool_FC.svg.png',
    'Man City':       'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/330px-Manchester_City_FC_badge.svg.png',
    'Man Utd':        'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/330px-Manchester_United_FC_crest.svg.png',
    'Newcastle':      'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/330px-Newcastle_United_Logo.svg.png',
    "Nott'm Forest":  'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Nottingham_Forest_F.C._logo.svg/330px-Nottingham_Forest_F.C._logo.svg.png',
    'Spurs':          'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/330px-Tottenham_Hotspur.svg.png',
    'Sunderland':     'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Logo_Sunderland.svg/330px-Logo_Sunderland.svg.png',
  }

  const teamColours = {
    'Arsenal':        '#EF0107',
    'Aston Villa':    '#670E36',
    'Bournemouth':    '#DA291C',
    'Brentford':      '#E30613',
    'Brighton':       '#0057B8',
    'Burnley':        '#6C1D45',
    'Chelsea':        '#034694',
    'Coventry':       '#78D0F7',
    'Crystal Palace': '#1B458F',
    'Everton':        '#003399',
    'Fulham':         '#000000',
    'Hull':           '#F18A01',
    'Ipswich':        '#0044A9',
    'Leeds':          '#FFCD00',
    'Liverpool':      '#C8102E',
    'Man City':       '#6CABDD',
    'Man Utd':        '#DA291C',
    'Newcastle':      '#241F20',
    "Nott'm Forest":  '#DD0000',
    'Spurs':          '#132257',
    'Sunderland':     '#EB172F',
    'West Ham':       '#7A263A',
    'Wolves':         '#FDB913',
  }

  const teamInfo = {
    'Arsenal':        { coach: 'Mikel Arteta',        captain: 'Martin Ødegaard' },
    'Aston Villa':    { coach: 'Unai Emery',           captain: 'John McGinn' },
    'Bournemouth':    { coach: 'Andoni Iraola',        captain: 'Marcos Senesi' },
    'Brentford':      { coach: 'Keith Andrews',        captain: 'Nathan Collins' },
    'Brighton':       { coach: 'Fabian Hürzeler',      captain: 'Lewis Dunk' },
    'Burnley':        { coach: 'Scott Parker',         captain: 'Josh Brownhill' },
    'Chelsea':        { coach: 'Enzo Maresca',         captain: 'Reece James' },
    'Coventry':       { coach: 'Frank Lampard',        captain: 'Bobby Thomas' },
    'Crystal Palace': { coach: 'Oliver Glasner',       captain: 'Marc Guéhi' },
    'Everton':        { coach: 'David Moyes',          captain: 'Séamus Coleman' },
    'Fulham':         { coach: 'Marco Silva',          captain: 'Tom Cairney' },
    'Hull':           { coach: 'Sergej Jakirović',     captain: 'Jacob Greaves' },
    'Ipswich':        { coach: 'Kieran McKenna',       captain: 'Sam Morsy' },
    'Leeds':          { coach: 'Daniel Farke',         captain: 'Ethan Ampadu' },
    'Liverpool':      { coach: 'Arne Slot',            captain: 'Virgil van Dijk' },
    'Man City':       { coach: 'Pep Guardiola',        captain: 'Bernardo Silva' },
    'Man Utd':        { coach: 'Ruben Amorim',         captain: 'Bruno Fernandes' },
    'Newcastle':      { coach: 'Eddie Howe',           captain: 'Bruno Guimarães' },
    "Nott'm Forest":  { coach: 'Ange Postecoglou',     captain: 'Ryan Yates' },
    'Spurs':          { coach: 'Thomas Frank',         captain: 'Cristian Romero' },
    'Sunderland':     { coach: 'Régis Le Bris',        captain: 'Dan Neil' },
    'West Ham':       { coach: 'Nuno Espírito Santo',  captain: 'Jarrod Bowen' },
    'Wolves':         { coach: 'Vítor Pereira',        captain: 'Emmanuel Agbadou' },
  }

  useEffect(() => {
    fetch('/epl-api/epl-2026')
      .then(r => r.json())
      .then(data => {
        setGames(data || [])
        const played = (data || []).filter(g => g.HomeTeamScore !== null)
        const upcoming = (data || []).filter(g => g.HomeTeamScore === null)
        if (played.length > 0) {
          setCurrentResultsRound(Math.max(...played.map(g => g.RoundNumber)))
        }
        if (upcoming.length > 0) {
          setCurrentFixturesRound(Math.min(...upcoming.map(g => g.RoundNumber)))
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })

    Promise.all(
      [2023, 2024, 2025].map(y =>
        fetch(`/epl-api/epl-${y}`).then(r => r.json()).catch(() => [])
      )
    ).then(years => {
      const all = years.flatMap(d => (d || []).filter(g => g.HomeTeamScore !== null))
      setHistoricalGames(all)
    }).catch(() => {})
  }, [])

  const results = games.filter(g => g.HomeTeamScore !== null)
  const fixtures = games.filter(g => g.HomeTeamScore === null)

  // Compute ladder from results
  const teamNames = [...new Set(games.flatMap(g => [g.HomeTeam, g.AwayTeam]))]
  const ladder = teamNames.map(name => {
    const played = results.filter(g => g.HomeTeam === name || g.AwayTeam === name)
    let wins = 0, losses = 0, draws = 0, pointsFor = 0, pointsAgainst = 0
    played.forEach(g => {
      const isHome = g.HomeTeam === name
      const scored = isHome ? g.HomeTeamScore : g.AwayTeamScore
      const conceded = isHome ? g.AwayTeamScore : g.HomeTeamScore
      pointsFor += scored
      pointsAgainst += conceded
      if (scored > conceded) wins++
      else if (scored < conceded) losses++
      else draws++
    })
    return {
      name,
      wins, losses, draws,
      pts: wins * 3 + draws,
      diff: pointsFor - pointsAgainst,
      played: played.length,
    }
  }).sort((a, b) => results.length === 0 ? a.name.localeCompare(b.name) : b.pts - a.pts || b.diff - a.diff)

  function getForm(teamName) {
    const teamGames = results
      .filter(g => g.HomeTeam === teamName || g.AwayTeam === teamName)
      .sort((a, b) => a.RoundNumber - b.RoundNumber)
      .slice(-5)

    let wins = 0, losses = 0
    teamGames.forEach(g => {
      const isHome = g.HomeTeam === teamName
      const scored = isHome ? g.HomeTeamScore : g.AwayTeamScore
      const conceded = isHome ? g.AwayTeamScore : g.HomeTeamScore
      if (scored > conceded) wins++
      else if (scored < conceded) losses++
    })
    return `${wins}-${losses}`
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

  function formatTime(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }

  const resultsRounds = [...new Set(results.map(g => g.RoundNumber))].sort((a, b) => a - b)
  const fixturesRounds = [...new Set(fixtures.map(g => g.RoundNumber))].sort((a, b) => a - b)
  const gamesForRound = (list, round) => list.filter(g => g.RoundNumber === round)

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

  return (
    <div className="app">
      <header className="header" style={{ background: '#37003C' }}>
        <button className="menu-button" onClick={onOpenMenu}>☰</button>
        <img src="/epl-logo.png" alt="Premier League Logo" className="afl-logo" />
        <nav className="nav">
          <button className={page === 'ladder' ? 'active' : ''} onClick={() => goToPage('ladder')}>Ladder</button>
          <button className={page === 'results' ? 'active' : ''} onClick={() => goToPage('results')}>Results</button>
          <button className={page === 'fixtures' ? 'active' : ''} onClick={() => goToPage('fixtures')}>Fixtures</button>
        </nav>
      </header>

      {selectedGame && (() => {
        const g = selectedGame
        const homeColour = teamColours[g.HomeTeam] || '#333'
        const awayColour = teamColours[g.AwayTeam] || '#333'
        const homeLadder = ladder.findIndex(t => t.name === g.HomeTeam) + 1
        const awayLadder = ladder.findIndex(t => t.name === g.AwayTeam) + 1
        const homeSeasonData = ladder.find(t => t.name === g.HomeTeam)
        const awaySeasonData = ladder.find(t => t.name === g.AwayTeam)

        const allGames = [...historicalGames, ...results]
        const allTimeHome = allGames.filter(r => r.HomeTeam === g.HomeTeam || r.AwayTeam === g.HomeTeam)
        const allTimeHomeWins = allTimeHome.filter(r => {
          const scored = r.HomeTeam === g.HomeTeam ? r.HomeTeamScore : r.AwayTeamScore
          const conceded = r.HomeTeam === g.HomeTeam ? r.AwayTeamScore : r.HomeTeamScore
          return scored > conceded
        }).length

        const allTimeAway = allGames.filter(r => r.HomeTeam === g.AwayTeam || r.AwayTeam === g.AwayTeam)
        const allTimeAwayWins = allTimeAway.filter(r => {
          const scored = r.HomeTeam === g.AwayTeam ? r.HomeTeamScore : r.AwayTeamScore
          const conceded = r.HomeTeam === g.AwayTeam ? r.AwayTeamScore : r.HomeTeamScore
          return scored > conceded
        }).length

        function getLast5(teamName) {
          return results
            .filter(r => r.HomeTeam === teamName || r.AwayTeam === teamName)
            .sort((a, b) => a.RoundNumber - b.RoundNumber)
            .slice(-5)
            .map(r => {
              const scored = r.HomeTeam === teamName ? r.HomeTeamScore : r.AwayTeamScore
              const conceded = r.HomeTeam === teamName ? r.AwayTeamScore : r.HomeTeamScore
              if (scored > conceded) return 'W'
              if (scored < conceded) return 'L'
              return 'D'
            })
        }

        const homeForm = getLast5(g.HomeTeam)
        const awayForm = getLast5(g.AwayTeam)
        const daysUntil = Math.ceil((new Date(g.DateUtc) - new Date()) / (1000 * 60 * 60 * 24))

        return (
          <div className="game-page" style={{ animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            <button className="game-page-back" onClick={() => setSelectedGame(null)}>← Back</button>

            <div className="game-page-hero">
              <div className="game-page-hero-team">
                {teamLogos[g.HomeTeam] && <img src={teamLogos[g.HomeTeam]} alt={g.HomeTeam} className="game-page-logo" style={{ filter: 'none' }} onError={e => e.target.style.display = 'none'} />}
                <span className="game-page-team-name" style={{ color: homeColour }}>{g.HomeTeam}</span>
              </div>
              <div className="game-page-hero-vs">
                <span className="game-page-vs">VS</span>
                <span className="game-page-round">Round {g.RoundNumber}</span>
              </div>
              <div className="game-page-hero-team">
                {teamLogos[g.AwayTeam] && <img src={teamLogos[g.AwayTeam]} alt={g.AwayTeam} className="game-page-logo" style={{ filter: 'none' }} onError={e => e.target.style.display = 'none'} />}
                <span className="game-page-team-name" style={{ color: awayColour }}>{g.AwayTeam}</span>
              </div>
            </div>

            <div className="game-page-body">
              <div className="game-page-info-card">
                <div className="game-page-info-row">
                  <span className="game-page-info-label">📅</span>
                  <span>{formatDate(g.DateUtc)} · {formatTime(g.DateUtc)}</span>
                </div>
                <div className="game-page-info-row">
                  <span className="game-page-info-label">📍</span>
                  <span>{g.Location}</span>
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
                    <span className="game-page-compare-label">Manager</span>
                    <span className="game-page-compare-value">{teamInfo[g.HomeTeam]?.coach ?? '—'}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Manager</span>
                    <span className="game-page-compare-value">{teamInfo[g.AwayTeam]?.coach ?? '—'}</span>
                  </div>
                </div>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Captain</span>
                    <span className="game-page-compare-value">{teamInfo[g.HomeTeam]?.captain ?? '—'}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Captain</span>
                    <span className="game-page-compare-value">{teamInfo[g.AwayTeam]?.captain ?? '—'}</span>
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

              <div className="game-page-section-title">Season Record</div>
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
                  <span className="game-page-form-team" style={{ color: homeColour }}>{g.HomeTeam}</span>
                  <div className="game-page-form-badges">
                    {homeForm.map((r, i) => <span key={i} className={`form-badge form-${r}`}>{r}</span>)}
                  </div>
                </div>
                <div className="game-page-form-row">
                  <span className="game-page-form-team" style={{ color: awayColour }}>{g.AwayTeam}</span>
                  <div className="game-page-form-badges">
                    {awayForm.map((r, i) => <span key={i} className={`form-badge form-${r}`}>{r}</span>)}
                  </div>
                </div>
              </div>

              <div className="game-page-section-title">All Time Record (2023–present)</div>
              <div className="game-page-compare">
                <div className="game-page-compare-col" style={{ borderTop: `4px solid ${homeColour}` }}>
                  <span className="game-page-compare-label">{g.HomeTeam}</span>
                  <span className="game-page-compare-value" style={{ color: homeColour }}>{allTimeHomeWins}W</span>
                  <span className="game-page-compare-label" style={{ marginTop: 4 }}>{allTimeHome.length - allTimeHomeWins}L from {allTimeHome.length}</span>
                </div>
                <div className="game-page-compare-divider" />
                <div className="game-page-compare-col" style={{ borderTop: `4px solid ${awayColour}` }}>
                  <span className="game-page-compare-label">{g.AwayTeam}</span>
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
        const teamColour = teamColours[selectedTeam] || '#333'
        const teamResults = results
          .filter(g => g.HomeTeam === selectedTeam || g.AwayTeam === selectedTeam)
          .sort((a, b) => a.RoundNumber - b.RoundNumber)
        const last10 = teamResults.slice(-10).map(g => {
          const isHome = g.HomeTeam === selectedTeam
          const scored = isHome ? g.HomeTeamScore : g.AwayTeamScore
          const conceded = isHome ? g.AwayTeamScore : g.HomeTeamScore
          if (scored > conceded) return 'W'
          if (scored < conceded) return 'L'
          return 'D'
        })
        const nextFixture = fixtures
          .filter(g => g.HomeTeam === selectedTeam || g.AwayTeam === selectedTeam)
          .sort((a, b) => new Date(a.DateUtc) - new Date(b.DateUtc))[0] || null

        return (
          <div className="team-page" style={{ background: 'white' }}>
            <button className="back-button" onClick={() => setSelectedTeam(null)} style={{ background: `${teamColour}18`, color: teamColour }}>← Back</button>

            <div className="team-hero">
              {teamLogos[selectedTeam] && (
                <img src={teamLogos[selectedTeam]} alt={selectedTeam} className="team-hero-logo" style={{ filter: 'none' }} onError={e => e.target.style.display = 'none'} />
              )}
              <h2 className="team-page-name" style={{ color: teamColour }}>{selectedTeam}</h2>
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
                  <span className="team-hero-stat-value" style={{ color: teamColour }}>{teamData?.diff != null ? (teamData.diff > 0 ? '+' : '') + teamData.diff : '-'}</span>
                  <span className="team-hero-stat-label" style={{ color: `${teamColour}99` }}>Goal Diff</span>
                </div>
              </div>
            </div>

            <div className="team-page-body" style={{ background: teamColour }}>
              <div className="team-info-row">
                <div className="team-info-item">
                  <span className="team-info-label">Manager</span>
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

              {nextFixture && (
                <div className="team-section-card" style={{ cursor: 'pointer' }} onClick={() => { setSelectedTeam(null); setSelectedGame(nextFixture) }}>
                  <h3 className="team-section-title">Next Game</h3>
                  <div className="next-fixture-teams">
                    <div className="next-fixture-team">
                      {teamLogos[nextFixture.HomeTeam] && <img src={teamLogos[nextFixture.HomeTeam]} alt={nextFixture.HomeTeam} className="next-fixture-logo" onError={e => e.target.style.display = 'none'} />}
                      <span className="next-fixture-name">{nextFixture.HomeTeam}</span>
                    </div>
                    <span className="next-fixture-vs">vs</span>
                    <div className="next-fixture-team">
                      {teamLogos[nextFixture.AwayTeam] && <img src={teamLogos[nextFixture.AwayTeam]} alt={nextFixture.AwayTeam} className="next-fixture-logo" onError={e => e.target.style.display = 'none'} />}
                      <span className="next-fixture-name">{nextFixture.AwayTeam}</span>
                    </div>
                  </div>
                  <div className="next-fixture-details">
                    <span>Round {nextFixture.RoundNumber}</span>
                    <span>{formatDate(nextFixture.DateUtc)}</span>
                    <span>{formatTime(nextFixture.DateUtc)}</span>
                    <span>{nextFixture.Location}</span>
                  </div>
                </div>
              )}

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
                    <tr key={team.name} className={i < 4 ? 'finals' : ''} style={{ borderLeft: `8px solid ${colour}`, cursor: 'pointer' }} onClick={() => setSelectedTeam(team.name)}>
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
            <p className="legend">Highlighted rows are in the top 4 (Champions League)</p>
          </div>
        )}

        {!loading && page === 'results' && currentResultsRound === null && (
          <p className="loading">The 2026-2027 season hasn't kicked off yet — check back once games are underway.</p>
        )}

        {!loading && page === 'results' && currentResultsRound !== null && (
          <>
            <RoundNav round={currentResultsRound} rounds={resultsRounds} onChange={setCurrentResultsRound} />
            <div className="games">
              {gamesForRound(results, currentResultsRound).map(game => {
                const homeWon = game.HomeTeamScore > game.AwayTeamScore
                const drew = game.HomeTeamScore === game.AwayTeamScore
                const winner = homeWon ? game.HomeTeam : game.AwayTeam
                const margin = Math.abs(game.HomeTeamScore - game.AwayTeamScore)
                const resultSummary = drew ? 'Match drawn' : `${winner} won by ${margin} goal${margin === 1 ? '' : 's'}`
                return (
                  <div key={game.MatchNumber} className="game-card result-card" style={{ borderLeft: `8px solid ${teamColours[homeWon ? game.HomeTeam : game.AwayTeam] || '#ccc'}`, borderRight: `8px solid ${teamColours[homeWon ? game.AwayTeam : game.HomeTeam] || '#ccc'}` }}>
                    <div className="result-sides">
                      <div className="result-side side-win">
                        {teamLogos[homeWon ? game.HomeTeam : game.AwayTeam] && <img src={teamLogos[homeWon ? game.HomeTeam : game.AwayTeam]} alt={homeWon ? game.HomeTeam : game.AwayTeam} className="result-logo" onError={e => e.target.style.display = 'none'} />}
                        <span className="result-team">{homeWon ? game.HomeTeam : game.AwayTeam}</span>
                        <span className="result-score">{homeWon ? game.HomeTeamScore : game.AwayTeamScore}</span>
                      </div>
                      <div className="result-side side-loss">
                        {teamLogos[homeWon ? game.AwayTeam : game.HomeTeam] && <img src={teamLogos[homeWon ? game.AwayTeam : game.HomeTeam]} alt={homeWon ? game.AwayTeam : game.HomeTeam} className="result-logo" onError={e => e.target.style.display = 'none'} />}
                        <span className="result-team">{homeWon ? game.AwayTeam : game.HomeTeam}</span>
                        <span className="result-score">{homeWon ? game.AwayTeamScore : game.HomeTeamScore}</span>
                      </div>
                    </div>
                    <div className="result-summary">{resultSummary}</div>
                    <div className="venue">{game.Location}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {!loading && page === 'fixtures' && currentFixturesRound !== null && (
          <>
            <RoundNav round={currentFixturesRound} rounds={fixturesRounds} onChange={setCurrentFixturesRound} />
            <div className="games">
              {gamesForRound(fixtures, currentFixturesRound).map(game => (
                <div key={game.MatchNumber} className="game-card fixture-card" style={{ borderLeft: `8px solid ${teamColours[game.HomeTeam] || '#ccc'}`, borderRight: `8px solid ${teamColours[game.AwayTeam] || '#ccc'}`, cursor: 'pointer' }} onClick={() => setSelectedGame(game)}>
                  <div className="fixture-matchup">
                    <span className="fixture-team">
                      {teamLogos[game.HomeTeam] && <img src={teamLogos[game.HomeTeam]} alt={game.HomeTeam} className="fixture-logo" onError={e => e.target.style.display = 'none'} />}
                      {game.HomeTeam}
                    </span>
                    <span className="fixture-vs">vs</span>
                    <span className="fixture-team">
                      {teamLogos[game.AwayTeam] && <img src={teamLogos[game.AwayTeam]} alt={game.AwayTeam} className="fixture-logo" onError={e => e.target.style.display = 'none'} />}
                      {game.AwayTeam}
                    </span>
                  </div>
                  <div className="fixture-info">
                    <div className="fixture-info-row">{game.Location}</div>
                    <div className="fixture-info-row">{formatDate(game.DateUtc)}</div>
                    <div className="fixture-info-row">{formatTime(game.DateUtc)}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default EPLPage
