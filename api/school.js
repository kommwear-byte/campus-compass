// ═══════════════════════════════════════════════
// Campus Compass Backend (Node.js Runtime)
// Runs on Vercel — proxies Exa + Claude calls
// ═══════════════════════════════════════════════

module.exports = async function handler(req, res) {
  // Set CORS headers on every response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const t0 = Date.now();

  try {
    const { school, city, url, mode } = req.body;
    console.log(`[${school}] Starting fetch (mode=${mode})`);

    if (!school || !mode) {
      return res.status(400).json({ error: 'Missing required fields: school, mode' });
    }

    const EXA_KEY = process.env.EXA_API_KEY;
    const OR_KEY = process.env.OPENROUTER_API_KEY;

    if (!EXA_KEY || !OR_KEY) {
      console.error('Missing env vars', { hasExa: !!EXA_KEY, hasOR: !!OR_KEY });
      return res.status(500).json({ error: 'Server misconfigured — API keys not set' });
    }

    // ── Step 1: Run 5 Exa searches in parallel ──
    const isCol = mode === 'col';
    const queries = isCol ? [
      { key: 'scholarships', q: `${school} scholarships financial aid grants` },
      { key: 'programs',     q: `${school} academic programs majors departments` },
      { key: 'clubs',        q: `${school} student organizations clubs activities` },
      { key: 'research',     q: `${school} undergraduate research opportunities internships` },
      { key: 'career',       q: `${school} career center internships shadowing programs` },
    ] : [
      { key: 'scholarships', q: `${school} ${city} scholarships financial aid high school` },
      { key: 'programs',     q: `${school} AP courses IB program academics` },
      { key: 'clubs',        q: `${school} clubs student organizations activities` },
      { key: 'sports',       q: `${school} athletics sports teams` },
      { key: 'career',       q: `${school} CTE career technical education programs` },
    ];

    let searchResults;
    try {
      searchResults = await Promise.all(
        queries.map(q =>
          runExaSearch(EXA_KEY, q.q)
            .then(r => ({ key: q.key, results: r }))
            .catch(err => {
              console.error(`Exa "${q.q}" failed:`, err.message);
              return { key: q.key, results: [] };
            })
        )
      );
      console.log(`[${school}] Exa done in ${Date.now() - t0}ms`);
    } catch (err) {
      console.error('Exa parallel failed:', err.message);
      return res.status(500).json({ error: `Exa search failed: ${err.message}` });
    }

    // ── Step 2: Send to Claude ──
    let structured;
    try {
      structured = await runClaude(OR_KEY, { school, city, url, mode }, searchResults);
      console.log(`[${school}] Total done in ${Date.now() - t0}ms`);
    } catch (err) {
      console.error('Claude failed:', err.message);
      return res.status(500).json({ error: `Claude call failed: ${err.message}` });
    }

    return res.status(200).json(structured);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

// ═══════════════════════════════════════════════
// EXA SEARCH
// ═══════════════════════════════════════════════
async function runExaSearch(key, query) {
  const res = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
    },
    body: JSON.stringify({
      query: query,
      numResults: 3,
      type: 'auto',
      contents: {
        highlights: { numSentences: 2, highlightsPerUrl: 1 },
      },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Exa ${res.status}: ${errText.substring(0, 150)}`);
  }
  const data = await res.json();
  return (data.results || []).map(r => ({
    title: r.title || '',
    url: r.url || '',
    highlights: Array.isArray(r.highlights) ? r.highlights.join(' ').substring(0, 300) : '',
  }));
}

// ═══════════════════════════════════════════════
// CLAUDE (via OpenRouter)
// ═══════════════════════════════════════════════
async function runClaude(key, school, searchResults) {
  const isCol = school.mode === 'col';
  const searchText = searchResults
    .map(sr =>
      `\n=== ${sr.key.toUpperCase()} SEARCH ===\n` +
      sr.results.map((r, i) =>
        `[${i + 1}] ${r.title}\nURL: ${r.url}\nExcerpt: ${r.highlights}`
      ).join('\n\n')
    )
    .join('\n');

  const schema = isCol ? colSchema(school) : hsSchema(school);
  const prompt = `You are structuring data for a student opportunity dashboard about ${school.school} (${school.city}).

Below are REAL search results from Exa about ${school.school}. Use ONLY facts and URLs from these search results.

${searchText}

Now output STRICT JSON matching this schema:
${schema}

Rules:
- Every URL must come from the search results above — no made-up URLs
- If a section has few real results, still include 5-6 items with realistic content
- Output ONLY JSON, no preamble, no markdown fences
- Start response with { and end with }`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key,
    },
    body: JSON.stringify({
      model: 'anthropic/claude-haiku-4.5',
      max_tokens: 5000,
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: '{' },
      ],
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude ${res.status}: ${errText.substring(0, 200)}`);
  }
  const data = await res.json();
  let text = data.choices?.[0]?.message?.content || '';
  if (!text.trimStart().startsWith('{')) text = '{' + text;

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Claude returned invalid JSON: ' + text.substring(0, 200));
  }
}

