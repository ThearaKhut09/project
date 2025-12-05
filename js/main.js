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
  initFavoriteButtons();
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
  title: "ចូលចិត្ត",
  signIn: "ចូលគណនី",
  signUp: "បង្កើតគណនី",
  greeting: "សួស្តី",
  goHome: "ចូលចិត្ត",
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
let authSessionValidationId = 0;
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

async function hydrateAuthState() {
  if (!window.PteahBayAPI) {
    currentAuthSession = null;
    updateAuthUiState();
    return;
  }

  const storedSession = window.PteahBayAPI.getStoredAuthSession?.();
  if (!storedSession || !storedSession.accessToken) {
    currentAuthSession = null;
    updateAuthUiState();
    return;
  }

  currentAuthSession = storedSession;
  updateAuthUiState();
  await validateStoredSession(storedSession);
}

async function validateStoredSession(referenceSession) {
  const validationId = ++authSessionValidationId;

  try {
    const user = await window.PteahBayAPI.getCurrentUser();
    if (validationId !== authSessionValidationId) {
      return;
    }
    currentAuthSession = {
      ...referenceSession,
      user: user || referenceSession.user,
    };
    updateAuthUiState();
  } catch (error) {
    if (validationId !== authSessionValidationId) {
      return;
    }
    if (error && error.status === 401) {
      clearInvalidSession();
      return;
    }
    console.warn("Unable to validate auth session", error);
  }
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
        { action: "profile", label: "គណនីរបស់ខ្ញុំ" },
        { action: "favorites", label: AUTH_LABELS.goHome },
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
    case "profile":
      hideAuthDropdown();
      navigateToProfile();
      break;
    case "favorites":
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

function clearInvalidSession() {
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
  if (path.endsWith("favorite.html")) {
    return;
  }
  window.location.href = "favorite.html";
}

function navigateToProfile() {
  const path = window.location.pathname;
  if (path.endsWith("profile.html")) {
    return;
  }
  window.location.href = "profile.html";
}

// ========================================
// Favorite Buttons
// ========================================
const FAVORITE_BUTTON_SELECTOR = "[data-favorite-food-id]";
let favoriteToastElement = null;
let favoriteToastTimer = null;

function initFavoriteButtons() {
  document.addEventListener("click", handleFavoriteButtonClick);
}

async function handleFavoriteButtonClick(event) {
  const button = event.target.closest(FAVORITE_BUTTON_SELECTOR);
  if (!button) {
    return;
  }

  event.preventDefault();

  if (button.dataset.favoriteLoading === "true") {
    return;
  }

  const foodId = button.getAttribute("data-favorite-food-id");
  if (!foodId) {
    console.warn("Favorite button missing food ID", button);
    return;
  }

  if (!window.PteahBayAPI || !window.PteahBayAPI.addFavoriteFood) {
    showFavoriteToast("សូមព្យាយាមម្តងទៀតក្រោយ។", "error");
    return;
  }

  setFavoriteButtonLoading(button, true);

  try {
    await window.PteahBayAPI.addFavoriteFood(foodId);
    setFavoriteButtonState(button, "saved");

    const message =
      button.dataset.favoriteSuccessMessage ||
      `${
        button.dataset.favoriteFoodName || "ម្ហូប"
      } ត្រូវបានបន្ថែមទៅបញ្ជីចូលចិត្ត។`;
    showFavoriteToast(message, "success");
  } catch (error) {
    handleFavoriteError(error, button);
  } finally {
    setFavoriteButtonLoading(button, false);
  }
}

function setFavoriteButtonLoading(button, isLoading) {
  button.dataset.favoriteLoading = String(isLoading);
  button.disabled = isLoading;
  button.setAttribute("aria-busy", String(isLoading));
  const icon = button.querySelector("svg");
  if (icon) {
    icon.style.opacity = isLoading ? "0.6" : "";
  }
}

function setFavoriteButtonState(button, state) {
  button.dataset.favoriteState = state;
  button.setAttribute("aria-pressed", state === "saved" ? "true" : "false");
  const icon = button.querySelector("svg");
  const path = icon?.querySelector("path");
  if (icon && path) {
    const baseColor = button.dataset.favoriteBaseColor || "#dd070c";
    if (state === "saved") {
      icon.style.fill = "currentColor";
      icon.style.stroke = "currentColor";
      path.setAttribute("fill", "currentColor");
      path.setAttribute("stroke", "currentColor");
    } else {
      icon.style.fill = "none";
      icon.style.stroke = baseColor;
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", baseColor);
    }
  }
}

function handleFavoriteError(error, button) {
  console.error("Unable to add favorite", error);
  if (error && error.status === 401) {
    showFavoriteToast("សូមចូលគណនីសិន ដើម្បីបន្ថែមចូលចិត្ត។", "error");
    clearInvalidSession();
    openAuthModal("sign-in");
    return;
  }

  const message =
    error?.message ||
    button.dataset.favoriteErrorMessage ||
    "ពុំអាចបន្ថែមទៅចូលចិត្តបានទេ។";
  showFavoriteToast(message, "error");
}

function showFavoriteToast(message, tone = "success") {
  const toast = ensureFavoriteToastElement();
  toast.textContent = message;
  toast.style.backgroundColor =
    tone === "error" ? "rgba(173,52,62,0.95)" : "rgba(16,65,39,0.95)";

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  if (favoriteToastTimer) {
    clearTimeout(favoriteToastTimer);
  }

  favoriteToastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
  }, 3200);
}

function ensureFavoriteToastElement() {
  if (favoriteToastElement) {
    return favoriteToastElement;
  }

  const toast = document.createElement("div");
  toast.className = "favorite-toast";
  toast.style.position = "fixed";
  toast.style.bottom = "24px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%) translateY(10px)";
  toast.style.padding = "12px 22px";
  toast.style.borderRadius = "999px";
  toast.style.color = "#fff";
  toast.style.fontSize = "15px";
  toast.style.fontWeight = "500";
  toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
  toast.style.opacity = "0";
  toast.style.zIndex = "9999";
  toast.style.pointerEvents = "none";
  toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  document.body.appendChild(toast);
  favoriteToastElement = toast;
  return toast;
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    hideAuthDropdown();
    closeAuthModal();
  }
});
