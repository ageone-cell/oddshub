export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { home, away, leagueName } = req.body;
  if (!home || !away) return res.status(400).json({ error: "Missing match details" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const prompt = `Search for current betting odds for the football match: "${home} vs ${away}" (${leagueName}).

Search multiple Kenya bookmaker sites and odds comparison sites to find the 1X2 (Home Win / Draw / Away Win) odds from each of these bookmakers:
- OdiBets (odibets.co.ke)
- Betika (betika.com)
- SportyBet Kenya (sportybet.com/ke)
- BetGr8 (betgr8.com)
- SportPesa (sportpesa.com)
- Betway Kenya (betway.co.ke)
- MozzartBet Kenya (mozzartbet.co.ke)
- BetWinner (betwinner.com)
- 1xBet Kenya (1xbet.com/en/ke)

Also check odds aggregators like oddsportal.com, flashscore.com, sofascore.com for any of these bookmakers.

Return ONLY a raw JSON object — no markdown, no backticks, no explanation. Use this exact structure:
{
  "home": "${home}",
  "away": "${away}",
  "league": "${leagueName}",
  "source_note": "brief note on where odds were found",
  "bookmakers": {
    "odibets":    {"1": 1.85, "X": 3.50, "2": 4.20},
    "betika":     {"1": 1.90, "X": 3.40, "2": 4.00},
    "sportybet":  {"1": 1.88, "X": 3.45, "2": 4.10},
    "betgr8":     {"1": 1.85, "X": 3.50, "2": 4.25},
    "sportpesa":  {"1": 1.87, "X": 3.45, "2": 4.15},
    "betway":     {"1": 1.89, "X": 3.42, "2": 4.05},
    "mozzartbet": {"1": 1.86, "X": 3.48, "2": 4.20},
    "betwinner":  {"1": 1.92, "X": 3.38, "2": 4.00},
    "1xbet":      {"1": 1.95, "X": 3.35, "2": 3.95}
  }
}

Rules:
- Use null for any bookmaker where you cannot find real odds
- All odds must be decimal format (e.g. 1.85)
- Do NOT invent odds — only return values you actually found via search`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || "Anthropic API error" });
    }

    const textBlock = data.content?.find(b => b.type === "text");
    if (!textBlock) return res.status(500).json({ error: "No response from AI" });

    let text = textBlock.text.trim().replace(/```json|```/gi, "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: "Could not parse odds data" });

    const oddsData = JSON.parse(jsonMatch[0]);
    return res.status(200).json(oddsData);

  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
