(function () {
  const favoriteGrid = document.getElementById("favoriteFoodGrid");
  if (!favoriteGrid) {
    return;
  }

  const loadingElement = document.getElementById("favoriteLoadingState");
  const messageElement = document.getElementById("favoriteStateMessage");
  const REMOVE_BUTTON_SELECTOR = "[data-remove-favorite-food-id]";

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFavoritePage);
  } else {
    initFavoritePage();
  }
  document.addEventListener("click", handleFavoriteRemoval);

  async function initFavoritePage() {
    hideMessage();
    favoriteGrid.innerHTML = "";
    setLoading(true);

    if (!window.PteahBayAPI) {
      showMessage(
        "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។ សូមព្យាយាមម្តងទៀតក្រោយ។",
        "error"
      );
      setLoading(false);
      return;
    }

    const session = window.PteahBayAPI.getStoredAuthSession?.();
    if (!session || !session.accessToken) {
      renderAuthRequiredState();
      setLoading(false);
      return;
    }

    try {
      const favorites = await window.PteahBayAPI.listFavoriteFoods(0, 100);
      if (!favorites || favorites.length === 0) {
        renderEmptyState();
        return;
      }

      const detailedFavorites = await Promise.all(
        favorites.map(async (favorite) => {
          try {
            const food = await window.PteahBayAPI.getFoodItem(
              favorite.food_item_id
            );
            return { favorite, food };
          } catch (error) {
            console.warn("Unable to fetch food", favorite.food_item_id, error);
            return null;
          }
        })
      );

      const validFavorites = detailedFavorites.filter(Boolean);
      if (!validFavorites.length) {
        renderEmptyState(true);
        return;
      }

      favoriteGrid.innerHTML = validFavorites
        .map(({ favorite, food }) => buildFavoriteCard(food, favorite))
        .join("");
    } catch (error) {
      handleFavoriteFetchError(error);
    } finally {
      setLoading(false);
    }
  }

  function renderAuthRequiredState() {
    showMessage(
      'សូម <a href="sign_in.html" class="text-[#ad343e] underline">ចូលគណនី</a> មុនពេលមើលបញ្ជីចូលចិត្ត។',
      "info"
    );
  }

  function renderEmptyState(hadErrors) {
    const message = hadErrors
      ? "ពុំអាចបង្ហាញព័ត៌មានម្ហូបចូលចិត្តបានទេ។ សូមព្យាយាមម្តងទៀតក្រោយ។"
      : "មិនទាន់មានម្ហូបណាមួយក្នុងបញ្ជីចូលចិត្ត។ ចាប់ផ្តើមបន្ថែមតាំងពីមុខម្ហូបទូទៅ។";
    showMessage(message, "info");
  }

  function buildFavoriteCard(food, favorite) {
    const rawFoodId = typeof food.id === "undefined" ? "" : String(food.id);
    const foodId = escapeHtmlAttr(rawFoodId);
    const name = escapeHtml(food.name || "ម្ហូប");
    const description = escapeHtml(summarizeDescription(food.description));
    const imageUrl = escapeHtmlAttr(resolveImageUrl(food.image_url));
    const addedLabel = formatAddedDate(favorite.added_at);
    const detailLink = rawFoodId
      ? `food_detail.html?foodId=${encodeURIComponent(rawFoodId)}`
      : "food_detail.html";

    return `
      <article class="bg-white shadow-sm rounded-[12px] p-5 md:p-6 flex flex-col md:flex-row gap-6" data-favorite-card>
        <div class="flex-1 space-y-4">
          <div>
            <p class="text-[#ad343e] text-[22px] md:text-[24px] font-semibold">${name}</p>
<<<<<<< HEAD
            <p class="text-[#6b5548] text-[15px] md:text-[17px] leading-relaxed line-clamp-3">${description}</p>
=======
            <p class="text-[#6b5548] text-[15px] md:text-[17px] leading-relaxed">${description}</p>
>>>>>>> project/main
          </div>
          <div class="flex flex-wrap gap-3">
            <a href="${detailLink}"
              class="inline-flex items-center justify-center bg-[#104127] text-white text-[15px] md:text-[16px] px-5 py-2 rounded-[10px]">
              ព័ត៌មានបន្ថែម
            </a>
            <button type="button"
              class="inline-flex items-center gap-2 border border-[#dd070c] text-[#dd070c] px-4 py-2 rounded-[10px] text-[15px] remove-favorite-btn"
              data-remove-favorite-food-id="${foodId}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
              លុបចេញ
            </button>
          </div>
          <p class="text-sm text-[#9b8a7f]">${addedLabel}</p>
        </div>
        <div class="w-full md:w-[260px] h-[190px] rounded-[12px] overflow-hidden">
          <img src="${imageUrl}" alt="${name}" class="w-full h-full object-cover" />
        </div>
      </article>
    `;
  }

  async function handleFavoriteRemoval(event) {
    const button = event.target.closest(REMOVE_BUTTON_SELECTOR);
    if (!button) {
      return;
    }

    event.preventDefault();

    if (!window.PteahBayAPI || !window.PteahBayAPI.removeFavoriteFood) {
      showMessage("មិនអាចលុបចេញបានទេ។", "error");
      return;
    }

    const foodId = button.getAttribute("data-remove-favorite-food-id");
    if (!foodId) {
      return;
    }

    setRemoveButtonLoading(button, true);

    try {
      await window.PteahBayAPI.removeFavoriteFood(foodId);
      const card = button.closest("[data-favorite-card]");
      card?.remove();
      showMessage("បានលុបចេញពីបញ្ជីចូលចិត្ត។", "success");

      if (!favoriteGrid.children.length) {
        renderEmptyState();
      }
    } catch (error) {
      if (error && error.status === 401) {
        renderAuthRequiredState();
        return;
      }

      showMessage(
        error?.message || "ពុំអាចលុបចេញបានទេ។ សូមព្យាយាមម្តងទៀត។",
        "error"
      );
      setRemoveButtonLoading(button, false);
    }
  }

  function handleFavoriteFetchError(error) {
    if (error && error.status === 401) {
      renderAuthRequiredState();
      return;
    }

    showMessage(
      error?.message || "មានបញ្ហាក្នុងការទាញយកបញ្ជីចូលចិត្ត។",
      "error"
    );
  }

  function setLoading(isLoading) {
    if (!loadingElement) {
      return;
    }

    loadingElement.classList.toggle("hidden", !isLoading);
  }

  function showMessage(message, tone = "info") {
    if (!messageElement) {
      return;
    }

    const toneClass = getToneClass(tone);
    messageElement.className = `text-center text-[17px] md:text-[18px] leading-relaxed rounded-[14px] px-6 py-4 ${toneClass}`;
    messageElement.innerHTML = message;
    messageElement.classList.remove("hidden");
  }

  function hideMessage() {
    if (!messageElement) {
      return;
    }
    messageElement.classList.add("hidden");
    messageElement.textContent = "";
  }

  function getToneClass(tone) {
    switch (tone) {
      case "success":
        return "bg-[#e6f5ed] text-[#104127]";
      case "error":
        return "bg-[#fdecec] text-[#ad343e]";
      default:
        return "bg-[#f3e9dd] text-[#642f28]";
    }
  }

  function setRemoveButtonLoading(button, isLoading) {
    button.disabled = isLoading;
    button.setAttribute("aria-busy", String(isLoading));
    button.classList.toggle("opacity-60", isLoading);
  }

  function resolveImageUrl(url) {
    if (typeof url === "string" && url.trim()) {
      return url.trim();
    }
    return "images/logo.png";
  }

  function summarizeDescription(value) {
    if (typeof value !== "string" || !value.trim()) {
      return "មិនមានការពិពណ៌នាពីម្ហូបនេះ។";
    }

    const trimmed = value.trim();
    if (trimmed.length <= 220) {
      return trimmed;
    }

    return `${trimmed.slice(0, 217)}...`;
  }

  function formatAddedDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return `បានបន្ថែមថ្ងៃទី ${date.toLocaleDateString("km-KH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`;
  }

  function escapeHtml(value) {
    if (typeof value !== "string") {
      return "";
    }

    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

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
})();
