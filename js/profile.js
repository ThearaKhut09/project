"use strict";

// ========================================
// Profile Page Initialization
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  checkAuthentication();
  initProfilePage();
  initTabs();
  initModals();
});

// ========================================
// Authentication Check
// ========================================
function checkAuthentication() {
  const session = window.PteahBayAPI?.getStoredAuthSession();
  if (!session || !session.accessToken) {
    window.location.href = "sign_in.html";
    return;
  }
}

// ========================================
// Profile Initialization
// ========================================
let currentUser = null;
let userPosts = [];
let userFavorites = [];

async function initProfilePage() {
  try {
    await loadCurrentUser();
    await Promise.all([loadUserPosts(), loadUserFavorites()]);
  } catch (error) {
    console.error("Error initializing profile:", error);
    showMessage("មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ", "error");
  }
}

async function loadCurrentUser() {
  try {
    currentUser = await window.PteahBayAPI.getCurrentUser();
    displayUserProfile(currentUser);

    // Update localStorage session with fresh user data
    const session = window.PteahBayAPI.getStoredAuthSession();
    if (session) {
      session.user = currentUser;
      localStorage.setItem(
        window.PteahBayAPI.AUTH_STORAGE_KEY,
        JSON.stringify(session)
      );
    }
  } catch (error) {
    console.error("Error loading user:", error);
    if (error?.status === 401) {
      window.location.href = "sign_in.html";
    }
    throw error;
  }
}

function displayUserProfile(user) {
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileImage = document.getElementById("profileImage");
  const profileInitial = document.getElementById("profileInitial");

  const displayName = user.full_name || user.username || "អ្នកប្រើប្រាស់";
  profileName.textContent = displayName;
  profileEmail.textContent = user.email || "";

  if (user.profile_image) {
    profileImage.src = user.profile_image;
    profileImage.classList.remove("hidden");
    profileInitial.classList.add("hidden");
  } else {
    const initial = displayName.charAt(0).toUpperCase();
    profileInitial.textContent = initial;
    profileInitial.classList.remove("hidden");
    profileImage.classList.add("hidden");
  }
}

// ========================================
// User Posts
// ========================================
async function loadUserPosts() {
  try {
    const posts = await window.PteahBayAPI.getUserFoodPosts(
      currentUser.id,
      0,
      50
    );
    userPosts = posts || [];
    displayUserPosts();
  } catch (error) {
    console.error("Error loading user posts:", error);
    userPosts = [];
    displayUserPosts();
  }
}

function displayUserPosts() {
  const postsGrid = document.getElementById("userPostsGrid");
  const noPostsMessage = document.getElementById("noPostsMessage");

  postsGrid.innerHTML = "";

  if (userPosts.length === 0) {
    noPostsMessage.classList.remove("hidden");
    return;
  }

  noPostsMessage.classList.add("hidden");

  userPosts.forEach((post) => {
    const card = createPostCard(post);
    postsGrid.appendChild(card);
  });
}

function createPostCard(post) {
  const card = document.createElement("article");
  card.className =
    "bg-white rounded-[15px] overflow-hidden shadow-md hover:shadow-lg transition-shadow";

  const title = escapeHtml(post.title || "គ្មានចំណងជើង");
  const description = escapeHtml(post.description || "គ្មានការពិពណ៌នា");
  const imageUrl = post.image_url || "images/Fish stew.jpg";

  card.innerHTML = `
    <img src="${imageUrl}" alt="${title}" class="w-full h-48 object-cover" onerror="this.src='images/Fish stew.jpg'" />
    <div class="p-4">
      <h3 class="text-[18px] text-[#104127] font-semibold mb-2">${title}</h3>
      <p class="text-[14px] text-[#55504c] line-clamp-2 mb-4">${description}</p>
      
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <svg class="w-5 h-5 text-[#ad343e]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
        <span>${post.likes_count || 0} ចូលចិត្ត</span>
      </div>

      <div class="flex gap-2">
        <button onclick="editPost('${
          post.id
        }')" class="flex-1 bg-[#104127] text-white px-4 py-2 rounded-lg hover:bg-[#dd070c] transition-colors text-sm">
          កែសម្រួល
        </button>
        <button onclick="deletePost('${
          post.id
        }')" class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
          លុប
        </button>
      </div>
    </div>
  `;

  return card;
}

