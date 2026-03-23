<script setup>
import { ref, computed, onMounted } from "vue";
import Nav from "@/components/Nav.vue";
import { useHabits } from "@/composables/useHabits";
import { useAuth } from '@/composables/useAuth'

const { handleGetHabits } = useHabits();

const habits = ref([]);
const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const { currentUser} = useAuth();
// Current month being viewed
const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth()); // 0-indexed

// Selected day popup
const selectedDay = ref(null); // 'YYYY-MM-DD' string

onMounted(async () => {
  try {
    habits.value = await handleGetHabits();
  } catch (e) {
    console.error("Failed to load habits:", e);
  }
});

function getStreak(habit){
  if (!habit.completedDates?.length) return 0
  const sorted = [...habit.completedDates].sort().reverse()
  let streak = 0
  const check = new Date(today)
  for (const d of sorted) {
    if (d === check.toISOString().split('T')[0]) {
      streak++
      check.setDate(check.getDate() - 1)
    } else break
  }
  return streak
}

</script>

<template>
  <div style="min-height:100vh; background:#f4f9f6; font-family:'Montserrat',sans-serif;">
  <Nav />
  <br>
  <h1 style="font-size:1.8rem; font-weight:800; color:#071c07; margin:0 0 4px; text-transform:none;">
   Habits Progress for {{ currentUser?.displayName || '' }}</h1>
  </div>
</template>
