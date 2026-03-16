<script setup>
import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useHabits } from "@/composables/useHabits";
import { getLocalUid } from "@/utils/getLocalUid";

const uid = getLocalUid();
const { loading, error, handleUpsertHabit, handleGetHabits } = useHabits(uid);

const habits = ref([]);
const nameInput = ref("");
const descriptionInput = ref("");
const frequencyInput = ref("daily");

async function onSubmit() {
    await handleUpsertHabit ({
        name: nameInput.value,
        description: descriptionInput.value,
        frequency: frequencyInput.value,
        daysOfWeek: [],
    });
}
async function onGet(){
    habits.value = await handleGetHabits();
    
}
</script>
<template>

    <div class="habits">

        <h1>Habitable</h1>

        <div class="content">
            <form @submit.prevent="onSubmit">
            <input 
                type='text'
                placeholder='Habit Name'
                v-model="nameInput"
            />
            <input 
                type='text'
                placeholder='Description'
                v-model="descriptionInput"
            />

            <select v-model="frequencyInput">
                <option disabled value="">Please select one</option>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
                placeholder='Frequency'
            </select>

            <input type="checkbox" v-model="daysOfWeekInput"/>
                <option disabled value="">Please select the days</option>
                <option value=0>Monday</option>
                <option value=1>Tuesday</option>
                <option value=2>Wednesday</option>
                <option value=3>Thursday</option>
                <option value=4>Friday</option>
                <option value=5>Saturday</option>
                <option value=6>Sunday</option>

            <button type="submit">Save Habit</button>
            </form>
        </div>

    </div>

</template>