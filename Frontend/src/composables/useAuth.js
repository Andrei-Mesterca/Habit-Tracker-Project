import { ref } from "vue";
import { auth } from "@/firebase/firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// Shared reactive state — lives for the lifetime of the app
const currentUser = ref(null);
const authReady = ref(false);

// Initialise listener once only
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
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  async function logout() {
    await signOut(auth);
  }

  // Returns the current user's ID token for authenticated API calls
  async function getToken() {
    if (!currentUser.value) throw new Error("Not authenticated");
    return currentUser.value.getIdToken();
  }

  return { currentUser, authReady, login, logout, getToken };
}
