// pages/api/odds.js
// Increase Vercel timeout — the AI web search takes 20–40 seconds
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { home, away, leagueName } = req.body;
  if (!home || !away) return res.status(400).json({ error: "Missing match details" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  const prompt = `You must search the web right now to find current betting odds for: "${home} vs ${away}" (${leagueName}).

Search these specific Kenya bookmaker websites for 1X2 odds on this match:
1. Search "sportybet kenya ${home} ${away} odds"
2. Search "betika ${home} ${away} odds"
3. Search "betway kenya ${home} ${away} odds"
4. Search "sportpesa ${home} ${away} odds"
5. Search "1xbet kenya ${home} ${away} odds"
6. Search "odibets ${home} ${away} odds"
7. Search "betwinner ${home} ${away} odds"
8. Search "mozzartbet ${home} ${away} odds"
9. Also search oddsportal.com and flashscore.com for "${home} vs ${away}"

After searching, return ONLY a raw JSON object. No markdown, no backticks, no explanation:

{
  "home": "${home}",
  "away": "${away}",
  "league": "${leagueName}",
  "source_note": "where you found the odds",
  "bookmakers": {
    "odibets":    {"1": null, "X": null, "2": null},
    "betika":     {"1": null, "X": null, "2": null},
    "sportybet":  {"1": null, "X": null, "2": null},
    "betgr8":     {"1": null, "X": null, "2": null},
    "sportpesa":  {"1": null, "X": null, "2": null},
    "betway":     {"1": null, "X": null, "2": null},
    "mozzartbet": {"1": null, "X": null, "2": null},
    "betwinner":  {"1": null, "X": null, "2": null},
    "1xbet":      {"1": null, "X": null, "2": null}
  }
}

Replace null with the actual decimal odd found. Keep null if not found. Never invent odds.`;

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
        max_tokens: 1024,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: `Anthropic API error ${response.status}: ${errText.slice(0,200)}` });
    }

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const textBlocks = (data.content || []).filter(b => b.type === "text");
    if (!textBlocks.length) return res.status(500).json({ error: "No text response from AI" });

    let text = textBlocks[textBlocks.length - 1].text.trim().replace(/```json|```/gi, "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: "Could not parse AI response", raw: text.slice(0,300) });

    const oddsData = JSON.parse(jsonMatch[0]);

    // Sanitize values
    for (const bm of Object.keys(oddsData.bookmakers || {})) {
      for (const mkt of ["1", "X", "2"]) {
        const v = oddsData.bookmakers[bm][mkt];
        oddsData.bookmakers[bm][mkt] = (v && !isNaN(Number(v)) && Number(v) > 1) ? Number(v) : null;
      }
    }

    return res.status(200).json(oddsData);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
