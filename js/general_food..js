const API_BASE_URL = "https://pteahbay-api.cheatdev.online";
const FALLBACK_IMAGE = "images/logo.png";

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
