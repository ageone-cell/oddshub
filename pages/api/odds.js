// pages/api/odds.js
// Uses The Odds API (the-odds-api.com) — free tier: 500 requests/month

const LEAGUE_TO_SPORT = {
  "Champions League":  "soccer_uefa_champs_league",
  "Europa League":     "soccer_uefa_europa_league",
  "Conference League": "soccer_uefa_europa_conference_league",
  "Premier League":    "soccer_epl",
  "La Liga":           "soccer_spain_la_liga",
  "Bundesliga":        "soccer_germany_bundesliga",
  "Serie A":           "soccer_italy_serie_a",
  "Ligue 1":           "soccer_france_ligue_one",
  "Eredivisie":        "soccer_netherlands_eredivisie",
  "Primeira Liga":     "soccer_portugal_primeira_liga",
};

const BOOKMAKER_KEYS = [
  "betway", "onexbet", "unibet",
  "william_hill", "bwin", "marathonbet",
  "betfair_ex_eu", "pinnacle",
];

function normalize(str) {
  return str.toLowerCase().replace(/\s+(fc|sc|ac|cf|afc|bfc|sfc|united|city|town|rovers)$/i, "").replace(/[^a-z0-9]/g, "").trim();
}

function teamsMatch(a, b) {
  const na = normalize(a), nb = normalize(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { home, away, leagueName } = req.body;
  if (!home || !away) return res.status(400).json({ error: "Missing match details" });

  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ODDS_API_KEY not configured in Vercel environment variables" });

  const sportKey = LEAGUE_TO_SPORT[leagueName];
  if (!sportKey) return res.status(200).json({ home, away, league: leagueName, source_note: `League "${leagueName}" not mapped`, bookmakers: Object.fromEntries(BOOKMAKER_KEYS.map(k => [k, {"1":null,"X":null,"2":null}])) });

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds?apiKey=${apiKey}&regions=eu,uk&markets=h2h&oddsFormat=decimal&bookmakers=${BOOKMAKER_KEYS.join(",")}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: `Odds API ${response.status}: ${errText.slice(0,200)}` });
    }

    const events = await response.json();

    const event = events.find(e =>
      (teamsMatch(e.home_team, home) && teamsMatch(e.away_team, away)) ||
      (teamsMatch(e.home_team, away) && teamsMatch(e.away_team, home))
    );

    const emptyBookmakers = Object.fromEntries(BOOKMAKER_KEYS.map(k => [k, {"1":null,"X":null,"2":null}]));

    if (!event) {
      return res.status(200).json({ home, away, league: leagueName, source_note: `Match not listed yet on The Odds API — usually appears 1-7 days before kick-off.`, bookmakers: emptyBookmakers });
    }

    const isFlipped = teamsMatch(event.home_team, away);
    const bookmakers = { ...emptyBookmakers };

    for (const bm of (event.bookmakers || [])) {
      const h2h = bm.markets?.find(m => m.key === "h2h");
      if (!h2h) continue;
      const outcomes = h2h.outcomes || [];
      const homeOut = outcomes.find(o => teamsMatch(o.name, isFlipped ? away : home));
      const awayOut = outcomes.find(o => teamsMatch(o.name, isFlipped ? home : away));
      const drawOut = outcomes.find(o => o.name === "Draw");
      bookmakers[bm.key] = {
        "1": homeOut?.price || null,
        "X": drawOut?.price || null,
        "2": awayOut?.price || null,
      };
    }

    const found = Object.values(bookmakers).filter(b => b["1"]).length;
    return res.status(200).json({
      home: event.home_team, away: event.away_team, league: leagueName,
      commence_time: event.commence_time,
      source_note: `Real-time odds via The Odds API · ${found}/${BOOKMAKER_KEYS.length} bookmakers listed`,
      bookmakers,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
