import { ref } from "vue"; //reactive state that vue tracks
import { 
    upsertHabit, 
    getHabits as fetchHabits,
    deleteHabit as removeHabit,
    toggleHabitCompletion as toggleCompletion,
    isHabitComplete as checkHabitComplete
 } from "@/services/HabitsService.js";
import { useAuth } from "@/composables/useAuth";


export function useHabits(){

    const { currentUser, authReady } = useAuth();
    //this function manages the state
    const loading = ref(false); //true while firestore is running
    const error = ref(null); //stops any errors that occurs

    async function waitForUid(timeout = 4000){
        const start = Date.now();
        while (Date.now() - start < timeout){
            if(authReady.value && currentUser.value?.uid) {
                return currentUser.value.uid;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if(authReady.value && !currentUser.value?.uid) {
            throw new Error("User is not signed in");
        }

        throw new Error("Authentication is still loading");
    }

    //function that the component calls
    //habitnis the data passed from the UI
    async function handleUpsertHabit(habit){
        loading.value = true; //disable buttons
        error.value = null; //clear old errors
        try {
            const uid = await waitForUid();
            console.log("PAYLOAD INSIDE useHabits:", habit)
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
            const uid = await waitForUid();
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

    async function handleDeleteHabit(habitId) {
        loading.value = true;
        error.value = null;

        try {
            const uid = await waitForUid();

            await removeHabit(uid, habitId);
        } catch (e) {
            error.value = e instanceof Error ? e : new Error(String(e));
            throw error.value;
        } finally {
            loading.value = false;
        }
    }

    async function handleToggleHabitCompletion(habitId) {
        loading.value = true;
        error.value = null;

        try {
            const uid = await waitForUid();

            await toggleCompletion(uid, habitId);
        } catch (e) {
            error.value = e instanceof Error ? e : new Error(String(e));
            throw error.value;
        } finally {
            loading.value = false;
        }
    }

    async function handleIsHabitComplete(habitId) {
        loading.value = true;
        error.value = null;

        try {
            const uid = await waitForUid();

            return await checkHabitComplete(uid, habitId);
        } catch (e) {
            error.value = e instanceof Error ? e : new Error(String(e));
            throw error.value;
        } finally {
            loading.value = false;
        }
    }

    return {
        loading,
        error,
        handleUpsertHabit,
        handleGetHabits,
        handleDeleteHabit,
        handleToggleHabitCompletion,
        handleIsHabitComplete
    };
}  

