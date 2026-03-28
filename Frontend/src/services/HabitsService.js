import { db } from "@/firebase/firebase.js";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

function habitIdFromName(name){
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export async function upsertHabit(uid, habit) {
  if (!uid) throw new Error("User id (uid) is required");
  if (!habit?.name?.trim()) throw new Error("Habit name is required");

  const allowedFrequencies = new Set(["daily", "weekly", "weekends", "weekdays"]);
  const frequency = allowedFrequencies.has(habit.frequency) ? habit.frequency : "daily";

  const habitId = habitIdFromName(habit.name);
  const habitRef = doc(db, "users", uid, "habits", habitId);

  const snap = await getDoc(habitRef);
  const existingData = snap.exists() ? snap.data() : {};

  const daysOfWeek =
    frequency === "weekly"
      ? (habit.daysOfWeek ?? existingData.daysOfWeek ?? [])
      : [];

  const payload = {
    name: habit.name.trim(),
    description: habit.description ?? "",
    frequency,
    daysOfWeek,
    completedDays: existingData.completedDays ?? [],
    updatedAt: serverTimestamp(),
    ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
  };

  await setDoc(habitRef, payload, { merge: true });
  return habitId;
}

export async function toggleHabitCompletion(uid, habitId){
  if (!uid) throw new Error("User id (uid) is required");
  if(!habitId) throw new Error("Habit id is required");

  const habitRef = doc(db, "users", uid, "habits", habitId);
  const snap = await getDoc(habitRef);

  if (!snap.exists()){
    throw new Error("Habit does not exist");
  }

  const data = snap.data();
  const completedDays = data.completedDays ?? [];

  const today = new Date();
  const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2,"0")}`;

  const isCompletedToday = completedDays.includes(dateString);

  await updateDoc(habitRef, {
    completedDays: isCompletedToday
      ? arrayRemove(dateString)
      : arrayUnion(dateString),
    updatedAt: serverTimestamp()
  });

  return !isCompletedToday;
}

export async function isHabitComplete(uid, habitId){
    let isCompleted = false;
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth()+1;
    const day = d.getDate();
    const date = y+"-"+String(m).padStart(2,'0')+"-"+String(day).padStart(2,'0');

    if (!uid) throw new Error("No uid available yet");
    const docRef = doc(db, "users", uid, "habits", habitId);

    const snap = await getDoc(docRef);

    if (!snap.exists()){
        throw new Error("snap doesn't exist");
    }

    const completedDays = snap.data().completedDays ?? [];

    const daily = snap.data().frequency === "daily";
    const weekly = snap.data().frequency === "weekly"; 
    const weekdays = snap.data().frequency === "weekdays";
    const weekends = snap.data().frequency === "weekends";

    if (daily){
        return completedDays.includes(date);
    }
    
    else if(weekly){
        const dayWeek = d.getDay();
        const mondayIndex = dayWeek === 0 ? 6 : dayWeek - 1;

        const mondayDate = new Date(d);
        mondayDate.setDate(mondayDate.getDate() - mondayIndex);

        const sundayDate = new Date(d);
        sundayDate.setDate(sundayDate.getDate() + (6 - mondayIndex));

        const monDate = mondayDate.getFullYear() + "-" + String(mondayDate.getMonth() + 1).padStart(2, "0") + "-" + String(mondayDate.getDate()).padStart(2, "0");

        const sunDate = sundayDate.getFullYear() + "-" + String(sundayDate.getMonth() + 1).padStart(2, "0") + "-" + String(sundayDate.getDate()).padStart(2, "0");

        return completedDays.some(d => d >= monDate && d <= sunDate);
    }

    else if(weekdays) {
      const dayWeek = d.getDay();
      if (dayWeek === 0 || dayWeek === 6) return false;
      return completedDays.includes(date);
    }

    else if(weekends) {
      const dayWeek = d.getDay();
      if(dayWeek !== 0 && dayWeek !== 6) return false;
      return completedDays.includes(date);
    }

  return false;
}

export async function getHabitByName(name, uid){
    const ref = doc(db, "users", uid, "habits", habitIdFromName(name));
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getHabits(uid) {
  if (!uid) throw new Error("User id (uid) is required");
    const snap = await getDocs(collection(db, "users", uid, "habits"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteHabit(uid, habitId){
  if(!uid) throw new Error("User id (uid) is required ");
  if(!habitId) throw new Error("Habit id is required");

  const habitRef = doc(db, "users", uid, "habits", habitId);
  await deleteDoc(habitRef);
}