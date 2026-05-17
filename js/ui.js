/**
 * ui.js — Shared UI Render Helpers
 *
 * These functions are called by app.js to build dynamic UI.
 * Edit this file to change how cards, grids, schedules, and workload bars look.
 */

/** Render a grid of opportunity cards into a container element */
function renderGrid(containerId, items, colorClass) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  (items || []).forEach(item => {
    el.innerHTML += `
      <div class="oc ${colorClass}">
        <div class="oc-bar"></div>
        <div class="oc-type">${item.type || 'Opportunity'}</div>
        <div class="oc-title">${item.title}</div>
        <div class="oc-desc">${item.description}</div>
        <div class="oc-foot">
          <span class="oc-src">
            <span class="oc-src-dot"></span>
            ${item.source || 'Official Website'}
          </span>
          ${item.deadline ? `<span class="oc-dl">📅 ${item.deadline}</span>` : ''}
        </div>
      </div>`;
  });
}

/** Build a 5-day week schedule grid */
function buildWeekGrid(containerId, days) {
  const wg = document.getElementById(containerId);
  if (!wg) return;
  wg.innerHTML = '';
  (days || []).forEach(day => {
    const blocks = (day.blocks || []).map(b => `
      <div class="tb">
        <div class="tb-t">${b.time}</div>
        <div class="tb-dot" style="background:${b.color || '#d4a843'}"></div>
        <div class="tb-b">
          <div class="tb-n">${b.name}</div>
          <div class="tb-w">${b.location || ''}</div>
        </div>
      </div>`).join('');
    wg.innerHTML += `
      <div class="day-card">
        <div class="day-hd">
          <span class="day-nm">${day.name}</span>
          <span class="day-tp">${day.type || ''}</span>
        </div>
        ${blocks}
      </div>`;
  });
}

/** Build animated workload bar cards */
function buildWorkload(containerId, workload) {
  const wr = document.getElementById(containerId);
  if (!wr) return;
  wr.innerHTML = '';
  (workload || []).forEach(w => {
    const pct = Math.min(100, Math.round((w.value / w.max) * 100));
    wr.innerHTML += `
      <div class="wl-card">
        <div class="wl-head">
          <span class="wl-title">${w.label}</span>
          <span class="wl-score" style="color:${w.color}">${w.value}</span>
        </div>
        <div class="wl-bg">
          <div class="wl-bar" style="width:0%;background:${w.color}" data-pct="${pct}"></div>
        </div>
        <div class="wl-note">${pct}% of typical maximum</div>
      </div>`;
  });
  // Animate after DOM settles
  setTimeout(() => {
    wr.querySelectorAll('.wl-bar').forEach(b => {
      b.style.width = b.dataset.pct + '%';
    });
  }, 200);
}

/** Build a prose section card from an array of {heading, content} sections */
function buildProseCard(containerId, sections, modeClass) {
  const el = document.getElementById(containerId);
  if (!el || !sections) return;
  let html = `<div class="prose-card ${modeClass}">`;
  sections.forEach(s => {
    html += `<h3>${s.heading}</h3><p>${s.content}</p>`;
  });
  html += '</div>';
  el.innerHTML = html;
}

/** Build the college prep timeline progress tracker */
function buildPrepTimeline(containerId, timeline) {
  const el = document.getElementById(containerId);
  if (!el || !timeline) return;
  let html = '<div class="grad-track"><div class="gt-title">College Prep Progress Tracker</div>';
  timeline.forEach(item => {
    html += `
      <div class="gt-item">
        <div class="gt-row">
          <span class="gt-lbl">${item.label}</span>
          <span class="gt-val">${item.pct}%</span>
        </div>
        <div class="gt-bg">
          <div class="gt-bar" style="width:0%" data-pct="${item.pct}"></div>
        </div>
      </div>`;
  });
  html += '</div>';
  el.innerHTML += html;
  setTimeout(() => {
    el.querySelectorAll('.gt-bar').forEach(b => {
      b.style.width = b.dataset.pct + '%';
    });
  }, 200);
}

/** Build a pill badge element */
function pill(text, cls) {
  return `<span class="dp ${cls}">${text}</span>`;
}

