// DOER — homepage script
// v1: directory only. Categories below, no provider listings yet.
//
// ============================================================
// EDIT ME: this is the ONLY place you need to touch to add,
// remove, or rename a category. Nothing else in this file or
// in index.html needs to change.
//
// Format: "url-safe-key": "Label shown on the button"
//   - key:   lowercase, words separated by hyphens, no spaces
//            (this becomes part of the page URL)
//   - label: whatever text you want people to see
//
// To add a category, copy a line and edit it, e.g.:
//   "landscaping": "Landscaping",
//
// Order here = order the tags appear on the homepage.
// ============================================================
const SERVICES = {
  "computer-repair": "Computer Repair",
  "plumbing": "Plumbing",
  "cleaning": "Cleaning",
  "gutters": "Gutter Cleaning",
  "moving": "Moving",
  "pressure-washing": "Pressure Washing"
};
// ============================================================
// END EDIT ME
// ============================================================

const searchInput = document.getElementById("searchInput");
const searchGo = document.getElementById("searchGo");
const tagRow = document.getElementById("tagRow");

// Build the tag buttons from SERVICES above. index.html no longer
// hardcodes any tags — this is the single source of truth.
function renderTags() {
  tagRow.innerHTML = "";
  for (const [key, label] of Object.entries(SERVICES)) {
    const btn = document.createElement("button");
    btn.className = "tag";
    btn.dataset.service = key;
    btn.textContent = label.toLowerCase();
    tagRow.appendChild(btn);
  }
}

renderTags();

function goToCategory(serviceKey) {
  window.location.href = `category.html?type=${encodeURIComponent(serviceKey)}`;
}

function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  // Very light matching: if the typed query matches a known category
  // (by key or label), go straight there. Otherwise fall back to a
  // generic search page that just echoes the query for now.
  const lowerQuery = query.toLowerCase();
  const matchedKey = Object.entries(SERVICES).find(
    ([key, label]) =>
      key.replace(/-/g, " ") === lowerQuery || label.toLowerCase() === lowerQuery
  )?.[0];

  if (matchedKey) {
    goToCategory(matchedKey);
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
  goToCategory(tag.dataset.service);
});
