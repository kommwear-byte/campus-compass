/**
 * api.js — Claude API Integration
 *
 * All prompts and fetch calls to the Anthropic API live here.
 * Edit prompts to change what data is returned for each school.
 *
 * Model: claude-sonnet-4-20250514
 * Tools: web_search (live data from official school websites)
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 5000;

// ─────────────────────────────────────────────────────────────
// COLLEGE PROMPT
// ─────────────────────────────────────────────────────────────

function buildCollegePrompt(school, userState) {
  const { name, major, deadline } = userState;
  return `You are an expert college researcher with live web search access.
Search the official website of ${school.name} (${school.url}) to find real, accurate information.

Student profile:
- Name: ${name}
- College: ${school.name}, ${school.city}
- Major: ${major}
- Application Deadline: ${deadline}
- College type: ${school.type || 'University'}

Search ${school.name}'s official website for:
1. Their actual course catalog and ${major} program details
2. Real undergraduate research programs and labs
3. Official student organizations directory
4. Actual financial aid and scholarship pages
5. Real building names, dining halls, and campus facilities

Return ONLY valid JSON (no markdown, no code fences, no explanation):
{
  "source_url": "${school.url}",
  "source_description": "Data sourced from ${school.name}'s official website (${school.url}), academic catalog, and student affairs pages",
  "stats": {
    "total_opportunities": <integer>,
    "clubs_count": <integer>,
    "scholarships_count": <integer>
  },
  "academic_programs": [
    {
      "title": "Real program name at ${school.name}",
      "type": "Academic Program",
      "description": "2-3 sentences using real ${school.name} program details",
      "tag": "...",
      "deadline": "...",
      "source": "specific page on ${school.url}"
    }
  ],
  "research_internships": [
    {
      "title": "Real research or internship program name",
      "type": "Research or Internship",
      "description": "2-3 sentences with real program names at ${school.name}",
      "tag": "...",
      "deadline": "...",
      "source": "specific page on ${school.url}"
    }
  ],
  "clubs": [
    {
      "title": "Real student org name at ${school.name}",
      "type": "Student Org",
      "description": "Real details about this organization",
      "tag": "...",
      "deadline": "Ongoing",
      "source": "student affairs page"
    }
  ],
  "scholarships": [
    {
      "title": "Real scholarship name at ${school.name}",
      "type": "Scholarship",
      "description": "Real details including award amounts if known",
      "tag": "...",
      "deadline": "...",
      "source": "financial aid page"
    }
  ],
  "schedule": {
    "intro": "2-3 sentences about a real typical week for a ${major} student at ${school.name}, using actual course names and real building names.",
    "days": [
      {
        "name": "Monday",
        "type": "Class Day",
        "blocks": [
          { "time": "9:00 AM", "name": "Real course name", "location": "Real building at ${school.name}", "color": "#d4a843" },
          { "time": "11:00 AM", "name": "Real course name", "location": "Real building", "color": "#3dd6c0" },
          { "time": "1:00 PM",  "name": "Lunch", "location": "Real dining hall name at ${school.name}", "color": "#9d7fe8" },
          { "time": "3:00 PM",  "name": "Real course or lab", "location": "Real building", "color": "#d4a843" },
          { "time": "5:30 PM",  "name": "Club or Study", "location": "Real student center name", "color": "#5baee8" }
        ]
      },
      { "name": "Tuesday",   "type": "Lab Day",    "blocks": [ /* same shape */ ] },
      { "name": "Wednesday", "type": "Class Day",  "blocks": [ /* same shape */ ] },
      { "name": "Thursday",  "type": "Flex Day",   "blocks": [ /* same shape */ ] },
      { "name": "Friday",    "type": "Light Day",  "blocks": [ /* same shape */ ] }
    ],
    "workload": [
      { "label": "Weekly Study Hours",     "value": 18, "max": 40, "color": "#d4a843" },
      { "label": "Credit Hours / Semester","value": 15, "max": 21, "color": "#3dd6c0" },
      { "label": "Assignments / Week",     "value": 8,  "max": 20, "color": "#9d7fe8" },
      { "label": "Social & Campus Hours",  "value": 10, "max": 20, "color": "#5baee8" }
    ]
  },
  "campus_life": {
    "sections": [
      { "heading": "Morning Routine",                         "content": "3-4 realistic sentences about mornings at ${school.name}..." },
      { "heading": "Academic Culture at ${school.name}",     "content": "..." },
      { "heading": "Social Scene & Weekends",                 "content": "..." },
      { "heading": "City Life in ${school.city}",            "content": "..." },
      { "heading": "Career & Networking at ${school.name}",  "content": "..." }
    ]
  },
  "scholarship_advice": "3-4 sentence paragraph with specific ${school.name} scholarship names and actionable advice for ${name} studying ${major} there."
}

