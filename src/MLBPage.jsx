import { useState, useEffect } from 'react'
import './App.css'

const teamLogoIds = {
  'Athletics': 133, 'Pirates': 134, 'Padres': 135, 'Mariners': 136, 'Giants': 137,
  'Cardinals': 138, 'Rays': 139, 'Rangers': 140, 'Blue Jays': 141, 'Twins': 142,
  'Phillies': 143, 'Braves': 144, 'White Sox': 145, 'Marlins': 146, 'Yankees': 147,
  'Brewers': 158, 'Angels': 108, 'Diamondbacks': 109, 'Orioles': 110, 'Red Sox': 111,
  'Cubs': 112, 'Reds': 113, 'Guardians': 114, 'Rockies': 115, 'Tigers': 116,
  'Astros': 117, 'Royals': 118, 'Dodgers': 119, 'Nationals': 120, 'Mets': 121,
}

function mlbLogo(name) {
  const id = teamLogoIds[name]
  return id ? `https://www.mlbstatic.com/team-logos/${id}.svg` : null
}

const teamColours = {
  'Diamondbacks': '#A71930', 'Braves': '#CE1141', 'Orioles': '#DF4601', 'Red Sox': '#BD3039',
  'Cubs': '#0E3386', 'White Sox': '#27251F', 'Reds': '#C6011F', 'Guardians': '#00385D',
  'Rockies': '#333366', 'Tigers': '#0C2340', 'Astros': '#EB6E1F', 'Royals': '#004687',
  'Angels': '#BA0021', 'Dodgers': '#005A9C', 'Marlins': '#00A3E0', 'Brewers': '#12284B',
  'Twins': '#002B5C', 'Mets': '#002D72', 'Yankees': '#132448', 'Athletics': '#003831',
  'Phillies': '#E81828', 'Pirates': '#FDB827', 'Padres': '#2F241D', 'Giants': '#FD5A1E',
  'Mariners': '#0C2C56', 'Cardinals': '#C41E3A', 'Rays': '#092C5C', 'Rangers': '#003278',
  'Blue Jays': '#134A8E', 'Nationals': '#AB0003',
}

const teamInfo = {
  'Diamondbacks': { coach: 'Torey Lovullo', captain: '—' },
  'Braves':       { coach: 'Brian Snitker', captain: '—' },
  'Orioles':      { coach: 'Brandon Hyde',  captain: '—' },
  'Red Sox':      { coach: 'Alex Cora',     captain: '—' },
  'Cubs':         { coach: 'Craig Counsell', captain: '—' },
  'White Sox':    { coach: 'Will Venable',  captain: '—' },
  'Reds':         { coach: 'Terry Francona', captain: '—' },
  'Guardians':    { coach: 'Stephen Vogt',  captain: '—' },
  'Rockies':      { coach: 'Warren Schaeffer', captain: '—' },
  'Tigers':       { coach: 'A.J. Hinch',    captain: '—' },
  'Astros':       { coach: 'Joe Espada',    captain: '—' },
  'Royals':       { coach: 'Matt Quatraro', captain: '—' },
  'Angels':       { coach: 'Ron Washington', captain: '—' },
  'Dodgers':      { coach: 'Dave Roberts',  captain: '—' },
  'Marlins':      { coach: 'Clayton McCullough', captain: '—' },
  'Brewers':      { coach: 'Pat Murphy',    captain: '—' },
  'Twins':        { coach: 'Rocco Baldelli', captain: '—' },
  'Mets':         { coach: 'Carlos Mendoza', captain: '—' },
  'Yankees':      { coach: 'Aaron Boone',   captain: 'Aaron Judge' },
  'Athletics':    { coach: 'Mark Kotsay',   captain: '—' },
  'Phillies':     { coach: 'Rob Thomson',   captain: '—' },
  'Pirates':      { coach: 'Don Kelly',     captain: '—' },
  'Padres':       { coach: 'Mike Shildt',   captain: '—' },
  'Giants':       { coach: 'Bob Melvin',    captain: '—' },
  'Mariners':     { coach: 'Dan Wilson',    captain: '—' },
  'Cardinals':    { coach: 'Oliver Marmol', captain: '—' },
  'Rays':         { coach: 'Kevin Cash',    captain: '—' },
  'Rangers':      { coach: 'Bruce Bochy',   captain: '—' },
  'Blue Jays':    { coach: 'John Schneider', captain: '—' },
  'Nationals':    { coach: 'Dave Martinez', captain: '—' },
}

function dateStr(d) {
  return d.toISOString().slice(0, 10)
}

