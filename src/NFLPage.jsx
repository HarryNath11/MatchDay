import { useState, useEffect } from 'react'
import './App.css'

const DIVISIONS = {
  'AFC East':    ['Buffalo Bills', 'Miami Dolphins', 'New England Patriots', 'New York Jets'],
  'AFC North':   ['Baltimore Ravens', 'Cincinnati Bengals', 'Cleveland Browns', 'Pittsburgh Steelers'],
  'AFC South':   ['Houston Texans', 'Indianapolis Colts', 'Jacksonville Jaguars', 'Tennessee Titans'],
  'AFC West':    ['Denver Broncos', 'Kansas City Chiefs', 'Las Vegas Raiders', 'Los Angeles Chargers'],
  'NFC East':    ['Dallas Cowboys', 'New York Giants', 'Philadelphia Eagles', 'Washington Commanders'],
  'NFC North':   ['Chicago Bears', 'Detroit Lions', 'Green Bay Packers', 'Minnesota Vikings'],
  'NFC South':   ['Atlanta Falcons', 'Carolina Panthers', 'New Orleans Saints', 'Tampa Bay Buccaneers'],
  'NFC West':    ['Arizona Cardinals', 'Los Angeles Rams', 'San Francisco 49ers', 'Seattle Seahawks'],
}

