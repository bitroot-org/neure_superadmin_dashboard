// Keys that must survive logout / session expiry (localStorage.clear()).
export const WHATS_NEW_DISMISSED_KEY = "neure:whatsNew:dismissedVersion";
// sessionStorage flag set on successful sign-in so the "What's new" popup shows once for that sign-in.
export const WHATS_NEW_PENDING_KEY = "neure:whatsNew:pending";

const PERSISTENT_KEYS = [WHATS_NEW_DISMISSED_KEY, "theme"];

// Clears auth/session data but keeps user preferences.
export const clearSessionStorage = () => {
  const kept = PERSISTENT_KEYS.map((key) => [key, localStorage.getItem(key)]);
  localStorage.clear();
  kept.forEach(([key, value]) => {
    if (value !== null) localStorage.setItem(key, value);
  });
};
