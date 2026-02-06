<script setup>
import { ref, onMounted } from 'vue';
//import { DataTable } from 'primevue/datatable';
//import { Column } from 'primevue/column';
import { getHabits } from "@/services/habitsService";
import { useHabits } from  "@/composables/useHabits";

const { loading, error, handleUpsertHabit, handleGetHabits } = useHabits();

const habits = ref([]);

onMounted(async() => {
    habits.value = await handleGetHabits();

})
</script>

<template>
<div>
    <table v-if="!loading && !error" class="table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Frequency</th>
                <th>Completed</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="habit in habits" :key="habit.id">
                <td>{{ habit.id }}</td>
                <td>{{ habit.description }}</td>
                <td>{{ habit.frequency }}</td>
                <td><input type="checkbox"</td>
            </tr>
        </tbody>
    </table>
        
</div>
</template>
