# 🧭 Campus Compass

> AI-powered college & high school opportunity explorer — built for students, by students.

Campus Compass lets high school and undergraduate students discover every academic program, scholarship, club, internship, and daily life detail at their chosen school — powered by real data from official school websites via the Claude AI API with live web search.

---

## 📁 Project Structure

```
campus-compass/
├── index.html          ← Main app shell & all page layouts
├── css/
│   └── styles.css      ← All styling (dark theme, components, responsive)
├── js/
│   ├── data.js         ← School directory data (colleges & high schools)
│   ├── api.js          ← Claude API calls + prompts
│   ├── ui.js           ← Shared UI helpers (render cards, grids, workload bars)
│   └── app.js          ← Main app logic (routing, quiz, dashboard, state)
├── README.md           ← You are here
└── .env.example        ← Environment variable template
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR-ORG/campus-compass.git
cd campus-compass
```

### 2. Set up your API key

Campus Compass uses the [Anthropic Claude API](https://docs.anthropic.com).

1. Go to [console.anthropic.com](https://console.anthropic.com) and create an API key
2. Copy `.env.example` to `.env`

```bash
cp .env.example .env
```

3. Open `.env` and paste your key:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`.

### 3. Open the app

Since this is a static frontend project, just open `index.html` in your browser:

```bash
open index.html      # macOS
start index.html     # Windows
xdg-open index.html  # Linux
```

Or use a local dev server (recommended):

```bash
# With VS Code: install "Live Server" extension → right-click index.html → Open with Live Server
# With Python:
python3 -m http.server 8080
# Then visit http://localhost:8080
```

---

## 🤝 Team Collaboration — Git Workflow

We use a **feature branch workflow**. Never push directly to `main`.

### Branch naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/add-more-colleges` |
| Bug fix | `fix/description` | `fix/hs-interest-picker` |
| Design | `design/description` | `design/dark-mode-tweaks` |
| Data | `data/description` | `data/add-midwest-schools` |

### Standard workflow

```bash
# 1. Always pull latest main first
git checkout main
git pull origin main

# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes, then commit clearly
git add .
git commit -m "feat: add Big Ten schools to college directory"

# 4. Push your branch
git push origin feature/your-feature-name

# 5. Open a Pull Request on GitHub → assign a teammate to review
```

### Commit message format

```
type: short description

Types: feat | fix | style | data | docs | refactor
```

Examples:
```
feat: add HBCU scholarship filter to directory
fix: resolve grade picker not saving on mobile
data: add 20 Texas high schools to HS directory
style: improve card hover animation on dashboard
docs: update README with deployment instructions
```

---

## 👥 Team Roles & File Ownership

| Role | Primary Files | What to work on |
|------|--------------|-----------------|
| **Frontend / UI** | `css/styles.css`, `index.html` | Styling, layout, animations, responsive design |
| **App Logic** | `js/app.js` | Quiz flow, routing, state management, tab switching |
| **AI / API** | `js/api.js` | Claude prompts, web search integration, response parsing |
| **Data** | `js/data.js` | Adding schools, categories, tags, directory content |
| **UI Helpers** | `js/ui.js` | Card rendering, grid builders, chart/workload helpers |

---

## ➕ Adding Schools to the Directory

Open `js/data.js` and find either `COL_DIR` (colleges) or `HS_DIR` (high schools).

### College entry format:
```js
{
  name: "University of Houston",
  city: "Houston, TX",
  url: "uh.edu",
  tags: ["Public", "Research", "Urban"],
  type: "Public Research University"
}
```

### High school entry format:
```js
{
  name: "Lamar High School",
  city: "Houston, TX",
  url: "houstonisd.org",
  tags: ["Public", "Magnet", "Arts"],
  type: "Public High School — Houston ISD"
}
```

Add it under the correct category key, or create a new category:
```js
"New Category Name": [
  { ...school },
]
```

---

## 🎨 Styling Guide

All CSS custom properties (variables) are defined at the top of `css/styles.css` inside `:root {}`.

| Variable | Usage |
|----------|-------|
| `--gold` / `--gold2` | College mode accent color |
| `--em` / `--em2` | High school mode accent color |
| `--card` / `--card2` | Card backgrounds |
| `--text` / `--text2` / `--text3` | Text hierarchy |
| `--r` / `--r2` / `--r3` | Border radius sizes |

**To add a new card type**, follow this pattern in `styles.css`:
```css
.oc.t-newtype .oc-bar { background: var(--your-color); }
.oc.t-newtype .oc-type { color: var(--your-color); }
```

And in `js/ui.js`:
```js
// In renderGrid(), pass 't-newtype' as the cls argument
renderGrid('element-id', data.new_section, 't-newtype');
```

---

## 🤖 Modifying AI Prompts

All Claude API prompts live in `js/api.js`.

- `buildCollegePrompt(school, userState)` → College dashboard prompt
- `buildHSPrompt(school, userState)` → High school dashboard prompt

When editing prompts:
- Keep the JSON structure contract intact (the dashboard builder depends on it)
- Test with at least 3 different schools after any prompt change
- If you add a new JSON field, also update the corresponding builder in `js/ui.js`

---

## 📦 Deployment

### GitHub Pages (free, easy)

1. Push to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Your app is live at `https://YOUR-ORG.github.io/campus-compass/`

> Note: For GitHub Pages, the API key is embedded in `js/api.js`. For a public deployment, consider proxying through a backend to protect your key.

### Netlify (drag & drop)

1. Go to [netlify.com](https://netlify.com) → New site → Drag the `campus-compass/` folder
2. Done — live in 30 seconds with a public URL

### Vercel

```bash
npm install -g vercel
vercel
```

---

## 🧪 Testing Checklist (before merging a PR)

- [ ] College directory loads and filters correctly
- [ ] High school directory loads and filters correctly
- [ ] Selecting a school from directory navigates to quiz
- [ ] College quiz: all 3 questions validate and advance
- [ ] High school quiz: grade picker saves, interest picker allows 1-3 picks, submits
- [ ] Loading animation runs through all steps
- [ ] Dashboard renders all tabs without errors
- [ ] Source badge shows correct school URL
- [ ] Works on mobile (test at 375px width)
- [ ] "Browse more" buttons return to directory
- [ ] Compare strip shows previously visited schools

---

## 📋 Roadmap / Open Tasks

- [ ] Add 50+ more colleges to the directory
- [ ] Add high schools for all 50 states
- [ ] Implement school comparison view (side by side)
- [ ] Add user favorites / saved schools (localStorage)
- [ ] Add a search-by-state dropdown filter
- [ ] Build a "My Profile" page that persists quiz answers
- [ ] Add a scholarship deadline calendar view
- [ ] Dark/light mode toggle
- [ ] Export dashboard as PDF
- [ ] Share dashboard via link

---

## 📄 License

MIT — free to use, fork, and build on.

---

## 💬 Questions?

Open a GitHub Issue or reach out to the project lead. Welcome to the team! 🎓
