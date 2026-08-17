// MyLocalTrades (MLT) - homepage script
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
      const match = line.match(/^\s*(category|name|state|city|stars|price|other|photo)\s*:\s*(.*)$/i);
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

// A GitHub "blob" page URL (what you get from copying a link on
// github.com) shows the image inside GitHub's own page, not the
// raw image bytes - so it won't load in an <img> tag. This turns
// a pasted blob URL into the matching raw.githubusercontent.com
// URL automatically, so you can just paste whatever link GitHub
// gives you in providers.txt.
//
// Handles both:
//   .../blob/main/photos/x.jpg
//   .../blob/refs/heads/main/photos/x.jpg
// Leaves already-raw URLs (or any non-GitHub URL) untouched.
function toRawGithubUrl(url) {
  const match = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(?:refs\/heads\/)?([^/]+)\/(.+)$/
  );
  if (!match) return url;
  const [, owner, repo, branch, path] = match;
  return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/${path}`;
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
const stateSelect = document.getElementById("stateSelect");
const citySelect = document.getElementById("citySelect");
const stateOptions = document.getElementById("stateOptions");
const cityOptions = document.getElementById("cityOptions");

if (tagRow) {
  let knownCategories = [];
  let allProviders = [];
  let knownStates = [];
  let knownCities = [];

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

  // Fill the state datalist with every unique state that appears
  // in providers.txt, in first-seen order. Entries with no state
  // set are simply not counted - they just won't be filterable
  // by location, same as any other optional field.
  function populateStates(providers) {
    const seen = new Set();
    knownStates = [];
    stateOptions.innerHTML = "";
    for (const p of providers) {
      if (!p.state) continue;
      const key = p.state.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      knownStates.push(p.state);
      const opt = document.createElement("option");
      opt.value = p.state;
      stateOptions.appendChild(opt);
    }
  }

  // Fill the city datalist based on whichever state is currently
  // typed in. If no valid state is entered, city stays disabled -
  // picking a city without a state doesn't make sense once there
  // are same-named cities in different states.
  function populateCities(providers, selectedState) {
    cityOptions.innerHTML = "";
    knownCities = [];
    if (!selectedState) {
      citySelect.disabled = true;
      citySelect.value = "";
      return;
    }
    citySelect.disabled = false;
    const seen = new Set();
    for (const p of providers) {
      if (!p.city || !p.state) continue;
      if (p.state.toLowerCase() !== selectedState.toLowerCase()) continue;
      const key = p.city.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      knownCities.push(p.city);
      const opt = document.createElement("option");
      opt.value = p.city;
      cityOptions.appendChild(opt);
    }
  }

  // Text inputs let someone type anything, including things that
  // don't match a real state/city. This finds the actual matching
  // value from the known list (case-insensitive) so partial or
  // mis-cased typing still works, and returns "" if nothing real
  // matches - so a stray typo can't silently filter results down
  // to nothing without the person realizing why.
  function resolveTyped(typedValue, knownList) {
    if (!typedValue) return "";
    const match = knownList.find((v) => v.toLowerCase() === typedValue.toLowerCase());
    return match || "";
  }

  fetchProviders()
    .then((providers) => {
      allProviders = providers;

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
      populateStates(providers);
    })
    .catch((err) => {
      console.error(err);
      tagRow.innerHTML = "";
    });

  stateSelect.addEventListener("input", () => {
    const resolved = resolveTyped(stateSelect.value, knownStates);
    populateCities(allProviders, resolved);
  });

  function goToCategory(category) {
    const params = new URLSearchParams();
    params.set("type", category);
    const state = resolveTyped(stateSelect.value, knownStates);
    const city = resolveTyped(citySelect.value, knownCities);
    if (state) params.set("state", state);
    if (city) params.set("city", city);
    window.location.href = `category.html?${params.toString()}`;
  }

  function handleSearch() {
    const query = searchInput.value.trim();
    const state = resolveTyped(stateSelect.value, knownStates);
    const city = resolveTyped(citySelect.value, knownCities);

    // A search with no typed text but a location picked should
    // still work - browse everyone in that state/city regardless
    // of category.
    if (!query && !state && !city) return;

    const params = new URLSearchParams();

    if (query) {
      const lowerQuery = query.toLowerCase();
      const matched = knownCategories.find((c) => c.toLowerCase() === lowerQuery);
      if (matched) {
        params.set("type", matched);
      } else {
        params.set("q", query);
      }
    }

    if (state) params.set("state", state);
    if (city) params.set("city", city);

    window.location.href = `category.html?${params.toString()}`;
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
