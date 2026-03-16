import { ref } from "vue"; //reactive state that vue tracks
import { upsertHabit, getHabits as fetchHabits, getHabitsByName } from "@/services/HabitsService.js"; //firestore write function
import { createHabit } from "@/utils/habitModel";
import { arrayUnion, arrayRemove, getDoc, updateDoc, doc } from "firebase/firestore"


function resolveUid(uidOrRef){
    if (typeof uidOrRef === "string") return uidOrRef;
    return uidOrRef?.value;
}
export function useHabits(uidOrRef){
    //this function manages the state
    const loading = ref(false); //true while firestore is running
    const error = ref(null); //stops any errors that occurs

    //function that the component calls
    //habitnis the data passed from the UI
    async function handleUpsertHabit(habit){
        loading.value = true; //disable buttons
        error.value = null; //clear old errors
        try {
            const uid = resolveUid(uidOrRef);
            if (!uid) throw new Error("No uid available yet");
            return await upsertHabit(uid, habit);
            //calls firestire and waits for firestore to finish
            //returns the new document ID
        } catch (e) {
            error.value = e instanceof Error? e : new Error(String(e)); //saves the error so the UI can display it
            throw error.value; //re-throws it in case the caller cares
        } finally {
            loading.value = false;
            //runs whether success or erroe
            //prevents "stuck loading" bugs
        }
    }

    async function handleGetHabits(){
        loading.value = true;
        error.value = null;
        try {
            const uid = resolveUid(uidOrRef);
            if (!uid) throw new Error("No uid available yet");
            const result = await fetchHabits(uid);
            console.log("Fetched Habits:", result);
            return result;
            } catch (e) {
                error.value = e instanceof Error ? e : new Error(String(e));
                throw error.value;
            } finally{
                loading.value = false;
            }
        }
    
    async function completeHabit(habitId){
        const d = new Date();
        const y = d.getFullYear();
        const m = d.getMonth()+1;
        const day = d.getDate();
        const date = y+"-"+String(m).padStart(2,'0')+"-"+String(day).padStart(2,'0');
        const uid = resolveUid(uidOrRef);
        if (!uid) throw new Error("No uid available yet");
        const docRef = doc(db, "users", uid, "habit", habitId);

        const snap = await getDoc(docRef);

        if (!snap.exists()){
            throw new Error("snap doesn't exist");
        }

        const daily = snap.data().frequency?.equals("daily");
        const weekly = snap.data().frequency?.equals("weekly"); 
        if (daily){
            //if the habit is completed daily
            const completed = snap.data().completedDays?.includes(date);

            if (completed) {
                await updateDoc(docRef, {
                    completedDays: arrayRemove(date),
                });
            }
            else{
                await updateDoc(docRef, {
                    completedDays: arrayUnion(date),
                });
            }
        }
        else if(weekly){
            const dayWeek = d.getDay();
            const mondayIndex = (dayWeek === 0 ? 6 : dayWeek -1);
            const mondayDate = new Date(d);
            mondayDate.setDate(mondayDate.getDate() - mondayIndex);
            let y = mondayDate.getFullYear();
            let m = mondayDate.getMonth()+1;
            let day = mondayDate.getDate();
            const monDate = y+"-"+String(m).padStart(2,'0')+"-"+String(day).padStart(2,'0');
            const sundayDate = new Date(d);
            sundayDate.setDate(sundayDate.getDate() + (6 - mondayIndex));
            y = sundayDate.getFullYear();
            m = sundayDate.getMonth()+1;
            day = sundayDate.getDate();
            const sunDate = y+"-"+String(m).padStart(2,'0')+"-"+String(day).padStart(2,'0');
            const completed = snap.data().completedDays?.some(date => date>=monDate && date <= sunDate);

            if (completed) {
                await updateDoc(docRef, {
                    completedDays: arrayRemove(date),
                });
            }
            else{
                await updateDoc(docRef, {
                    completedDays: arrayUnion(date),
                });
            }
        }

    }
    //these become available in the vue component
    return { loading, error, handleUpsertHabit, handleGetHabits};
}

async function handleCreateHabit(){
    const habit = createHabit({
        name: nameInput.value,
        description: descriptionInput.value,
        frequency: frequencyInput.value,
        daysOfWeek: daysOfWeekInput.value,
        userId: uid,
    });
    await handleUpsertHabit(habit);
}