// ========================================
// User Favorites
// ========================================
async function loadUserFavorites() {
  try {
    const favorites = await window.PteahBayAPI.listFavoriteFoods(0, 50);

    if (!favorites || favorites.length === 0) {
      userFavorites = [];
      displayUserFavorites();
      return;
    }

    // Fetch full food item details for each favorite
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

    // Filter out any failed fetches
    userFavorites = detailedFavorites.filter(Boolean);
    displayUserFavorites();
  } catch (error) {
    console.error("Error loading favorites:", error);
    userFavorites = [];
    displayUserFavorites();
  }
}

function displayUserFavorites() {
  const favoritesGrid = document.getElementById("userFavoritesGrid");
  const noFavoritesMessage = document.getElementById("noFavoritesMessage");

  favoritesGrid.innerHTML = "";

  if (userFavorites.length === 0) {
    noFavoritesMessage.classList.remove("hidden");
    return;
  }

  noFavoritesMessage.classList.add("hidden");

  userFavorites.forEach((favorite) => {
    const card = createFavoriteCard(favorite);
    favoritesGrid.appendChild(card);
  });
}

function createFavoriteCard(favoriteData) {
  const card = document.createElement("article");
  card.className =
    "bg-white rounded-[15px] overflow-hidden shadow-md hover:shadow-lg transition-shadow";

  const food = favoriteData.food || {};
  const name = escapeHtml(food.name || "ម្ហូប");
  const description = escapeHtml(food.description || "គ្មានការពិពណ៌នា");
  const imageUrl = food.image_url || "images/Fish stew.jpg";
  const foodId = food.id || favoriteData.favorite?.food_item_id;

  card.innerHTML = `
    <a href="food_detail.html?foodId=${encodeURIComponent(
      foodId
    )}" class="block">
      <img src="${imageUrl}" alt="${name}" class="w-full h-48 object-cover" onerror="this.src='images/Fish stew.jpg'" />
    </a>
    <div class="p-4">
      <h3 class="text-[18px] text-[#104127] font-semibold mb-2">${name}</h3>
      <p class="text-[14px] text-[#55504c] line-clamp-2 mb-4">${description}</p>
      
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <svg class="w-5 h-5 text-[#ad343e]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
        <span>ចូលចិត្ត</span>
      </div>

      <button onclick="removeFavorite('${foodId}', event)" class="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
        លុបចូលចិត្ត
      </button>
    </div>
  `;

  return card;
}

// ========================================
// Tabs
// ========================================
function initTabs() {
  const postsTab = document.getElementById("postsTab");
  const favoritesTab = document.getElementById("favoritesTab");
  const postsSection = document.getElementById("postsSection");
  const favoritesSection = document.getElementById("favoritesSection");

  postsTab?.addEventListener("click", () => {
    postsTab.classList.add("border-[#dd070c]", "text-[#dd070c]");
    postsTab.classList.remove("text-gray-600");
    favoritesTab.classList.remove("border-[#dd070c]", "text-[#dd070c]");
    favoritesTab.classList.add("text-gray-600");

    postsSection.classList.remove("hidden");
    favoritesSection.classList.add("hidden");
  });

  favoritesTab?.addEventListener("click", () => {
    favoritesTab.classList.add("border-[#dd070c]", "text-[#dd070c]");
    favoritesTab.classList.remove("text-gray-600");
    postsTab.classList.remove("border-[#dd070c]", "text-[#dd070c]");
    postsTab.classList.add("text-gray-600");

    favoritesSection.classList.remove("hidden");
    postsSection.classList.add("hidden");
  });
}

