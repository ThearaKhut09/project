const API_BASE_URL = "https://pteahbay-api.cheatdev.online";
const FALLBACK_IMAGE = "images/logo.png";

// Cache for all restaurants
let allRestaurantsCache = [];
let searchTimeout = null;

async function listFood() {
  const response = await fetch(API_BASE_URL + "/food-items");
  const data = await response.json();
  console.log(data);

  let display = "";

  // ប្រើ for...of វិញ — ងាយស្រួលបំផុត!
  for (const item of data) {
    try {
      const restRes = await fetch(
        API_BASE_URL + "/restaurants/" + item.restaurant_id
      );
      const restaurant = await restRes.json();

      const foodId = item.id || item.food_item_id;
      const foodName = escapeHtmlAttr(item.name || "ម្ហូប");
      const safeFoodIdAttr = foodId ? escapeHtmlAttr(String(foodId)) : "";

      const favoriteButtonMarkup = foodId
        ? `
          <button
            type="button"
            class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 text-[#dd070c] flex items-center justify-center drop-shadow hover:bg-white transition-colors z-10"
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

      display += `
        <div class="bg-neutral-50 rounded-[10px] overflow-hidden relative">
          ${favoriteButtonMarkup}

          <div class="h-[250px] md:h-[320px] lg:h-[372px] overflow-hidden">
            <img src=${item.image_url} alt=" $${
        item.name
      }" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
          </div>

          <div class="p-3 md:p-[15px] pt-4 md:pt-[17px]">
            <div class="mb-3 md:mb-[20px]">
              <p class="text-[16px] md:text-[18px] lg:text-[20px] text-black mb-2 md:mb-[10px]">
                មុខម្ហូប: ${item.name}
              </p>
              <p class="text-[16px] md:text-[18px] lg:text-[20px] text-black font-semibold">
                ប្រភពភោជនីយដ្ឋាន: ${restaurant.name || "មិនមានឈ្មោះ"}
              </p>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="flex gap-1 md:gap-[6px]">
                ${[1, 2, 3, 4]
                  .map(
                    () => `
                  <svg class="w-[20px] h-[20px] md:w-[24px] md:h-[24px] lg:w-[30px] lg:h-[30px]" viewBox="0 0 30 30" fill="#FFCA28">
                    <path d="M15 2.5L18.09 11.59L27.5 12.82L21.25 18.86L22.77 28.2L15 23.77L7.23 28.2L8.75 18.86L2.5 12.82L11.91 11.59L15 2.5Z"/>
                  </svg>`
                  )
                  .join("")}
                <svg class="w-[20px] h-[20px] md:w-[24px] md:h-[24px] lg:w-[30px] lg:h-[30px]" viewBox="0 0 30 30" fill="#d3d3d3">
                  <path d="M15 2.5L18.09 11.59L27.5 12.82L21.25 18.86L22.77 28.2L15 23.77L7.23 28.2L8.75 18.86L2.5 12.82L11.91 11.59L15 2.5Z"/>
                </svg>
              </div>

              <p class="text-[#ad343e] text-[16px] md:text-[18px] lg:text-[22px]">
                ទីតាំង: ${restaurant.location?.name || "សៀមរាប"}
              </p>
            </div>
          </div>
        </div>`;
    } catch (err) {
      console.log("មិនអាចទាញយកភោជនីយដ្ឋានបាន:", item.restaurant_id);
    }
  }

  document.getElementById("popularFood").innerHTML = display;
}

// Initialize search functionality
document.addEventListener("DOMContentLoaded", function () {
  const restaurantSearchInput = document.getElementById(
    "restaurantSearchInput"
  );
  const restaurantSearchBtn = document.getElementById("restaurantSearchBtn");
  const provinceSearchForm = document.getElementById("provinceSearchForm");
  const searchPopup = document.getElementById("searchPopup");
  const closeSearchPopup = document.getElementById("closeSearchPopup");
  const popupSearchInput = document.getElementById("popupSearchInput");

  // Load all restaurants for searching
  loadAllRestaurants();

  // Prevent form default submission
  if (provinceSearchForm) {
    provinceSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      openSearchPopup();
      if (popupSearchInput && restaurantSearchInput) {
        popupSearchInput.value = restaurantSearchInput.value;
        performLiveSearch(restaurantSearchInput.value);
      }
    });
  }

  // Open popup when clicking search button
  if (restaurantSearchBtn) {
    restaurantSearchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openSearchPopup();
      if (popupSearchInput && restaurantSearchInput) {
        popupSearchInput.value = restaurantSearchInput.value;
        performLiveSearch(restaurantSearchInput.value);
      }
    });
  }

  // Open popup when focusing on input
  if (restaurantSearchInput) {
    restaurantSearchInput.addEventListener("focus", function () {
      openSearchPopup();
      if (popupSearchInput) {
        popupSearchInput.value = this.value;
        performLiveSearch(this.value);
      }
    });

    restaurantSearchInput.addEventListener("keypress", function (e) {
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
  const restaurantSearchInput = document.getElementById(
    "restaurantSearchInput"
  );

  if (searchPopup) {
    searchPopup.classList.add("hidden");
    searchPopup.classList.remove("flex");
    document.body.style.overflow = "";
  }

  if (popupSearchInput) {
    popupSearchInput.value = "";
  }

  if (restaurantSearchInput) {
    restaurantSearchInput.value = "";
  }

  if (searchResultsContainer) {
    searchResultsContainer.innerHTML = `
      <div class="text-center text-gray-500 py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
        </svg>
        <p class="text-[16px]">វាយបញ្ចូលធាតុភោជនីយដ្ឋានដើម្បីស្វែងរក...</p>
      </div>
    `;
  }
}

async function loadAllRestaurants() {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants`);
    const data = await response.json();
    allRestaurantsCache = data || [];
    console.log("Loaded restaurants:", allRestaurantsCache.length);
  } catch (error) {
    console.error("Error loading restaurants:", error);
    allRestaurantsCache = [];
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
        <p class="text-[16px]">វាយបញ្ចូលធាតុភោជនីយដ្ឋានដើម្បីស្វែងរក...</p>
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
  const filteredResults = allRestaurantsCache.filter((item) => {
    const name = (item.name || "").toLowerCase();
    const description = (item.description || "").toLowerCase();
    const location = (item.location?.name || "").toLowerCase();
    return (
      name.includes(searchLower) ||
      description.includes(searchLower) ||
      location.includes(searchLower)
    );
  });

  // Display results
  displaySearchResults(filteredResults);
}

