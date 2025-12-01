// Dark Mode Toggle Functionality
(function () {
  "use strict";

  // Get elements
  const darkModeBtn = document.getElementById("darkModeBtn");
  const body = document.body;
  const html = document.documentElement;

  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem("theme") || "light";

  // Apply the saved theme on page load
  if (currentTheme === "dark") {
    enableDarkMode();
  }

  // Dark mode toggle event listener
  if (darkModeBtn) {
    darkModeBtn.addEventListener("click", function () {
      if (body.classList.contains("dark-mode")) {
        disableDarkMode();
      } else {
        enableDarkMode();
      }
    });
  }

  // Enable dark mode
  function enableDarkMode() {
    body.classList.add("dark-mode");
    html.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
    updateDarkModeIcon(true);
  }

  // Disable dark mode
  function disableDarkMode() {
    body.classList.remove("dark-mode");
    html.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
    updateDarkModeIcon(false);
  }

  // Update the dark mode button icon
  function updateDarkModeIcon(isDark) {
    if (darkModeBtn) {
      const svg = darkModeBtn.querySelector("svg");
      if (svg) {
        if (isDark) {
          // Sun icon for light mode
          svg.innerHTML =
            '<path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.7 10.7-1.1 15.2L446.9 256l62.8 90.3c2.8 4.5 3.2 10.2 1.1 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.7-15.2-1.1L256 446.9l-90.3 62.8c-4.5 2.8-10.2 3.2-15.2 1.1s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.7-10.7 1.1-15.2L65.1 256 2.3 165.7c-2.8-4.5-3.2-10.2-1.1-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.7 15.2 1.1L256 65.1 346.3 2.3c4.5-2.8 10.2-3.2 15.2-1.1zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/>';
        } else {
          // Moon icon for dark mode
          svg.innerHTML =
            '<path d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z" />';
        }
      }
    }
  }

  // Initialize icon state
  updateDarkModeIcon(currentTheme === "dark");

  // Handle mobile dark mode button
  const mobileDarkModeBtn = document.querySelector(
    '.md\\:hidden button[class*="flex items-center gap-2"]:has(svg path[d*="320 64C178.6"])'
  );
  if (mobileDarkModeBtn) {
    mobileDarkModeBtn.addEventListener("click", function () {
      if (body.classList.contains("dark-mode")) {
        disableDarkMode();
      } else {
        enableDarkMode();
      }
    });
  }
})();
