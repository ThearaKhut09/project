const API_BASE_URL = "https://pteahbay-api.cheatdev.online";

async function listFood() {
  var display = "";

  const response = await fetch(API_BASE_URL + "/food-items"+"?limit=4");
  const data = await response.json();

  console.log(data);

  data.map((items) => {
    display += `
    
    <article
              class="bg-neutral-50 rounded-[16px] p-6 flex flex-col md:flex-row gap-6"
            >
              <div class="flex-1">
                <p class="text-[#ad343e] text-[22px] mb-2">
                  ${items.name}
                </p>
                <p class="text-[16px] text-[#55504c] mb-4">
                  ${items.description}
                </p>
                <a
                  href="food_detail.html?foodId=${items.id}"
                  class="inline-flex items-center gap-2 bg-[#104127] text-white px-5 py-2 rounded-[10px] text-[15px]"
                  >ព័ត៌មានបន្ថែម</a
                >
              </div>
              <img
                src=${items.image_url}
                alt="ទឹកគ្រឿង"
                class="w-full md:w-[260px] h-[190px] object-cover rounded-[12px]"
              />
    </article>
    
    `;
  });

  document.getElementById("ImportantFoodBlock").innerHTML = display;
}

listFood();
