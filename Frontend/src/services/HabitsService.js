import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, deleteField, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

//making sure the name is well laid out because it is our id
function habitIdFromName(name){
    return name.trim().toLowerCase().replace(/\s+/g, "-");
}

//either inserting a new habit or updating an existing one
export async function upsertHabit(uid, habit){
    //checking that there is a name for the habit
    //throwing an error if not
    if (!uid) throw new Error("User id (uid) is required");
    if (!habit?.name?.trim()) throw new Error("Habit name is required");

    const allowedFrequencies = new Set(["daily", "weekly"]);
    const frequency = allowedFrequencies.has(habit.frequency) ? habit.frequency: "daily";
    //making the name of the habit the id
    //this is because the name will be unique
    //easier than using a number because habits will be able to be deleted later
    const habitId = habitIdFromName(habit.name);
    const habitRef = doc(db, "users", uid, "habit", habitId);

    const existing = await getDoc(habitRef);
    const existingData = existing.exists() ? existing.data() : null;

    const daysOfWeek = 
        frequency === "weeekly"
            ?(habit.daysOfWeek ?? existingData.daysOfWeek ?? [])
            : [];

    const payload = {
        name: habit.name.trim(),
        description: habit.description ?? "",
        frequency,
        daysOfWeek,
        completedDays: existingData?.completedDays ?? [],
        updatedAt: serverTimestamp(),
        ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
    };

    await setDoc(habitRef, payload, {merge: true});
    return habitId;
}

//trying to grab the data of a habit by entering the name

export async function getHabitsByName(uid, name){

    const ref = doc(db, "users", devId, "habit", habitIdFromName(name));
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function getHabits(uid) {
    const snap = await getDocs(collection(db, "users", uid, "habit"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function deleteHabitById(uid, habitId){
    if (!habitId) throw new Error("Habit id is required");
    await deleteDoc(doc(db, "users", uid, "habit", habitId));
    return habitId;
}