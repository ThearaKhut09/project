const params = new URLSearchParams(window.location.search);
const API_BASE_URL = "https://pteahbay-api.cheatdev.online";
const foodID = params.get("foodId");
const foodDetailContainer = document.getElementById("foodDetail");
const FALLBACK_IMAGE = "images/logo.png";

if (foodDetailContainer) {
  initFoodDetail();
}

async function initFoodDetail() {
  if (!foodID) {
    renderErrorState("មិនមានលេខសម្គាល់ម្ហូបទេ។ សូមត្រឡប់ក្រោយម្ដងទៀត។");
    return;
  }

  renderLoadingState();

  try {
    const response = await fetch(
      `${API_BASE_URL}/food-items/${encodeURIComponent(foodID)}`
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    renderFoodDetail(data);
  } catch (error) {
    console.error("Unable to load food", error);
    renderErrorState("ពុំអាចទាញយកព័ត៌មានម្ហូបបានទេ។ សូមព្យាយាមម្តងទៀត។");
  }
}

function renderLoadingState() {
  foodDetailContainer.setAttribute("aria-busy", "true");
  foodDetailContainer.innerHTML = `
    <section class="max-w-[1360px] mx-auto px-4 md:px-6 lg:px-10 py-16 text-center">
      <p class="text-xl text-[#4f2620]">កំពុងទាញយកព័ត៌មានម្ហូប...</p>
    </section>
  `;
}

function renderErrorState(message) {
  foodDetailContainer.removeAttribute("aria-busy");
  foodDetailContainer.innerHTML = `
    <section class="max-w-[1360px] mx-auto px-4 md:px-6 lg:px-10 py-16 text-center space-y-6">
      <p class="text-xl text-[#ad343e]">${message}</p>
      <a href="general_food.html" class="inline-flex items-center gap-2 bg-[#104127] text-white px-5 py-2 rounded-[10px] text-[15px]">
        ត្រឡប់ទៅបញ្ជីម្ហូប
      </a>
    </section>
  `;
}

function renderFoodDetail(data) {
  if (!data || !data.id) {
    renderErrorState("រកមិនឃើញម្ហូបទេ។");
    return;
  }

  const imageUrl = resolveImageUrl(data.image_url);
  const ingredientsText = formatInlineList(data.ingredients);
  const stepsMarkup = formatStepList(data.step_to_cook);
  const ratingLabel = formatRatingLabel(data.rating_count);

  foodDetailContainer.innerHTML = `
    <!-- Dish overview -->
    <section class="max-w-[1360px] mx-auto px-4 md:px-6 lg:px-10 py-10 grid lg:grid-cols-[420px_1fr] gap-10 items-start">
      <div class="rounded-[30px] overflow-hidden border border-[#f0d6c4] shadow-sm">
        <img src="${imageUrl}" alt="${
    data.name || "ម្ហូប"
  }" class="w-full h-full object-cover" />
      </div>
      <div class="space-y-6 lg:space-y-8">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between relative">
          <dl class="space-y-4 text-[24px] sm:text-[26px] leading-[1.7] max-w-3xl">
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <dt class="text-[#ad343e] font-medium flex items-start gap-2 whitespace-nowrap">
                <span>មុខម្ហូប</span>
                <span>៖</span>
              </dt>
              <dd class="flex-1 text-[#104127] text-[32px] sm:text-[36px] leading-snug">
                ${data.name || "មិនមានព័ត៌មាន"}
              </dd>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <dt class="text-[#ad343e] font-medium flex items-start gap-2 whitespace-nowrap">
                <span>គ្រឿងផ្សំ</span>
                <span>៖</span>
              </dt>
              <dd class="flex-1 text-[#4f2620]">
                ${ingredientsText}
              </dd>
            </div>
          </dl>
          <div class="flex items-center gap-3 mt-4 lg:mt-0 text-sm text-[#a4a4a4] lg:absolute lg:right-0 lg:bottom-0">
            <img src="https://www.figma.com/api/mcp/asset/982bc587-7cdc-41fe-bd9d-abb7de7f4ef4" alt="Rating" class="w-[150px] h-7 object-contain" />
            <span>${ratingLabel}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Steps -->
    <section class="max-w-[1360px] mx-auto px-4 md:px-6 lg:px-10">
      <div class="bg-white rounded-[25px] border border-[#e8e8e8] p-6 md:p-10 shadow-sm">
        <div class="flex flex-col gap-3">
          <h2 class="text-[#104127] text-[36px]">របៀបធ្វើ ៖</h2>
          <div class="h-px bg-[#d4d4d4]"></div>
          <ul class="list-disc list-inside text-[20px] leading-[2] space-y-3">
            ${stepsMarkup}
          </ul>
        </div>
      </div>
    </section>

    <!-- Customer reviews -->
    <section class="max-w-[1360px] mx-auto px-4 md:px-6 lg:px-10 mt-12">
      <div class="bg-[rgba(217,217,217,0.3)] rounded-[25px] p-6 md:p-10 space-y-6">
        <div>
          <h3 class="text-[#104127] text-[32px]">មតិយោបល់ពីអតិថិជន</h3>
        </div>
        <div>
          <p class="text-[20px]">ការវាយតម្លៃរបស់អ្នក</p>
          <div class="flex items-center gap-2 mt-3 text-[#e0a427]" aria-label="Rating stars">
            ${renderRatingStars(5)}
          </div>
        </div>
        <div class="space-y-3">
          <label for="review" class="text-[20px]">មតិយោបល់របស់អ្នក</label>
          <textarea
            id="review"
            rows="5"
            class="w-full rounded-[20px] bg-white/80 border border-[#d9d9d9] px-5 py-4 text-[18px] placeholder:text-[#b5b5b5]"
            placeholder="ចែករំលែកបទពិពណ៌នាបទពិសោធន៍របស់អ្នកជាមួយផលិតផលនេះ..."
          ></textarea>
        </div>
        <button class="mt-4 inline-flex items-center justify-center px-10 py-3 rounded-[25px] bg-green-900 text-white text-[20px] hover:bg-[#129746] transition-colors">
          បញ្ជូន
        </button>
      </div>
    </section>
  `;

  foodDetailContainer.removeAttribute("aria-busy");
}

function resolveImageUrl(url) {
  if (typeof url === "string" && url.trim().length) {
    return url.trim();
  }
  return FALLBACK_IMAGE;
}

function formatInlineList(value) {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    return items.length ? items.join(" • ") : "មិនមានព័ត៌មាន";
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "មិនមានព័ត៌មាន";
}

function formatStepList(value) {
  const stepsArray = Array.isArray(value)
    ? value
    : typeof value === "string"
    ? value.split(/\r?\n/)
    : [];

  const items = stepsArray
    .map((step) => (typeof step === "string" ? step.trim() : ""))
    .filter(Boolean);

  if (!items.length) {
    return '<li class="pl-2">មិនមានព័ត៌មាន</li>';
  }

  return items
    .map(
      (step) => `
            <li class="pl-2">${step}</li>
          `
    )
    .join("");
}

function formatRatingLabel(count) {
  if (typeof count === "number" && count > 0) {
    return `${count} Reviews`;
  }
  return "មិនទាន់មានការវាយតម្លៃ";
}

function renderRatingStars(total) {
  return new Array(total)
    .fill("")
    .map(
      () => `
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l2.9 6.1 6.7.5-5 4.4 1.6 6.6-6.2-3.5-6.2 3.5 1.6-6.6-5-4.4 6.7-.5z" />
        </svg>
      `
    )
    .join("");
}
