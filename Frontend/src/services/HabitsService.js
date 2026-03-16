import { auth } from "@/firebase/firebase.js";

const API_BASE = "http://localhost:3000/api";

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function getHabits() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/habits`, { headers });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.habits;
}

export async function upsertHabit(habit) {
  if (!habit?.name?.trim()) throw new Error("Habit name is required");
  const headers = await authHeaders();
  const body = JSON.stringify({
    name: habit.name.trim(),
    description: habit.description ?? "",
    frequency: habit.frequency ?? "daily"
  });

  if (habit.id) {
    // Update existing
    const res = await fetch(`${API_BASE}/habits/${habit.id}`, {
      method: "PUT",
      headers,
      body
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return habit.id;
  } else {
    // Create new
    const res = await fetch(`${API_BASE}/habits`, {
      method: "POST",
      headers,
      body
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.habitId;
  }
}

export async function deleteHabit(habitId) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/habits/${habitId}`, {
    method: "DELETE",
    headers
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

export async function toggleHabitComplete(habitId, date, completed) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/habits/${habitId}/complete`, {
    method: "POST",
    headers,
    body: JSON.stringify({ date, completed })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}
