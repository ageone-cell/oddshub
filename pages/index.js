import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

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

function findBest(oddsData, market) {
  if (!oddsData) return null;
  let best = null, bestVal = 0;
  for (const bm of BOOKMAKERS) {
    const val = oddsData.bookmakers?.[bm.id]?.[market];
    if (val && val > bestVal) { bestVal = val; best = bm.id; }
  }
  return best;
}

export default function OddsHub() {
  const [leagues, setLeagues] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [oddsData, setOddsData] = useState(null);
  const [oddsLoading, setOddsLoading] = useState(false);
  const [oddsError, setOddsError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const countdownRef = useRef(null);

  useEffect(() => { loadMatches(); }, []);

  async function loadMatches() {
    setMatchesLoading(true); setMatchesError(null);
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLeagues(data.leagues || []);
    } catch (e) { setMatchesError(e.message); }
    finally { setMatchesLoading(false); }
  }

  const allMatches = leagues.flatMap(c =>
    c.leagues.flatMap(l =>
      l.matches.map(m => ({ ...m, leagueName: l.name, leagueId: l.id, leagueLogo: l.logo, countryName: c.country, flag: c.flag }))
    )
  );

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchResults(allMatches.filter(m =>
      m.home.toLowerCase().includes(q) || m.away.toLowerCase().includes(q)
    ));
  }, [searchQuery, leagues]);

  useEffect(() => {
    if (!lastFetched || !selectedMatch) return;
    let secs = 120; setCountdown(secs);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      secs--; setCountdown(secs);
      if (secs <= 0) { clearInterval(countdownRef.current); fetchOdds(selectedMatch, selectedLeague?.name || ""); }
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [lastFetched]);

  const fetchOdds = useCallback(async (match, leagueName) => {
    setOddsLoading(true); setOddsError(null); setOddsData(null);
    clearInterval(countdownRef.current); setCountdown(null);
    try {
      const res = await fetch("/api/odds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home: match.home, away: match.away, leagueName }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOddsData(data); setLastFetched(new Date());
    } catch (e) { setOddsError(e.message || "Failed to fetch odds"); }
    finally { setOddsLoading(false); }
  }, []);

  const selectMatch = (match, league, country) => {
    setSelectedMatch(match); setSelectedLeague(league); setSelectedCountry(country);
    setOddsData(null); fetchOdds(match, league.name);
    setSearchQuery(""); setSearchResults([]); setSidebarOpen(false);
  };

  const selectSearch = (match) => {
    const country = leagues.find(c => c.leagues.some(l => l.id === match.leagueId));
    const league = country?.leagues.find(l => l.id === match.leagueId);
    if (country && league) selectMatch(match, league, country);
  };

  const currentLeague = selectedLeague
    ? leagues.flatMap(c => c.leagues).find(l => l.id === selectedLeague.id)
    : null;

  return (
    <>
      <Head>
        <title>OddsHub Kenya — Compare Bookmaker Odds</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Compare 1X2 odds from 9 Kenya bookmakers in real time" />
      </Head>
      <div style={st.root}>
        <div style={st.scanlines} />
        <header style={st.header}>
          <button style={st.hamburger} onClick={() => setSidebarOpen(o => !o)}>{sidebarOpen ? "✕" : "☰"}</button>
          <div style={st.logo}>
            <span style={{ fontSize: 24 }}>⚽</span>
            <div>
              <div style={st.logoText}>ODDS<span style={{ color: "var(--green)" }}>HUB</span></div>
              <div style={st.logoSub}>Kenya · 9 Bookmakers · Live Odds</div>
            </div>
          </div>
          <div style={st.searchWrap}>
            <span style={{ marginRight: 8, fontSize: 13 }}>🔍</span>
            <input style={st.searchInput} placeholder="Search teams — e.g. Arsenal, Real Madrid..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 180)} />
            {searchQuery && <button style={st.clearX} onClick={() => setSearchQuery("")}>✕</button>}
            {searchFocused && searchResults.length > 0 && (
              <div style={st.dropdown}>
                {searchResults.slice(0, 8).map(m => (
                  <div key={m.id} className="dropRow" style={st.dropRow} onMouseDown={() => selectSearch(m)}>
                    <span>{m.flag}</span>
                    <div>
                      <div style={{ color: "var(--text)", fontSize: 12 }}>{m.home} <span style={{ color: "var(--dim)" }}>vs</span> {m.away}</div>
                      <div style={{ color: "var(--dim)", fontSize: 10, marginTop: 2 }}>{m.leagueLogo} {m.leagueName} · {m.date} {m.time}</div>
                    </div>
                    <span style={{ marginLeft: "auto", color: "var(--green)" }}>→</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            {oddsLoading ? (
              <div style={{ fontSize: 11, color: "var(--green)", display: "flex", alignItems: "center", gap: 6 }}>
                <span className="spin" style={{ fontSize: 15 }}>⟳</span> Fetching live odds…
              </div>
            ) : lastFetched ? (
              <div>
                <div style={{ fontSize: 11, color: "var(--green)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)", display: "inline-block" }} />
                  Updated {lastFetched.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                </div>
                {countdown !== null && (
                  <div style={{ fontSize: 9, color: "var(--dim)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    Refresh in {countdown}s
                    <div style={{ width: 70, height: 2, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--green)", width: `${(countdown / 120) * 100}%`, transition: "width 1s linear" }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--dim)" }}>Select a match to load odds</div>
            )}
          </div>
        </header>

        <div style={st.body}>
          <aside style={{ ...st.sidebar, ...(sidebarOpen ? st.sidebarOpen : {}) }}>
            <div style={st.sideHead}>
              ⚽ Competitions
              <button style={{ background: "none", border: "none", color: "var(--dim)", cursor: "pointer", fontSize: 14 }} onClick={loadMatches} title="Reload fixtures">↻</button>
            </div>
            {matchesLoading && (
              <div style={{ padding: "20px 16px", color: "var(--dim)", fontSize: 11, textAlign: "center" }}>
                <span className="spin" style={{ fontSize: 18, display: "block", marginBottom: 8 }}>⟳</span>
                Loading fixtures…
              </div>
            )}
            {matchesError && (
              <div style={{ padding: 16, fontSize: 10, color: "#ff6b6b" }}>
                ⚠️ {matchesError}
                <button style={{ display: "block", marginTop: 8, color: "var(--green)", background: "none", border: "none", cursor: "pointer", fontSize: 10 }} onClick={loadMatches}>Retry</button>
              </div>
            )}
            {!matchesLoading && leagues.map(country => (
              <div key={country.id}>
                <button className="countryBtn" style={{ ...st.countryBtn, ...(selectedCountry?.id === country.id ? st.countryActive : {}) }}
                  onClick={() => { setSelectedCountry(selectedCountry?.id === country.id ? null : country); setSelectedLeague(null); setSelectedMatch(null); setOddsData(null); }}>
                  <span>{country.flag}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>{country.country}</span>
                  <span style={{ fontSize: 10, color: "var(--dim)" }}>{selectedCountry?.id === country.id ? "▾" : "▸"}</span>
                </button>
                {selectedCountry?.id === country.id && country.leagues.map(league => (
                  <button key={league.id} className="leagueBtn" style={{ ...st.leagueBtn, ...(selectedLeague?.id === league.id ? st.leagueActive : {}) }}
                    onClick={() => { setSelectedLeague(selectedLeague?.id === league.id ? null : league); setSelectedMatch(null); setOddsData(null); }}>
                    {league.logo} {league.name}
                    <span style={{ marginLeft: "auto", background: "var(--border)", color: "var(--dim)", fontSize: 9, padding: "1px 5px", borderRadius: 8 }}>{league.matches.length}</span>
                  </button>
                ))}
              </div>
            ))}
          </aside>
          {sidebarOpen && <div style={st.overlay} onClick={() => setSidebarOpen(false)} />}
          <main style={st.main}>
            {!selectedLeague && !selectedMatch && <Welcome matchesLoading={matchesLoading} count={allMatches.length} />}
            {selectedLeague && !selectedMatch && currentLeague && (
              <MatchList country={selectedCountry} league={currentLeague} onSelect={m => selectMatch(m, currentLeague, selectedCountry)} />
            )}
            {selectedMatch && (
              <OddsPanel match={selectedMatch} leagueName={selectedLeague?.name || ""} countryFlag={selectedCountry?.flag || ""}
                oddsData={oddsData} loading={oddsLoading} error={oddsError}
                onBack={() => { setSelectedMatch(null); setOddsData(null); clearInterval(countdownRef.current); setCountdown(null); }}
                onRefresh={() => fetchOdds(selectedMatch, selectedLeague?.name || "")} />
            )}
          </main>
        </div>
        <footer style={st.footer}>OddsHub Kenya · Fixtures via football-data.org · Odds via live web search · 18+ · Gamble Responsibly</footer>
      </div>
    </>
  );
}

function Welcome({ matchesLoading, count }) {
  return (
    <div style={{ maxWidth: 560, margin: "50px auto", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>⚽</div>
      <h1 style={{ fontSize: 20, color: "var(--text)", marginBottom: 10, fontWeight: 600 }}>Real Odds. 9 Bookmakers. One Page.</h1>
      <p style={{ color: "var(--dim)", fontSize: 12, lineHeight: 1.8, marginBottom: 24 }}>
        {matchesLoading ? "Loading live fixtures…" : count > 0 ? `${count} real upcoming matches loaded. Select a competition from the left to browse.` : "Select a competition from the left panel."}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 }}>
        {BOOKMAKERS.map(bm => (
          <div key={bm.id} style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${bm.color}60`, borderRadius: 4, padding: "5px 10px", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: bm.color }} />
            <span style={{ color: bm.color, fontSize: 11 }}>{bm.name}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "var(--dim)", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 6 }}>
        💡 Use the search bar above to instantly find any team across all leagues
      </div>
    </div>
  );
}

function MatchList({ country, league, onSelect }) {
  const groups = {};
  for (const m of league.matches) { if (!groups[m.date]) groups[m.date] = []; groups[m.date].push(m); }
  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 18px", marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{country.flag}</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{league.logo} {league.name}</div>
          <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 3 }}>{country.country} · {league.matches.length} upcoming matches · Click to load real odds</div>
        </div>
      </div>
      {Object.entries(groups).map(([date, matches]) => (
        <div key={date}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "var(--dim)", padding: "8px 0 5px", borderTop: "1px solid var(--border)", marginTop: 6, textTransform: "uppercase" }}>{date}</div>
          {matches.map(m => (
            <button key={m.id} className="matchRow" style={st.matchRow} onClick={() => onSelect(m)}>
              <span style={{ fontSize: 11, color: "var(--dim)", width: 46, flexShrink: 0 }}>{m.time}</span>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13 }}>{m.home}</span>
                <span style={{ fontSize: 9, color: "var(--dim)", background: "var(--border)", padding: "2px 5px", borderRadius: 3 }}>VS</span>
                <span style={{ fontSize: 13 }}>{m.away}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
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

function OddsPanel({ match, leagueName, countryFlag, oddsData, loading, error, onBack, onRefresh }) {
  const markets = ["1", "X", "2"];
  const labels = { "1": "Home Win", X: "Draw", "2": "Away Win" };
  const best = {};
  if (oddsData) markets.forEach(mkt => { best[mkt] = findBest(oddsData, mkt); });
  return (
    <div style={{ maxWidth: 800 }}>
      <button style={{ background: "none", border: "none", color: "var(--dim)", fontSize: 11, padding: "0 0 18px", cursor: "pointer", letterSpacing: 1 }} onClick={onBack}>← Back to matches</button>
      <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px", marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: "var(--dim)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{countryFlag} {leagueName}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 17, fontWeight: 600, flex: 1, textAlign: "center" }}>{match.home}</span>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ display: "inline-block", width: 42, height: 42, lineHeight: "42px", textAlign: "center", border: "1px solid var(--border)", borderRadius: "50%", fontSize: 11, color: "var(--dim)", fontWeight: 700 }}>VS</div>
            <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 4 }}>{match.date} · {match.time}</div>
          </div>
          <span style={{ fontSize: 17, fontWeight: 600, flex: 1, textAlign: "center" }}>{match.away}</span>
        </div>
      </div>
      {loading && (
        <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "32px 24px", textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }} className="spin">⟳</div>
          <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 16 }}>Searching live odds across 9 bookmakers…</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 16 }}>
            {BOOKMAKERS.map((bm, i) => (
              <div key={bm.id} className="fadeIn" style={{ display: "flex", alignItems: "center", gap: 5, animationDelay: `${i * 100}ms` }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: bm.color }} />
                <span style={{ color: bm.color, fontSize: 11 }}>{bm.name}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "var(--dim)" }}>This takes 15–40 seconds. Please wait.</div>
        </div>
      )}
      {error && !loading && (
        <div style={{ background: "#1a0808", border: "1px solid #4a1515", borderRadius: 10, padding: "28px 24px", textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
          <div style={{ color: "#ff6b6b", marginBottom: 6 }}>Could not load odds</div>
          <div style={{ color: "var(--dim)", fontSize: 11, marginBottom: 16 }}>{error}</div>
          <button style={{ background: "none", border: "1px solid #4a1515", color: "#ff6b6b", padding: "8px 18px", borderRadius: 5, cursor: "pointer", fontSize: 11 }} onClick={onRefresh}>↺ Try Again</button>
        </div>
      )}
      {oddsData && !loading && (
        <div className="fadeIn">
          {oddsData.source_note && (
            <div style={{ fontSize: 10, color: "var(--dim)", background: "rgba(0,230,118,0.04)", border: "1px solid rgba(0,230,118,0.15)", borderRadius: 5, padding: "8px 14px", marginBottom: 12 }}>🔍 {oddsData.source_note}</div>
          )}
          <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "rgba(0,230,118,0.05)", padding: "10px 16px" }}>
              <div style={{ flex: "0 0 155px", fontSize: 10, color: "var(--dim)", letterSpacing: 1, textTransform: "uppercase" }}>Bookmaker</div>
              {markets.map(mkt => (
                <div key={mkt} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{mkt}</div>
                  <div style={{ fontSize: 9, color: "var(--dim)", letterSpacing: 1 }}>{labels[mkt]}</div>
                </div>
              ))}
            </div>
            {BOOKMAKERS.map((bm, i) => {
              const bmOdds = oddsData.bookmakers?.[bm.id];
              const unavail = !bmOdds || Object.values(bmOdds).every(v => v === null);
              return (
                <div key={bm.id} style={{ display: "flex", alignItems: "center", padding: "11px 16px", borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "rgba(255,255,255,0.018)" : "transparent", opacity: unavail ? 0.4 : 1 }}>
                  <div style={{ flex: "0 0 155px", display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: bm.color, flexShrink: 0 }} />
                    <span style={{ color: bm.color, fontSize: 11, fontWeight: 600 }}>{bm.name}</span>
                    {unavail && <span style={{ fontSize: 9, color: "var(--dim)", background: "var(--border)", padding: "1px 5px", borderRadius: 3, marginLeft: 4 }}>N/A</span>}
                  </div>
                  {markets.map(mkt => {
                    const val = bmOdds?.[mkt];
                    const isBest = best[mkt] === bm.id;
                    return (
                      <div key={mkt} style={{ flex: 1, textAlign: "center" }}>
                        {val ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 15, fontWeight: 700, padding: "3px 8px", borderRadius: 4, color: isBest ? "var(--gold)" : "var(--dim)", background: isBest ? "rgba(255,196,0,0.1)" : "transparent", border: isBest ? "1px solid rgba(255,196,0,0.3)" : "1px solid transparent" }}>
                            {Number(val).toFixed(2)}{isBest && <span style={{ fontSize: 8, color: "var(--gold)" }}>▲</span>}
                          </span>
                        ) : <span style={{ color: "var(--dim)", opacity: 0.4 }}>—</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div style={{ background: "var(--panel)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "var(--green)", letterSpacing: 1, marginBottom: 12 }}>🏆 Best Available Odds</div>
            <div style={{ display: "flex", gap: 10 }}>
              {markets.map(mkt => {
                const bestId = best[mkt];
                const bm = BOOKMAKERS.find(b => b.id === bestId);
                const val = oddsData.bookmakers?.[bestId]?.[mkt];
                return (
                  <div key={mkt} style={{ flex: 1, border: `1px solid ${bm?.color || "var(--border)"}`, borderRadius: 8, padding: 10, textAlign: "center", background: "rgba(255,255,255,0.015)" }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{mkt}</div>
                    <div style={{ fontSize: 9, color: "var(--dim)", margin: "3px 0 8px" }}>{labels[mkt]}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: bm?.color }}>{val ? Number(val).toFixed(2) : "—"}</div>
                    <div style={{ fontSize: 10, color: bm?.color, marginTop: 4 }}>{bm?.name || "—"}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <button className="refreshBtn" style={st.refreshBtn} onClick={onRefresh}>↺ Refresh Odds Now</button>
        </div>
      )}
      <div style={{ fontSize: 9, color: "var(--dim)", textAlign: "center", lineHeight: 1.7, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        ⚡ Odds sourced via live web search · Always verify on bookmaker site before placing bets · 18+ · Gamble Responsibly
      </div>
    </div>
  );
}

const st = {
  root: { minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column" },
  scanlines: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,230,118,0.01) 3px, rgba(0,230,118,0.01) 4px)" },
  header: { position: "sticky", top: 0, zIndex: 100, background: "rgba(7,9,15,0.97)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  hamburger: { background: "none", border: "1px solid var(--border)", color: "var(--text)", fontSize: 16, padding: "4px 9px", borderRadius: 4, flexShrink: 0, cursor: "pointer" },
  logo: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  logoText: { fontSize: 18, fontWeight: 700, letterSpacing: 3 },
  logoSub: { fontSize: 9, color: "var(--dim)", letterSpacing: 1, marginTop: 2 },
  searchWrap: { flex: "1 1 240px", position: "relative", display: "flex", alignItems: "center", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px" },
  searchInput: { flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 12, padding: "10px 0" },
  clearX: { background: "none", border: "none", color: "var(--dim)", fontSize: 11, cursor: "pointer" },
  dropdown: { position: "absolute", top: "100%", left: 0, right: 0, background: "#111820", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 8px 8px", zIndex: 200, maxHeight: 280, overflowY: "auto" },
  dropRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)", transition: "background 0.15s" },
  body: { display: "flex", flex: 1, position: "relative", zIndex: 1 },
  sidebar: { width: 234, flexShrink: 0, background: "var(--panel)", borderRight: "1px solid var(--border)", padding: "14px 0", overflowY: "auto", maxHeight: "calc(100vh - 64px)", position: "sticky", top: 64 },
  sidebarOpen: {},
  sideHead: { fontSize: 9, letterSpacing: 2, color: "var(--dim)", padding: "0 16px 10px", borderBottom: "1px solid var(--border)", marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "space-between" },
  countryBtn: { display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "none", color: "var(--text)", padding: "9px 14px", textAlign: "left", fontSize: 12, transition: "background 0.15s", cursor: "pointer" },
  countryActive: { background: "rgba(0,230,118,0.07)", color: "var(--green)" },
  leagueBtn: { display: "flex", alignItems: "center", gap: 7, width: "100%", background: "none", border: "none", borderLeft: "2px solid transparent", color: "var(--dim)", padding: "7px 14px 7px 28px", textAlign: "left", fontSize: 11, transition: "all 0.15s", cursor: "pointer" },
  leagueActive: { color: "var(--green)", background: "rgba(0,230,118,0.05)", borderLeft: "2px solid var(--green)" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50 },
  main: { flex: 1, padding: "24px 28px", overflowY: "auto" },
  footer: { borderTop: "1px solid var(--border)", padding: "10px 24px", fontSize: 9, color: "var(--dim)", textAlign: "center", position: "relative", zIndex: 1 },
  matchRow: { display: "flex", alignItems: "center", gap: 10, width: "100%", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 6, padding: "13px 16px", marginBottom: 7, textAlign: "left", color: "var(--text)", cursor: "pointer", transition: "border-color 0.2s, background 0.2s" },
  refreshBtn: { display: "block", width: "100%", background: "none", border: "1px solid var(--border)", color: "var(--green)", padding: 10, borderRadius: 6, fontSize: 11, letterSpacing: 1, marginBottom: 14, transition: "border-color 0.2s", cursor: "pointer" },
};
