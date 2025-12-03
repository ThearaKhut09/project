"use strict";
const API_BASE_URL = "https://pteahbay-api.cheatdev.online";
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
restaurant();
