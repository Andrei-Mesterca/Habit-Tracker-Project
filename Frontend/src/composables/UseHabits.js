import { ref } from "vue";
import {
  upsertHabit,
  getHabits as fetchHabits,
  deleteHabit as removeHabit,
  toggleHabitComplete as toggleComplete
} from "@/services/HabitsService.js";

export function useHabits() {
  const loading = ref(false);
  const error = ref(null);

  async function handleUpsertHabit(habit) {
    loading.value = true;
    error.value = null;
    try {
      return await upsertHabit(habit);
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  async function handleGetHabits() {
    loading.value = true;
    error.value = null;
    try {
      return await fetchHabits();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  async function handleDeleteHabit(habitId) {
    loading.value = true;
    error.value = null;
    try {
      await removeHabit(habitId);
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  async function handleToggleComplete(habitId, date, completed) {
    loading.value = true;
    error.value = null;
    try {
      await toggleComplete(habitId, date, completed);
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, handleUpsertHabit, handleGetHabits, handleDeleteHabit, handleToggleComplete };
}
