import { ref } from "vue"; //reactive state that vue tracks
import { upsertHabit, getHabits as fetchHabits } from "@/services/HabitsService.js"; //firestore write function


export function useHabits(){
    //this function manages the state
    const loading = ref(false); //true while firestore is running
    const error = ref(null); //stops any errors that occurs

    //function that the component calls
    //habitnis the data passed from the UI
    async function handleUpsertHabit(habit){
        loading.value = true; //disable buttons
        error.value = null; //clear old errors
        try {
            return await upsertHabit(habit);
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
            const result = await fetchHabits();
            console.log("Fetched Habits:", result);
            return result;
            } catch (e) {
                error.value = e instanceof Error ? e : new Error(String(e));
                throw error.value;
            } finally{
                loading.value = false;
            }
        }
    

    //these become available in the vue component
    return { loading, error, handleUpsertHabit, handleGetHabits};
}