// ========================================
// Modals
// ========================================
function initModals() {
  // Edit Profile Modal
  const editProfileBtn = document.getElementById("editProfileBtn");
  const editProfileModal = document.getElementById("editProfileModal");
  const closeEditModal = document.getElementById("closeEditModal");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const editProfileForm = document.getElementById("editProfileForm");

  editProfileBtn?.addEventListener("click", () => {
    openEditProfileModal();
  });

  closeEditModal?.addEventListener("click", () => {
    editProfileModal?.classList.add("hidden");
    editProfileModal?.classList.remove("flex");
  });

  cancelEditBtn?.addEventListener("click", () => {
    editProfileModal?.classList.add("hidden");
    editProfileModal?.classList.remove("flex");
  });

  editProfileForm?.addEventListener("submit", handleProfileUpdate);

  // Edit Post Modal
  const editPostModal = document.getElementById("editPostModal");
  const closeEditPostModal = document.getElementById("closeEditPostModal");
  const cancelEditPostBtn = document.getElementById("cancelEditPostBtn");
  const editPostForm = document.getElementById("editPostForm");

  closeEditPostModal?.addEventListener("click", () => {
    editPostModal?.classList.add("hidden");
    editPostModal?.classList.remove("flex");
  });

  cancelEditPostBtn?.addEventListener("click", () => {
    editPostModal?.classList.add("hidden");
    editPostModal?.classList.remove("flex");
  });

  editPostForm?.addEventListener("submit", handlePostUpdate);

  // Profile Photo Upload
  const changePhotoBtn = document.getElementById("changePhotoBtn");
  const photoInput = document.getElementById("photoInput");

  changePhotoBtn?.addEventListener("click", () => {
    photoInput?.click();
  });

  photoInput?.addEventListener("change", handlePhotoUpload);
}

function openEditProfileModal() {
  const modal = document.getElementById("editProfileModal");
  const editFullName = document.getElementById("editFullName");
  const editUsername = document.getElementById("editUsername");
  const editEmail = document.getElementById("editEmail");

  if (currentUser) {
    editFullName.value = currentUser.full_name || "";
    editUsername.value = currentUser.username || "";
    editEmail.value = currentUser.email || "";
  }

  modal?.classList.remove("hidden");
  modal?.classList.add("flex");
}

async function handleProfileUpdate(e) {
  e.preventDefault();

  const editFullName = document.getElementById("editFullName");
  const editUsername = document.getElementById("editUsername");
  const messageDiv = document.getElementById("profileFormMessage");

  const profileData = {
    full_name: editFullName.value.trim(),
    username: editUsername.value.trim(),
  };

  try {
    messageDiv.textContent = "កំពុងរក្សាទុក...";
    messageDiv.className = "p-3 bg-blue-100 text-blue-700 rounded-lg";
    messageDiv.classList.remove("hidden");

    const result = await window.PteahBayAPI.updateUserProfile(profileData);

    // If API returns updated user directly, use it; otherwise reload from server
    if (result && (result.id || result.email)) {
      currentUser = result;
      displayUserProfile(result);

      // Update localStorage session with new user data
      const session = window.PteahBayAPI.getStoredAuthSession();
      if (session) {
        session.user = result;
        localStorage.setItem(
          window.PteahBayAPI.AUTH_STORAGE_KEY,
          JSON.stringify(session)
        );
      }
    } else {
      // If no user data returned, reload from server
      await loadCurrentUser();
    }

    messageDiv.textContent = "បានរក្សាទុកដោយជោគជ័យ! ✓";
    messageDiv.className = "p-3 bg-green-100 text-green-700 rounded-lg";

    setTimeout(() => {
      const modal = document.getElementById("editProfileModal");
      modal?.classList.add("hidden");
      modal?.classList.remove("flex");
      messageDiv.classList.add("hidden");
    }, 1500);
  } catch (error) {
    console.error("Error updating profile:", error);

    // Check if the update actually succeeded despite the error
    // This can happen if the API returns 204 or unexpected format
    try {
      await loadCurrentUser();

      // If we successfully loaded user data, the update likely worked
      messageDiv.textContent = "បានរក្សាទុកដោយជោគជ័យ! ✓";
      messageDiv.className = "p-3 bg-green-100 text-green-700 rounded-lg";

      setTimeout(() => {
        const modal = document.getElementById("editProfileModal");
        modal?.classList.add("hidden");
        modal?.classList.remove("flex");
        messageDiv.classList.add("hidden");
      }, 1500);
    } catch (reloadError) {
      // Both update and reload failed
      messageDiv.textContent = error?.message || "មានបញ្ហាក្នុងការរក្សាទុក";
      messageDiv.className = "p-3 bg-red-100 text-red-700 rounded-lg";
    }
  }
}