function MLBPage({ onOpenMenu }) {
  const [page, setPage] = useState('ladder')
  const [ladder, setLadder] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [liveGames, setLiveGames] = useState([])
  const [resultsDate, setResultsDate] = useState(null)
  const [fixturesDate, setFixturesDate] = useState(null)
  const [resultsGames, setResultsGames] = useState([])
  const [fixturesGames, setFixturesGames] = useState([])
  const [teamSchedules, setTeamSchedules] = useState({})
  const [divisions, setDivisions] = useState([])
  const [ladderLeague, setLadderLeague] = useState('AL')

  function goToPage(newPage) {
    setSelectedTeam(null)
    setSelectedGame(null)
    setPage(newPage)
  }

  function fetchLadder() {
    const divisionNames = {
      200: 'AL West', 201: 'AL East', 202: 'AL Central',
      203: 'NL West', 204: 'NL East', 205: 'NL Central',
    }
    const divisionOrder = [201, 202, 200, 204, 205, 203]

    return fetch('https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2026')
      .then(r => r.json())
      .then(data => {
        const divisions = (data.records || [])
          .slice()
          .sort((a, b) => divisionOrder.indexOf(a.division.id) - divisionOrder.indexOf(b.division.id))
          .map(div => {
            const teams = div.teamRecords.map(t => ({
              name: t.team.name.split(' ').pop() === 'Sox' ? t.team.name.split(' ').slice(-2).join(' ') : t.team.name.split(' ').pop(),
              wins: t.leagueRecord.wins,
              losses: t.leagueRecord.losses,
              pct: parseFloat(t.leagueRecord.pct),
              gamesBack: t.divisionGamesBack,
              streak: t.streak?.streakCode ?? '-',
              divisionRank: parseInt(t.divisionRank, 10),
            })).sort((a, b) => a.divisionRank - b.divisionRank)
            const league = [200, 201, 202].includes(div.division.id) ? 'AL' : 'NL'
            return { name: divisionNames[div.division.id] || 'Division', teams, league }
          })

        setDivisions(divisions)
        setLadder(divisions.flatMap(d => d.teams).sort((a, b) => b.pct - a.pct))
      })
  }

  function fetchDayGames(date, isLive) {
    return fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=team,linescore`)
      .then(r => r.json())
      .then(data => {
        const games = (data.dates?.[0]?.games || []).map(g => ({
          id: g.gamePk,
          date: g.gameDate,
          venue: g.venue?.name,
          status: g.status.detailedState,
          home: g.teams.home.team.name.split(' ').pop() === 'Sox' ? g.teams.home.team.name.split(' ').slice(-2).join(' ') : g.teams.home.team.name.split(' ').pop(),
          away: g.teams.away.team.name.split(' ').pop() === 'Sox' ? g.teams.away.team.name.split(' ').slice(-2).join(' ') : g.teams.away.team.name.split(' ').pop(),
          homeScore: g.teams.home.score,
          awayScore: g.teams.away.score,
          inning: g.linescore?.currentInningOrdinal,
          isLive: g.status.abstractGameState === 'Live',
        }))
        return games
      })
  }

  function loadAll() {
    const today = new Date()
    const todayStr = dateStr(today)

    fetchLadder().catch(() => {})

    fetchDayGames(todayStr).then(games => {
      setLiveGames(games.filter(g => g.isLive))
    }).catch(() => {})

    // find most recent day with finished games (search back up to 5 days)
    async function findResultsDay() {
      for (let i = 0; i < 6; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const ds = dateStr(d)
        const games = await fetchDayGames(ds)
        const finished = games.filter(g => g.status === 'Final')
        if (finished.length > 0) {
          setResultsDate(ds)
          setResultsGames(finished)
          return
        }
      }
    }

    async function findFixturesDay() {
      for (let i = 0; i < 6; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const ds = dateStr(d)
        const games = await fetchDayGames(ds)
        const scheduled = games.filter(g => g.status === 'Scheduled' || g.status === 'Pre-Game')
        if (scheduled.length > 0) {
          setFixturesDate(ds)
          setFixturesGames(scheduled)
          return
        }
      }
    }

    Promise.all([findResultsDay(), findFixturesDay()])
      .then(() => setLoading(false))
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadAll()
    const interval = setInterval(loadAll, 30000)
    return () => clearInterval(interval)
  }, [])

  function changeResultsDate(delta) {
    const d = new Date(resultsDate)
    d.setDate(d.getDate() + delta)
    const ds = dateStr(d)
    setResultsDate(ds)
    fetchDayGames(ds).then(games => setResultsGames(games.filter(g => g.status === 'Final')))
  }

  function changeFixturesDate(delta) {
    const d = new Date(fixturesDate)
    d.setDate(d.getDate() + delta)
    const ds = dateStr(d)
    setFixturesDate(ds)
    fetchDayGames(ds).then(games => setFixturesGames(games.filter(g => g.status === 'Scheduled' || g.status === 'Pre-Game')))
  }

  function formatDateLabel(ds) {
    if (!ds) return ''
    const date = new Date(ds + 'T12:00:00')
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`
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

  function DateNav({ label, onChange }) {
    return (
      <div className="round-nav">
        <button className="round-arrow" onClick={() => onChange(-1)}>&#8249;</button>
        <span className="round-label">{label}</span>
        <button className="round-arrow" onClick={() => onChange(1)}>&#8250;</button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header" style={{ background: '#041E42' }}>
        <button className="menu-button" onClick={onOpenMenu}>☰</button>
        <img src="/mlb-logo.png" alt="MLB Logo" className="afl-logo" />
        <nav className="nav">
          <button className={page === 'ladder' ? 'active' : ''} onClick={() => goToPage('ladder')}>Ladder</button>
          <button className={page === 'results' ? 'active' : ''} onClick={() => goToPage('results')}>Results</button>
          <button className={page === 'fixtures' ? 'active' : ''} onClick={() => goToPage('fixtures')}>Fixtures</button>
        </nav>
      </header>

      {selectedGame && (() => {
        const g = selectedGame
        const homeColour = teamColours[g.home] || '#333'
        const awayColour = teamColours[g.away] || '#333'
        const homeLadder = ladder.findIndex(t => t.name === g.home) + 1
        const awayLadder = ladder.findIndex(t => t.name === g.away) + 1
        const homeData = ladder.find(t => t.name === g.home)
        const awayData = ladder.find(t => t.name === g.away)

        return (
          <div className="game-page" style={{ animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            <button className="game-page-back" onClick={() => setSelectedGame(null)}>← Back</button>

            <div className="game-page-hero">
              <div className="game-page-hero-team">
                {mlbLogo(g.home) && <img src={mlbLogo(g.home)} alt={g.home} className="game-page-logo" style={{ filter: 'none' }} onError={e => e.target.style.display = 'none'} />}
                <span className="game-page-team-name" style={{ color: homeColour }}>{g.home}</span>
              </div>
              <div className="game-page-hero-vs">
                <span className="game-page-vs">VS</span>
                {g.isLive && <span className="game-page-round" style={{ background: '#e0303022', color: '#e03030' }}>{g.inning}</span>}
              </div>
              <div className="game-page-hero-team">
                {mlbLogo(g.away) && <img src={mlbLogo(g.away)} alt={g.away} className="game-page-logo" style={{ filter: 'none' }} onError={e => e.target.style.display = 'none'} />}
                <span className="game-page-team-name" style={{ color: awayColour }}>{g.away}</span>
              </div>
            </div>

            <div className="game-page-body">
              <div className="game-page-info-card">
                <div className="game-page-info-row">
                  <span className="game-page-info-label">📅</span>
                  <span>{formatDateLabel(dateStr(new Date(g.date)))} · {formatTime(g.date)}</span>
                </div>
                <div className="game-page-info-row">
                  <span className="game-page-info-label">📍</span>
                  <span>{g.venue}</span>
                </div>
                {(g.homeScore != null) && (
                  <div className="game-page-info-row">
                    <span className="game-page-info-label">🏆</span>
                    <span>{g.home} {g.homeScore} – {g.awayScore} {g.away} ({g.status})</span>
                  </div>
                )}
              </div>

              <div className="game-page-section-title">Team Info</div>
              <div className="game-page-info-grid" style={{ borderTop: `4px solid transparent`, borderImage: `linear-gradient(to right, ${homeColour} 50%, ${awayColour} 50%) 1` }}>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Manager</span>
                    <span className="game-page-compare-value">{teamInfo[g.home]?.coach ?? '—'}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Manager</span>
                    <span className="game-page-compare-value">{teamInfo[g.away]?.coach ?? '—'}</span>
                  </div>
                </div>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Ranking</span>
                    <span className="game-page-compare-value" style={{ color: homeColour }}>#{homeLadder}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Ranking</span>
                    <span className="game-page-compare-value" style={{ color: awayColour }}>#{awayLadder}</span>
                  </div>
                </div>
              </div>

              <div className="game-page-section-title">2026 Season Record</div>
              <div className="game-page-info-grid" style={{ borderTop: `4px solid transparent`, borderImage: `linear-gradient(to right, ${homeColour} 50%, ${awayColour} 50%) 1` }}>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Wins</span>
                    <span className="game-page-compare-value" style={{ color: '#2a9d2a' }}>{homeData?.wins ?? '—'}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Wins</span>
                    <span className="game-page-compare-value" style={{ color: '#2a9d2a' }}>{awayData?.wins ?? '—'}</span>
                  </div>
                </div>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Losses</span>
                    <span className="game-page-compare-value" style={{ color: '#cc3333' }}>{homeData?.losses ?? '—'}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Losses</span>
                    <span className="game-page-compare-value" style={{ color: '#cc3333' }}>{awayData?.losses ?? '—'}</span>
                  </div>
                </div>
                <div className="game-page-grid-row">
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Streak</span>
                    <span className="game-page-compare-value">{homeData?.streak ?? '—'}</span>
                  </div>
                  <div className="game-page-grid-divider" />
                  <div className="game-page-grid-cell">
                    <span className="game-page-compare-label">Streak</span>
                    <span className="game-page-compare-value">{awayData?.streak ?? '—'}</span>
                  </div>
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

        return (
          <div className="team-page" style={{ background: 'white' }}>
            <button className="back-button" onClick={() => setSelectedTeam(null)} style={{ background: `${teamColour}18`, color: teamColour }}>← Back</button>

            <div className="team-hero">
              {mlbLogo(selectedTeam) && <img src={mlbLogo(selectedTeam)} alt={selectedTeam} className="team-hero-logo" style={{ filter: 'none' }} onError={e => e.target.style.display = 'none'} />}
              <h2 className="team-page-name" style={{ color: teamColour }}>{selectedTeam}</h2>
              <div className="team-hero-stats" style={{ background: `${teamColour}18` }}>
                <div className="team-hero-stat">
                  <span className="team-hero-stat-value" style={{ color: teamColour }}>#{ladderPos}</span>
                  <span className="team-hero-stat-label" style={{ color: `${teamColour}99` }}>Ranking</span>
                </div>
                <div className="team-hero-divider" style={{ background: `${teamColour}40` }} />
                <div className="team-hero-stat">
                  <span className="team-hero-stat-value" style={{ color: teamColour }}>{teamData?.pct?.toFixed(3) ?? '-'}</span>
                  <span className="team-hero-stat-label" style={{ color: `${teamColour}99` }}>Win Pct</span>
                </div>
                <div className="team-hero-divider" style={{ background: `${teamColour}40` }} />
                <div className="team-hero-stat">
                  <span className="team-hero-stat-value" style={{ color: teamColour }}>{teamData?.streak ?? '-'}</span>
                  <span className="team-hero-stat-label" style={{ color: `${teamColour}99` }}>Streak</span>
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
                  <span className="team-info-label">Games Back</span>
                  <span className="team-info-value">{teamData?.gamesBack ?? '—'}</span>
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
              </div>
            </div>
          </div>
        )
      })()}

      <main className="main" style={{ display: selectedTeam || selectedGame ? 'none' : 'block' }}>
        {loading && <p className="loading">Loading data...</p>}
        {error && <p className="loading" style={{color: 'red'}}>Error: {error}</p>}

        {!loading && page === 'ladder' && (
          <>
            <div className="league-tabs">
              <button className={ladderLeague === 'AL' ? 'active' : ''} onClick={() => setLadderLeague('AL')}>American League</button>
              <button className={ladderLeague === 'NL' ? 'active' : ''} onClick={() => setLadderLeague('NL')}>National League</button>
            </div>
            {divisions.filter(div => div.league === ladderLeague).map(div => (
              <div className="table-wrap" key={div.name} style={{ marginBottom: 20 }}>
                <h3 className="team-form-title" style={{ margin: '0 0 8px 4px' }}>{div.name}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team</th>
                      <th>W</th>
                      <th>L</th>
                      <th>Pct</th>
                      <th>GB</th>
                      <th>Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {div.teams.map(team => {
                      const colour = teamColours[team.name] || '#333'
                      return (
                        <tr key={team.name} style={{ borderLeft: `8px solid ${colour}`, cursor: 'pointer' }} onClick={() => setSelectedTeam(team.name)}>
                          <td>
                            <span className="rank-circle" style={{ backgroundColor: colour }}>{team.divisionRank}</span>
                          </td>
                          <td className="team-name clickable-team">{team.name}</td>
                          <td>{team.wins}</td>
                          <td>{team.losses}</td>
                          <td><strong>{team.pct.toFixed(3)}</strong></td>
                          <td>{team.gamesBack}</td>
                          <td className="form-record">{team.streak}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))}
            <p className="legend">Ranked by division, matching the official MLB standings page</p>
          </>
        )}

        {!loading && page === 'results' && (
          <>
            <DateNav label={formatDateLabel(resultsDate)} onChange={changeResultsDate} />
            {liveGames.length > 0 && (
              <div className="live-section">
                <div className="live-section-header">
                  <span className="live-dot" />
                  Live Now
                </div>
                {liveGames.map(game => (
                  <div key={game.id} className="game-card live-card" style={{ borderLeft: `8px solid ${teamColours[game.home] || '#ccc'}`, borderRight: `8px solid ${teamColours[game.away] || '#ccc'}`, cursor: 'pointer' }} onClick={() => setSelectedGame(game)}>
                    <div className="result-sides">
                      <div className="result-side">
                        {mlbLogo(game.home) && <img src={mlbLogo(game.home)} alt="" className="result-logo" onError={e => e.target.style.display = 'none'} />}
                        <span className="result-team">{game.home}</span>
                        <span className="result-score">{game.homeScore}</span>
                      </div>
                      <div className="result-side">
                        {mlbLogo(game.away) && <img src={mlbLogo(game.away)} alt="" className="result-logo" onError={e => e.target.style.display = 'none'} />}
                        <span className="result-team">{game.away}</span>
                        <span className="result-score">{game.awayScore}</span>
                      </div>
                    </div>
                    <div className="venue">{game.venue}</div>
                    <div className="live-progress">{game.inning}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="games">
              {resultsGames.length === 0 && <p className="loading">No completed games on this date.</p>}
              {resultsGames.map(game => {
                const homeWon = game.homeScore > game.awayScore
                const margin = Math.abs(game.homeScore - game.awayScore)
                return (
                  <div key={game.id} className="game-card result-card" style={{ borderLeft: `8px solid ${teamColours[homeWon ? game.home : game.away] || '#ccc'}`, borderRight: `8px solid ${teamColours[homeWon ? game.away : game.home] || '#ccc'}`, cursor: 'pointer' }} onClick={() => setSelectedGame(game)}>
                    <div className="result-sides">
                      <div className="result-side side-win">
                        {mlbLogo(homeWon ? game.home : game.away) && <img src={mlbLogo(homeWon ? game.home : game.away)} alt="" className="result-logo" onError={e => e.target.style.display = 'none'} />}
                        <span className="result-team">{homeWon ? game.home : game.away}</span>
                        <span className="result-score">{homeWon ? game.homeScore : game.awayScore}</span>
                      </div>
                      <div className="result-side side-loss">
                        {mlbLogo(homeWon ? game.away : game.home) && <img src={mlbLogo(homeWon ? game.away : game.home)} alt="" className="result-logo" onError={e => e.target.style.display = 'none'} />}
                        <span className="result-team">{homeWon ? game.away : game.home}</span>
                        <span className="result-score">{homeWon ? game.awayScore : game.homeScore}</span>
                      </div>
                    </div>
                    <div className="result-summary">{homeWon ? game.home : game.away} won by {margin} run{margin === 1 ? '' : 's'}</div>
                    <div className="venue">{game.venue}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {!loading && page === 'fixtures' && (
          <>
            <DateNav label={formatDateLabel(fixturesDate)} onChange={changeFixturesDate} />
            <div className="games">
              {fixturesGames.length === 0 && <p className="loading">No scheduled games on this date.</p>}
              {fixturesGames.map(game => (
                <div key={game.id} className="game-card fixture-card" style={{ borderLeft: `8px solid ${teamColours[game.home] || '#ccc'}`, borderRight: `8px solid ${teamColours[game.away] || '#ccc'}`, cursor: 'pointer' }} onClick={() => setSelectedGame(game)}>
                  <div className="fixture-matchup">
                    <span className="fixture-team">
                      {mlbLogo(game.away) && <img src={mlbLogo(game.away)} alt={game.away} className="fixture-logo" onError={e => e.target.style.display = 'none'} />}
                      {game.away}
                    </span>
                    <span className="fixture-vs">@</span>
                    <span className="fixture-team">
                      {mlbLogo(game.home) && <img src={mlbLogo(game.home)} alt={game.home} className="fixture-logo" onError={e => e.target.style.display = 'none'} />}
                      {game.home}
                    </span>
                  </div>
                  <div className="fixture-info">
                    <div className="fixture-info-row">{game.venue}</div>
                    <div className="fixture-info-row">{formatTime(game.date)}</div>
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

export default MLBPage
