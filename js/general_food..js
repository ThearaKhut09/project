const API_BASE_URL = "https://pteahbay-api.cheatdev.online";
const FALLBACK_IMAGE = "images/logo.png";

// Cache for all food items
let allFoodItemsCache = [];
let searchTimeout = null;

// Initialize search functionality
document.addEventListener("DOMContentLoaded", function () {
  const foodSearchInput = document.getElementById("foodSearchInput");
  const foodSearchBtn = document.getElementById("foodSearchBtn");
  const searchPopup = document.getElementById("searchPopup");
  const closeSearchPopup = document.getElementById("closeSearchPopup");
  const popupSearchInput = document.getElementById("popupSearchInput");

  // Load all food items for searching
  loadAllFoodItems();

  // Open popup when clicking search button or input
  if (foodSearchBtn) {
    foodSearchBtn.addEventListener("click", function () {
      openSearchPopup();
    });
  }

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

  if (searchPopup) {
    searchPopup.classList.add("hidden");
    searchPopup.classList.remove("flex");
    document.body.style.overflow = "";
  }

  if (popupSearchInput) {
    popupSearchInput.value = "";
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
        <div class="w-full md:w-[260px] h-[190px] rounded-[12px] overflow-hidden relative">
          ${favoriteButtonMarkup}
          <img
            src="${imageSource}"
            alt="${item.name || "ម្ហូប"}"
            class="w-full h-full object-cover"
          />
        </div>
      </article>
    `;
  });

  display += "</div>";
  searchResultsContainer.innerHTML = display;
}

async function listFood() {
  var display = "";

  const response = await fetch(API_BASE_URL + "/food-items" + "?limit=4");
  const data = await response.json();

  data.map((items) => {
    const foodId = items.id || items.food_item_id;
    const foodName = escapeHtmlAttr(items.name || "ម្ហូប");
    const safeFoodIdAttr = foodId ? escapeHtmlAttr(String(foodId)) : "";
    const articleIdAttr = safeFoodIdAttr
      ? ` data-food-id="${safeFoodIdAttr}"`
      : "";
    const favoriteButtonMarkup = foodId
      ? `
        <button
          type="button"
          class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 text-[#dd070c] flex items-center justify-center drop-shadow"
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
      items.image_url && items.image_url.trim().length
        ? items.image_url.trim()
        : FALLBACK_IMAGE;
    const imageSource = escapeHtmlAttr(rawImage);
    const foodDetailLink = foodId
      ? `food_detail.html?foodId=${encodeURIComponent(foodId)}`
      : "food_detail.html";

    display += `
    
    <article
              class="bg-neutral-50 rounded-[16px] p-6 flex flex-col md:flex-row gap-6"${articleIdAttr}
            >
              <div class="flex-1">
                <p class="text-[#ad343e] text-[22px] mb-2">
                  ${items.name}
                </p>
                <p class="text-[16px] text-[#55504c] mb-4 line-clamp-3">
                  ${items.description}
                </p>
                <a
                  href="${foodDetailLink}"
                  class="inline-flex items-center gap-2 bg-[#104127] text-white px-5 py-2 rounded-[10px] text-[15px]"
                  >ព័ត៌មានបន្ថែម</a
                >
              </div>
              <div class="w-full md:w-[260px] h-[190px] rounded-[12px] overflow-hidden relative">
                ${favoriteButtonMarkup}
                <img
                  src="${imageSource}"
                  alt="${items.name || "ម្ហូប"}"
                  class="w-full h-full object-cover"
                />
              </div>
    </article>
    
    `;
  });

  document.getElementById("ImportantFoodBlock").innerHTML = display;
}

listFood();

function escapeHtmlAttr(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