Rules:
- Use REAL program names, REAL building names, REAL org names from ${school.name}
- Each array must have at least 5 items
- Descriptions must be 2-3 sentences each, specific and informative
- Every source field should point to the exact page on ${school.url} where that info lives`;
}

// ─────────────────────────────────────────────────────────────
// HIGH SCHOOL PROMPT
// ─────────────────────────────────────────────────────────────

function buildHSPrompt(school, userState) {
  const { name, grade, interests } = userState;
  const interestStr = interests.join(', ') || 'General';
  const gradeNum = parseInt(grade) || 11;
  const gradYear = new Date().getFullYear() + (12 - gradeNum);

  return `You are an expert high school researcher with live web search access.
Search the official website of ${school.name} in ${school.city} (${school.url || 'their official website'}) to find real, accurate information.

Student profile:
- Name: ${name}
- School: ${school.name}, ${school.city}
- Grade: ${grade}
- Interests: ${interestStr}
- School type: ${school.type || 'Public High School'}
- Expected graduation year: ${gradYear}

Search ${school.name}'s official website for:
1. Their actual AP, IB, Honors, and dual enrollment course list
2. Real clubs and student organizations directory
3. Actual sports teams and athletic programs with seasons
4. Real scholarships, awards, and competitions for students
5. CTE pathways, career programs, and vocational offerings
6. Real teacher/department info and facility names

