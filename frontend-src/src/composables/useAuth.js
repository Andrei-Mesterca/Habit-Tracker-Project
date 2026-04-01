
import { ref } from "vue";
import { auth } from "@/firebase/firebase.js";
import {
  signInWithCustomToken,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

const currentUser = ref(null);
const authReady = ref(false);

let listenerStarted = false;
function ensureListener() {
  if (listenerStarted) return;
  listenerStarted = true;
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    authReady.value = true;
  });
}

export function useAuth() {
  ensureListener();

  async function login(email, password) {
    // In production, use relative URL since API is on same domain
    const apiBase = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_BASE_URL || '');
    const response = await fetch(`${apiBase}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    const cred = await signInWithCustomToken(auth, data.customToken);
    return cred.user;
  }

  async function logout() {
    await signOut(auth);
  }

  async function getToken() {
    if (!currentUser.value) throw new Error("Not authenticated");
    return currentUser.value.getIdToken();
  }

  return { currentUser, authReady, login, logout, getToken };
}