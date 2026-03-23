<script setup>
import { ref, computed, onMounted } from 'vue'
import Nav from '@/components/Nav.vue'
import { useHabits } from '@/composables/UseHabits'
import { useAuth } from '@/composables/useAuth'

const { currentUser } = useAuth()
const { loading, handleGetHabits, handleUpsertHabit, handleDeleteHabit, handleToggleComplete } = useHabits()

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
  habits.value.filter(h => h.completedDates?.includes(today)).length
)
const progressPercent = computed(() =>
  habits.value.length ? Math.round((completedCount.value / habits.value.length) * 100) : 0
)

onMounted(loadHabits)

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
      ? { ...form.value, id: editingHabit.value.id }
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
  const dates = habit.completedDates || []
  const wasCompleted = dates.includes(today)
  habit.completedDates = wasCompleted
    ? dates.filter(d => d !== today)
    : [...dates, today]
  try {
    await handleToggleComplete(habit.id, today, !wasCompleted)
  } catch (e) {
    habit.completedDates = dates
    pageError.value = e.message || 'Failed to update.'
  }
}

function isCompletedToday(habit) {
  return habit.completedDates?.includes(today) ?? false
}

function getStreak(habit) {
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

    <div style="max-width:1000px; margin:0 auto; padding:32px 24px;">

      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:1.8rem; font-weight:800; color:#071c07; margin:0 0 4px; text-transform:none;">
            Good day, {{ currentUser?.displayName || 'there' }} 👋
          </h1>
          <p style="color:#5a7a5a; font-size:0.9rem;">{{ formattedDate }}</p>
        </div>
        <button
          @click="openAdd"
          style="background:#2B8C64; color:#fff; border:none; border-radius:100px; padding:10px 24px; font-family:inherit; font-size:0.95rem; font-weight:700; cursor:pointer;">
          + Add Habit
        </button>
      </div>

      <!-- Error -->
      <div v-if="pageError" style="background:#fff0f0; border:1px solid #f5c0c0; color:#aa010d; border-radius:8px; padding:12px 16px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
        ⚠️ {{ pageError }}
        <button @click="pageError = ''" style="background:none; border:none; cursor:pointer; color:#aa010d; font-size:1.1rem;">✕</button>
      </div>

      <!-- Progress -->
      <div v-if="habits.length" style="margin-bottom:28px;">
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; color:#3a5a3a; margin-bottom:6px;">
          <span>Today's Progress</span>
          <span style="color:#2B8C64;">{{ completedCount }} / {{ habits.length }} done</span>
        </div>
        <div style="height:10px; background:#d4ead9; border-radius:100px; overflow:hidden;">
          <div :style="{ width: progressPercent + '%', height:'100%', background:'#2B8C64', borderRadius:'100px', transition:'width 400ms ease' }"></div>
        </div>
      </div>

      <!-- Loading -->
      <p v-if="loading" style="text-align:center; color:#5a7a5a; padding:40px 0;">Loading your habits…</p>

      <!-- Empty -->
      <div v-else-if="!habits.length && !pageError" style="text-align:center; padding:60px 20px; color:#3a5a3a;">
        <div style="font-size:3rem; margin-bottom:12px;">🌱</div>
        <h2 style="font-size:1.3rem; font-weight:700; margin-bottom:8px;">No habits yet</h2>
        <p style="color:#5a7a5a; margin-bottom:24px;">Start building better habits by adding your first one.</p>
        <button @click="openAdd" style="background:#2B8C64; color:#fff; border:none; border-radius:100px; padding:10px 24px; font-family:inherit; font-weight:700; cursor:pointer;">
          + Add Your First Habit
        </button>
      </div>

      <!-- Habits list -->
      <div v-else style="display:flex; flex-direction:column; gap:12px;">
        <div
          v-for="habit in habits"
          :key="habit.id"
          :style="{
            display:'flex', alignItems:'center', gap:'14px',
            background: isCompletedToday(habit) ? '#f0faf4' : '#fff',
            border: isCompletedToday(habit) ? '1.5px solid #2B8C64' : '1.5px solid #d4ead9',
            borderRadius:'14px', padding:'16px 18px'
          }"
        >
          <!-- Tick button -->
          <button
            @click="toggleComplete(habit)"
            :style="{ background:'none', border:'none', cursor:'pointer', color: isCompletedToday(habit) ? '#2B8C64' : '#b0ccb8', padding:'0', display:'flex', alignItems:'center' }"
          >
            <svg v-if="isCompletedToday(habit)" xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-232 198-198-56-56-142 142-56-56-58 56 114 112Z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
            </svg>
          </button>

          <!-- Info -->
          <div style="flex:1; text-align:left; min-width:0;">
            <div :style="{ fontWeight:'700', fontSize:'1rem', color: isCompletedToday(habit) ? '#7aaa8a' : '#071c07', textDecoration: isCompletedToday(habit) ? 'line-through' : 'none' }">
              {{ habit.name }}
            </div>
            <div v-if="habit.description" style="font-size:0.8rem; color:#5a7a5a; margin-top:2px;">{{ habit.description }}</div>
            <div style="display:flex; gap:8px; margin-top:6px; flex-wrap:wrap; align-items:center;">
              <span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; color:#2B8C64; background:#edf4ee; padding:2px 8px; border-radius:100px;">
                {{ habit.frequency || 'daily' }}
              </span>
              <span v-if="getStreak(habit) > 0" style="font-size:0.78rem; color:#e07b00; font-weight:600;">
                🔥 {{ getStreak(habit) }}-day streak
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div style="display:flex; gap:6px;">
            <button @click="openEdit(habit)" style="background:none; border:1.5px solid #d4ead9; border-radius:8px; padding:6px; cursor:pointer; color:#5a7a5a; display:flex; align-items:center;">
              <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
              </svg>
            </button>
            <button @click="confirmDelete(habit.id)" style="background:none; border:1.5px solid #d4ead9; border-radius:8px; padding:6px; cursor:pointer; color:#aa010d; display:flex; align-items:center;">
              <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal — rendered at body level to avoid CSS conflicts -->
    <Teleport to="body">
      <div
        v-if="showModal"
        @click.self="closeModal"
        style="position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px;"
      >
        <div style="background:#fff; border-radius:16px; width:100%; max-width:460px; box-shadow:0 8px 32px rgba(0,0,0,0.2); overflow:hidden;">

          <!-- Modal header -->
          <div style="display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid #edf4ee;">
            <h2 style="font-size:1.1rem; font-weight:800; color:#071c07; margin:0; text-transform:none;">
              {{ editingHabit ? 'Edit Habit' : 'New Habit' }}
            </h2>
            <button @click="closeModal" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#5a7a5a; line-height:1;">✕</button>
          </div>

          <!-- Modal body -->
          <div style="padding:20px 24px 24px; display:flex; flex-direction:column; gap:16px;">

            <div style="display:flex; flex-direction:column; gap:6px; text-align:left;">
              <label style="font-size:0.82rem; font-weight:700; color:#3a5a3a;">Habit Name *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. Morning run"
                style="height:44px; padding:0 12px; border:1.5px solid #d4ead9; border-radius:8px; font-family:inherit; font-size:0.9rem; outline:none; color:#071c07;"
              />
            </div>

            <div style="display:flex; flex-direction:column; gap:6px; text-align:left;">
              <label style="font-size:0.82rem; font-weight:700; color:#3a5a3a;">Description (optional)</label>
              <input
                v-model="form.description"
                type="text"
                placeholder="e.g. 30 mins before breakfast"
                style="height:44px; padding:0 12px; border:1.5px solid #d4ead9; border-radius:8px; font-family:inherit; font-size:0.9rem; outline:none; color:#071c07;"
              />
            </div>

            <div style="display:flex; flex-direction:column; gap:6px; text-align:left;">
              <label style="font-size:0.82rem; font-weight:700; color:#3a5a3a;">Frequency</label>
              <select
                v-model="form.frequency"
                style="height:44px; padding:0 12px; border:1.5px solid #d4ead9; border-radius:8px; font-family:inherit; font-size:0.9rem; outline:none; color:#071c07; background:#fff;"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
              </select>
            </div>

            <p v-if="formError" style="color:#aa010d; font-size:0.82rem; font-weight:600; margin:0;">{{ formError }}</p>

            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:4px;">
              <button
                @click="closeModal"
                style="background:none; border:1.5px solid #d4ead9; border-radius:100px; padding:8px 20px; font-family:inherit; font-size:0.85rem; font-weight:600; color:#5a7a5a; cursor:pointer;">
                Cancel
              </button>
              <button
                @click="submitHabit"
                :disabled="saving"
                style="background:#2B8C64; color:#fff; border:none; border-radius:100px; padding:8px 24px; font-family:inherit; font-size:0.85rem; font-weight:700; cursor:pointer;">
                {{ saving ? 'Saving…' : editingHabit ? 'Save Changes' : 'Add Habit' }}
              </button>
            </div>

          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
