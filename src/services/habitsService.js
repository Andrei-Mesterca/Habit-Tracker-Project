import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

await setDoc(doc(db, "test", "ping"), { ok: true });
console.log("ping write ok");

//making sure the name is well laid out because it is our id
function habitIdFromName(name){
    return name.trim().toLowerCase().replace(/\s+/g, "-");
}

const HABITS_COL = "habitablehabits";

//either inserting a new habit or updating an existing one
export async function upsertHabit(habit){
    //checking that there is a name for the habit
    //throwing an error if not
    if (!habit?.name?.trim()) throw new Error("Habit name is required");

    //making the name of the habit the id
    //this is because the name will be unique
    //easier than using a number because habits will be able to be deleted later
    const habitId = habitIdFromName(habit.name);
    const ref = doc(db, "habitablehabits", habitId);

    try {
        //trying to either make a new document in habits or merging if it already exists
        await setDoc(ref, {
        name: habit.name.trim(),
        description: habit.description ?? "",
        frequency: habit.frequency ?? "daily",
        updatedAt: new Date().toISOString()
    }, { merge: true });
        //success message
        console.log('This value has been written to the database');
    } catch (error) {
        //printing an error message
        console.log("I got an error!", error);
        throw error;
    }

    return habitId;
}

//trying to grab the data of a habit by entering the name

export async function getHabitsByName(name){
    const ref = doc(db, "habits", habitIdFromName(name));
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function getHabits() {
    const snap = await getDocs(collection(db, "habitablehabits"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(doc.id, doc.data()); 
}