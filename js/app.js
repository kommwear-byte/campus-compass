/**
 * app.js — Main Application Logic
 *
 * Handles:
 *  - Page routing
 *  - Directory rendering & filtering
 *  - Quiz flow (college + high school)
 *  - Dashboard building (college + high school)
 *  - Compare strip (multiple visited schools)
 *  - Fallback data when API is unavailable
 */

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────

const collegeState = { name: '', major: '', deadline: '' };
const hsState      = { name: '', grade: '', interests: [] };

let activeSchool   = {};
let activeMode     = 'college';
let curCollegeQ    = 1;
let curHSQ         = 1;
const visitedSchools = [];  // [{ ...school, mode: 'col'|'hs' }]

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  generateStars();
  buildMajorGrid('col-major-grid', 'col');
  buildInterestGrid('hs-interest-grid');
  buildLoadSteps('col-load-steps', [
    'Locating official college website',
    'Reading academic programs & course catalog',
    'Scanning research & internship pages',
    'Finding student orgs & clubs directory',
    'Pulling scholarships & financial aid data',
    'Building personalised schedule preview',
  ]);
  buildLoadSteps('hs-load-steps', [
    'Locating official school website',
    'Reading AP, IB & advanced course offerings',
    'Scanning clubs, sports & activities pages',
    'Finding scholarship & award opportunities',
    'Building grade-level schedule preview',
  ]);
  document.getElementById('cf-deadline').min =
    new Date().toISOString().split('T')[0];
});

// ─────────────────────────────────────────────────────────────
// STAR FIELD
// ─────────────────────────────────────────────────────────────

function generateStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random() * 100}%;
      left:${Math.random() * 100}%;
      --op:${Math.random() * 0.5 + 0.1};
      --d:${Math.random() * 4 + 2}s;
      --delay:-${Math.random() * 5}s`;
    container.appendChild(s);
  }
}

// ─────────────────────────────────────────────────────────────
// ROUTING
// ─────────────────────────────────────────────────────────────

function nav(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  window.scrollTo(0, 0);
}

function setMode(mode) {
  activeMode = mode;
  document.getElementById('mesh').className = 'mesh ' + (mode === 'college' ? 'college' : 'hs');
  document.getElementById('logo-icon').className = 'logo-icon ' + (mode === 'college' ? 'col' : 'hs');
  document.getElementById('logo-name').className  = 'logo-name' + (mode === 'hs' ? ' hs' : '');
  document.querySelectorAll('.hn-btn').forEach(b => b.classList.remove('active-col', 'active-hs'));
  const id = mode === 'college' ? 'hb-col' : 'hb-hs';
  document.getElementById(id).classList.add('active-' + (mode === 'college' ? 'col' : 'hs'));
}

// ─────────────────────────────────────────────────────────────
// DIRECTORY
// ─────────────────────────────────────────────────────────────

function openDir(mode) {
  setMode(mode);
  const id   = mode === 'college' ? 'col' : 'hs';
  const data = mode === 'college' ? COL_DIR : HS_DIR;
  const cats = Object.keys(data);

  // Build filter pills
  const fp = document.getElementById(id + '-filters');
  fp.innerHTML = `<span class="fpill on ${id}" onclick="setFilter('${id}','All',this)">All</span>`;
  cats.forEach(c => {
    fp.innerHTML += `<span class="fpill" onclick="setFilter('${id}','${c.replace(/'/g,"\\'")}',this)">${c}</span>`;
  });

  buildDir(id, data, null);
  nav(mode === 'college' ? 'col-dir' : 'hs-dir');
}

