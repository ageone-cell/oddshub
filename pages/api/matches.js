// pages/api/matches.js
// Fetches real upcoming fixtures from football-data.org (free API)

const LEAGUE_IDS = {
  ucl:        { code: "CL",  name: "Champions League",  logo: "⭐", country: "UEFA Competitions", flag: "🏆" },
  uel:        { code: "EL",  name: "Europa League",     logo: "🔶", country: "UEFA Competitions", flag: "🏆" },
  uecl:       { code: "ECL", name: "Conference League", logo: "🔷", country: "UEFA Competitions", flag: "🏆" },
  epl:        { code: "PL",  name: "Premier League",    logo: "🦁", country: "England",            flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  laliga:     { code: "PD",  name: "La Liga",           logo: "🌟", country: "Spain",              flag: "🇪🇸" },
  bundesliga: { code: "BL1", name: "Bundesliga",        logo: "🦅", country: "Germany",            flag: "🇩🇪" },
  seriea:     { code: "SA",  name: "Serie A",           logo: "🐉", country: "Italy",              flag: "🇮🇹" },
  ligue1:     { code: "FL1", name: "Ligue 1",           logo: "⚜️", country: "France",             flag: "🇫🇷" },
  eredivisie: { code: "DED", name: "Eredivisie",        logo: "🌷", country: "Netherlands",        flag: "🇳🇱" },
  primeira:   { code: "PPL", name: "Primeira Liga",     logo: "🦅", country: "Portugal",           flag: "🇵🇹" },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, tomorrow)) return "Tomorrow";
  return d.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-KE", {
    hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi",
  });
}

export default async function handler(req, res) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "FOOTBALL_DATA_API_KEY not set" });
  }

  try {
    // Fetch from all leagues in parallel
    const competitionCodes = Object.values(LEAGUE_IDS).map(l => l.code);
    const uniqueCodes = [...new Set(competitionCodes)];

    // Get fixtures for next 7 days
    const dateFrom = new Date().toISOString().split("T")[0];
    const dateTo = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    const responses = await Promise.allSettled(
      uniqueCodes.map(code =>
        fetch(
          `https://api.football-data.org/v4/competitions/${code}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED,TIMED`,
          { headers: { "X-Auth-Token": apiKey } }
        ).then(r => r.json())
      )
    );

    // Build structured result grouped by league
    const leagueMap = {};

    responses.forEach((result, i) => {
      if (result.status !== "fulfilled") return;
      const data = result.value;
      if (!data.matches || data.error) return;

      const code = uniqueCodes[i];
      // Find league key by code
      const leagueKey = Object.keys(LEAGUE_IDS).find(k => LEAGUE_IDS[k].code === code);
      if (!leagueKey) return;

      const meta = LEAGUE_IDS[leagueKey];

      const matches = data.matches.slice(0, 8).map(m => ({
        id: String(m.id),
        home: m.homeTeam.shortName || m.homeTeam.name,
        away: m.awayTeam.shortName || m.awayTeam.name,
        homeFull: m.homeTeam.name,
        awayFull: m.awayTeam.name,
        date: formatDate(m.utcDate),
        time: formatTime(m.utcDate),
        utcDate: m.utcDate,
        status: m.status,
      }));

      if (matches.length === 0) return;

      if (!leagueMap[meta.country]) {
        leagueMap[meta.country] = {
          country: meta.country,
          flag: meta.flag,
          id: meta.country.toLowerCase().replace(/\s/g, "_"),
          leagues: [],
        };
      }

      leagueMap[meta.country].leagues.push({
        id: leagueKey,
        name: meta.name,
        logo: meta.logo,
        matches,
      });
    });

    const grouped = Object.values(leagueMap);

    // Sort: UEFA first
    grouped.sort((a, b) => {
      if (a.country === "UEFA Competitions") return -1;
      if (b.country === "UEFA Competitions") return 1;
      return a.country.localeCompare(b.country);
    });

    return res.status(200).json({ leagues: grouped, fetchedAt: new Date().toISOString() });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
