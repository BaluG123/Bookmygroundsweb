const API_BASE_URL = "https://bookmyground.pythonanywhere.com/api/v1";

export function getToken() {
  return localStorage.getItem("bmg_token") || "";
}

export function setToken(token) {
  if (token) localStorage.setItem("bmg_token", token);
  else localStorage.removeItem("bmg_token");
}

export function getUser() {
  try {
    const raw = localStorage.getItem("bmg_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (user) localStorage.setItem("bmg_user", JSON.stringify(user));
  else localStorage.removeItem("bmg_user");
}

export async function api(path, options = {}) {
  const token = getToken();
  const config = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload?.error ||
      payload?.detail ||
      flattenErrors(payload) ||
      `${response.status} ${response.statusText}`;
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

export function asList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export function flattenErrors(payload) {
  if (!payload || typeof payload !== "object") return "";
  const entries = Object.values(payload).flatMap((v) =>
    Array.isArray(v) ? v : [v]
  );
  return entries.filter(Boolean).join(" ");
}

export function today() {
  return new Date().toISOString().split("T")[0];
}

export function formatTime(value) {
  return value ? String(value).slice(0, 5) : "--:--";
}

export function timeDiffHours(start, end) {
  const [sh, sm] = String(start).split(":").map(Number);
  const [eh, em] = String(end).split(":").map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=80";

export function imageForGround(ground) {
  return ground.primary_image || ground.images?.[0]?.image || FALLBACK_IMAGE;
}

export function renderMinPrice(ground) {
  if (ground.min_price?.amount) {
    return `From ₹${ground.min_price.amount} · ${ground.min_price.duration || "Plan"}`;
  }
  return "Pricing on request";
}

export function resolveMatchingPricingPlan(ground, slot) {
  const pricingPlans = (ground?.pricing_plans || []).filter((p) => p.is_active);
  if (!slot) return null;
  const durationHours = timeDiffHours(slot.start_time, slot.end_time);
  return (
    pricingPlans.find((p) => Number(p.duration_hours) === durationHours) ||
    pricingPlans.find((p) => p.duration_type === "per_hour") ||
    null
  );
}

export const authAPI = {
  register: (body) => api("/auth/register/", { method: "POST", body }),
  login: (email, password) =>
    api("/auth/login/", { method: "POST", body: { email, password } }),
  firebaseLogin: (firebaseToken, role = "customer") =>
    api("/auth/firebase-login/", {
      method: "POST",
      body: { firebase_token: firebaseToken, role },
    }),
  logout: () =>
    requestWithFallback("POST", ["/auth/logout/", "/auth/logout"], { body: {} }),
  getProfile: () => api("/auth/profile/"),
  updateProfile: (body) => api("/auth/profile/", { method: "PATCH", body }),
  changePassword: (body) =>
    api("/auth/change-password/", { method: "POST", body }),
  registerPushToken: (body) =>
    api("/auth/push/register/", { method: "POST", body }),
  unregisterPushToken: (token) =>
    api("/auth/push/unregister/", { method: "POST", body: { token } }),
  listNotifications: (params) => {
    const search = new URLSearchParams(params || {}).toString();
    const suffix = search ? `?${search}` : "";
    return requestWithFallback("GET", [
      `/auth/notifications/${suffix}`,
      `/notifications/${suffix}`,
    ]);
  },
  markNotificationRead: (id) =>
    requestWithFallback("PATCH", [
      `/auth/notifications/${id}/read/`,
      `/notifications/${id}/read/`,
    ]),
  getPayoutProfile: () =>
    requestWithFallback("GET", [
      "/auth/payout-profile/",
      "/payout-profile/",
      "/auth/payout-profile",
      "/payout-profile",
    ]),
  updatePayoutProfile: (body) =>
    requestWithFallback("PATCH", [
      "/auth/payout-profile/",
      "/payout-profile/",
      "/auth/payout-profile",
      "/payout-profile",
    ], { body }),
};

export const groundsAPI = {
  list: (params) => {
    const search = new URLSearchParams(
      Object.entries(params || {}).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    ).toString();
    return api(`/grounds/${search ? `?${search}` : ""}`);
  },
  detail: (id) => api(`/grounds/${id}/`),
  amenities: () => api("/grounds/amenities/"),
  availability: (id, date) =>
    api(`/grounds/${id}/availability/?date=${encodeURIComponent(date)}`),
  listImages: (groundId) => api(`/grounds/${groundId}/images/`),
  uploadImages: (groundId, formData) => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/grounds/${groundId}/images/`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      body: formData,
    }).then(async (response) => {
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : null;
      if (!response.ok) {
        const message =
          payload?.error ||
          payload?.detail ||
          flattenErrors(payload) ||
          `${response.status} ${response.statusText}`;
        throw new Error(message);
      }
      return payload;
    });
  },
  deleteImage: (groundId, imageId) =>
    api(`/grounds/${groundId}/images/${imageId}/`, { method: "DELETE" }),
  create: (body) => api("/grounds/", { method: "POST", body }),
  update: (id, body) => api(`/grounds/${id}/`, { method: "PATCH", body }),
  delete: (id) => api(`/grounds/${id}/`, { method: "DELETE" }),
  myGrounds: () => api("/grounds/my-grounds/"),
  listPricing: (groundId) => api(`/grounds/${groundId}/pricing/`),
  addPricing: (groundId, body) =>
    requestWithFallback("POST", [
      `/grounds/${groundId}/pricing/`,
      "/grounds/pricing/",
    ], { body }),
  updatePricing: (groundId, planId, body) =>
    api(`/grounds/${groundId}/pricing/${planId}/`, { method: "PATCH", body }),
  deletePricing: (groundId, planId) =>
    api(`/grounds/${groundId}/pricing/${planId}/`, { method: "DELETE" }),
  listFavorites: () => api("/grounds/favorites/"),
  addFavorite: (groundId) =>
    api("/grounds/favorites/", { method: "POST", body: { ground_id: groundId } }),
  removeFavorite: (favId) =>
    api(`/grounds/favorites/${favId}/`, { method: "DELETE" }),
};

export const bookingsAPI = {
  listSlots: (groundId, date, bookableOnly) => {
    const params = new URLSearchParams({
      ground: groundId,
      date,
      ...(bookableOnly !== undefined ? { bookable_only: String(bookableOnly) } : {}),
    }).toString();
    return api(`/bookings/slots/?${params}`);
  },
  createSlots: (body) => api("/bookings/slots/create/", { method: "POST", body }),
  updateSlot: (id, body) => api(`/bookings/slots/${id}/`, { method: "PATCH", body }),
  deleteSlot: (id) => api(`/bookings/slots/${id}/delete/`, { method: "DELETE" }),
  list: (params) => {
    const search = new URLSearchParams(
      Object.entries(params || {}).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    ).toString();
    return api(`/bookings/${search ? `?${search}` : ""}`);
  },
  create: (body) => api("/bookings/", { method: "POST", body }),
  detail: (id) => api(`/bookings/${id}/`),
  cancel: (id, reason = "") =>
    requestWithMethodFallback(["PATCH", "POST"], `/bookings/${id}/cancel/`, {
      body: { reason },
    }),
  confirm: (id) =>
    requestWithMethodFallback(["PATCH", "POST"], `/bookings/${id}/confirm/`),
  complete: (id) =>
    requestWithMethodFallback(["PATCH", "POST"], `/bookings/${id}/complete/`),
  adminBookings: (params) => {
    const search = new URLSearchParams(
      Object.entries(params || {}).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    ).toString();
    return api(`/bookings/admin-bookings/${search ? `?${search}` : ""}`);
  },
  createPaymentOrder: (bookingId, body) =>
    requestWithFallback("POST", [
      `/bookings/${bookingId}/payment-order/`,
      `/bookings/${bookingId}/create-razorpay-order/`,
    ], { body }),
  createUpiIntent: (bookingId, body) =>
    api(`/bookings/${bookingId}/upi-intent/`, { method: "POST", body }),
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
  listPayments: (bookingId) =>
    requestWithFallback("GET", [
      `/bookings/${bookingId}/payments/`,
      `/bookings/${bookingId}/payment/`,
    ]),
};

export const reviewsAPI = {
  list: (groundId) => api(`/reviews/?ground=${encodeURIComponent(groundId)}`),
  create: (body) => api("/reviews/create/", { method: "POST", body }),
  update: (id, body) => api(`/reviews/${id}/`, { method: "PATCH", body }),
  delete: (id) => api(`/reviews/${id}/delete/`, { method: "DELETE" }),
  reply: (id, reply) =>
    api(`/reviews/${id}/reply/`, { method: "POST", body: { reply } }),
};