function NFLPage({ onOpenMenu }) {
  const [page, setPage] = useState('fixtures')
  const [teams, setTeams] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fixturesWeek, setFixturesWeek] = useState(1)
  const [fixturesGames, setFixturesGames] = useState([])
  const [resultsWeek, setResultsWeek] = useState(1)
  const [resultsGames, setResultsGames] = useState([])
  const [divisions, setDivisions] = useState([])
  const [ladderConference, setLadderConference] = useState('AFC')
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)

  function goToPage(newPage) {
    setSelectedTeam(null)
    setSelectedGame(null)
    setPage(newPage)
  }

  useEffect(() => {
    // Week 1 features all 32 teams — pull colours/logos from the schedule itself,
    // since ESPN's dedicated /teams endpoint doesn't send CORS headers.
    fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week=1&dates=2026')
      .then(r => r.json())
      .then(data => {
        const teamMap = {}
        ;(data.events || []).forEach(e => {
          e.competitions[0].competitors.forEach(c => {
            teamMap[c.team.displayName] = {
              colour: `#${c.team.color}`,
              logo: c.team.logo,
              abbreviation: c.team.abbreviation,
            }
          })
        })
        setTeams(teamMap)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })

    // Fresh 2026 season — no carryover from last year, alphabetical until games are played
    const divs = Object.entries(DIVISIONS).map(([divName, teamNames]) => {
      const divTeams = teamNames
        .map(name => ({ name, wins: 0, losses: 0, ties: 0, pct: 0, streak: '-' }))
        .sort((a, b) => a.name.localeCompare(b.name))
      return { name: divName, teams: divTeams }
    })
    setDivisions(divs)
  }, [])

  const ladder = divisions.flatMap(d => d.teams)

  function fetchWeek(week) {
    return fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week=${week}&dates=2026`)
      .then(r => r.json())
      .then(data => (data.events || []).map(e => {
        const comp = e.competitions[0]
        const home = comp.competitors.find(c => c.homeAway === 'home')
        const away = comp.competitors.find(c => c.homeAway === 'away')
        return {
          id: e.id,
          date: e.date,
          venue: comp.venue?.fullName,
          week,
          home: home.team.displayName,
          away: away.team.displayName,
          homeScore: home.score,
          awayScore: away.score,
          state: comp.status?.type?.state,
          detail: comp.status?.type?.detail,
        }
      }))
  }

  useEffect(() => {
    fetchWeek(fixturesWeek).then(games => setFixturesGames(games.filter(g => g.state !== 'post'))).catch(() => {})
  }, [fixturesWeek])

  useEffect(() => {
    fetchWeek(resultsWeek).then(games => setResultsGames(games.filter(g => g.state === 'post'))).catch(() => {})
  }, [resultsWeek])

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

  function WeekNav({ week, onChange }) {
    return (
      <div className="round-nav">
        <button className="round-arrow" onClick={() => onChange(week - 1)} disabled={week <= 1}>&#8249;</button>
        <span className="round-label">Week {week}</span>
        <button className="round-arrow" onClick={() => onChange(week + 1)} disabled={week >= 18}>&#8250;</button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header" style={{ background: '#013369' }}>
        <button className="menu-button" onClick={onOpenMenu}>☰</button>
        <img src="/nfl-logo.png" alt="NFL Logo" className="afl-logo" />
        <nav className="nav">
          <button className={page === 'ladder' ? 'active' : ''} onClick={() => goToPage('ladder')}>Ladder</button>
          <button className={page === 'results' ? 'active' : ''} onClick={() => goToPage('results')}>Results</button>
          <button className={page === 'fixtures' ? 'active' : ''} onClick={() => goToPage('fixtures')}>Fixtures</button>
        </nav>
      </header>

      {selectedGame && (() => {
        const g = selectedGame
        const homeColour = teams[g.home]?.colour || '#333'
        const awayColour = teams[g.away]?.colour || '#333'

        return (
          <div className="game-page" style={{ animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            <button className="game-page-back" onClick={() => setSelectedGame(null)}>← Back</button>

            <div className="game-page-hero">
              <div className="game-page-hero-team">
                {teams[g.home]?.logo && <img src={teams[g.home].logo} alt={g.home} className="game-page-logo" style={{ filter: 'none' }} onError={e => e.target.style.display = 'none'} />}
                <span className="game-page-team-name" style={{ color: homeColour }}>{g.home}</span>
              </div>
              <div className="game-page-hero-vs">
                <span className="game-page-vs">VS</span>
                <span className="game-page-round">Week {g.week}</span>
              </div>
              <div className="game-page-hero-team">
                {teams[g.away]?.logo && <img src={teams[g.away].logo} alt={g.away} className="game-page-logo" style={{ filter: 'none' }} onError={e => e.target.style.display = 'none'} />}
                <span className="game-page-team-name" style={{ color: awayColour }}>{g.away}</span>
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
                {g.state === 'post' && (
                  <div className="game-page-info-row">
                    <span className="game-page-info-label">🏆</span>
                    <span>{g.home} {g.homeScore} – {g.awayScore} {g.away}</span>
                  </div>
                )}
                {g.state === 'in' && (
                  <div className="game-page-info-row">
                    <span className="game-page-info-label">🔴</span>
                    <span>Live: {g.home} {g.homeScore} – {g.awayScore} {g.away} ({g.detail})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {selectedTeam && (() => {
        const teamColour = teams[selectedTeam]?.colour || '#333'
        const teamData = ladder.find(t => t.name === selectedTeam)
        const ladderPos = ladder.findIndex(t => t.name === selectedTeam) + 1
        const division = divisions.find(d => d.teams.some(t => t.name === selectedTeam))
        return (
          <div className="team-page" style={{ background: 'white' }}>
            <button className="back-button" onClick={() => setSelectedTeam(null)} style={{ background: `${teamColour}18`, color: teamColour }}>← Back</button>
            <div className="team-hero">
              {teams[selectedTeam]?.logo && (
                <img src={teams[selectedTeam].logo} alt={selectedTeam} className="team-hero-logo" style={{ filter: 'none' }} onError={e => e.target.style.display = 'none'} />
              )}
              <h2 className="team-page-name" style={{ color: teamColour }}>{selectedTeam}</h2>
              <div className="team-hero-stats" style={{ background: `${teamColour}18` }}>
                <div className="team-hero-stat">
                  <span className="team-hero-stat-value" style={{ color: teamColour }}>#{ladderPos}</span>
                  <span className="team-hero-stat-label" style={{ color: `${teamColour}99` }}>{division?.name ?? 'Rank'}</span>
                </div>
                <div className="team-hero-divider" style={{ background: `${teamColour}40` }} />
                <div className="team-hero-stat">
                  <span className="team-hero-stat-value" style={{ color: teamColour }}>{teamData ? `${teamData.wins}-${teamData.losses}${teamData.ties ? '-' + teamData.ties : ''}` : '-'}</span>
                  <span className="team-hero-stat-label" style={{ color: `${teamColour}99` }}>Record</span>
                </div>
                <div className="team-hero-divider" style={{ background: `${teamColour}40` }} />
                <div className="team-hero-stat">
                  <span className="team-hero-stat-value" style={{ color: teamColour }}>{teamData?.streak ?? '-'}</span>
                  <span className="team-hero-stat-label" style={{ color: `${teamColour}99` }}>Streak</span>
                </div>
              </div>
            </div>
            <div className="team-page-body" style={{ background: teamColour }}>
              {(!teamData || (teamData.wins === 0 && teamData.losses === 0)) && (
                <p style={{ color: 'white', textAlign: 'center', padding: '20px 0' }}>Season hasn't started yet — check the Fixtures tab for the 2026 schedule.</p>
              )}
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
              <button className={ladderConference === 'AFC' ? 'active' : ''} onClick={() => setLadderConference('AFC')}>AFC</button>
              <button className={ladderConference === 'NFC' ? 'active' : ''} onClick={() => setLadderConference('NFC')}>NFC</button>
            </div>
            {divisions.filter(div => div.name.startsWith(ladderConference)).map(div => (
              <div className="table-wrap" key={div.name} style={{ marginBottom: 20 }}>
                <h3 className="team-form-title" style={{ margin: '0 0 8px 4px' }}>{div.name}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team</th>
                      <th>W</th>
                      <th>L</th>
                      <th>T</th>
                      <th>Pct</th>
                      <th>Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {div.teams.map((team, i) => {
                      const colour = teams[team.name]?.colour || '#333'
                      return (
                        <tr key={team.name} style={{ borderLeft: `8px solid ${colour}`, cursor: 'pointer' }} onClick={() => setSelectedTeam(team.name)}>
                          <td>
                            <span className="rank-circle" style={{ backgroundColor: colour }}>{i + 1}</span>
                          </td>
                          <td className="team-name clickable-team">{team.name}</td>
                          <td>{team.wins}</td>
                          <td>{team.losses}</td>
                          <td>{team.ties}</td>
                          <td><strong>{team.pct.toFixed(3)}</strong></td>
                          <td className="form-record">{team.streak}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))}
            <p className="legend">Ranked by division · will populate as the 2026 season kicks off</p>
          </>
        )}

        {!loading && page === 'results' && (
          <>
            <WeekNav week={resultsWeek} onChange={setResultsWeek} />
            <div className="games">
              {resultsGames.length === 0 && <p className="loading">No completed games for this week yet.</p>}
              {resultsGames.map(game => {
                const homeWon = game.homeScore > game.awayScore
                const margin = Math.abs(game.homeScore - game.awayScore)
                return (
                  <div
                    key={game.id}
                    className="game-card result-card"
                    style={{ borderLeft: `8px solid ${teams[homeWon ? game.home : game.away]?.colour || '#ccc'}`, borderRight: `8px solid ${teams[homeWon ? game.away : game.home]?.colour || '#ccc'}`, cursor: 'pointer' }}
                    onClick={() => setSelectedGame(game)}
                  >
                    <div className="result-sides">
                      <div className="result-side side-win">
                        {teams[homeWon ? game.home : game.away]?.logo && <img src={teams[homeWon ? game.home : game.away].logo} alt="" className="result-logo" onError={e => e.target.style.display = 'none'} />}
                        <span className="result-team">{homeWon ? game.home : game.away}</span>
                        <span className="result-score">{homeWon ? game.homeScore : game.awayScore}</span>
                      </div>
                      <div className="result-side side-loss">
                        {teams[homeWon ? game.away : game.home]?.logo && <img src={teams[homeWon ? game.away : game.home].logo} alt="" className="result-logo" onError={e => e.target.style.display = 'none'} />}
                        <span className="result-team">{homeWon ? game.away : game.home}</span>
                        <span className="result-score">{homeWon ? game.awayScore : game.homeScore}</span>
                      </div>
                    </div>
                    <div className="result-summary">{homeWon ? game.home : game.away} won by {margin} point{margin === 1 ? '' : 's'}</div>
                    <div className="venue">{game.venue}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {!loading && page === 'fixtures' && (
          <>
            <WeekNav week={fixturesWeek} onChange={setFixturesWeek} />
            <div className="games">
              {fixturesGames.length === 0 && <p className="loading">No games scheduled for this week.</p>}
              {fixturesGames.map(game => (
                <div
                  key={game.id}
                  className="game-card fixture-card"
                  style={{ borderLeft: `8px solid ${teams[game.home]?.colour || '#ccc'}`, borderRight: `8px solid ${teams[game.away]?.colour || '#ccc'}`, cursor: 'pointer' }}
                  onClick={() => setSelectedGame(game)}
                >
                  <div className="fixture-matchup">
                    <span className="fixture-team">
                      {teams[game.away]?.logo && <img src={teams[game.away].logo} alt={game.away} className="fixture-logo" onError={e => e.target.style.display = 'none'} />}
                      {game.away}
                    </span>
                    <span className="fixture-vs">@</span>
                    <span className="fixture-team">
                      {teams[game.home]?.logo && <img src={teams[game.home].logo} alt={game.home} className="fixture-logo" onError={e => e.target.style.display = 'none'} />}
                      {game.home}
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
          </>
        )}
      </main>
    </div>
  )
}

export default NFLPage
