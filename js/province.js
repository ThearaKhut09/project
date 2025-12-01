const API_BASE_URL = "https://pteahbay-api.cheatdev.online";

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

      display += `
        <div class="bg-neutral-50 rounded-[10px] overflow-hidden relative">
          <!-- Heart Button -->
          <button class="absolute top-[13px] right-[13px] bg-white p-[10px] rounded-[20px] hover:bg-red-50 transition-colors z-10">
            <svg class="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none">
              <path d="M9 15.75L7.9125 14.7675C4.05 11.28 1.5 8.97 1.5 6.15C1.5 3.84 3.285 2.25 5.25 2.25C6.36 2.25 7.4325 2.745 8.25 3.5475C9.0675 2.745 10.14 2.25 11.25 2.25C13.215 2.25 15 3.84 15 6.15C15 8.97 12.45 11.28 8.5875 14.7675L7.5 15.75H9Z"
                stroke="#642f28" stroke-width="1.5" fill="none"/>
            </svg>
          </button>

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

// ហៅវា
listFood();