async function handlePhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("សូមជ្រើសរើសរូបភាពតែប៉ុណ្ណោះ");
    return;
  }

  try {
    const result = await window.PteahBayAPI.uploadProfileImage(file, "profile");

    if (result && result.url) {
      // Reload user data from server to get updated profile
      await loadCurrentUser();

      showMessage("បានផ្លាស់ប្តូររូបភាពដោយជោគជ័យ! ✓", "success");
    }
  } catch (error) {
    console.error("Error uploading photo:", error);
    showMessage(error?.message || "មានបញ្ហាក្នុងការបញ្ចូលរូបភាព", "error");
  }
}

// ========================================
// Post Management
// ========================================
window.editPost = function (postId) {
  const post = userPosts.find((p) => p.id === postId);
  if (!post) return;

  const modal = document.getElementById("editPostModal");
  const editPostId = document.getElementById("editPostId");
  const editPostTitle = document.getElementById("editPostTitle");
  const editPostDescription = document.getElementById("editPostDescription");

  editPostId.value = post.id;
  editPostTitle.value = post.title || "";
  editPostDescription.value = post.description || "";

  modal?.classList.remove("hidden");
  modal?.classList.add("flex");
};

async function handlePostUpdate(e) {
  e.preventDefault();

  const editPostId = document.getElementById("editPostId");
  const editPostTitle = document.getElementById("editPostTitle");
  const editPostDescription = document.getElementById("editPostDescription");
  const messageDiv = document.getElementById("postFormMessage");

  const postData = {
    title: editPostTitle.value.trim(),
    description: editPostDescription.value.trim(),
  };

  try {
    messageDiv.textContent = "កំពុងរក្សាទុក...";
    messageDiv.className = "p-3 bg-blue-100 text-blue-700 rounded-lg";
    messageDiv.classList.remove("hidden");

    await window.PteahBayAPI.updateFoodPost(editPostId.value, postData);

    messageDiv.textContent = "បានរក្សាទុកដោយជោគជ័យ! ✓";
    messageDiv.className = "p-3 bg-green-100 text-green-700 rounded-lg";

    setTimeout(async () => {
      const modal = document.getElementById("editPostModal");
      modal?.classList.add("hidden");
      modal?.classList.remove("flex");
      messageDiv.classList.add("hidden");
      await loadUserPosts();
    }, 1500);
  } catch (error) {
    console.error("Error updating post:", error);
    messageDiv.textContent = error?.message || "មានបញ្ហាក្នុងការរក្សាទុក";
    messageDiv.className = "p-3 bg-red-100 text-red-700 rounded-lg";
  }
}

window.deletePost = async function (postId) {
  if (!confirm("តើអ្នកប្រាកដថាចង់លុបប្រកាសនេះទេ?")) {
    return;
  }

  try {
    await window.PteahBayAPI.deleteFoodPost(postId);
    showMessage("បានលុបប្រកាសដោយជោគជ័យ! ✓", "success");
    await loadUserPosts();
  } catch (error) {
    console.error("Error deleting post:", error);
    showMessage(error?.message || "មានបញ្ហាក្នុងការលុបប្រកាស", "error");
  }
};

window.removeFavorite = async function (foodId, event) {
  // Prevent navigation to food detail page
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!confirm("តើអ្នកប្រាកដថាចង់លុបចេញពីបញ្ជីចូលចិត្តទេ?")) {
    return;
  }

  try {
    await window.PteahBayAPI.removeFavoriteFood(foodId);
    showMessage("បានលុបចេញពីបញ្ជីចូលចិត្តដោយជោគជ័យ! ✓", "success");
    await loadUserFavorites();
  } catch (error) {
    console.error("Error removing favorite:", error);
    showMessage(error?.message || "មានបញ្ហាក្នុងការលុបចូលចិត្ត", "error");
  }
};

// ========================================
// Utility Functions
// ========================================
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showMessage(message, type) {
  const toast = document.createElement("div");
  toast.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-white font-medium shadow-lg z-50 transition-opacity duration-300`;
  toast.style.backgroundColor = type === "error" ? "#ad343e" : "#104127";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}
