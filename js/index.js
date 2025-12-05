"use strict";
const API_BASE_URL = "https://pteahbay-api.cheatdev.online";
const FALLBACK_IMAGE = "images/logo.png";

// Cache for all food items
let allFoodItemsCache = [];
let searchTimeout = null;

// Restaurant Display Function
async function restaurant() {
  var display = " ";
  const response = await fetch(API_BASE_URL + "/restaurants");
  const data = await response.json();
  console.log(data);

  data.map((items) => {
    display += `
        <div class="rounded-[20px] overflow-hidden h-[280px]">
                        <img src=${items.image_url} alt="Nesat Seafood Madness"
                            class="w-full h-full object-cover">
                    </div>
                    <div class="flex flex-col gap-4">
                        <h3 class="text-[#dd070c] text-[30px]">${items.name}</h3>
                        <p class="text-[#104127] text-[22px]">ទីតាំង ៖ ${items.location_id}</p>
                        <p class="text-[#104127] text-[22px]">ជាភោជនីយដ្ឋានល្បីមួយនៅខេត្ត ${items.description}</p>
                        <a href="restaurant_detail.html"
                            class="bg-[#104127] text-white text-[20px] px-6 py-3 rounded-[10px] w-fit inline-flex items-center gap-2">មើលបន្ថែម
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14" />
                                <path d="M12 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div> 
        `;
  });
  document.getElementById("card-1").innerHTML = display;
}

// Initialize search functionality
document.addEventListener("DOMContentLoaded", function () {
  const foodSearchInput = document.getElementById("foodSearchInput");
  const foodSearchBtn = document.getElementById("foodSearchBtn");
  const homeSearchForm = document.getElementById("homeSearchForm");
  const searchPopup = document.getElementById("searchPopup");
  const closeSearchPopup = document.getElementById("closeSearchPopup");
  const popupSearchInput = document.getElementById("popupSearchInput");

  // Load all food items for searching
  loadAllFoodItems();

  // Prevent form default submission
  if (homeSearchForm) {
    homeSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      openSearchPopup();
      if (popupSearchInput && foodSearchInput) {
        popupSearchInput.value = foodSearchInput.value;
        performLiveSearch(foodSearchInput.value);
      }
    });
  }

  // Open popup when clicking search button
  if (foodSearchBtn) {
    foodSearchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openSearchPopup();
      if (popupSearchInput && foodSearchInput) {
        popupSearchInput.value = foodSearchInput.value;
        performLiveSearch(foodSearchInput.value);
      }
    });
  }

  // Open popup when focusing on input
  if (foodSearchInput) {
    foodSearchInput.addEventListener("focus", function () {
      openSearchPopup();
      if (popupSearchInput) {
        popupSearchInput.value = this.value;
        performLiveSearch(this.value);
      }
    });

    foodSearchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        openSearchPopup();
        if (popupSearchInput) {
          popupSearchInput.value = this.value;
          performLiveSearch(this.value);
        }
      }
    });
  }

  // Close popup handlers
  if (closeSearchPopup) {
    closeSearchPopup.addEventListener("click", closePopup);
  }

  if (searchPopup) {
    searchPopup.addEventListener("click", function (e) {
      if (e.target === searchPopup) {
        closePopup();
      }
    });
  }

  // Live search in popup as user types
  if (popupSearchInput) {
    popupSearchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performLiveSearch(this.value.trim());
      }, 300); // Debounce 300ms
    });
  }

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      searchPopup &&
      !searchPopup.classList.contains("hidden")
    ) {
      closePopup();
    }
  });
});

function openSearchPopup() {
  const searchPopup = document.getElementById("searchPopup");
  const popupSearchInput = document.getElementById("popupSearchInput");

  if (searchPopup) {
    searchPopup.classList.remove("hidden");
    searchPopup.classList.add("flex");
    document.body.style.overflow = "hidden";

    if (popupSearchInput) {
      setTimeout(() => popupSearchInput.focus(), 100);
    }
  }
}

function closePopup() {
  const searchPopup = document.getElementById("searchPopup");
  const searchResultsContainer = document.getElementById(
    "searchResultsContainer"
  );
  const popupSearchInput = document.getElementById("popupSearchInput");
  const foodSearchInput = document.getElementById("foodSearchInput");

  if (searchPopup) {
    searchPopup.classList.add("hidden");
    searchPopup.classList.remove("flex");
    document.body.style.overflow = "";
  }

  if (popupSearchInput) {
    popupSearchInput.value = "";
  }

  if (foodSearchInput) {
    foodSearchInput.value = "";
  }

  if (searchResultsContainer) {
    searchResultsContainer.innerHTML = `
      <div class="text-center text-gray-500 py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
        </svg>
        <p class="text-[16px]">វាយបញ្ចូលធាតុម្ហូបដើម្បីស្វែងរក...</p>
      </div>
    `;
  }
}