/** Build the stat row cards */
function buildStatRow(containerId, stats) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = stats.map(s => `
    <div class="sc ${s.colorClass}">
      <div class="sc-val">${s.value}</div>
      <div class="sc-lbl">${s.label}</div>
    </div>`).join('');
}

/** Build a tab bar */
function buildTabBar(containerId, tabs, modeClass) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = tabs.map((t, i) => `
    <button class="tab-btn ${i === 0 ? 'on' : ''} ${modeClass}"
      onclick="${t.onclick}">
      ${t.label}
    </button>`).join('');
}

/** Build the college major picker grid */
function buildMajorGrid(containerId, modeClass) {
  const majors = [
    { icon: '💻', label: 'Computer Science',       value: 'Computer Science' },
    { icon: '📊', label: 'Business',                value: 'Business Administration' },
    { icon: '🧬', label: 'Biology / Pre-Med',       value: 'Biology / Pre-Med' },
    { icon: '🧠', label: 'Psychology',              value: 'Psychology' },
    { icon: '⚙️', label: 'Engineering',             value: 'Engineering' },
    { icon: '🏥', label: 'Nursing / Health',        value: 'Nursing / Health Sciences' },
    { icon: '⚖️', label: 'Poli Sci / Law',          value: 'Political Science / Law' },
    { icon: '📡', label: 'Communications',          value: 'Communications / Media' },
    { icon: '🎨', label: 'Fine Arts / Design',      value: 'Fine Arts / Design' },
    { icon: '📚', label: 'Education',               value: 'Education' },
  ];
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = majors.map(m => `
    <div class="maj-tile ${modeClass}" onclick="cpickMaj(this, '${m.value}')">
      <span class="mti">${m.icon}</span>
      <span class="mtl">${m.label}</span>
    </div>`).join('');
}

/** Build the HS interest picker grid */
function buildInterestGrid(containerId) {
  const interests = [
    { icon: '🔬', label: 'STEM & Science',              val: 'STEM & Science' },
    { icon: '🎨', label: 'Arts & Music',                val: 'Arts & Music' },
    { icon: '🏆', label: 'Sports & Athletics',         val: 'Sports & Athletics' },
    { icon: '💡', label: 'Business',                   val: 'Business & Entrepreneurship' },
    { icon: '🤝', label: 'Community Service',           val: 'Community Service' },
    { icon: '💻', label: 'Technology',                  val: 'Technology & Coding' },
    { icon: '🎤', label: 'Debate & Speech',             val: 'Debate & Public Speaking' },
    { icon: '✍️', label: 'Writing',                     val: 'Writing & Journalism' },
    { icon: '🏥', label: 'Healthcare',                  val: 'Healthcare & Medicine' },
  ];
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = interests.map(i => `
    <div class="int-tile" data-val="${i.val}" onclick="hpickInt(this)">
      <span class="int-icon">${i.icon}</span>${i.label}
    </div>`).join('');
}

/** Build the loading steps list */
function buildLoadSteps(containerId, steps) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = steps.map((s, i) => `
    <div class="ls" id="ls-${containerId}-${i}">
      <div class="ls-dot"></div>${s}
    </div>`).join('');
}

/** Animate loading steps sequentially */
function animateLoader(containerId, modeClass, interval = 1600) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const steps = el.querySelectorAll('.ls');
  steps.forEach(s => s.className = 'ls');
  let i = 0;
  const t = setInterval(() => {
    if (i > 0) steps[i - 1].className = 'ls done';
    if (i < steps.length) steps[i].className = `ls act ${modeClass}`;
    i++;
    if (i > steps.length) clearInterval(t);
  }, interval);
}

/** Update the compare strip at the top of each dashboard */
function updateCompareStrip(mode, visitedSchools, activeSchool) {
  const id = (mode === 'col' ? 'col' : 'hs') + '-cs-schools';
  const schools = visitedSchools.filter(s => s.mode === mode);
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = schools.map((s, i) => `
    <span class="cs-school ${mode} ${s.name === activeSchool.name ? 'act' : ''}"
      onclick="switchToSchool(${i}, '${mode}')">
      <span class="cs-name">${s.name.split(' ').slice(0, 2).join(' ')}</span>
    </span>`).join('');
}