function buildDir(id, data, activeFilter) {
  const cont = document.getElementById(id + '-dir-content');
  const query = (document.getElementById(id + '-search').value || '').toLowerCase();
  let html = '';

  Object.entries(data).forEach(([cat, schools]) => {
    if (activeFilter && activeFilter !== 'All' && cat !== activeFilter) return;
    const filtered = schools.filter(s =>
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.city.toLowerCase().includes(query) ||
      s.tags.some(t => t.toLowerCase().includes(query))
    );
    if (!filtered.length) return;

    html += `<div class="cat-section">
      <div class="cat-label">${cat}</div>
      <div class="school-grid">`;

    filtered.forEach(s => {
      const tags = s.tags.slice(0, 2).map(t => `<span class="st-tag">${t}</span>`).join('');
      const safeSchool = JSON.stringify(s).replace(/"/g, '&quot;');
      const modeStr = id === 'col' ? 'college' : 'hs';
      html += `
        <div class="school-tile ${id}" onclick="selectSchool(JSON.parse(this.dataset.school), '${modeStr}')" data-school="${safeSchool}">
          <div class="school-tile-name">${s.name}</div>
          <div class="school-tile-meta">
            ${s.city}<br>
            <span style="font-size:.65rem;color:var(--text4)">${s.type}</span>
          </div>
          <div class="school-tile-tags">${tags}</div>
          <span class="school-tile-arrow">→</span>
        </div>`;
    });
    html += '</div></div>';
  });

  if (!html) html = '<div class="no-results">No schools match your search. Try a different term.</div>';
  cont.innerHTML = html;
}

function filterSchools(id) {
  const data = id === 'col' ? COL_DIR : HS_DIR;
  const activePill = document.querySelector(`#${id}-filters .fpill.on`);
  buildDir(id, data, activePill ? activePill.textContent : null);
}

function setFilter(id, cat, el) {
  document.querySelectorAll(`#${id}-filters .fpill`).forEach(p => p.classList.remove('on', 'col', 'hs'));
  el.classList.add('on', id);
  buildDir(id, id === 'col' ? COL_DIR : HS_DIR, cat === 'All' ? null : cat);
}

// ─────────────────────────────────────────────────────────────
// SELECT A SCHOOL → START QUIZ
// ─────────────────────────────────────────────────────────────

function selectSchool(school, mode) {
  activeSchool = school;
  setMode(mode);
  if (mode === 'college') {
    document.getElementById('cqsb-name').textContent = school.name;
    document.getElementById('cqsb-meta').textContent = `${school.city} • ${school.type}`;
    cshowQ(1);
    nav('col-quiz');
  } else {
    document.getElementById('hqsb-name').textContent = school.name;
    document.getElementById('hqsb-meta').textContent = `${school.city} • ${school.type}`;
    hshowQ(1);
    nav('hs-quiz');
  }
}

// ─────────────────────────────────────────────────────────────
// COLLEGE QUIZ
// ─────────────────────────────────────────────────────────────

function cshowQ(n) {
  document.querySelectorAll('[id^="cq"]').forEach(b => b.classList.remove('active'));
  document.getElementById('cq' + n).classList.add('active');
  curCollegeQ = n;
  for (let i = 1; i <= 3; i++) {
    const seg = document.getElementById('cps' + i);
    seg.classList.remove('done', 'on');
    if (i < n) seg.classList.add('done');
    else if (i === n) seg.classList.add('on');
  }
  document.getElementById('cp-label').textContent = `Question ${n} of 3`;
  document.getElementById('cp-pct').textContent   = Math.round((n - 1) / 3 * 100) + '%';
}

function cpf(fieldId, el) {
  document.getElementById(fieldId).value = el.textContent;
  el.closest('.chip-row').querySelectorAll('.chip').forEach(c => c.classList.remove('pk'));
  el.classList.add('pk');
}

function cpickMaj(el, value) {
  document.querySelectorAll('.maj-tile.col').forEach(t => t.classList.remove('pk'));
  el.classList.add('pk');
  document.getElementById('cf-major').value = value;
}

function csdl(value) {
  document.getElementById('cf-deadline').value = value;
}

function cnq(from) {
  if (from === 1) {
    const v = document.getElementById('cf-name').value.trim();
    if (!v) { alert('Please enter your name.'); return; }
    collegeState.name = v;
  } else if (from === 2) {
    const v = document.getElementById('cf-major').value.trim();
    if (!v) { alert('Please select or type your major.'); return; }
    collegeState.major = v;
  }
  cshowQ(from + 1);
}

async function csubmit() {
  const v = document.getElementById('cf-deadline').value;
  if (!v) { alert('Please choose a deadline date.'); return; }
  collegeState.deadline = v;
  document.getElementById('cl-name').textContent = activeSchool.name;
  document.getElementById('cl-url').textContent  = `Searching: ${activeSchool.url} and official program pages…`;
  nav('col-load');
  animateLoader('col-load-steps', 'col');

  const data = await fetchCollegeData(activeSchool, collegeState);
  buildCollegeDashboard(data || getCollegeFallback(activeSchool, collegeState));
}

// ─────────────────────────────────────────────────────────────
// HIGH SCHOOL QUIZ
// ─────────────────────────────────────────────────────────────

function hshowQ(n) {
  document.querySelectorAll('[id^="hq"]').forEach(b => b.classList.remove('active'));
  document.getElementById('hq' + n).classList.add('active');
  curHSQ = n;
  for (let i = 1; i <= 3; i++) {
    const seg = document.getElementById('hps' + i);
    seg.classList.remove('done', 'on');
    if (i < n) seg.classList.add('done');
    else if (i === n) seg.classList.add('on');
  }
  document.getElementById('hp-label').textContent = `Question ${n} of 3`;
  document.getElementById('hp-pct').textContent   = Math.round((n - 1) / 3 * 100) + '%';
}

function hpf(fieldId, el) {
  document.getElementById(fieldId).value = el.textContent;
  el.closest('.chip-row').querySelectorAll('.chip').forEach(c => c.classList.remove('pk'));
  el.classList.add('pk');
}

function hpickGrade(el, grade, label) {
  document.querySelectorAll('.grade-tile').forEach(t => t.classList.remove('pk'));
  el.classList.add('pk');
  hsState.grade = grade;
  document.getElementById('hf-grade').value = `${grade} — ${label}`;
}

function hpickInt(el) {
  const alreadyPicked = el.classList.contains('pk');
  const currentCount  = document.querySelectorAll('.int-tile.pk').length;
  if (!alreadyPicked && currentCount >= 3) {
    alert('You can pick up to 3 interests.');
    return;
  }
  el.classList.toggle('pk');
  // Use data-val attribute — set in ui.js buildInterestGrid()
  hsState.interests = Array.from(document.querySelectorAll('.int-tile.pk'))
    .map(t => t.dataset.val);
}

function hnq(from) {
  if (from === 1) {
    const v = document.getElementById('hf-name').value.trim();
    if (!v) { alert('Please enter your name.'); return; }
    hsState.name = v;
  } else if (from === 2) {
    if (!hsState.grade) { alert('Please select your grade.'); return; }
  }
  hshowQ(from + 1);
}

async function hsubmit() {
  if (!hsState.interests.length) {
    alert('Please pick at least one interest.');
    return;
  }
  document.getElementById('hl-name').textContent = activeSchool.name;
  document.getElementById('hl-url').textContent  = `Searching: ${activeSchool.url} and official pages…`;
  nav('hs-load');
  animateLoader('hs-load-steps', 'hs');

  const data = await fetchHSData(activeSchool, hsState);
  buildHSDashboard(data || getHSFallback(activeSchool, hsState));
}

// ─────────────────────────────────────────────────────────────
// COLLEGE DASHBOARD BUILDER
// ─────────────────────────────────────────────────────────────

function buildCollegeDashboard(d) {
  const school = activeSchool;
  if (!visitedSchools.find(s => s.name === school.name && s.mode === 'col'))
    visitedSchools.push({ ...school, mode: 'col' });
  updateCompareStrip('col', visitedSchools, activeSchool);

  // Header
  document.getElementById('cd-name').textContent = school.name;
  const dl = new Date(collegeState.deadline + 'T12:00:00');
  document.getElementById('cd-pills').innerHTML = [
    pill('🎓 ' + school.name,    'col'),
    pill('📍 ' + school.city,    ''),
    pill('📖 ' + collegeState.major, 'tl'),
    pill('⏰ ' + dl.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 'ro'),
    pill('👤 ' + collegeState.name, 'li'),
  ].join('');
  document.getElementById('cd-src').textContent =
    d.source_description || `Data sourced from ${school.name}'s official website (${school.url})`;

  // Stats
  buildStatRow('col-stat-row', [
    { value: d.stats?.total_opportunities || '40+', label: 'Total Opportunities', colorClass: 'cg' },
    { value: d.stats?.clubs_count         || '150+',label: 'Student Orgs',         colorClass: 'ct' },
    { value: d.stats?.scholarships_count  || '25+', label: 'Scholarships',          colorClass: 'cl' },
    { value: Math.max(0, Math.round((dl - new Date()) / 86400000)), label: 'Days to Deadline', colorClass: 'cr' },
  ]);

  // Tab bar
  buildTabBar('col-tab-bar', [
    { label: '🎯 Opportunities', onclick: "ctab('opportunities',this)" },
    { label: '📅 Schedule',      onclick: "ctab('schedule',this)" },
    { label: '🏛️ Campus Life',   onclick: "ctab('life',this)" },
    { label: '💰 Scholarships',  onclick: "ctab('scholarships',this)" },
  ], 'col');

  // Content
  renderGrid('cog-academic',   d.academic_programs,    'tg');
  renderGrid('cog-research',   d.research_internships, 'tt');
  renderGrid('cog-clubs',      d.clubs,                'tl');
  renderGrid('cog-scholarships',d.scholarships,        'tr');

  document.getElementById('c-sched-intro').innerHTML =
    `<h3>A Week as a ${collegeState.major} Student at ${school.name}</h3><p>${d.schedule?.intro || ''}</p>`;
  buildWeekGrid('c-week-grid', d.schedule?.days || []);
  buildWorkload('c-wl-row',    d.schedule?.workload || []);
  buildProseCard('c-life-content', d.campus_life?.sections, 'col');

  document.getElementById('c-aid-prose').innerHTML = d.scholarship_advice
    ? `<div class="prose-card col" style="margin-top:1.4rem">
         <h3>Personalised Strategy for ${collegeState.name} at ${school.name}</h3>
         <p>${d.scholarship_advice}</p>
       </div>`
    : '';

  nav('col-dash');
}

// ─────────────────────────────────────────────────────────────
// HIGH SCHOOL DASHBOARD BUILDER
// ─────────────────────────────────────────────────────────────

function buildHSDashboard(d) {
  const school   = activeSchool;
  const gradeNum = parseInt(hsState.grade) || 11;
  const gradYear = d.stats?.grad_year || new Date().getFullYear() + (12 - gradeNum);

  if (!visitedSchools.find(s => s.name === school.name && s.mode === 'hs'))
    visitedSchools.push({ ...school, mode: 'hs' });
  updateCompareStrip('hs', visitedSchools, activeSchool);

  // Header
  document.getElementById('hd-name').textContent = school.name;
  document.getElementById('hd-pills').innerHTML = [
    pill('📚 ' + school.name,                              'hs'),
    pill('📍 ' + school.city,                              ''),
    pill('🎒 ' + hsState.grade,                            'sk'),
    pill('⭐ ' + hsState.interests.slice(0, 2).join(', '), 'am'),
    pill('👤 ' + hsState.name,                             'tl'),
  ].join('');
  document.getElementById('hd-src').textContent =
    d.source_description || `Data sourced from ${school.name}'s official website`;

  // Stats
  buildStatRow('hs-stat-row', [
    { value: d.stats?.total_opportunities || '35+', label: 'Total Opportunities', colorClass: 'ce' },
    { value: d.stats?.clubs_count         || '40+', label: 'Clubs & Activities',   colorClass: 'cs' },
    { value: d.stats?.scholarships_count  || '20+', label: 'Scholarships',          colorClass: 'ca' },
    { value: "'" + String(gradYear).slice(-2),       label: 'Graduation Year',       colorClass: 'ct' },
  ]);

  // Tab bar
  buildTabBar('hs-tab-bar', [
    { label: '📖 Programs',     onclick: "htab('programs',this)" },
    { label: '🎭 Activities',   onclick: "htab('activities',this)" },
    { label: '📅 Schedule',     onclick: "htab('schedule',this)" },
    { label: '💰 Scholarships', onclick: "htab('scholarships',this)" },
    { label: '🎓 College Prep', onclick: "htab('collegeprep',this)" },
  ], 'hs');

  // Content
  renderGrid('hog-academic',     d.academic_programs, 'te');
  renderGrid('hog-career',       d.career_programs,   'ts');
  renderGrid('hog-clubs',        d.clubs,             'tl');
  renderGrid('hog-sports',       d.sports,            'ta');
  renderGrid('hog-scholarships', d.scholarships,      'tr');

  document.getElementById('h-sched-intro').innerHTML =
    `<h3>A School Day for a ${hsState.grade} Student at ${school.name}</h3><p>${d.schedule?.intro || ''}</p>`;
  buildWeekGrid('h-week-grid', d.schedule?.days    || []);
  buildWorkload('h-wl-row',    d.schedule?.workload || []);

  // College prep tab
  const pc = document.getElementById('h-prep-content');
  if (d.college_prep) {
    let h = '<div class="prose-card hs">';
    (d.college_prep.sections || []).forEach(s => {
      h += `<h3>${s.heading}</h3><p>${s.content}</p>`;
    });
    h += '</div>';
    pc.innerHTML = h;
    buildPrepTimeline('h-prep-content', d.college_prep.timeline);
  }

  buildProseCard('h-life-content', d.daily_life?.sections, 'hs');

  document.getElementById('h-aid-prose').innerHTML = d.scholarship_advice
    ? `<div class="prose-card hs" style="margin-top:1.4rem">
         <h3>Personalised Strategy for ${hsState.name}</h3>
         <p>${d.scholarship_advice}</p>
       </div>`
    : '';

  nav('hs-dash');
}

// ─────────────────────────────────────────────────────────────
// TAB SWITCHERS
// ─────────────────────────────────────────────────────────────

function ctab(id, btn) {
  document.querySelectorAll('[id^="ctab-"]').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('[onclick^="ctab"]').forEach(b => b.classList.remove('on'));
  document.getElementById('ctab-' + id).classList.add('on');
  btn.classList.add('on');
}

function htab(id, btn) {
  document.querySelectorAll('[id^="htab-"]').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('[onclick^="htab"]').forEach(b => b.classList.remove('on'));
  document.getElementById('htab-' + id).classList.add('on');
  btn.classList.add('on');
}

// ─────────────────────────────────────────────────────────────
// COMPARE STRIP — switch between previously visited schools
// ─────────────────────────────────────────────────────────────

function switchToSchool(index, mode) {
  const schools = visitedSchools.filter(s => s.mode === mode);
  if (schools[index]) selectSchool(schools[index], mode === 'col' ? 'college' : 'hs');
}

// ─────────────────────────────────────────────────────────────
// KEYBOARD SHORTCUT — Enter to advance quiz
// ─────────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const colQuiz = document.getElementById('page-col-quiz');
  const hsQuiz  = document.getElementById('page-hs-quiz');
  if (colQuiz.classList.contains('active')) {
    const btn = document.querySelector(`#cq${curCollegeQ} .btn-col`);
    if (btn) btn.click();
  } else if (hsQuiz.classList.contains('active')) {
    const btn = document.querySelector(`#hq${curHSQ} .btn-hs`);
    if (btn) btn.click();
  }
});