Return ONLY valid JSON (no markdown, no code fences):
{
  "source_url": "${school.url || school.name.toLowerCase().replace(/ /g,'') + '.org'}",
  "source_description": "Data sourced from ${school.name}'s official website and district records",
  "stats": {
    "total_opportunities": <integer>,
    "clubs_count": <integer>,
    "scholarships_count": <integer>,
    "grad_year": ${gradYear}
  },
  "academic_programs": [
    {
      "title": "Real AP/IB/Honors course name offered at ${school.name}",
      "type": "AP Course or IB or Honors",
      "description": "2-3 sentences about this specific course and how it's offered at ${school.name}",
      "tag": "...",
      "deadline": "...",
      "source": "${school.url || 'official website'}/academics or catalog"
    }
  ],
  "career_programs": [
    {
      "title": "Real CTE, dual enrollment, or career program at ${school.name}",
      "type": "CTE or Dual Enrollment or Career Program",
      "description": "Real program details including certifications or college credit earned",
      "tag": "...",
      "deadline": "...",
      "source": "CTE or career page"
    }
  ],
  "clubs": [
    {
      "title": "Real club name at ${school.name}",
      "type": "Club or Organization",
      "description": "Real details — what this club does, who leads it, what competitions they enter",
      "tag": "...",
      "deadline": "Ongoing",
      "source": "student life page"
    }
  ],
  "sports": [
    {
      "title": "Sport name (e.g. Varsity Football)",
      "type": "Varsity Sport",
      "description": "Real details about this program at ${school.name} — season, conference, recent performance",
      "tag": "Season (e.g. Fall)",
      "deadline": "Tryout month",
      "source": "athletics page"
    }
  ],
  "scholarships": [
    {
      "title": "Scholarship or award name",
      "type": "Scholarship or Award or Competition",
      "description": "Real details — amount, eligibility, what the school has won or achieved",
      "tag": "...",
      "deadline": "...",
      "source": "..."
    }
  ],
  "schedule": {
    "intro": "2-3 sentences about a realistic typical school day for a ${grade} student at ${school.name} interested in ${interestStr}.",
    "days": [
      {
        "name": "Monday",
        "type": "Regular Day",
        "blocks": [
          { "time": "7:30 AM", "name": "1st Period", "location": "Room / Building at ${school.name}", "color": "#34c98a" },
          { "time": "9:00 AM", "name": "2nd Period", "location": "Room", "color": "#5baee8" },
          { "time": "10:30 AM","name": "3rd Period", "location": "Room", "color": "#9d7fe8" },
          { "time": "12:00 PM","name": "Lunch",      "location": "Cafeteria at ${school.name}",    "color": "#e8a030" },
          { "time": "1:00 PM", "name": "4th Period", "location": "Room", "color": "#34c98a" },
          { "time": "2:30 PM", "name": "5th Period / Elective", "location": "Room", "color": "#5baee8" },
          { "time": "3:45 PM", "name": "After-School Activity", "location": "Gym / Field / Club Room", "color": "#3dd6c0" }
        ]
      },
      { "name": "Tuesday",   "type": "Lab / AP Day",    "blocks": [ /* same shape */ ] },
      { "name": "Wednesday", "type": "Regular Day",      "blocks": [ /* same shape */ ] },
      { "name": "Thursday",  "type": "Activity Day",     "blocks": [ /* same shape */ ] },
      { "name": "Friday",    "type": "Spirit Day",       "blocks": [ /* same shape */ ] }
    ],
    "workload": [
      { "label": "Daily Study Hours",    "value": 2,  "max": 6,  "color": "#34c98a" },
      { "label": "Classes Per Day",      "value": 6,  "max": 8,  "color": "#5baee8" },
      { "label": "Assignments / Week",   "value": 10, "max": 20, "color": "#9d7fe8" },
      { "label": "Activities / Week",    "value": 3,  "max": 7,  "color": "#e8a030" }
    ]
  },
  "college_prep": {
    "sections": [
      { "heading": "${grade} Priorities at ${school.name}",    "content": "Grade-specific, actionable advice..." },
      { "heading": "Test Prep & Standardised Testing",          "content": "..." },
      { "heading": "Building Your College List",                "content": "..." },
      { "heading": "Extracurricular Strategy",                  "content": "..." },
      { "heading": "Financial Aid & FAFSA Prep",                "content": "..." }
    ],
    "timeline": [
      { "label": "SAT/ACT Prep",               "pct": ${gradeNum >= 11 ? 70 : 40} },
      { "label": "Course Rigor (AP/IB)",        "pct": ${gradeNum >= 10 ? 65 : 35} },
      { "label": "Extracurricular Leadership",  "pct": ${gradeNum >= 11 ? 60 : 30} },
      { "label": "College List Research",       "pct": ${gradeNum >= 11 ? 55 : 20} },
      { "label": "Application Essays",          "pct": ${gradeNum >= 12 ? 80 : 15} }
    ]
  },
  "daily_life": {
    "sections": [
      { "heading": "Morning at ${school.name}",                  "content": "..." },
      { "heading": "Academic Culture",                           "content": "..." },
      { "heading": "After-School Scene",                         "content": "..." },
      { "heading": "Social & Weekend Life in ${school.city}",   "content": "..." }
    ]
  },
  "scholarship_advice": "3-4 sentence actionable advice for ${name} in ${grade} at ${school.name} interested in ${interestStr}."
}

Rules:
- Use REAL course names, REAL club names, REAL sport programs from ${school.name}
- Each array must have at least 5 items
- Include real AP exam names, real conference/league names for sports
- Be specific about what makes ${school.name} in ${school.city} unique`;
}

// ─────────────────────────────────────────────────────────────
// API FETCH — COLLEGE
// ─────────────────────────────────────────────────────────────

async function fetchCollegeData(school, userState) {
  const prompt = buildCollegePrompt(school, userState);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    let raw = '';
    if (data.content) {
      for (const block of data.content) {
        if (block.type === 'text') raw += block.text;
      }
    }
    return parseJSON(raw);
  } catch (err) {
    console.error('[api.js] College fetch error:', err);
    return null; // app.js will use fallback
  }
}

// ─────────────────────────────────────────────────────────────
// API FETCH — HIGH SCHOOL
// ─────────────────────────────────────────────────────────────

async function fetchHSData(school, userState) {
  const prompt = buildHSPrompt(school, userState);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    let raw = '';
    if (data.content) {
      for (const block of data.content) {
        if (block.type === 'text') raw += block.text;
      }
    }
    return parseJSON(raw);
  } catch (err) {
    console.error('[api.js] HS fetch error:', err);
    return null; // app.js will use fallback
  }
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Safely extract and parse the first JSON object in a string */
function parseJSON(text) {
  try {
    text = text.trim();
    const start = text.indexOf('{');
    const end   = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object found');
    return JSON.parse(text.slice(start, end + 1));
  } catch (err) {
    console.error('[api.js] JSON parse error:', err);
    return null;
  }
}