// ═══════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════
function colSchema(s) {
  return `{
  "school": "${s.school}",
  "city": "${s.city}",
  "url": "https://${s.url}",
  "overview": "2-3 sentences about the school",
  "programs": [
    { "title": "Real major/program name", "type": "Academic Program", "description": "2 sentences", "url": "real URL from search" }
  ],
  "research": [
    { "title": "Real research program", "type": "Research", "description": "2 sentences", "deadline": "date or Rolling", "url": "real URL" }
  ],
  "clubs": [
    { "title": "Real student org name", "type": "Student Org", "description": "2 sentences", "url": "real URL" }
  ],
  "scholarships": [
    { "title": "Real scholarship name", "type": "Scholarship", "description": "2 sentences with dollar amount", "deadline": "real deadline", "url": "real URL" }
  ],
  "schedule": {
    "intro": "1-2 sentences about typical week",
    "sample_courses": ["Real course 1", "Real course 2", "Real course 3", "Real course 4"]
  },
  "campus_life": [
    { "heading": "Academic Culture", "content": "2 sentences" },
    { "heading": "Social Scene", "content": "2 sentences" },
    { "heading": "Living in ${s.city}", "content": "2 sentences" }
  ],
  "stats": { "programs": 40, "clubs": 150, "scholarships": 25 }
}
6+ items each in programs/research/clubs/scholarships.`;
}

function hsSchema(s) {
  return `{
  "school": "${s.school}",
  "city": "${s.city}",
  "url": "https://${s.url}",
  "overview": "2-3 sentences",
  "programs": [
    { "title": "Real AP/IB course", "type": "AP Course", "description": "2 sentences", "url": "real URL" }
  ],
  "career": [
    { "title": "Real CTE program", "type": "CTE", "description": "2 sentences", "url": "real URL" }
  ],
  "clubs": [
    { "title": "Real club name", "type": "Club", "description": "2 sentences", "url": "real URL" }
  ],
  "sports": [
    { "title": "Sport name", "type": "Varsity", "description": "2 sentences", "url": "real URL" }
  ],
  "scholarships": [
    { "title": "Scholarship name", "type": "Scholarship", "description": "2 sentences", "url": "real URL" }
  ],
  "schedule": {
    "intro": "1-2 sentences",
    "sample_courses": ["Course 1", "Course 2", "Course 3", "Course 4"]
  },
  "campus_life": [
    { "heading": "Academic Culture", "content": "2 sentences" },
    { "heading": "After School Life", "content": "2 sentences" },
    { "heading": "Living in ${s.city}", "content": "2 sentences" }
  ],
  "stats": { "programs": 35, "clubs": 40, "scholarships": 20 }
}
5+ items each.`;
}
