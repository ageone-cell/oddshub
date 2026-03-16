import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

/* ── BOOKMAKERS ─────────────────────────────────────── */
const BOOKMAKERS = [
  { id: "odibets",    name: "OdiBets",    color: "#e8b400" },
  { id: "betika",     name: "Betika",     color: "#00b140" },
  { id: "sportybet",  name: "SportyBet",  color: "#ff6b00" },
  { id: "betgr8",     name: "BetGr8",     color: "#00aaff" },
  { id: "sportpesa",  name: "SportPesa",  color: "#1a8cff" },
  { id: "betway",     name: "Betway",     color: "#00af41" },
  { id: "mozzartbet", name: "MozzartBet", color: "#cc0000" },
  { id: "betwinner",  name: "BetWinner",  color: "#f4a900" },
  { id: "1xbet",      name: "1xBet",      color: "#1560bd" },
];

/* ── LEAGUES & MATCHES ─────────────────────────────── */
const LEAGUES = [
  {
    country: "UEFA Competitions", flag: "🏆", id: "uefa",
    leagues: [
      { id: "ucl", name: "Champions League", logo: "⭐", matches: [
        { id: "ucl1", home: "Real Madrid", away: "Arsenal", time: "21:00", date: "Today" },
        { id: "ucl2", home: "Bayern Munich", away: "Inter Milan", time: "21:00", date: "Today" },
        { id: "ucl3", home: "PSG", away: "Atletico Madrid", time: "21:00", date: "Tomorrow" },
        { id: "ucl4", home: "Manchester City", away: "Benfica", time: "21:00", date: "Tomorrow" },
      ]},
      { id: "uel", name: "Europa League", logo: "🔶", matches: [
        { id: "uel1", home: "Roma", away: "Ajax", time: "21:00", date: "Today" },
        { id: "uel2", home: "Tottenham", away: "Bodo/Glimt", time: "18:45", date: "Today" },
        { id: "uel3", home: "Eintracht Frankfurt", away: "Lyon", time: "21:00", date: "Tomorrow" },
      ]},
      { id: "uecl", name: "Conference League", logo: "🔷", matches: [
        { id: "uecl1", home: "Chelsea", away: "Legia Warsaw", time: "21:00", date: "Today" },
        { id: "uecl2", home: "Real Betis", away: "Gent", time: "18:45", date: "Tomorrow" },
      ]},
    ],
  },
  {
    country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", id: "england",
    leagues: [{ id: "epl", name: "Premier League", logo: "🦁", matches: [
      { id: "epl1", home: "Liverpool", away: "Manchester United", time: "17:30", date: "Today" },
      { id: "epl2", home: "Arsenal", away: "Chelsea", time: "14:00", date: "Today" },
      { id: "epl3", home: "Manchester City", away: "Tottenham", time: "16:00", date: "Today" },
      { id: "epl4", home: "Aston Villa", away: "Newcastle", time: "20:00", date: "Tomorrow" },
      { id: "epl5", home: "Brighton", away: "West Ham", time: "15:00", date: "Tomorrow" },
    ]}],
  },
  {
    country: "Spain", flag: "🇪🇸", id: "spain",
    leagues: [{ id: "laliga", name: "La Liga", logo: "🌟", matches: [
      { id: "ll1", home: "Real Madrid", away: "Barcelona", time: "21:00", date: "Today" },
      { id: "ll2", home: "Atletico Madrid", away: "Sevilla", time: "19:00", date: "Today" },
      { id: "ll3", home: "Valencia", away: "Real Betis", time: "16:15", date: "Tomorrow" },
      { id: "ll4", home: "Athletic Club", away: "Villarreal", time: "21:00", date: "Tomorrow" },
    ]}],
  },
  {
    country: "Germany", flag: "🇩🇪", id: "germany",
    leagues: [{ id: "bundesliga", name: "Bundesliga", logo: "🦅", matches: [
      { id: "bl1", home: "Bayern Munich", away: "Borussia Dortmund", time: "18:30", date: "Today" },
      { id: "bl2", home: "Bayer Leverkusen", away: "RB Leipzig", time: "15:30", date: "Today" },
      { id: "bl3", home: "Stuttgart", away: "Eintracht Frankfurt", time: "20:30", date: "Tomorrow" },
    ]}],
  },
  {
    country: "Italy", flag: "🇮🇹", id: "italy",
    leagues: [{ id: "seriea", name: "Serie A", logo: "🐉", matches: [
      { id: "sa1", home: "Napoli", away: "Inter Milan", time: "20:45", date: "Today" },
      { id: "sa2", home: "Juventus", away: "AC Milan", time: "18:00", date: "Today" },
      { id: "sa3", home: "Roma", away: "Lazio", time: "20:45", date: "Tomorrow" },
    ]}],
  },
  {
    country: "France", flag: "🇫🇷", id: "france",
    leagues: [{ id: "ligue1", name: "Ligue 1", logo: "⚜️", matches: [
      { id: "l1_1", home: "PSG", away: "Marseille", time: "21:00", date: "Today" },
      { id: "l1_2", home: "Monaco", away: "Lyon", time: "19:00", date: "Today" },
      { id: "l1_3", home: "Nice", away: "Lens", time: "17:05", date: "Tomorrow" },
    ]}],
  },
  {
    country: "Netherlands", flag: "🇳🇱", id: "netherlands",
    leagues: [{ id: "eredivisie", name: "Eredivisie", logo: "🌷", matches: [
      { id: "er1", home: "Ajax", away: "PSV Eindhoven", time: "16:45", date: "Today" },
      { id: "er2", home: "Feyenoord", away: "AZ Alkmaar", time: "14:30", date: "Tomorrow" },
    ]}],
  },
  {
    country: "Portugal", flag: "🇵🇹", id: "portugal",
    leagues: [{ id: "primeira", name: "Primeira Liga", logo: "🦅", matches: [
      { id: "pl1", home: "Benfica", away: "Porto", time: "20:15", date: "Today" },
      { id: "pl2", home: "Sporting CP", away: "Braga", time: "18:30", date: "Tomorrow" },
    ]}],
  },
];

