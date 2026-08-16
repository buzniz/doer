// DOER - homepage script
// v1: directory driven entirely by providers.txt. There is no
// hardcoded category list anywhere in this file - homepage
// buttons are built from whatever "category:" values actually
// appear in providers.txt. Add a listing in a new category and
// its button appears automatically. Remove all listings in a
// category and its button disappears automatically.

// ------------------------------------------------------------
// Parse providers.txt into a list of provider objects.
// Each entry is a block of "key: value" lines separated by a
// line containing only "---". Blocks missing category or name
// (like the CATEGORIES reference list at the top of the file,
// or the blank template block) are skipped automatically.
//
// Shared by index.html (to build category buttons) and
// category.html (to show listings for one category).
// ------------------------------------------------------------
function parseProviders(text) {
  const blocks = text.split(/^---\s*$/m);
  const providers = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const entry = {};

    for (const line of lines) {
      const match = line.match(/^\s*(category|name|stars|price|other|photo)\s*:\s*(.*)$/i);
      if (!match) continue;
      const key = match[1].toLowerCase();
      const value = match[2].trim();
      if (value) entry[key] = value;
    }

    if (entry.category && entry.name) {
      providers.push(entry);
    }
  }

  return providers;
}

// Turns "tech repair" into "Tech Repair" for display on buttons/titles.
function titleCase(str) {
  return str.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

async function fetchProviders() {
  const res = await fetch("providers.txt");
  if (!res.ok) throw new Error("Could not load providers.txt");
  const text = await res.text();
  return parseProviders(text);
}

// ------------------------------------------------------------
// Homepage-only logic below. Skips cleanly on pages (like
// category.html) that don't have these elements.
// ------------------------------------------------------------
const searchInput = document.getElementById("searchInput");
const searchGo = document.getElementById("searchGo");
const tagRow = document.getElementById("tagRow");

if (tagRow) {
  let knownCategories = [];

  function renderTags(categories) {
    tagRow.innerHTML = "";
    for (const category of categories) {
      const btn = document.createElement("button");
      btn.className = "tag";
      btn.dataset.category = category;
      btn.textContent = category.toLowerCase();
      tagRow.appendChild(btn);
    }
  }

  fetchProviders()
    .then((providers) => {
      // Unique categories, in first-seen order.
      const seen = new Set();
      knownCategories = [];
      for (const p of providers) {
        const key = p.category.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          knownCategories.push(p.category);
        }
      }
      renderTags(knownCategories);
    })
    .catch((err) => {
      console.error(err);
      tagRow.innerHTML = "";
    });

  function goToCategory(category) {
    window.location.href = `category.html?type=${encodeURIComponent(category)}`;
  }

  function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    const lowerQuery = query.toLowerCase();
    const matched = knownCategories.find((c) => c.toLowerCase() === lowerQuery);

    if (matched) {
      goToCategory(matched);
    } else {
      window.location.href = `category.html?q=${encodeURIComponent(query)}`;
    }
  }

  searchGo.addEventListener("click", handleSearch);

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  tagRow.addEventListener("click", (e) => {
    const tag = e.target.closest(".tag");
    if (!tag) return;
    goToCategory(tag.dataset.category);
  });
}
