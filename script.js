// DOER — homepage script
// v1: hard-coded services, no backend, no live filtering.
// Search box + tags just route to a service page (not built yet),
// or log the query for now until service pages exist.

const SERVICES = {
  "computer-repair": "Computer Repair",
  "plumbing": "Plumbing",
  "cleaning": "Cleaning",
  "gutters": "Gutter Cleaning",
  "moving": "Moving",
  "pressure-washing": "Pressure Washing"
};

const searchInput = document.getElementById("searchInput");
const searchGo = document.getElementById("searchGo");
const tagRow = document.getElementById("tagRow");

function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  // Placeholder: service pages / search results don't exist yet.
  // Once the next screen is built, this should route to something like:
  // window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
  console.log("Search submitted:", query);
}

searchGo.addEventListener("click", handleSearch);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

tagRow.addEventListener("click", (e) => {
  const tag = e.target.closest(".tag");
  if (!tag) return;
  const serviceKey = tag.dataset.service;
  const serviceName = SERVICES[serviceKey];
  // Placeholder: service selection page doesn't exist yet.
  // Once built, this should route to something like:
  // window.location.href = `/service.html?type=${serviceKey}`;
  console.log("Service selected:", serviceName);
});