async function loadAllFoodItems() {
  try {
    const response = await fetch(`${API_BASE_URL}/food-items?limit=100`);
    const data = await response.json();
    allFoodItemsCache = data || [];
    console.log("Loaded food items:", allFoodItemsCache.length);
  } catch (error) {
    console.error("Error loading food items:", error);
    allFoodItemsCache = [];
  }
}

function performLiveSearch(searchQuery) {
  const searchResultsContainer = document.getElementById(
    "searchResultsContainer"
  );

  if (!searchQuery) {
    searchResultsContainer.innerHTML = `
      <div class="text-center text-gray-500 py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
        </svg>
        <p class="text-[16px]">វាយបញ្ចូលធាតុម្ហូបដើម្បីស្វែងរក...</p>
      </div>
    `;
    return;
  }

  // Show loading
  searchResultsContainer.innerHTML = `
    <div class="text-center text-gray-500 py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#104127] mb-4"></div>
      <p class="text-[16px]">កំពុងស្វែងរក...</p>
    </div>
  `;

  // Filter from cache
  const searchLower = searchQuery.toLowerCase();
  const filteredResults = allFoodItemsCache.filter((item) => {
    const name = (item.name || "").toLowerCase();
    const description = (item.description || "").toLowerCase();
    return name.includes(searchLower) || description.includes(searchLower);
  });

  // Display results
  displaySearchResults(filteredResults);
}

function displaySearchResults(results) {
  const searchResultsContainer = document.getElementById(
    "searchResultsContainer"
  );

  if (!results || results.length === 0) {
    searchResultsContainer.innerHTML = `
      <div class="text-center text-gray-500 py-12">
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-[#104127] text-[20px] mb-2">រកមិនឃើញ</h3>
        <p class="text-[16px]">គ្មានម្ហូបដែលត្រូវនឹងការស្វែងរករបស់អ្នក។ សូមព្យាយាមម្តងទៀត។</p>
      </div>
    `;
    return;
  }

  let display = '<div class="grid gap-6">';

  results.forEach((item) => {
    const foodId = item.id || item.food_item_id;
    const foodName = escapeHtmlAttr(item.name || "ម្ហូប");
    const safeFoodIdAttr = foodId ? escapeHtmlAttr(String(foodId)) : "";

    const favoriteButtonMarkup = foodId
      ? `
        <button
          type="button"
          class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 text-[#dd070c] flex items-center justify-center drop-shadow hover:bg-white transition-colors"
          data-favorite-food-id="${safeFoodIdAttr}"
          data-favorite-food-name="${foodName}"
          aria-label="បន្ថែមទៅចូលចិត្ត"
          aria-pressed="false"
        >
          <span class="sr-only">បន្ថែមទៅចូលចិត្ត</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"
            />
          </svg>
        </button>
      `
      : "";

    const rawImage =
      item.image_url && item.image_url.trim().length
        ? item.image_url.trim()
        : FALLBACK_IMAGE;
    const imageSource = escapeHtmlAttr(rawImage);
    const foodDetailLink = foodId
      ? `food_detail.html?foodId=${encodeURIComponent(foodId)}`
      : "food_detail.html";

    display += `
      <article class="bg-neutral-50 rounded-[16px] p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow">
        <div class="flex-1">
          <p class="text-[#ad343e] text-[22px] mb-2">
            ${item.name}
          </p>
          <p class="text-[16px] text-[#55504c] mb-4 line-clamp-3">
            ${item.description || "គ្មានការពិពណ៌នា"}
          </p>
          <a
            href="${foodDetailLink}"
            class="inline-flex items-center gap-2 bg-[#104127] text-white px-5 py-2 rounded-[10px] text-[15px] hover:bg-[#ad343e] transition-colors"
            >ព័ត៌មានបន្ថែម</a
          >
        </div>
        <div class="w-full md:w-[280px] h-[200px] md:h-auto rounded-[12px] overflow-hidden relative flex-shrink-0">
          ${favoriteButtonMarkup}
          <img
            src="${imageSource}"
            alt="${foodName}"
            class="w-full h-full object-cover"
            onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
          />
        </div>
      </article>
    `;
  });

  display += "</div>";
  searchResultsContainer.innerHTML = display;

  // Re-attach favorite listeners after rendering
  if (typeof attachFavoriteListeners === "function") {
    attachFavoriteListeners();
  }
}

function escapeHtmlAttr(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

restaurant();