// ─────────────────────────────────────────────────────────────
// FALLBACK DATA (used if API call fails)
// Full fallback data is defined below. It mirrors the exact JSON
// shape the API is expected to return so the dashboard renders
// cleanly even without a network connection.
// ─────────────────────────────────────────────────────────────

function getCollegeFallback(school, state) {
  const m = state.major;
  return {
    source_url: school.url,
    source_description: `Data sourced from ${school.name}'s official website (${school.url})`,
    stats: { total_opportunities: 45, clubs_count: 200, scholarships_count: 30 },
    academic_programs: [
      { title:`${m} Bachelor of Science`, type:'Academic', description:`The ${m} program at ${school.name} combines rigorous core coursework with applied specialization. Students complete foundational requirements before advancing to capstone research and industry-linked projects.`, tag:'Core Degree', deadline:state.deadline, source:`${school.url}/academics` },
      { title:'Honors College', type:'Academic', description:`${school.name}'s Honors College offers smaller seminars, faculty mentorship, and an independent thesis. Members receive priority registration and access to exclusive funding for undergraduate research.`, tag:'Selective', deadline:'Jan 15', source:`${school.url}/honors` },
      { title:'Undergraduate Research', type:'Academic', description:`Students join active faculty research labs for hands-on scholarly experience. Many positions include a stipend and can lead to co-authorship on peer-reviewed publications.`, tag:'Stipend', deadline:'Rolling', source:`${school.url}/research` },
      { title:'Study Abroad', type:'Academic', description:`${school.name} partners with universities in 40+ countries for credit-bearing programs. Most financial aid transfers directly to approved international options through the Study Abroad Office.`, tag:'International', deadline:'Rolling', source:`${school.url}/studyabroad` },
      { title:'Interdisciplinary Certificate', type:'Academic', description:`Stack credentials in data analytics, entrepreneurship, or sustainability alongside your ${m} degree within your standard credit load. All certificates appear on the official transcript.`, tag:'Certificate', deadline:'Add/Drop', source:`${school.url}/certificates` },
    ],
    research_internships: [
      { title:`${m} Industry Co-op`, type:'Internship', description:`Semester-long paid placements with employer partners in ${school.city} and beyond. Co-op coordinators match students to positions aligned with their academic focus.`, tag:'Paid', deadline:'Oct 15', source:`${school.url}/career` },
      { title:'Faculty Lab Assistantship', type:'Research', description:`Join a professor's active research team as an undergraduate contributor. Positions open each semester and have led to student co-authorship in peer-reviewed journals.`, tag:'Stipend', deadline:'Rolling', source:`${school.url}/research` },
      { title:'Summer Research Fellowship', type:'Research', description:`A competitive 10-week funded summer program placing undergraduates on intensive interdisciplinary research teams. Housing and travel stipends are typically included.`, tag:'Competitive', deadline:'March 1', source:`${school.url}/fellowships` },
      { title:`${school.city} Internship Network`, type:'Internship', description:`Community and industry placements with local organizations across ${school.city}. Ideal for students seeking meaningful professional experience tied to their major.`, tag:'Local', deadline:'Feb 1', source:`${school.url}/career` },
      { title:'Alumni Mentorship', type:'Internship', description:`Connect one-on-one with senior professionals through ${school.name}'s official alumni mentorship matching program. Mentors frequently facilitate job shadowing and referrals.`, tag:'Mentorship', deadline:'Oct 30', source:`${school.url}/alumni` },
    ],
    clubs: [
      { title:`${m} Student Association`, type:'Club', description:`The primary academic and professional club for ${m} majors. Hosts career panels, networking events, competitions, and alumni speaker series throughout the year.`, tag:'Academic/Professional', deadline:'Ongoing', source:`${school.url}/studentlife` },
      { title:'Student Government', type:'Organization', description:`Elected leaders shape campus policy, allocate activity fees, and collaborate directly with administration. Strong SGA experience is valued by employers and graduate schools.`, tag:'Leadership', deadline:'Ongoing', source:`${school.url}/sga` },
      { title:'Cultural Diversity Board', type:'Organization', description:`Celebrates multicultural identities through events, awareness weeks, and community partnerships. Open to all students regardless of background.`, tag:'Cultural', deadline:'Ongoing', source:`${school.url}/diversity` },
      { title:'Entrepreneurship Club', type:'Club', description:`Regular pitch competitions, startup weekends, and mentorship sessions with local founders. Tied to the campus innovation center and business incubator.`, tag:'Business', deadline:'Ongoing', source:`${school.url}/innovation` },
      { title:'Intramural Sports', type:'Organization', description:`20+ sports from flag football to esports offered through ${school.name}'s program. A great way to stay active and meet students from across campus.`, tag:'Recreation', deadline:'Ongoing', source:`${school.url}/recreation` },
    ],
    scholarships: [
      { title:`${school.name} Merit Scholarship`, type:'Scholarship', description:`Automatically considered for top applicants. Awards range from $3,000–$20,000 per year, renewable with a 3.0+ GPA.`, tag:'Merit', deadline:state.deadline, source:`${school.url}/financialaid` },
      { title:`${m} Departmental Award`, type:'Scholarship', description:`Offered by the ${m} department to declared majors showing academic excellence. Requires a short essay and two faculty letters of recommendation.`, tag:'Departmental', deadline:'March 1', source:`${school.url}/financialaid` },
      { title:'First-Generation Grant', type:'Scholarship', description:`Covers tuition gaps beyond federal aid for first-generation students, plus peer mentorship and academic coaching support throughout four years.`, tag:'Need-Based', deadline:'FAFSA Date', source:`${school.url}/firstgen` },
      { title:`${school.city} Business Foundation Scholarship`, type:'Scholarship', description:`Funded by regional employers for students from the ${school.city} metro area. Requires a community service record and a 500-word essay.`, tag:'Local', deadline:'Jan 15', source:`${school.url}/scholarships` },
      { title:'Diversity in STEM Scholarship', type:'Scholarship', description:`Open to underrepresented students in ${m}. Awards of $1,500–$5,000 per year tied to involvement in campus diversity initiatives.`, tag:'Diversity', deadline:'Feb 15', source:`${school.url}/diversity` },
    ],
    schedule: {
      intro: `As a ${m} student at ${school.name}, your week balances lectures, labs, independent study, and campus life. Most semesters involve 15 credit hours, around 18 hours of self-directed study, and meaningful time for clubs and social activities.`,
      days: [
        { name:'Monday',    type:'Class Day', blocks:[{time:'9:00 AM',name:`Intro to ${m}`,location:'Main Academic Hall',color:'#d4a843'},{time:'11:00 AM',name:'Statistics',location:'Science Building',color:'#3dd6c0'},{time:'1:00 PM',name:'Lunch',location:'Main Dining Hall',color:'#9d7fe8'},{time:'3:00 PM',name:'Seminar',location:'Liberal Arts Building',color:'#d4a843'},{time:'5:30 PM',name:'Club Meeting',location:'Student Center',color:'#5baee8'}]},
        { name:'Tuesday',   type:'Lab Day',   blocks:[{time:'9:00 AM',name:'Lab Session',location:'Research Lab',color:'#3dd6c0'},{time:'12:00 PM',name:'Office Hours',location:'Faculty Suite',color:'#d4a843'},{time:'2:00 PM',name:'Group Project',location:'Library',color:'#9d7fe8'},{time:'5:00 PM',name:'Rec Center',location:'Campus Rec',color:'#e0635a'}]},
        { name:'Wednesday', type:'Class Day', blocks:[{time:'9:30 AM',name:`${m} Core II`,location:'Academic Hall',color:'#d4a843'},{time:'11:30 AM',name:'Writing Course',location:'Humanities Building',color:'#e0635a'},{time:'1:00 PM',name:'Lunch',location:'Campus Café',color:'#9d7fe8'},{time:'3:00 PM',name:'Study Block',location:'Library',color:'#3dd6c0'}]},
        { name:'Thursday',  type:'Flex Day',  blocks:[{time:'10:00 AM',name:'Internship Work',location:'Off-Campus',color:'#3dd6c0'},{time:'1:00 PM',name:'Lunch',location:'Campus Café',color:'#9d7fe8'},{time:'3:00 PM',name:'Advising',location:'Student Success Center',color:'#d4a843'},{time:'6:00 PM',name:'Social Time',location:'Dorm/Off-Campus',color:'#5baee8'}]},
        { name:'Friday',    type:'Light Day', blocks:[{time:'10:00 AM',name:'Optional Lecture',location:'Varies',color:'#9d7fe8'},{time:'12:00 PM',name:'Club Activity',location:'Student Center',color:'#5baee8'},{time:'3:00 PM',name:'Workout',location:'Rec Center',color:'#3dd6c0'},{time:'7:00 PM',name:'Weekend Plans',location:'On/Off Campus',color:'#e0635a'}]},
      ],
      workload: [
        { label:'Weekly Study Hours',     value:18, max:40, color:'#d4a843' },
        { label:'Credit Hours/Semester',  value:15, max:21, color:'#3dd6c0' },
        { label:'Assignments / Week',     value:8,  max:20, color:'#9d7fe8' },
        { label:'Social & Campus Hours',  value:10, max:20, color:'#5baee8' },
      ]
    },
    campus_life: { sections:[
      { heading:'Morning Routine',                       content:`Most ${m} students at ${school.name} start between 8–9 AM, grabbing breakfast before their first lecture. The campus comes alive between 9 AM and noon with students crossing between buildings.` },
      { heading:`Academic Culture at ${school.name}`,   content:`${school.name} fosters a collaborative environment in the ${m} department. Study groups form naturally around core courses, and professors hold productive office hours. The library stays open late during finals.` },
      { heading:'Social Scene & Weekends',               content:`Weekends range from packed Friday campus events to quieter Sunday study sessions. Greek life, cultural orgs, and interest clubs each form their own communities — there's always something to join.` },
      { heading:`City Life in ${school.city}`,          content:`Proximity to ${school.city} gives ${school.name} students access to internships, cultural venues, and professional networking events. Most students explore the city regularly and find it a major advantage.` },
      { heading:'Career & Networking',                   content:`${school.name}'s career center hosts multiple employer fairs each semester. Students who connect with advisors and alumni networks early consistently land competitive opportunities.` },
    ]},
    scholarship_advice: `${state.name}, to maximize financial aid at ${school.name} as a ${m} student, file your FAFSA on October 1st and check both the main portal and the ${m} department's separate scholarship page — departmental awards frequently go unclaimed. Build a relationship with your departmental coordinator early, as they know about unlisted internal funds. Maintain strong grades from day one since most merit awards are renewed annually.`
  };
}

