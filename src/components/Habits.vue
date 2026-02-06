<script setup>
import { ref } from "vue";
import { useHabits } from "@/composables/useHabits";

const { loading, error, handleUpsertHabit, handleGetHabits } = useHabits();

const habits = ref([]);

import { db } from "@/firebase";
console.log("Project:", db.app.options.projectId);



async function onAdd() {
    await handleUpsertHabit ({
        name: "water",
        description: "drink 2l water",
        frequency: "daily"
    });

}

const nameInput = ref("");
const descriptionInput = ref("");
const frequencyInput = ref("daily");

async function onSubmit() {
    await handleUpsertHabit ({
        name: nameInput.value,
        description: descriptionInput.value,
        frequency: frequencyInput.value
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

            <button @click="onAdd" :disabled="loading">Save habit</button>
            <button @click="onGet">get habits</button>
            <p v-if="error">{{ error.message }}</p>
            <br>
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

            <button type="submit">Save Habit</button>
            </form>
        </div>
        <div></div>


    </div>

</template>

