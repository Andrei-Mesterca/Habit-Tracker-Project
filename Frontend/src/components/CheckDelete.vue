<script setup>
import { ref, onMounted } from "vue";
import { useHabits } from "@/composables/useHabits";
import { getAuth } from "firebase/auth";
import { deleteHabitById } from "@/services/habitsService";
import { app } from "@/firebase";

const habits = ref([]);
const auth = getAuth();
const uid = auth.currentUser?.uid;

const { handleGetHabits } = useHabits(uid);
onMounted(async () => {
  habits.value = await handleGetHabits();
});
const currHabits = ref([]);

async function refresh() {
    console.log("Project:", app.options.projectId);
  currHabits.value = await handleGetHabits();
}

async function onDelete(id) {
  await deleteHabitById(id);
  await refresh(); // re-fetch list (simple + reliable)
}

onMounted(refresh);
</script>

<template>
  <div>
    <ul v-if="currHabits.length">
      <li v-for="h in currHabits" :key="h.id">
        {{ h.name }} — {{ h.frequency }}
        <button @click="onDelete(h.id)">Delete</button>
      </li>
    </ul>
    <p v-else>No habits yet</p>
  </div>
</template>