const ALL_MATCHES = LEAGUES.flatMap(c =>
  c.leagues.flatMap(l =>
    l.matches.map(m => ({ ...m, leagueName: l.name, leagueId: l.id, leagueLogo: l.logo, countryName: c.country, flag: c.flag }))
  )
);

function findBest(oddsData, market) {
  if (!oddsData) return null;
  let best = null, bestVal = 0;
  for (const bm of BOOKMAKERS) {
    const val = oddsData.bookmakers?.[bm.id]?.[market];
    if (val && val > bestVal) { bestVal = val; best = bm.id; }
  }
  return best;
}

/* ── MAIN APP ────────────────────────────────────────── */
export default function OddsHub() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLeague,  setSelectedLeague]  = useState(null);
  const [selectedMatch,   setSelectedMatch]   = useState(null);
  const [oddsData,  setOddsData]  = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [lastFetched,   setLastFetched]   = useState(null);
  const [countdown,     setCountdown]     = useState(null);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const countdownRef = useRef(null);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchResults(ALL_MATCHES.filter(m =>
      m.home.toLowerCase().includes(q) || m.away.toLowerCase().includes(q)
    ));
  }, [searchQuery]);

  useEffect(() => {
    if (!lastFetched || !selectedMatch) return;
    let secs = 120;
    setCountdown(secs);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      secs--;
      setCountdown(secs);
      if (secs <= 0) {
        clearInterval(countdownRef.current);
        doFetch(selectedMatch, selectedLeague?.name || "");
      }
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [lastFetched]);

  const doFetch = useCallback(async (match, leagueName) => {
    setLoading(true); setError(null); setOddsData(null);
    clearInterval(countdownRef.current); setCountdown(null);
    try {
      const res = await fetch("/api/odds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home: match.home, away: match.away, leagueName }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOddsData(data);
      setLastFetched(new Date());
    } catch (e) {
      setError(e.message || "Failed to fetch odds");
    } finally {
      setLoading(false);
    }
  }, []);

  const selectMatch = (match, league, country) => {
    setSelectedMatch(match); setSelectedLeague(league); setSelectedCountry(country);
    setOddsData(null); doFetch(match, league.name);
    setSearchQuery(""); setSearchResults([]); setSidebarOpen(false);
  };

  const selectSearch = (match) => {
    const country = LEAGUES.find(c => c.leagues.some(l => l.id === match.leagueId));
    const league  = country?.leagues.find(l => l.id === match.leagueId);
    if (country && league) selectMatch(match, league, country);
  };

  const currentLeague = selectedLeague
    ? LEAGUES.flatMap(c => c.leagues).find(l => l.id === selectedLeague.id)
    : null;

  const s = styles;

  return (
    <>
      <Head>
        <title>OddsHub Kenya — Compare Bookmaker Odds</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Compare 1X2 odds from 9 Kenya bookmakers — OdiBets, Betika, SportyBet, BetGr8, SportPesa, Betway, MozzartBet, BetWinner, 1xBet" />
      </Head>

      <div style={s.root}>
        <div style={s.scanlines} />

        {/* ── HEADER ── */}
        <header style={s.header}>
          <button style={s.hamburger} onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
            {sidebarOpen ? "✕" : "☰"}
          </button>
          <div style={s.logo}>
            <span style={s.logoEmoji}>⚽</span>
            <div>
              <div style={s.logoText}>ODDS<span style={s.logoGreen}>HUB</span></div>
              <div style={s.logoSub}>Kenya · 9 Bookmakers · Live Comparison</div>
            </div>
          </div>

          <div style={s.searchWrap}>
            <span style={s.searchIco}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search teams — e.g. Arsenal, PSG..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
            />
            {searchQuery && <button style={s.clearX} onClick={() => setSearchQuery("")}>✕</button>}
            {searchFocused && searchResults.length > 0 && (
              <div style={s.dropdown}>
                {searchResults.slice(0, 8).map(m => (
                  <div key={m.id} className="dropRow" style={s.dropRow} onMouseDown={() => selectSearch(m)}>
                    <span>{m.flag}</span>
                    <div>
                      <div style={s.dropMatch}>{m.home} <span style={s.dropVs}>vs</span> {m.away}</div>
                      <div style={s.dropSub}>{m.leagueLogo} {m.leagueName} · {m.date} {m.time}</div>
                    </div>
                    <span style={s.dropArr}>→</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={s.statusBox}>
            {loading ? (
              <div style={s.statusGreen}><span className="spin">⟳</span> Fetching live odds…</div>
            ) : lastFetched ? (
              <div>
                <div style={s.statusGreen}>
                  <span className="pulse" style={{ ...s.liveDot }} /> {lastFetched.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                </div>
                {countdown !== null && (
                  <div style={s.countdownRow}>
                    <span style={s.countdownText}>Refresh in {countdown}s</span>
                    <div style={s.countBar}><div style={{ ...s.countFill, width: `${(countdown/120)*100}%` }} /></div>
                  </div>
                )}
              </div>
            ) : (
              <div style={s.statusDim}>Select a match</div>
            )}
          </div>
        </header>

        <div style={s.body}>
          {/* ── SIDEBAR ── */}
          <aside style={{ ...s.sidebar, ...(sidebarOpen ? s.sidebarOpen : {}) }}>
            <div style={s.sideHead}>⚽ European Football</div>
            {LEAGUES.map(country => (
              <div key={country.id}>
                <button
                  className="countryBtn"
                  style={{ ...s.countryBtn, ...(selectedCountry?.id === country.id ? s.countryActive : {}) }}
                  onClick={() => {
                    setSelectedCountry(selectedCountry?.id === country.id ? null : country);
                    setSelectedLeague(null); setSelectedMatch(null); setOddsData(null);
                  }}
                >
                  <span>{country.flag}</span>
                  <span style={s.countryName}>{country.country}</span>
                  <span style={s.caret}>{selectedCountry?.id === country.id ? "▾" : "▸"}</span>
                </button>
                {selectedCountry?.id === country.id && country.leagues.map(league => (
                  <button
                    key={league.id}
                    className="leagueBtn"
                    style={{ ...s.leagueBtn, ...(selectedLeague?.id === league.id ? s.leagueActive : {}) }}
                    onClick={() => {
                      setSelectedLeague(selectedLeague?.id === league.id ? null : league);
                      setSelectedMatch(null); setOddsData(null);
                    }}
                  >
                    {league.logo} {league.name}
                    <span style={s.badge}>{league.matches.length}</span>
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {/* Mobile overlay */}
          {sidebarOpen && <div style={s.overlay} onClick={() => setSidebarOpen(false)} />}

          {/* ── MAIN ── */}
          <main style={s.main}>
            {!selectedLeague && !selectedMatch && <Welcome />}

            {selectedLeague && !selectedMatch && currentLeague && (
              <MatchList
                country={selectedCountry}
                league={currentLeague}
                onSelect={m => selectMatch(m, currentLeague, selectedCountry)}
              />
            )}

            {selectedMatch && (
              <OddsPanel
                match={selectedMatch}
                leagueName={selectedLeague?.name || ""}
                countryFlag={selectedCountry?.flag || ""}
                oddsData={oddsData}
                loading={loading}
                error={error}
                onBack={() => { setSelectedMatch(null); setOddsData(null); clearInterval(countdownRef.current); setCountdown(null); }}
                onRefresh={() => doFetch(selectedMatch, selectedLeague?.name || "")}
              />
            )}
          </main>
        </div>

        <footer style={s.footer}>
          OddsHub Kenya · 18+ · Gamble Responsibly · Odds sourced via live web search
        </footer>
      </div>
    </>
  );
}

/* ── WELCOME ─────────────────────────────────────────── */
function Welcome() {
  const s = styles;
  return (
    <div style={s.welcome}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>⚽</div>
      <h1 style={s.welcomeTitle}>Real Odds. 9 Bookmakers. One Page.</h1>
      <p style={s.welcomeText}>
        Pick a competition from the left menu, select a match, and get live 1X2 odds
        fetched from Kenya's top bookmakers in real time.
      </p>
      <div style={s.bmGrid}>
        {BOOKMAKERS.map(bm => (
          <div key={bm.id} style={{ ...s.bmChip, borderColor: bm.color + "70" }}>
            <div style={{ ...s.bmDot, background: bm.color }} />
            <span style={{ color: bm.color, fontSize: 11 }}>{bm.name}</span>
          </div>
        ))}
      </div>
      <div style={s.welcomeTip}>
        💡 Use the search bar above to quickly find any team across all leagues.
      </div>
    </div>
  );
}

/* ── MATCH LIST ───────────────────────────────────────── */
function MatchList({ country, league, onSelect }) {
  const s = styles;
  const groups = {};
  for (const m of league.matches) {
    if (!groups[m.date]) groups[m.date] = [];
    groups[m.date].push(m);
  }
  return (
    <div style={{ maxWidth: 680 }}>
      <div style={s.leagueHdr}>
        <span style={{ fontSize: 28 }}>{country.flag}</span>
        <div>
          <div style={s.leagueHdrTitle}>{league.logo} {league.name}</div>
          <div style={s.leagueHdrSub}>{country.country} · Click a match to load real-time odds</div>
        </div>
      </div>
      {Object.entries(groups).map(([date, matches]) => (
        <div key={date}>
          <div style={s.dateBar}>{date}</div>
          {matches.map(m => (
            <button key={m.id} className="matchRow" style={s.matchRow} onClick={() => onSelect(m)}>
              <span style={s.matchTime}>{m.time}</span>
              <div style={s.matchTeams}>
                <span>{m.home}</span>
                <span style={s.vsChip}>VS</span>
                <span>{m.away}</span>
              </div>
              <div style={s.matchCta}>
                <span style={{ fontSize: 10, color: "var(--green)", letterSpacing: 1 }}>View Odds</span>
                <span style={{ color: "var(--green)" }}>→</span>
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── ODDS PANEL ───────────────────────────────────────── */
function OddsPanel({ match, leagueName, countryFlag, oddsData, loading, error, onBack, onRefresh }) {
  const s = styles;
  const markets = ["1", "X", "2"];
  const labels  = { "1": "Home Win", X: "Draw", "2": "Away Win" };
  const best    = {};
  if (oddsData) markets.forEach(mkt => { best[mkt] = findBest(oddsData, mkt); });

  return (
    <div style={{ maxWidth: 800 }}>
      <button style={s.backBtn} onClick={onBack}>← Back to matches</button>

      <div style={s.matchHdr}>
        <div style={s.matchHdrLeague}>{countryFlag} {leagueName}</div>
        <div style={s.matchHdrRow}>
          <span style={s.matchHdrTeam}>{match.home}</span>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={s.vsCircle}>VS</div>
            <div style={s.matchHdrTime}>{match.date} · {match.time}</div>
          </div>
          <span style={s.matchHdrTeam}>{match.away}</span>
        </div>
      </div>

      {loading && (
        <div style={s.loadingCard}>
          <div style={{ fontSize: 36, marginBottom: 12 }} className="spin">⟳</div>
          <div style={s.loadingTitle}>Searching live odds across 9 bookmakers…</div>
          <div style={s.loadingBms}>
            {BOOKMAKERS.map((bm, i) => (
              <div key={bm.id} className="fadeIn" style={{ ...s.loadingBm, animationDelay: `${i * 120}ms` }}>
                <div style={{ ...s.bmDot, background: bm.color }} />
                <span style={{ color: bm.color, fontSize: 11 }}>{bm.name}</span>
              </div>
            ))}
          </div>
          <div style={s.loadingSub}>This takes 15–30 seconds. Please wait.</div>
        </div>
      )}

      {error && !loading && (
        <div style={s.errorCard}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
          <div style={{ color: "#ff6b6b", marginBottom: 6, fontSize: 14 }}>Could not load odds</div>
          <div style={{ color: "var(--dim)", fontSize: 11, marginBottom: 16 }}>{error}</div>
          <button style={s.retryBtn} onClick={onRefresh}>↺ Try Again</button>
        </div>
      )}

      {oddsData && !loading && (
        <div className="fadeIn">
          {oddsData.source_note && (
            <div style={s.sourceNote}>🔍 {oddsData.source_note}</div>
          )}

          <div style={s.oddsTable}>
            <div style={s.tableHead}>
              <div style={s.colBook}>Bookmaker</div>
              {markets.map(mkt => (
                <div key={mkt} style={s.colOdd}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{mkt}</div>
                  <div style={{ fontSize: 9, color: "var(--dim)", letterSpacing: 1 }}>{labels[mkt]}</div>
                </div>
              ))}
            </div>

            {BOOKMAKERS.map((bm, i) => {
              const bmOdds = oddsData.bookmakers?.[bm.id];
              const unavail = !bmOdds || Object.values(bmOdds).every(v => v === null);
              return (
                <div key={bm.id} style={{
                  ...s.tableRow,
                  background: i % 2 === 0 ? "rgba(255,255,255,0.018)" : "transparent",
                  opacity: unavail ? 0.4 : 1,
                }}>
                  <div style={s.colBook}>
                    <div style={{ ...s.bmDot, background: bm.color }} />
                    <span style={{ color: bm.color, fontSize: 11, fontWeight: 600 }}>{bm.name}</span>
                    {unavail && <span style={s.naTag}>N/A</span>}
                  </div>
                  {markets.map(mkt => {
                    const val = bmOdds?.[mkt];
                    const isBest = best[mkt] === bm.id;
                    return (
                      <div key={mkt} style={s.colOdd}>
                        {val ? (
                          <span style={{ ...s.oddVal, ...(isBest ? s.oddBest : {}) }}>
                            {Number(val).toFixed(2)}{isBest && <span style={{ fontSize: 8, color: "var(--gold)", marginLeft: 2 }}>▲</span>}
                          </span>
                        ) : (
                          <span style={{ color: "var(--dim)", fontSize: 13, opacity: 0.4 }}>—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Best odds summary */}
          <div style={s.bestBar}>
            <div style={{ fontSize: 11, color: "var(--green)", letterSpacing: 1, marginBottom: 12 }}>🏆 Best Available Odds</div>
            <div style={s.bestRow}>
              {markets.map(mkt => {
                const bestId = best[mkt];
                const bm  = BOOKMAKERS.find(b => b.id === bestId);
                const val = oddsData.bookmakers?.[bestId]?.[mkt];
                return (
                  <div key={mkt} style={{ ...s.bestCard, borderColor: bm?.color || "var(--border)" }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{mkt}</div>
                    <div style={{ fontSize: 9, color: "var(--dim)", margin: "3px 0 8px" }}>{labels[mkt]}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: bm?.color }}>{val ? Number(val).toFixed(2) : "—"}</div>
                    <div style={{ fontSize: 10, color: bm?.color, marginTop: 4 }}>{bm?.name || "—"}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="refreshBtn" style={s.refreshBtn} onClick={onRefresh}>↺ Refresh Odds Now</button>
        </div>
      )}

      <div style={s.disclaimer}>
        ⚡ Odds sourced via live web search. Always verify on the bookmaker's site before placing bets. 18+ | Gamble Responsibly
      </div>
    </div>
  );
}

/* ── STYLES ───────────────────────────────────────────── */
const styles = {
  root: { minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column" },
  scanlines: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,230,118,0.01) 3px, rgba(0,230,118,0.01) 4px)" },

  header: { position: "sticky", top: 0, zIndex: 100, background: "rgba(7,9,15,0.97)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  hamburger: { display: "none", background: "none", border: "none", color: "var(--text)", fontSize: 20, "@media(max-width:600px)": { display: "block" } },
  logo: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  logoEmoji: { fontSize: 24 },
  logoText: { fontSize: 18, fontWeight: 700, letterSpacing: 3 },
  logoGreen: { color: "var(--green)" },
  logoSub: { fontSize: 9, color: "var(--dim)", letterSpacing: 1, marginTop: 2 },

  searchWrap: { flex: "1 1 240px", position: "relative", display: "flex", alignItems: "center", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px" },
  searchIco: { marginRight: 8, fontSize: 13 },
  searchInput: { flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 12, padding: "10px 0" },
  clearX: { background: "none", border: "none", color: "var(--dim)", fontSize: 11 },
  dropdown: { position: "absolute", top: "100%", left: 0, right: 0, background: "#111820", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 8px 8px", zIndex: 200, maxHeight: 280, overflowY: "auto" },
  dropRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)", fontSize: 12, transition: "background 0.15s" },
  dropMatch: { color: "var(--text)", fontSize: 12 },
  dropVs: { color: "var(--dim)", margin: "0 4px" },
  dropSub: { color: "var(--dim)", fontSize: 10, marginTop: 2 },
  dropArr: { marginLeft: "auto", color: "var(--green)" },

  statusBox: { flexShrink: 0 },
  statusGreen: { fontSize: 11, color: "var(--green)", display: "flex", alignItems: "center", gap: 6 },
  statusDim: { fontSize: 11, color: "var(--dim)" },
  liveDot: { width: 7, height: 7, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)", display: "inline-block" },
  countdownRow: { marginTop: 4, display: "flex", alignItems: "center", gap: 6 },
  countdownText: { fontSize: 9, color: "var(--dim)" },
  countBar: { width: 80, height: 2, background: "var(--border)", borderRadius: 2, overflow: "hidden" },
  countFill: { height: "100%", background: "var(--green)", transition: "width 1s linear" },

  body: { display: "flex", flex: 1, position: "relative", zIndex: 1 },

  sidebar: { width: 234, flexShrink: 0, background: "var(--panel)", borderRight: "1px solid var(--border)", padding: "14px 0", overflowY: "auto", maxHeight: "calc(100vh - 64px)", position: "sticky", top: 64, transition: "transform 0.25s" },
  sidebarOpen: {},
  sideHead: { fontSize: 9, letterSpacing: 2, color: "var(--dim)", padding: "0 16px 10px", borderBottom: "1px solid var(--border)", marginBottom: 8, textTransform: "uppercase" },
  countryBtn: { display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "none", color: "var(--text)", padding: "9px 14px", textAlign: "left", fontSize: 12, transition: "background 0.15s" },
  countryActive: { background: "rgba(0,230,118,0.07)", color: "var(--green)" },
  countryName: { flex: 1 },
  caret: { fontSize: 10, color: "var(--dim)" },
  leagueBtn: { display: "flex", alignItems: "center", gap: 7, width: "100%", background: "none", border: "none", borderLeft: "2px solid transparent", color: "var(--dim)", padding: "7px 14px 7px 28px", textAlign: "left", fontSize: 11, transition: "all 0.15s" },
  leagueActive: { color: "var(--green)", background: "rgba(0,230,118,0.05)", borderLeft: "2px solid var(--green)" },
  badge: { marginLeft: "auto", background: "var(--border)", color: "var(--dim)", fontSize: 9, padding: "1px 5px", borderRadius: 8 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50 },

  main: { flex: 1, padding: "24px 28px", overflowY: "auto" },
  footer: { borderTop: "1px solid var(--border)", padding: "12px 24px", fontSize: 9, color: "var(--dim)", textAlign: "center", position: "relative", zIndex: 1 },

  welcome: { maxWidth: 560, margin: "50px auto", textAlign: "center" },
  welcomeTitle: { fontSize: 20, color: "var(--text)", marginBottom: 10, fontWeight: 600 },
  welcomeText: { color: "var(--dim)", fontSize: 12, lineHeight: 1.8, marginBottom: 24 },
  bmGrid: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 },
  bmChip: { display: "flex", alignItems: "center", gap: 6, border: "1px solid", borderRadius: 4, padding: "5px 10px", background: "rgba(255,255,255,0.02)" },
  bmDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  welcomeTip: { fontSize: 10, color: "var(--dim)", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 6 },

  leagueHdr: { display: "flex", alignItems: "center", gap: 12, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 18px", marginBottom: 16 },
  leagueHdrTitle: { fontSize: 16, fontWeight: 600 },
  leagueHdrSub: { fontSize: 10, color: "var(--dim)", marginTop: 3 },
  dateBar: { fontSize: 9, letterSpacing: 2, color: "var(--dim)", padding: "8px 0 5px", borderTop: "1px solid var(--border)", marginTop: 6, textTransform: "uppercase" },
  matchRow: { display: "flex", alignItems: "center", gap: 10, width: "100%", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 6, padding: "13px 16px", marginBottom: 7, textAlign: "left", color: "var(--text)", fontSize: 13, transition: "border-color 0.2s, background 0.2s" },
  matchTime: { fontSize: 11, color: "var(--dim)", width: 42, flexShrink: 0 },
  matchTeams: { flex: 1, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  vsChip: { fontSize: 9, color: "var(--dim)", background: "var(--border)", padding: "2px 5px", borderRadius: 3 },
  matchCta: { display: "flex", alignItems: "center", gap: 5, flexShrink: 0 },

  backBtn: { background: "none", border: "none", color: "var(--dim)", fontSize: 11, padding: "0 0 18px", letterSpacing: 1 },
  matchHdr: { background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px", marginBottom: 18 },
  matchHdrLeague: { fontSize: 10, color: "var(--dim)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" },
  matchHdrRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  matchHdrTeam: { fontSize: 17, fontWeight: 600, flex: 1, textAlign: "center" },
  vsCircle: { display: "inline-block", width: 42, height: 42, lineHeight: "42px", textAlign: "center", border: "1px solid var(--border)", borderRadius: "50%", fontSize: 11, color: "var(--dim)", fontWeight: 700 },
  matchHdrTime: { fontSize: 10, color: "var(--dim)", marginTop: 4, letterSpacing: 1 },

  loadingCard: { background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "32px 24px", textAlign: "center", marginBottom: 16 },
  loadingTitle: { fontSize: 13, color: "var(--text)", marginBottom: 16 },
  loadingBms: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 16 },
  loadingBm: { display: "flex", alignItems: "center", gap: 5 },
  loadingSub: { fontSize: 10, color: "var(--dim)" },

  errorCard: { background: "#1a0808", border: "1px solid #4a1515", borderRadius: 10, padding: "28px 24px", textAlign: "center", marginBottom: 16 },
  retryBtn: { background: "none", border: "1px solid #4a1515", color: "#ff6b6b", padding: "8px 18px", borderRadius: 5, fontSize: 11 },

  sourceNote: { fontSize: 10, color: "var(--dim)", background: "rgba(0,230,118,0.04)", border: "1px solid rgba(0,230,118,0.15)", borderRadius: 5, padding: "8px 14px", marginBottom: 12 },

  oddsTable: { background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 16 },
  tableHead: { display: "flex", borderBottom: "1px solid var(--border)", background: "rgba(0,230,118,0.05)", padding: "10px 16px" },
  colBook: { flex: "0 0 155px", display: "flex", alignItems: "center", gap: 7 },
  colOdd: { flex: 1, textAlign: "center" },
  tableRow: { display: "flex", alignItems: "center", padding: "11px 16px", borderBottom: "1px solid var(--border)" },
  naTag: { marginLeft: 6, fontSize: 9, color: "var(--dim)", background: "var(--border)", padding: "1px 5px", borderRadius: 3 },
  oddVal: { display: "inline-flex", alignItems: "center", fontSize: 15, fontWeight: 700, color: "var(--dim)", padding: "3px 8px", borderRadius: 4, transition: "all 0.3s" },
  oddBest: { color: "var(--gold)", background: "rgba(255,196,0,0.1)", border: "1px solid rgba(255,196,0,0.3)" },

  bestBar: { background: "var(--panel)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 14 },
  bestRow: { display: "flex", gap: 10 },
  bestCard: { flex: 1, border: "1px solid var(--border)", borderRadius: 8, padding: 10, textAlign: "center", background: "rgba(255,255,255,0.015)" },

  refreshBtn: { display: "block", width: "100%", background: "none", border: "1px solid var(--border)", color: "var(--green)", padding: 10, borderRadius: 6, fontSize: 11, letterSpacing: 1, marginBottom: 14, transition: "border-color 0.2s" },

  disclaimer: { fontSize: 9, color: "var(--dim)", textAlign: "center", lineHeight: 1.7, borderTop: "1px solid var(--border)", paddingTop: 12 },
};
