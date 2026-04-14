const API_BASE_URL = "https://bookmyground.pythonanywhere.com/api/v1";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=80";

const state = {
  token: localStorage.getItem("bmg_token") || "",
  user: readJson("bmg_user"),
  grounds: [],
  favorites: [],
  bookings: [],
  selectedGroundId: null,
  selectedGround: null,
  reviews: [],
  slots: [],
  selectedSlotId: null,
  bookingDate: today(),
  search: "",
  city: "",
  ordering: "-avg_rating",
};

const els = {
  groundsGrid: document.querySelector("#groundsGrid"),
  groundsStatus: document.querySelector("#groundsStatus"),
  groundsCount: document.querySelector("#groundsCount"),
  favoritesCount: document.querySelector("#favoritesCount"),
  bookingsCount: document.querySelector("#bookingsCount"),
  detailEmpty: document.querySelector("#detailEmpty"),
  detailView: document.querySelector("#detailView"),
  detailHero: document.querySelector("#detailHero"),
  detailMeta: document.querySelector("#detailMeta"),
  detailDescription: document.querySelector("#detailDescription"),
  amenitiesList: document.querySelector("#amenitiesList"),
  pricingList: document.querySelector("#pricingList"),
  detailRules: document.querySelector("#detailRules"),
  detailCancellation: document.querySelector("#detailCancellation"),
  reviewsList: document.querySelector("#reviewsList"),
  slotList: document.querySelector("#slotList"),
  bookingDateInput: document.querySelector("#bookingDateInput"),
  bookingSummary: document.querySelector("#bookingSummary"),
  bookingForm: document.querySelector("#bookingForm"),
  customerNameInput: document.querySelector("#customerNameInput"),
  customerPhoneInput: document.querySelector("#customerPhoneInput"),
  playerCountInput: document.querySelector("#playerCountInput"),
  specialRequestsInput: document.querySelector("#specialRequestsInput"),
  bookingSubmitBtn: document.querySelector("#bookingSubmitBtn"),
  favoriteBtn: document.querySelector("#favoriteBtn"),
  mapBtn: document.querySelector("#mapBtn"),
  accountTitle: document.querySelector("#accountTitle"),
  authGuest: document.querySelector("#authGuest"),
  authUser: document.querySelector("#authUser"),
  profileCard: document.querySelector("#profileCard"),
  authToggleBtn: document.querySelector("#authToggleBtn"),
  loginForm: document.querySelector("#loginForm"),
  registerForm: document.querySelector("#registerForm"),
  logoutBtn: document.querySelector("#logoutBtn"),
  bookingsList: document.querySelector("#bookingsList"),
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  cityInput: document.querySelector("#cityInput"),
  sortSelect: document.querySelector("#sortSelect"),
  refreshBtn: document.querySelector("#refreshBtn"),
  toast: document.querySelector("#toast"),
};

boot();

async function boot() {
  bindEvents();
  hydrateFormDefaults();
  syncAuthUi();
  await loadGrounds();
  if (state.token) {
    await hydratePrivateData();
  }
}