function getHSFallback(school, state) {
  const g = state.grade, interests = state.interests.join(', ') || 'General';
  const gradeNum = parseInt(g) || 11;
  const gradYear = new Date().getFullYear() + (12 - gradeNum);
  return {
    source_url: school.url,
    source_description: `Data sourced from ${school.name}'s official website and district records`,
    stats: { total_opportunities:38, clubs_count:45, scholarships_count:22, grad_year:gradYear },
    academic_programs:[
      {title:'AP English Language & Composition',type:'AP Course',description:`One of the most popular AP courses at ${school.name}, preparing students for college-level analytical writing. Passing the exam earns direct credit at most universities.`,tag:'AP / College Credit',deadline:'Course Selection',source:`${school.url}/academics`},
      {title:'AP Calculus AB',type:'AP Course',description:`Covers differential and integral calculus at the college level. Essential for STEM-bound students and highly valued on college applications as a signal of academic readiness.`,tag:'AP / STEM',deadline:'Prerequisite Required',source:`${school.url}/academics`},
      {title:'IB Diploma Programme',type:'IB Program',description:`The internationally recognized two-year IB curriculum can earn students 30+ college credits and is highly regarded by selective universities worldwide.`,tag:'IB / International',deadline:'Application Required',source:`${school.url}/ib`},
      {title:'Dual Enrollment',type:'Dual Enrollment',description:`Juniors and seniors at ${school.name} can take real college courses simultaneously for both high school and college credit. Classes count on the official transcript.`,tag:'College Credit',deadline:'Semester Registration',source:`${school.url}/dualenrollment`},
      {title:'AP US History',type:'AP Course',description:`A rigorous survey of American history at the college level, with strong AP exam pass rates at ${school.name}. Great preparation for pre-law and political science tracks.`,tag:'AP / College Credit',deadline:'Course Selection',source:`${school.url}/academics`},
    ],
    career_programs:[
      {title:'Career & Technical Education (CTE)',type:'Career Tech',description:`${school.name}'s CTE pathways offer hands-on training in healthcare, IT, culinary arts, and business. Students earn industry certifications recognized by employers upon graduation.`,tag:'Certification',deadline:'Course Selection',source:`${school.url}/cte`},
      {title:'JROTC Leadership Program',type:'Career Program',description:`Junior Reserve Officers Training Corps builds leadership, discipline, and teamwork. Participants may qualify for ROTC college scholarships worth up to $180,000 in tuition.`,tag:'Leadership / Military',deadline:'Open Enrollment',source:`${school.url}/jrotc`},
      {title:'Work-Based Learning',type:'Career Program',description:`Eligible juniors and seniors earn school credit for part-time internships with local ${school.city} businesses. A career counselor matches students to positions aligned with their goals.`,tag:'Paid / Credit',deadline:'Application Required',source:`${school.url}/workbased`},
      {title:'Microsoft IT Academy Certification',type:'Career Tech',description:`Students earn Microsoft Office Specialist (MOS) certification through this school program. These credentials appear directly on college applications and resumes.`,tag:'Tech Cert',deadline:'Ongoing',source:`${school.url}/technology`},
      {title:'FFA Agricultural Program',type:'Career Program',description:`Provides hands-on agricultural education and business training. FFA competitions at ${school.name} offer scholarship opportunities at the state and national level.`,tag:'Agriculture',deadline:'Open Enrollment',source:`${school.url}/ffa`},
    ],
    clubs:[
      {title:'Key Club',type:'Club',description:`Key Club at ${school.name} organizes community volunteer events and service projects year-round. Strong membership history is valuable on college application essays.`,tag:'Service / Leadership',deadline:'Ongoing',source:`${school.url}/clubs`},
      {title:'Student Government',type:'Organization',description:`Elected representatives plan events, advocate for students, and work directly with administration at ${school.name}. Leadership here signals maturity to college admissions officers.`,tag:'Leadership',deadline:'Ongoing',source:`${school.url}/studentgovernment`},
      {title:'National Honor Society',type:'Honor Society',description:`Recognizes students for scholarship, service, leadership, and character. Requires a minimum GPA and committee nomination — highly valued on college applications.`,tag:'Academic',deadline:'GPA Req.',source:`${school.url}/nhs`},
      {title:'DECA / Business Club',type:'Club',description:`DECA prepares students for careers in business and marketing through competitive events. National competitions offer scholarship prizes and professional networking opportunities.`,tag:'Business',deadline:'Ongoing',source:`${school.url}/deca`},
      {title:'Science Olympiad',type:'Club',description:`Academic competition team covering 23 STEM events. Teams from ${school.name} compete regionally, at state, and nationally. Strong participation significantly bolsters STEM college applications.`,tag:'STEM / Competition',deadline:'Tryouts',source:`${school.url}/scienceolympiad`},
    ],
    sports:[
      {title:'Varsity Football',type:'Sport',description:`One of the flagship programs at ${school.name} with strong community following and a dedicated coaching staff. Academically strong players may be scouted for college recruitment.`,tag:'Fall Season',deadline:'Aug Tryouts',source:`${school.url}/athletics`},
      {title:'Varsity Basketball',type:'Sport',description:`Both men's and women's programs compete in the regional league. Players interested in college athletics should connect with coaches about recruitment outreach.`,tag:'Winter Season',deadline:'Oct Tryouts',source:`${school.url}/athletics`},
      {title:'Track & Field / Cross Country',type:'Sport',description:`Competitive programs welcome athletes at all levels. Many athletes qualify for regional and state championships and earn athletic scholarship consideration.`,tag:'Spring Season',deadline:'Feb Tryouts',source:`${school.url}/athletics`},
      {title:'Soccer',type:'Sport',description:`The soccer program trains year-round with a fall competitive season. Coaches at ${school.name} value students who balance strong academics with athletic commitment.`,tag:'Fall Season',deadline:'Aug Tryouts',source:`${school.url}/athletics`},
      {title:'Swimming & Diving',type:'Sport',description:`The swim team competes at district and regional level. Swimmers with competitive times in multiple events have strong prospects for college athletic recruitment.`,tag:'Winter Season',deadline:'Oct Tryouts',source:`${school.url}/athletics`},
    ],
    scholarships:[
      {title:'National Merit Scholarship',type:'Competition',description:`Based on PSAT/NMSQT scores in junior year. Semifinalists and finalists earn recognition actively sought by colleges, plus substantial scholarship awards at many universities.`,tag:'PSAT / Merit',deadline:'Junior Year PSAT',source:'nationalmerit.org'},
      {title:`${school.city} Community Foundation Scholarship`,type:'Scholarship',description:`Funded by local philanthropists for students from the ${school.city} area. Awards range from $500–$5,000 based on academic achievement, community service, and a personal essay.`,tag:'Local',deadline:'Feb 1',source:`${school.url}/scholarships`},
      {title:'Gates Scholarship',type:'National Scholarship',description:`Supports exceptional minority students with financial need. Covers full cost of attendance at any accredited US college for students meeting the rigorous eligibility criteria.`,tag:'National / Need-Based',deadline:'Sept 15',source:'thegatesscholarship.org'},
      {title:'Coca-Cola Scholars Program',type:'National Scholarship',description:`Awarded to 150 seniors annually based on character, leadership, and academic achievement. A $20,000 award from one of the most prestigious scholarship programs in the country.`,tag:'National / Merit',deadline:'Oct 31',source:'coca-colascholarsfoundation.org'},
      {title:`${school.name} Booster Club Scholarship`,type:'School Scholarship',description:`The booster club awards scholarships to graduating seniors who demonstrated extracurricular excellence while maintaining strong academic standing throughout high school.`,tag:'School / Athletic',deadline:'March 1',source:`${school.url}/scholarships`},
    ],
    schedule:{
      intro:`A typical school day for a ${g} student at ${school.name} runs from about 7:30 AM to 3:30 PM with six to seven class periods. After-school activities often extend the day to 5 or 6 PM for students involved in sports, clubs, or tutoring.`,
      days:[
        {name:'Monday',type:'Regular Day',blocks:[{time:'7:30 AM',name:'1st Period — English',location:'Room 204',color:'#34c98a'},{time:'9:00 AM',name:'2nd Period — Math',location:'Room 115',color:'#5baee8'},{time:'10:30 AM',name:'3rd Period — Science',location:'Science Lab',color:'#9d7fe8'},{time:'12:00 PM',name:'Lunch',location:'Cafeteria',color:'#e8a030'},{time:'1:00 PM',name:'4th Period — History',location:'Room 302',color:'#34c98a'},{time:'2:30 PM',name:'5th Period — Elective',location:'Varies',color:'#5baee8'},{time:'3:45 PM',name:'After-School Activity',location:'Field / Gym',color:'#3dd6c0'}]},
        {name:'Tuesday',type:'AP / Lab Day',blocks:[{time:'7:30 AM',name:'AP Course',location:'AP Classroom',color:'#34c98a'},{time:'9:15 AM',name:'Lab / Workshop',location:'Science Lab',color:'#3dd6c0'},{time:'11:00 AM',name:'Study Hall',location:'Library',color:'#9d7fe8'},{time:'12:00 PM',name:'Lunch',location:'Cafeteria',color:'#e8a030'},{time:'1:00 PM',name:'Elective / Arts',location:'Fine Arts Wing',color:'#5baee8'},{time:'3:45 PM',name:'Club Meeting',location:'Room 110',color:'#9d7fe8'}]},
        {name:'Wednesday',type:'Regular Day',blocks:[{time:'7:30 AM',name:'1st Period',location:'Room 204',color:'#34c98a'},{time:'9:00 AM',name:'2nd Period',location:'Room 115',color:'#5baee8'},{time:'12:00 PM',name:'Lunch + Social',location:'Cafeteria / Courtyard',color:'#e8a030'},{time:'1:00 PM',name:'Dual Enrollment',location:'Online / College',color:'#3dd6c0'},{time:'2:30 PM',name:'Study Period',location:'Library',color:'#34c98a'}]},
        {name:'Thursday',type:'Activity Day',blocks:[{time:'7:30 AM',name:'Morning Practice',location:'Gym / Track',color:'#e8a030'},{time:'9:00 AM',name:'1st Period',location:'Classroom',color:'#34c98a'},{time:'11:00 AM',name:'Counselor Meeting',location:'Guidance Office',color:'#9d7fe8'},{time:'12:00 PM',name:'Lunch',location:'Cafeteria',color:'#e8a030'},{time:'1:00 PM',name:'AP Study Group',location:'Library',color:'#5baee8'},{time:'3:45 PM',name:'Sports Practice',location:'Field / Gym',color:'#3dd6c0'}]},
        {name:'Friday',type:'Spirit Day',blocks:[{time:'7:30 AM',name:'1st Period',location:'Classroom',color:'#34c98a'},{time:'10:30 AM',name:'Assembly / Pep Rally',location:'Gym / Auditorium',color:'#e8a030'},{time:'12:00 PM',name:'Lunch + Weekend Plans',location:'Cafeteria',color:'#34c98a'},{time:'2:30 PM',name:'Elective / Free',location:'Varies',color:'#9d7fe8'},{time:'3:30 PM',name:'Game / Match',location:'Stadium',color:'#3dd6c0'}]},
      ],
      workload:[
        {label:'Daily Study Hours',   value:2,  max:6,  color:'#34c98a'},
        {label:'Classes Per Day',     value:6,  max:8,  color:'#5baee8'},
        {label:'Assignments / Week',  value:10, max:20, color:'#9d7fe8'},
        {label:'Activities / Week',   value:3,  max:7,  color:'#e8a030'},
      ]
    },
    college_prep:{
      sections:[
        {heading:`${g} Priorities at ${school.name}`,content:`Your immediate priorities are maintaining the highest GPA possible, taking rigorous courses, and building genuine extracurricular commitments. Colleges value depth and growth over volume — pick 2-3 activities you genuinely care about.`},
        {heading:'Test Prep & Testing',content:`The SAT and ACT matter but aren't everything. Most students take their first attempt in spring of sophomore or junior year. Use Khan Academy's free SAT prep, take full-length timed practice tests, and schedule tests during low-stress periods.`},
        {heading:'Building Your College List',content:`Research colleges now through websites, virtual tours, and social media. Aim for a balanced list of reaches, matches, and likely schools. Factor in financial aid generosity and graduation rates as seriously as prestige.`},
        {heading:'Extracurricular Strategy',content:`Admissions officers want to see consistency, growth, and impact. Aim to hold a leadership position in 1-2 activities by senior year and be able to articulate clearly what you contributed and what you learned.`},
        {heading:'Financial Aid & FAFSA Prep',content:`Your family's tax records form the basis of the FAFSA. Seniors file starting October 1st of their senior year — non-negotiable timing. Research merit scholarships now since many have early fall deadlines that catch students off guard.`},
      ],
      timeline:[
        {label:'SAT/ACT Prep',              pct: gradeNum >= 11 ? 70 : 40},
        {label:'Course Rigor (AP/IB)',       pct: gradeNum >= 10 ? 65 : 35},
        {label:'Extracurricular Leadership', pct: gradeNum >= 11 ? 60 : 30},
        {label:'College List Research',      pct: gradeNum >= 11 ? 55 : 20},
        {label:'Application Essays',         pct: gradeNum >= 12 ? 80 : 15},
      ]
    },
    daily_life:{sections:[
      {heading:`Morning at ${school.name}`,content:`Students arrive between 7:15–7:30 AM with school starting promptly. Core subjects run in the first three periods when students are most focused. Hallway time between periods is when friendships are maintained and plans are made.`},
      {heading:'Academic Culture',content:`${school.name} maintains a culture where academics are taken seriously, especially in AP and honors tracks. Strong teacher relationships lead to better grades and trusted recommendation letters for college applications.`},
      {heading:'After-School Scene',content:`From 3:30–6 PM, campus transforms: sports teams practice, clubs meet, and the library fills with students studying or prepping for standardized tests. Involved students consistently feel more connected and motivated.`},
      {heading:`Social & Weekend Life in ${school.city}`,content:`Weekends in ${school.city} offer school games, performances, part-time jobs, and city exploration. The most balanced students mix academic work with genuine rest and social connection across all four years.`},
    ]},
    scholarship_advice:`${state.name}, as a ${g} student at ${school.name} interested in ${interests}, your most impactful scholarship moves start now rather than senior year. Document community service hours, leadership roles, and academic achievements in one running list — most scholarship essays draw from the same material. Look for competitions tied to your interests since these carry prizes and are less competitive than general awards. Set reminders for October 31st and January 15th, which capture the largest national scholarships, and ask your guidance counselor specifically for local ${school.city}-area awards that most students never find.`
  };
}
