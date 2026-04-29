/* ============================================
   api.js — Frontend API client
   ============================================ */
const API = (() => {
  const baseUrl = (window.BB_API_BASE || "http://localhost:4000/api").replace(/\/$/, "");

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) {
      let message = "Request failed";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (_) {}
      throw new Error(message);
    }
    return response.json();
  }

  return {
    async register({ username, email, password, avatar }) {
      return request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password, avatar }),
      });
    },
    async login({ usernameOrEmail, password }) {
      return request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ usernameOrEmail, password }),
      });
    },
    async upsertProfile(profile) {
      return request("/profiles/upsert", {
        method: "POST",
        body: JSON.stringify(profile),
      });
    },
    async getLeaderboard(limit = 10) {
      return request(`/leaderboard?limit=${encodeURIComponent(limit)}`, { method: "GET" });
    },
  };
})();