async function displaySearchResults(results) {
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
        <p class="text-[16px]">គ្មានភោជនីយដ្ឋានដែលត្រូវនឹងការស្វែងរករបស់អ្នក។ សូមព្យាយាមម្តងទៀត។</p>
      </div>
    `;
    return;
  }

  let display = '<div class="grid gap-6">';

  // Show loading while fetching food items
  searchResultsContainer.innerHTML = `
    <div class="text-center text-gray-500 py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#104127] mb-4"></div>
      <p class="text-[16px]">កំពុងផ្ទុកម្ហូប...</p>
    </div>
  `;

  // Fetch food items for each restaurant
  for (const restaurant of results) {
    try {
      const restaurantId = restaurant.id || restaurant.restaurant_id;
      const restaurantName = escapeHtmlAttr(restaurant.name || "ភោជនីយដ្ឋាន");
      const locationName =
        restaurant.location?.name || restaurant.location_id || "មិនទាន់កំណត់";

      // Fetch food items from this restaurant
      const foodResponse = await fetch(
        `${API_BASE_URL}/food-items?restaurant_id=${restaurantId}`
      );
      const foodItems = await foodResponse.json();

      if (foodItems && foodItems.length > 0) {
        // Show first food item from this restaurant
        const item = foodItems[0];
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
                  fill="none"
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
              <p class="text-[16px] text-[#55504c] mb-2">
                <span class="font-semibold">ភោជនីយដ្ឋាន:</span> ${restaurantName}
              </p>
              <p class="text-[16px] text-[#55504c] mb-2">
                <span class="font-semibold">ទីតាំង:</span> ${locationName}
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
      }
    } catch (error) {
      console.error(
        "Error fetching food items for restaurant:",
        restaurant.id,
        error
      );
    }
  }

  display += "</div>";
  searchResultsContainer.innerHTML = display;
}

function escapeHtmlAttr(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ហៅវា
listFood();
