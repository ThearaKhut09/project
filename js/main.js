"use strict";
// ========================================
// DOM Content Loaded Event
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  initScrollAnimations();
  initUserDropdown();
  initAuthModal();
  initAuthMessaging();
  hydrateAuthState();
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
const AUTH_MESSAGE_TYPE = "auth:success";

const AUTH_LABELS = {
  title: "គ្រប់គ្រងគណនី",
  signIn: "ចូលគណនី",
  signUp: "បង្កើតគណនី",
  greeting: "សួស្តី",
  goHome: "គ្រប់គ្រងគណនី",
  signOut: "ចាកចេញ",
};

const AUTH_FILE_MAP = {
  "sign-in": "sign_in.html",
  "sign-up": "sign_up.html",
};

let authDropdownElement = null;
let authDropdownTrigger = null;
let authModalElement = null;
let authModalFrame = null;
let currentAuthSession = null;
let userAvatarImage = null;
let userAvatarInitial = null;

function initUserDropdown() {
  const triggerButton = document.querySelector("[data-user-trigger]");
  if (!triggerButton) {
    return;
  }

  authDropdownTrigger = triggerButton;
  authDropdownTrigger.type = "button";
  authDropdownTrigger.setAttribute("aria-haspopup", "true");
  authDropdownTrigger.setAttribute("aria-expanded", "false");

  userAvatarImage = triggerButton.querySelector("[data-user-avatar-img]");
  userAvatarInitial = triggerButton.querySelector("[data-user-avatar-initial]");

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
  renderAuthDropdown();

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
    handleAuthAction(action.dataset.authAction);
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

function initAuthMessaging() {
  window.addEventListener("message", function (event) {
    const data = event.data;
    if (!data || typeof data !== "object") {
      return;
    }

    if (data.type === AUTH_MESSAGE_TYPE) {
      closeAuthModal();
      hydrateAuthState();
      navigateHome();
    }
  });
}

function hydrateAuthState() {
  if (!window.PteahBayAPI) {
    currentAuthSession = null;
    updateAuthUiState();
    return;
  }

  currentAuthSession = window.PteahBayAPI.getStoredAuthSession();
  updateAuthUiState();
}

function updateAuthUiState() {
  updateUserAvatar();
  renderAuthDropdown();
}

const DEFAULT_USER_AVATAR_SRC = "images/user-icon.svg";

function updateUserAvatar() {
  if (!authDropdownTrigger) {
    return;
  }

  const user = currentAuthSession?.user;
  const hasProfileImage = Boolean(user?.profile_image);

  if (hasProfileImage && userAvatarImage) {
    userAvatarImage.src = user.profile_image;
    userAvatarImage.alt = user.username || user.email || "User";
    userAvatarImage.classList.remove("hidden");
    userAvatarInitial?.classList.add("hidden");
    return;
  }

  if (user && userAvatarInitial) {
    userAvatarInitial.textContent = getUserInitial(user);
    userAvatarInitial.classList.remove("hidden");
    userAvatarInitial.classList.add("uppercase");
    userAvatarImage?.classList.add("hidden");
    return;
  }

  if (userAvatarImage) {
    userAvatarImage.src = DEFAULT_USER_AVATAR_SRC;
    userAvatarImage.alt = "User";
    userAvatarImage.classList.remove("hidden");
  }
  userAvatarInitial?.classList.add("hidden");
}

function renderAuthDropdown() {
  if (!authDropdownElement) {
    return;
  }

  authDropdownElement.innerHTML = "";

  const title = document.createElement("p");
  title.className = "auth-dropdown__title";
  if (currentAuthSession?.user) {
    title.textContent = `${AUTH_LABELS.greeting} ${getUserDisplayName(
      currentAuthSession.user
    )}`;
  } else {
    title.textContent = AUTH_LABELS.title;
  }
  authDropdownElement.appendChild(title);

  const actions = currentAuthSession?.user
    ? [
        { action: "home", label: AUTH_LABELS.goHome },
        { action: "logout", label: AUTH_LABELS.signOut },
      ]
    : [
        { action: "sign-in", label: AUTH_LABELS.signIn },
        { action: "sign-up", label: AUTH_LABELS.signUp },
      ];

  actions.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "auth-dropdown__item";
    button.dataset.authAction = item.action;
    button.textContent = item.label;
    authDropdownElement.appendChild(button);
  });
}

function handleAuthAction(action) {
  switch (action) {
    case "sign-in":
      openAuthModal("sign-in");
      hideAuthDropdown();
      break;
    case "sign-up":
      openAuthModal("sign-up");
      hideAuthDropdown();
      break;
    case "home":
      hideAuthDropdown();
      navigateHome();
      break;
    case "logout":
      hideAuthDropdown();
      performLogout();
      break;
    default:
      break;
  }
}

function performLogout() {
  window.PteahBayAPI?.clearAuthSession();
  currentAuthSession = null;
  updateAuthUiState();
}

function getUserDisplayName(user) {
  return user.full_name || user.username || user.email || "អ្នកប្រើ";
}

function getUserInitial(user) {
  const displayName = getUserDisplayName(user);
  return displayName ? displayName.charAt(0) : "U";
}

function navigateHome() {
  const path = window.location.pathname;
  if (path.endsWith("index.html") || path === "/" || path === "") {
    return;
  }
  window.location.href = "index.html";
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    hideAuthDropdown();
    closeAuthModal();
  }
});