function bindEvents() {
  els.bookingDateInput.value = state.bookingDate;
  els.bookingDateInput.min = today();

  els.searchForm.addEventListener("submit", async event => {
    event.preventDefault();
    state.search = els.searchInput.value.trim();
    state.city = els.cityInput.value.trim();
    await loadGrounds();
  });

  els.sortSelect.addEventListener("change", async event => {
    state.ordering = event.target.value;
    await loadGrounds();
  });

  els.refreshBtn.addEventListener("click", async () => {
    await loadGrounds();
    if (state.selectedGroundId) {
      await selectGround(state.selectedGroundId);
    }
    if (state.token) {
      await hydratePrivateData();
    }
    notify("Data refreshed from live API.");
  });

  els.authToggleBtn.addEventListener("click", () => {
    document.querySelector(".panel-side").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.loginForm.addEventListener("submit", handleLogin);
  els.registerForm.addEventListener("submit", handleRegister);
  els.logoutBtn.addEventListener("click", handleLogout);
  els.bookingDateInput.addEventListener("change", async event => {
    state.bookingDate = event.target.value;
    state.selectedSlotId = null;
    renderBookingComposer();
    if (state.selectedGround) {
      await loadSlots(state.selectedGround.id, state.bookingDate);
    }
  });
  els.bookingForm.addEventListener("submit", handleBooking);
  els.favoriteBtn.addEventListener("click", handleFavoriteToggle);
  els.mapBtn.addEventListener("click", openSelectedGroundInMaps);
}

function hydrateFormDefaults() {
  els.searchInput.value = state.search;
  els.cityInput.value = state.city;
  els.sortSelect.value = state.ordering;
  els.customerNameInput.value = state.user?.full_name || "";
  els.customerPhoneInput.value = state.user?.phone || "";
}

async function api(path, options = {}) {
  const config = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  if (state.token) {
    config.headers.Authorization = `Token ${state.token}`;
  }

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.error || payload?.detail || flattenErrors(payload) || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return payload;
}

async function requestWithFallback(method, paths, options = {}) {
  let lastError;

  for (const path of paths) {
    try {
      return await api(path, { method, ...options });
    } catch (error) {
      lastError = error;
      const message = String(error?.message || "");
      if (!message.includes("404")) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function requestWithMethodFallback(methods, path, options = {}) {
  let lastError;

  for (const method of methods) {
    try {
      return await api(path, { method, ...options });
    } catch (error) {
      lastError = error;
      const message = String(error?.message || "");
      if (!message.includes("404") && !message.includes("405")) {
        throw error;
      }
    }
  }

  throw lastError;
}

const authAPI = {
  register: body => api("/auth/register/", { method: "POST", body }),
  login: (email, password) => api("/auth/login/", { method: "POST", body: { email, password } }),
  logout: () => requestWithFallback("POST", ["/auth/logout/", "/auth/logout"], { body: {} }),
  getProfile: () => api("/auth/profile/"),
  listNotifications: params => {
    const search = new URLSearchParams(params || {}).toString();
    const suffix = search ? `?${search}` : "";
    return requestWithFallback("GET", [`/auth/notifications/${suffix}`, `/notifications/${suffix}`]);
  },
};

const groundsAPI = {
  list: params => {
    const search = new URLSearchParams(
      Object.entries(params || {}).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    ).toString();
    return api(`/grounds/${search ? `?${search}` : ""}`);
  },
  detail: groundId => api(`/grounds/${groundId}/`),
  listFavorites: () => api("/grounds/favorites/"),
  addFavorite: groundId => api("/grounds/favorites/", { method: "POST", body: { ground_id: groundId } }),
  removeFavorite: favId => api(`/grounds/favorites/${favId}/`, { method: "DELETE" }),
};

const bookingsAPI = {
  list: params => {
    const search = new URLSearchParams(
      Object.entries(params || {}).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    ).toString();
    return api(`/bookings/${search ? `?${search}` : ""}`);
  },
  listSlots: (groundId, date) =>
    api(`/bookings/slots/?ground=${encodeURIComponent(groundId)}&date=${encodeURIComponent(date)}`),
  create: body => api("/bookings/", { method: "POST", body }),
  cancel: bookingId =>
    requestWithMethodFallback(["PATCH", "POST"], `/bookings/${bookingId}/cancel/`, { body: { reason: "" } }),
  createPaymentOrder: (bookingId, body) =>
    requestWithFallback("POST", [
      `/bookings/${bookingId}/payment-order/`,
      `/bookings/${bookingId}/create-razorpay-order/`,
    ], { body }),
  verifyPayment: (bookingId, body) =>
    requestWithFallback("POST", [
      `/bookings/${bookingId}/payment-verify/`,
      `/bookings/${bookingId}/verify-razorpay-payment/`,
    ], { body }),
  recordPayment: (bookingId, body) =>
    requestWithFallback("POST", [
      `/bookings/${bookingId}/payment/`,
      `/bookings/${bookingId}/payments/`,
    ], { body }),
};

const reviewsAPI = {
  list: groundId => api(`/reviews/?ground=${encodeURIComponent(groundId)}`),
  create: body => api("/reviews/create/", { method: "POST", body }),
  update: (reviewId, body) => api(`/reviews/${reviewId}/`, { method: "PATCH", body }),
  delete: reviewId => api(`/reviews/${reviewId}/delete/`, { method: "DELETE" }),
  reply: (reviewId, reply) => api(`/reviews/${reviewId}/reply/`, { method: "POST", body: { reply } }),
};

async function loadGrounds() {
  els.groundsStatus.textContent = "Loading grounds...";
  try {
    const data = await groundsAPI.list({
      search: state.search,
      city: state.city,
      ordering: state.ordering,
    });
    state.grounds = asList(data);
    renderGrounds();
    if (!state.selectedGroundId && state.grounds.length) {
      await selectGround(state.grounds[0].id);
    } else if (state.selectedGroundId) {
      const stillExists = state.grounds.some(item => item.id === state.selectedGroundId);
      if (!stillExists) {
        await selectGround(state.grounds[0]?.id || null);
      }
    }
  } catch (error) {
    els.groundsStatus.textContent = error.message;
    els.groundsGrid.innerHTML = "";
  }
  updateStats();
}

function renderGrounds() {
  els.groundsGrid.innerHTML = "";

  if (!state.grounds.length) {
    els.groundsStatus.textContent = "No grounds matched your filters.";
    return;
  }

  els.groundsStatus.textContent = `${state.grounds.length} grounds loaded.`;

  state.grounds.forEach(ground => {
    const card = document.createElement("article");
    card.className = "ground-card";
    card.innerHTML = `
      <button type="button" data-ground-id="${ground.id}">
        <div class="ground-card-media" style="background-image:url('${escapeHtmlAttr(imageForGround(ground))}')"></div>
        <div class="ground-card-body">
          <p class="section-kicker">${escapeHtml(ground.ground_type_display || ground.ground_type || "Ground")}</p>
          <h3>${escapeHtml(ground.name)}</h3>
          <p>${escapeHtml([ground.address, ground.city, ground.state].filter(Boolean).join(", "))}</p>
          <div class="tag-row">
            <span class="tag">⭐ ${escapeHtml(String(ground.avg_rating || "New"))}</span>
            <span class="tag">${escapeHtml(ground.surface_type_display || ground.surface_type || "Surface")}</span>
            <span class="tag">${escapeHtml(`${ground.max_players || "Flexible"} players`)}</span>
          </div>
          <span class="price-badge">${renderMinPrice(ground)}</span>
        </div>
      </button>
    `;
    card.querySelector("button").addEventListener("click", () => selectGround(ground.id));
    els.groundsGrid.appendChild(card);
  });
}

async function selectGround(groundId) {
  state.selectedGroundId = groundId;
  state.selectedSlotId = null;

  if (!groundId) {
    els.detailEmpty.classList.remove("hidden");
    els.detailView.classList.add("hidden");
    return;
  }

  els.detailEmpty.classList.add("hidden");
  els.detailView.classList.remove("hidden");
  els.detailHero.innerHTML = '<div class="detail-hero-content"><p class="section-kicker">GROUND DETAIL</p><h2>Loading...</h2></div>';

  try {
    const [ground, reviews] = await Promise.all([
      groundsAPI.detail(groundId),
      reviewsAPI.list(groundId),
    ]);

    state.selectedGround = ground;
    state.reviews = asList(reviews);
    renderDetail();
    await loadSlots(ground.id, state.bookingDate);
  } catch (error) {
    notify(error.message, true);
  }
}

function renderDetail() {
  const ground = state.selectedGround;
  if (!ground) return;

  const heroImage = imageForGround(ground);
  const verification = ground.verification_status_display || (ground.is_verified ? "Verified" : "Pending");

  els.detailHero.style.backgroundImage = `url('${heroImage}')`;
  els.detailHero.innerHTML = `
    <div class="detail-hero-content">
      <p class="section-kicker">${escapeHtml(ground.city || "BookMyGrounds")}</p>
      <h2>${escapeHtml(ground.name)}</h2>
      <p>${escapeHtml([ground.address, ground.city, ground.state].filter(Boolean).join(", "))}</p>
    </div>
  `;

  els.detailMeta.innerHTML = `
    <span class="meta-pill">⭐ ${escapeHtml(String(ground.avg_rating || "New"))}</span>
    <span class="meta-pill">${escapeHtml(ground.ground_type_display || ground.ground_type || "Ground")}</span>
    <span class="meta-pill">${escapeHtml(ground.surface_type_display || ground.surface_type || "Surface")}</span>
    <span class="meta-pill">${escapeHtml(verification)}</span>
    <span class="meta-pill">${escapeHtml(`${ground.total_reviews || 0} reviews`)}</span>
    <span class="meta-pill">${escapeHtml(`${ground.total_bookings || 0} bookings`)}</span>
    <span class="meta-pill">${escapeHtml(`${formatTime(ground.opening_time)} - ${formatTime(ground.closing_time)}`)}</span>
  `;

  els.detailDescription.textContent = ground.description || "No description available for this ground yet.";
  els.detailRules.textContent = ground.rules || "No specific rules listed.";
  els.detailCancellation.textContent = ground.cancellation_policy || "Contact the ground owner for cancellation policy details.";

  els.amenitiesList.innerHTML = "";
  (ground.amenities || []).forEach(item => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = item.name;
    els.amenitiesList.appendChild(chip);
  });
  if (!ground.amenities?.length) {
    els.amenitiesList.innerHTML = '<span class="chip">Amenities not listed yet</span>';
  }

  els.pricingList.innerHTML = "";
  (ground.pricing_plans || []).filter(plan => plan.is_active).forEach(plan => {
    const item = document.createElement("div");
    item.className = "pricing-item";
    item.innerHTML = `
      <strong>${escapeHtml(plan.duration_display || plan.duration_type)}</strong>
      <p>Weekday: ₹${escapeHtml(String(plan.price))}</p>
      <p>${plan.weekend_price ? `Weekend: ₹${escapeHtml(String(plan.weekend_price))}` : "Weekend pricing follows standard rate."}</p>
    `;
    els.pricingList.appendChild(item);
  });
  if (!ground.pricing_plans?.length) {
    els.pricingList.innerHTML = '<div class="pricing-item"><strong>Pricing unavailable</strong><p>This ground has no active pricing plans yet.</p></div>';
  }

  els.reviewsList.innerHTML = "";
  state.reviews.forEach(review => {
    const card = document.createElement("article");
    card.className = "review-card";
    card.innerHTML = `
      <strong>${escapeHtml(review.customer_info?.full_name || "Player")} · ${escapeHtml(String(review.rating))}/5</strong>
      <p>${escapeHtml(review.comment || "No written review.")}</p>
      ${review.owner_reply ? `<p><strong>Owner reply:</strong> ${escapeHtml(review.owner_reply)}</p>` : ""}
    `;
    els.reviewsList.appendChild(card);
  });
  if (!state.reviews.length) {
    els.reviewsList.innerHTML = '<article class="review-card"><strong>No reviews yet</strong><p>Be the first player to leave a review after a completed booking.</p></article>';
  }

  updateFavoriteButton();
  renderBookingComposer();
}

async function loadSlots(groundId, date) {
  if (!groundId) return;
  els.slotList.innerHTML = '<div class="status-text">Loading slots...</div>';

  try {
    const payload = await bookingsAPI.listSlots(groundId, date);
    state.slots = asList(payload);
    renderBookingComposer();
  } catch (error) {
    els.slotList.innerHTML = `<div class="status-text">${escapeHtml(error.message)}</div>`;
  }
}

function renderBookingComposer() {
  const ground = state.selectedGround;
  const user = state.user;

  els.slotList.innerHTML = "";
  els.bookingSummary.classList.add("hidden");
  els.bookingForm.classList.add("hidden");

  if (!ground) {
    els.slotList.innerHTML = '<div class="status-text">Select a ground to load slots.</div>';
    return;
  }

  if (!state.slots.length) {
    els.slotList.innerHTML = '<div class="status-text">No slots available for the selected date.</div>';
  } else {
    state.slots.forEach(slot => {
      const button = document.createElement("button");
      const selected = state.selectedSlotId === slot.id;
      button.type = "button";
      button.className = `slot-chip ${slot.is_bookable ? "available" : "disabled"} ${selected ? "selected" : ""}`;
      button.disabled = !slot.is_bookable;
      button.textContent = `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`;
      button.addEventListener("click", () => {
        state.selectedSlotId = slot.id;
        renderBookingComposer();
      });
      els.slotList.appendChild(button);
    });
  }

  const slot = state.slots.find(item => item.id === state.selectedSlotId);
  if (!slot) return;

  const matchedPlan = resolveMatchingPricingPlan(ground, slot);
  if (!matchedPlan) {
    els.bookingSummary.classList.remove("hidden");
    els.bookingSummary.innerHTML = `
      <strong>Pricing missing</strong>
      <p>This ground has no active pricing plan for the selected slot duration.</p>
    `;
    return;
  }

  els.bookingSummary.classList.remove("hidden");
  els.bookingSummary.innerHTML = `
    <strong>${escapeHtml(formatTime(slot.start_time))} - ${escapeHtml(formatTime(slot.end_time))}</strong>
    <p>${escapeHtml(matchedPlan.duration_display || matchedPlan.duration_type)} · ₹${escapeHtml(String(matchedPlan.price))}</p>
    <p>${user ? "Complete the form below to create the booking." : "Login to create this booking."}</p>
  `;

  els.customerNameInput.value = user?.full_name || "";
  els.customerPhoneInput.value = user?.phone || "";

  if (user) {
    els.bookingForm.classList.remove("hidden");
  }
}

async function hydratePrivateData() {
  try {
    const [profile, favorites, bookings] = await Promise.all([
      authAPI.getProfile(),
      groundsAPI.listFavorites(),
      bookingsAPI.list(),
    ]);
    state.user = profile;
    state.favorites = asList(favorites);
    state.bookings = asList(bookings);
    persistAuth();
    syncAuthUi();
    renderBookings();
    updateFavoriteButton();
  } catch (error) {
    notify(error.message, true);
  }
  updateStats();
}

function syncAuthUi() {
  const user = state.user;
  const loggedIn = Boolean(state.token && user);

  els.accountTitle.textContent = loggedIn ? user.full_name || "Customer" : "Guest Mode";
  els.authGuest.classList.toggle("hidden", loggedIn);
  els.authUser.classList.toggle("hidden", !loggedIn);
  els.authToggleBtn.textContent = loggedIn ? "Account" : "Login";

  if (loggedIn) {
    els.profileCard.innerHTML = `
      <strong>${escapeHtml(user.full_name || "Customer")}</strong>
      <p>${escapeHtml(user.email || "")}</p>
      <p>${escapeHtml(user.city || "City not set")}</p>
      <p>Role: ${escapeHtml(user.role || "customer")}</p>
    `;
  } else {
    els.profileCard.innerHTML = "";
    state.favorites = [];
    state.bookings = [];
    renderBookings();
  }

  updateStats();
}

function renderBookings() {
  els.bookingsList.innerHTML = "";

  if (!state.token) {
    els.bookingsList.innerHTML = '<p class="status-text">Login to load your bookings.</p>';
    return;
  }

  if (!state.bookings.length) {
    els.bookingsList.innerHTML = '<p class="status-text">No bookings yet. Reserve your first slot from the detail panel.</p>';
    return;
  }

  state.bookings.forEach(booking => {
    const card = document.createElement("article");
    card.className = "booking-card";
    card.innerHTML = `
      <strong>${escapeHtml(booking.ground_name || "Booking")} · #${escapeHtml(booking.booking_number || "")}</strong>
      <p>${escapeHtml(booking.booking_date || "")} · ${escapeHtml(formatTime(booking.start_time))} - ${escapeHtml(formatTime(booking.end_time))}</p>
      <p>Status: ${escapeHtml(booking.status_display || booking.status || "pending")} · Payment: ${escapeHtml(booking.payment_status_display || booking.payment_status || "pending")}</p>
      <p>Total: ₹${escapeHtml(String(booking.total_amount || 0))}</p>
    `;
    els.bookingsList.appendChild(card);
  });
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPassword").value;

  try {
    const data = await authAPI.login(email, password);
    state.token = data.token || "";
    state.user = data.user || null;
    persistAuth();
    syncAuthUi();
    await hydratePrivateData();
    notify("Logged in successfully.");
    event.target.reset();
  } catch (error) {
    notify(error.message, true);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const body = {
    full_name: document.querySelector("#registerName").value.trim(),
    email: document.querySelector("#registerEmail").value.trim(),
    phone: document.querySelector("#registerPhone").value.trim(),
    city: document.querySelector("#registerCity").value.trim(),
    role: "customer",
    state: "",
    password: document.querySelector("#registerPassword").value,
    password_confirm: document.querySelector("#registerPasswordConfirm").value,
  };

  try {
    await authAPI.register(body);
    notify("Account created. Login with the new credentials.");
    event.target.reset();
  } catch (error) {
    notify(error.message, true);
  }
}

async function handleLogout() {
  try {
    await authAPI.logout();
  } catch (error) {
    // Local logout should still proceed if backend token invalidation fails.
  }

  state.token = "";
  state.user = null;
  state.favorites = [];
  state.bookings = [];
  persistAuth();
  syncAuthUi();
  updateFavoriteButton();
  notify("Logged out.");
}

async function handleFavoriteToggle() {
  if (!state.selectedGround) return;
  if (!state.token) {
    notify("Login first to save favorites.", true);
    return;
  }

  try {
    const existing = state.favorites.find(item => item.ground?.id === state.selectedGround.id);
    if (existing) {
      await groundsAPI.removeFavorite(existing.id);
      state.favorites = state.favorites.filter(item => item.id !== existing.id);
      state.selectedGround.is_favorited = false;
      updateFavoriteButton();
      updateStats();
      notify("Favorite removed.");
      return;
    }

    const favorite = await groundsAPI.addFavorite(state.selectedGround.id);
    state.favorites.unshift(favorite);
    state.selectedGround.is_favorited = true;
    updateFavoriteButton();
    updateStats();
    notify("Saved to favorites.");
  } catch (error) {
    notify(error.message, true);
  }
}

function updateFavoriteButton() {
  if (!state.selectedGround) return;
  const favorited =
    state.selectedGround.is_favorited ||
    state.favorites.some(item => item.ground?.id === state.selectedGround.id);

  els.favoriteBtn.textContent = favorited ? "Saved Favorite" : "Save Favorite";
}

async function handleBooking(event) {
  event.preventDefault();

  if (!state.token) {
    notify("Login first to create a booking.", true);
    return;
  }

  const ground = state.selectedGround;
  const slot = state.slots.find(item => item.id === state.selectedSlotId);
  const plan = slot ? resolveMatchingPricingPlan(ground, slot) : null;
  if (!ground || !slot || !plan) {
    notify("Select a valid slot first.", true);
    return;
  }

  const body = {
    ground: ground.id,
    time_slot: slot.id,
    pricing_plan: plan.id,
    booking_date: state.bookingDate,
    start_time: slot.start_time,
    end_time: slot.end_time,
    customer_name: els.customerNameInput.value.trim(),
    customer_phone: els.customerPhoneInput.value.trim(),
    player_count: Number(els.playerCountInput.value || 1),
    notes: "",
    special_requests: els.specialRequestsInput.value.trim(),
  };

  try {
    setBookingButtonBusy(true);
    const booking = await bookingsAPI.create(body);
    notify(`Booking created for ${booking.booking_date} · ${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`);
    els.specialRequestsInput.value = "";
    state.selectedSlotId = null;
    await hydratePrivateData();
    await loadSlots(ground.id, state.bookingDate);
    renderBookingComposer();
  } catch (error) {
    notify(error.message, true);
  } finally {
    setBookingButtonBusy(false);
  }
}

function setBookingButtonBusy(isBusy) {
  els.bookingSubmitBtn.disabled = isBusy;
  els.bookingSubmitBtn.textContent = isBusy ? "Creating..." : "Create Booking";
}

function openSelectedGroundInMaps() {
  const ground = state.selectedGround;
  if (!ground) return;

  if (ground.latitude && ground.longitude) {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ground.latitude},${ground.longitude}`)}`,
      "_blank"
    );
    return;
  }

  const label = [ground.name, ground.address, ground.city, ground.state].filter(Boolean).join(", ");
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`, "_blank");
}

function updateStats() {
  els.groundsCount.textContent = String(state.grounds.length);
  els.favoritesCount.textContent = String(state.favorites.length);
  els.bookingsCount.textContent = String(state.bookings.length);
}

function notify(message, isError = false) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  els.toast.style.background = isError ? "rgba(185,61,37,0.94)" : "rgba(24,33,45,0.94)";
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => els.toast.classList.add("hidden"), 3200);
}

function persistAuth() {
  if (state.token) {
    localStorage.setItem("bmg_token", state.token);
  } else {
    localStorage.removeItem("bmg_token");
  }

  if (state.user) {
    localStorage.setItem("bmg_user", JSON.stringify(state.user));
  } else {
    localStorage.removeItem("bmg_user");
  }
}

function resolveMatchingPricingPlan(ground, slot) {
  const pricingPlans = (ground?.pricing_plans || []).filter(plan => plan.is_active);
  if (!slot) return null;

  const durationHours = timeDiffHours(slot.start_time, slot.end_time);
  return (
    pricingPlans.find(plan => Number(plan.duration_hours) === durationHours) ||
    pricingPlans.find(plan => plan.duration_type === "per_hour") ||
    null
  );
}

function asList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function imageForGround(ground) {
  return ground.primary_image || ground.images?.[0]?.image || FALLBACK_IMAGE;
}

function renderMinPrice(ground) {
  if (ground.min_price?.amount) {
    return `From ₹${ground.min_price.amount} · ${ground.min_price.duration || "Plan"}`;
  }
  return "Pricing on request";
}

function formatTime(value) {
  return value ? String(value).slice(0, 5) : "--:--";
}

function timeDiffHours(start, end) {
  const [sh, sm] = String(start).split(":").map(Number);
  const [eh, em] = String(end).split(":").map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
}

function flattenErrors(payload) {
  if (!payload || typeof payload !== "object") return "";
  const entries = Object.values(payload).flatMap(value => (Array.isArray(value) ? value : [value]));
  return entries.filter(Boolean).join(" ");
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value).replaceAll("(", "%28").replaceAll(")", "%29");
}
