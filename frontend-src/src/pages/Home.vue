<script setup>
import { ref, computed, watch , onMounted} from 'vue'
import Nav from '@/components/Nav.vue'
import { useHabits } from '@/composables/useHabits'
import { useAuth } from '@/composables/useAuth'

const { currentUser, authReady } = useAuth()
const { loading, handleGetHabits, handleUpsertHabit, handleDeleteHabit, handleToggleHabitCompletion } = useHabits()

const habits = ref([])
const today = new Date().toISOString().split('T')[0]
const formattedDate = new Date().toLocaleDateString('en-IE', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

const showModal = ref(false)
const editingHabit = ref(null)
const form = ref({ name: '', description: '', frequency: 'daily' })
const formError = ref('')
const saving = ref(false)
const pageError = ref('')

const completedCount = computed(() =>
  habits.value.filter(h => h.completedDays?.includes(today)).length
)
const progressPercent = computed(() =>
  habits.value.length ? Math.round((completedCount.value / habits.value.length) * 100) : 0
)

onMounted(async () => {
  await loadHabits()
})

async function loadHabits() {
  pageError.value = ''
  try {
    habits.value = await handleGetHabits()
  } catch (e) {
    pageError.value = e.message || 'Failed to load habits. Is the backend running?'
  }
}

function openAdd() {
  editingHabit.value = null
  form.value = { name: '', description: '', frequency: 'daily' }
  formError.value = ''
  showModal.value = true
}

function openEdit(habit) {
  editingHabit.value = habit
  form.value = { name: habit.name, description: habit.description || '', frequency: habit.frequency || 'daily' }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function submitHabit() {
  formError.value = ''
  if (!form.value.name.trim()) {
    formError.value = 'Habit name is required.'
    return
  }
  saving.value = true
  try {
    const payload = editingHabit.value
      ? { ...form.value, name: editingHabit.value.name, id: editingHabit.value.id }
      : { ...form.value }
    await handleUpsertHabit(payload)
    await loadHabits()
    closeModal()
  } catch (e) {
    formError.value = e.message || 'Something went wrong. Is the backend running?'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(habitId) {
  if (!confirm('Delete this habit?')) return
  try {
    await handleDeleteHabit(habitId)
    habits.value = habits.value.filter(h => h.id !== habitId)
  } catch (e) {
    pageError.value = e.message || 'Failed to delete.'
  }
}

async function toggleComplete(habit) {
  const oldCompletedDays = habit.completedDays || []
  const wasCompleted = oldCompletedDays.includes(today)
  habit.completedDays = wasCompleted
    ? oldCompletedDays.filter(d => d !== today)
    : [...oldCompletedDays, today]
  try {
    await handleToggleHabitCompletion(habit.id)
  } catch (e) {
    habit.completedDays = oldCompletedDays
    pageError.value = e.message || 'Failed to update.'
  }
}

function isCompletedToday(habit) {
  return habit.completedDays?.includes(today) ?? false
}

function getStreak(habit) {
  if (!habit.completedDays?.length) return 0
  const sorted = [...habit.completedDays].sort().reverse()
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
  <div class="page">
    <Nav />

    <div class="container">
      <div class="header">
        <div>
          <h1 class="title">
            Good day, {{ currentUser?.displayName || 'there' }} 
          </h1>
          <p class="date">{{ formattedDate }}</p>
        </div>

        <button @click="openAdd" class="primary-btn">
          + Add Habit
        </button>
      </div>

      <div v-if="pageError" class="error-banner">
        <span> {{ pageError }}</span>
        <button @click="pageError = ''" class="icon-close">✕</button>
      </div>

      <div v-if="habits.length" class="progress-section">
        <div class="progress-row">
          <span>Today's Progress</span>
          <span class="progress-count">{{ completedCount }} / {{ habits.length }} done</span>
        </div>

        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>

      <p v-if="loading" class="loading-text">Loading your habits…</p>

      <div v-else-if="!habits.length && !pageError" class="empty-state">
        <div class="empty-icon"></div>
        <h2 class="empty-title">No habits yet</h2>
        <p class="empty-text">Start building better habits by adding your first one</p>
        <button @click="openAdd" class="primary-btn">
          + Add Your First Habit
        </button>
      </div>

      <div v-else class="habit-list">
        <div
          v-for="habit in habits"
          :key="habit.id"
          :class="['habit-card', { completed: isCompletedToday(habit) }]"
        >
          <button
            @click="toggleComplete(habit)"
            :class="['tick-btn', { completed: isCompletedToday(habit) }]"
          >
            <svg
              v-if="isCompletedToday(habit)"
              xmlns="http://www.w3.org/2000/svg"
              height="28px"
              viewBox="0 -960 960 960"
              width="28px"
              fill="currentColor"
            >
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-232 198-198-56-56-142 142-56-56-58 56 114 112Z"/>
            </svg>

            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              height="28px"
              viewBox="0 -960 960 960"
              width="28px"
              fill="currentColor"
            >
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
            </svg>
          </button>

          <div class="habit-info">
            <div :class="['habit-name', { completed: isCompletedToday(habit) }]">
              {{ habit.name }}
            </div>

            <div v-if="habit.description" class="habit-description">
              {{ habit.description }}
            </div>

            <div class="habit-meta">
              <span class="frequency-badge">
                {{ habit.frequency || 'daily' }}
              </span>

              <span v-if="getStreak(habit) > 0" class="streak">
                 {{ getStreak(habit) }}-day streak
              </span>
            </div>
          </div>

          <div class="habit-actions">
            <button @click="openEdit(habit)" class="action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
              </svg>
            </button>

            <button @click="confirmDelete(habit.id)" class="action-btn delete-btn">
              <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showModal"
        @click.self="closeModal"
        class="modal-overlay"
      >
        <div class="habit-modal-card">
          <div class="habit-modal-header">
            <h2 class="habit-modal-title">
              {{ editingHabit ? 'Edit Habit' : 'New Habit' }}
            </h2>
            <button @click="closeModal" class="icon-close">✕</button>
          </div>

          <div class="habit-modal-body">
            <div class="form-group">
              <label class="label">Habit Name *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. Morning run"
                :disabled="!!editingHabit"
                :class="['input', { disabled: !!editingHabit }]"
              />
            </div>

            <div class="form-group">
              <label class="label">Description (optional)</label>
              <input
                v-model="form.description"
                type="text"
                placeholder="e.g. 30 mins before breakfast"
                class="input"
              />
            </div>

            <div class="form-group">
              <label class="label">Frequency</label>
              <select v-model="form.frequency" class="input">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
              </select>
            </div>

            <p v-if="formError" class="form-error">{{ formError }}</p>

            <div class="modal-actions">
              <button @click="closeModal" class="secondary-btn">
                Cancel
              </button>

              <button @click="submitHabit" :disabled="saving" class="primary-btn">
                {{ saving ? 'Saving…' : editingHabit ? 'Save Changes' : 'Add Habit' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f4f9f6;
  font-family: 'Montserrat', sans-serif;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #071c07;
  margin: 0 0 4px;
  text-transform: none;
}

.date {
  color: #5a7a5a;
  font-size: 0.9rem;
  margin: 0;
}

.primary-btn {
  background: #2b8c64;
  color: #fff;
  border: none;
  border-radius: 100px;
  padding: 10px 24px;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.secondary-btn {
  background: none;
  border: 1.5px solid #d4ead9;
  border-radius: 100px;
  padding: 8px 20px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: #5a7a5a;
  cursor: pointer;
}

.error-banner {
  background: #fff0f0;
  border: 1px solid #f5c0c0;
  color: #aa010d;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-close {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font-size: 1.1rem;
}

.progress-section {
  margin-bottom: 28px;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #3a5a3a;
  margin-bottom: 6px;
}

.progress-count {
  color: #2b8c64;
}

.progress-bar {
  height: 10px;
  background: #d4ead9;
  border-radius: 100px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2b8c64;
  border-radius: 100px;
  transition: width 400ms ease;
}

.loading-text {
  text-align: center;
  color: #5a7a5a;
  padding: 40px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #3a5a3a;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.empty-text {
  color: #5a7a5a;
  margin-bottom: 24px;
}

.habit-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.habit-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1.5px solid #d4ead9;
  border-radius: 14px;
  padding: 16px 18px;
}

.habit-card.completed {
  background: #f0faf4;
  border: 1.5px solid #2b8c64;
}

.tick-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #b0ccb8;
  padding: 0;
  display: flex;
  align-items: center;
}

.tick-btn.completed {
  color: #2b8c64;
}

.habit-info {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.habit-name {
  font-weight: 700;
  font-size: 1rem;
  color: #071c07;
}

.habit-name.completed {
  color: #7aaa8a;
  text-decoration: line-through;
}

.habit-description {
  font-size: 0.8rem;
  color: #5a7a5a;
  margin-top: 2px;
}

.habit-meta {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.frequency-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #2b8c64;
  background: #edf4ee;
  padding: 2px 8px;
  border-radius: 100px;
}

.streak {
  font-size: 0.78rem;
  color: #e07b00;
  font-weight: 600;
}

.habit-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: none;
  border: 1.5px solid #d4ead9;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  color: #5a7a5a;
  display: flex;
  align-items: center;
}

.delete-btn {
  color: #aa010d;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #edf4ee;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #071c07;
  margin: 0;
  text-transform: none;
}

.modal-body {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #3a5a3a;
}

.input {
  height: 44px;
  padding: 0 12px;
  border: 1.5px solid #d4ead9;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  color: #071c07;
  background: #fff;
}

.input.disabled {
  color: #7a8a7a;
  background: #f4f6f4;
  cursor: not-allowed;
}

.form-error {
  color: #aa010d;
  font-size: 0.82rem;
  font-weight: 600;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.habit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.habit-modal-card {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.habit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #edf4ee;
}

.habit-modal-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #071c07;
  margin: 0;
  text-transform: none;
}

.habit-modal-body {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
