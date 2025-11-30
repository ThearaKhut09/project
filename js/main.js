"use strict";

// ========================================
// DOM Content Loaded Event
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  initScrollAnimations();
  initUserDropdown();
  initAuthModal();
});

// ========================================
// Scroll Animations
// ========================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all food cards
  const cards = document.querySelectorAll(".bg-neutral-50");
  cards.forEach((card) => {
    observer.observe(card);
  });
}

// ========================================
// Authentication Dropdown + Modal
// ========================================
const AUTH_LABELS = {
  title: "គ្រប់គ្រងគណនី",
  signIn: "ចូលគណនី",
  signUp: "បង្កើតគណនី",
};

const AUTH_FILE_MAP = {
  "sign-in": "sign_in.html",
  "sign-up": "sign_up.html",
};

let authDropdownElement = null;
let authDropdownTrigger = null;
let authModalElement = null;
let authModalFrame = null;

function initUserDropdown() {
  const triggerImage = document.querySelector('button img[alt="User"]');
  if (!triggerImage) {
    return;
  }

  const triggerButton = triggerImage.closest("button");
  if (!triggerButton) {
    return;
  }

  authDropdownTrigger = triggerButton;
  authDropdownTrigger.type = "button";
  authDropdownTrigger.setAttribute("aria-haspopup", "true");
  authDropdownTrigger.setAttribute("aria-expanded", "false");

  const container = triggerButton.parentElement;
  if (!container) {
    return;
  }

  const anchor = document.createElement("span");
  anchor.className = "auth-dropdown-anchor";
  anchor.style.position = "relative";
  anchor.style.display = "inline-flex";
  anchor.style.alignItems = "center";

  container.insertBefore(anchor, triggerButton);
  anchor.appendChild(triggerButton);

  authDropdownElement = document.createElement("div");
  authDropdownElement.className = "auth-dropdown auth-dropdown--hidden";
  authDropdownElement.innerHTML = `
    <p class="auth-dropdown__title">${AUTH_LABELS.title}</p>
    <button type="button" class="auth-dropdown__item" data-auth-action="sign-in">${AUTH_LABELS.signIn}</button>
    <button type="button" class="auth-dropdown__item" data-auth-action="sign-up">${AUTH_LABELS.signUp}</button>
  `;

  anchor.appendChild(authDropdownElement);

  authDropdownTrigger.addEventListener("click", function (event) {
    event.stopPropagation();
    toggleAuthDropdown();
  });

  authDropdownElement.addEventListener("click", function (event) {
    const action = event.target.closest("[data-auth-action]");
    if (!action) {
      return;
    }
    openAuthModal(action.dataset.authAction);
    hideAuthDropdown();
  });

  document.addEventListener("click", function (event) {
    if (
      !authDropdownElement ||
      authDropdownElement.classList.contains("auth-dropdown--hidden")
    ) {
      return;
    }

    const clickedInsideDropdown = authDropdownElement.contains(event.target);
    const clickedTrigger =
      authDropdownTrigger && authDropdownTrigger.contains(event.target);

    if (!clickedInsideDropdown && !clickedTrigger) {
      hideAuthDropdown();
    }
  });
}

function toggleAuthDropdown() {
  if (!authDropdownElement) {
    return;
  }

  const isHidden = authDropdownElement.classList.contains(
    "auth-dropdown--hidden"
  );
  if (isHidden) {
    authDropdownElement.classList.remove("auth-dropdown--hidden");
    authDropdownTrigger?.setAttribute("aria-expanded", "true");
  } else {
    hideAuthDropdown();
  }
}

function hideAuthDropdown() {
  if (!authDropdownElement) {
    return;
  }

  if (!authDropdownElement.classList.contains("auth-dropdown--hidden")) {
    authDropdownElement.classList.add("auth-dropdown--hidden");
    authDropdownTrigger?.setAttribute("aria-expanded", "false");
  }
}

function initAuthModal() {
  if (authModalElement) {
    return;
  }

  authModalElement = document.createElement("div");
  authModalElement.className = "auth-modal";
  authModalElement.setAttribute("role", "dialog");
  authModalElement.setAttribute("aria-modal", "true");
  authModalElement.setAttribute("aria-hidden", "true");
  authModalElement.innerHTML = `
    <div class="auth-modal__backdrop" data-auth-close="true"></div>
    <div class="auth-modal__panel">
      <button type="button" class="auth-modal__close" data-auth-close="true" aria-label="Close authentication dialog">&times;</button>
      <iframe class="auth-modal__frame" data-auth-frame title="Authentication dialog" src="about:blank" loading="lazy"></iframe>
    </div>
  `;

  document.body.appendChild(authModalElement);
  authModalFrame = authModalElement.querySelector("[data-auth-frame]");

  authModalElement.addEventListener("click", function (event) {
    if (event.target.hasAttribute("data-auth-close")) {
      closeAuthModal();
    }
  });

  authModalFrame?.addEventListener("load", handleAuthFrameLoad);
  authModalFrame?.addEventListener("error", handleAuthFrameError, true);
}

function openAuthModal(view) {
  initAuthModal();

  if (!authModalElement || !authModalFrame) {
    return;
  }

  const selectedView = AUTH_FILE_MAP[view] ? view : "sign-in";
  const filePath = AUTH_FILE_MAP[selectedView];

  authModalFrame.classList.remove("auth-modal__frame--ready");

  authModalElement.classList.add("auth-modal--open");
  authModalElement.setAttribute("aria-hidden", "false");
  document.body.classList.add("auth-modal-open");

  authModalFrame.src = filePath;
}

function closeAuthModal() {
  if (!authModalElement) {
    return;
  }

  if (authModalElement.classList.contains("auth-modal--open")) {
    authModalElement.classList.remove("auth-modal--open");
    authModalElement.setAttribute("aria-hidden", "true");
    document.body.classList.remove("auth-modal-open");
  }

  if (authModalFrame) {
    authModalFrame.src = "about:blank";
    authModalFrame.classList.remove("auth-modal__frame--ready");
  }
}

function handleAuthFrameLoad() {
  if (
    !authModalElement ||
    !authModalElement.classList.contains("auth-modal--open")
  ) {
    return;
  }

  authModalFrame?.classList.add("auth-modal__frame--ready");
}

function handleAuthFrameError() {
  if (
    !authModalElement ||
    !authModalElement.classList.contains("auth-modal--open")
  ) {
    return;
  }

  authModalFrame?.classList.remove("auth-modal__frame--ready");
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    hideAuthDropdown();
    closeAuthModal();
  }
});
