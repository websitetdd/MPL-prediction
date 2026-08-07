/* ==========================================================================
 * auth.js — user accounts, sessions, admin auth (LocalStorage demo build)
 *
 * IMPORTANT: this is a front-end-only demo. Passwords are lightly hashed
 * (djb2) and everything lives in the user's browser. For real shared
 * accounts use a backend (Firebase / Supabase / PocketBase).
 * ========================================================================== */

const Auth = (() => {
  /** Validate a username: 3-20 chars, letters/numbers/underscore/hyphen */
  function validUsername(name) {
    return /^[A-Za-z0-9_-]{3,20}$/.test(name);
  }

  function register(username, password) {
    const name = String(username || "").trim();
    if (!validUsername(name)) return { ok: false, error: "Username must be 3-20 characters (letters, numbers, _ or -)." };
    if (!password || password.length < 4) return { ok: false, error: "Password must be at least 4 characters." };
    if (Store.getUser(name)) return { ok: false, error: "That username is already taken." };

    const users = Store.users();
    users[name] = {
      passwordHash: hash(password),
      createdAt: new Date().toISOString(),
    };
    Store.saveUsers(users);
    Store.setSession(name);
    return { ok: true };
  }

  function login(username, password) {
    const name = String(username || "").trim();
    const user = Store.getUser(name);
    if (!user || user.passwordHash !== hash(password)) {
      return { ok: false, error: "Invalid username or password." };
    }
    Store.setSession(name);
    return { ok: true };
  }

  function logout() {
    Store.setSession(null);
    Store.lsRemove("adminSession");
  }

  function current() {
    return Store.currentUser();
  }

  /** Admin session management */
  function adminLogin(username, password) {
    const admin = Store.getAdmin();
    if (username === admin.username && hash(password) === admin.passwordHash) {
      Store.lsSet("adminSession", { at: Date.now() });
      return { ok: true };
    }
    return { ok: false, error: "Invalid admin credentials." };
  }

  function isAdmin() {
    return !!Store.lsGet("adminSession");
  }

  function adminLogout() {
    Store.lsRemove("adminSession");
  }

  return { register, login, logout, current, adminLogin, isAdmin, adminLogout, validUsername };
})();
