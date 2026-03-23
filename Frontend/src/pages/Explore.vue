<script setup>
import { ref, computed, onMounted } from 'vue'
import Nav from '@/components/Nav.vue'
import { useHabits } from '@/composables/UseHabits'
import { useRouter} from 'vue-router'

import creative from '@/assets/creative.jpg'
import healthy from '@/assets/healthy.jpg'
import sport from '@/assets/sports.jpg'
import teamwork from '@/assets/teamwork.jpg'


const { loading, handleGetHabits, handleUpsertHabit, handleDeleteHabit, handleToggleComplete } = useHabits()
const router = useRouter();
const showModal = ref(false);
const selectedHabit = ref(null);
const habits = ref([]);
const activeCategory = ref(null);
const successMessage = ref('');
const form = ref({
  name: '',
  description: '',
  frequency: 'daily'
})
const saving = ref(false)
const formError = ref('')

const categories = [
  {
    name: 'creative',
    label: 'Creative',
    image: creative,
    habits: ['Painting','Drawing','Journalling','Photography','Baking']
  },
  {
    name: 'healthy',
    label: 'Healthy',
    image: healthy,
    habits: ['Yoga','Drink Water','Meditation','Eat Fruit/Veg','Exercise','Digital Detox']
  },
  {
    name: 'sport',
    label: 'Sport',
    image: sport,
    habits: ['Football','Gym','Running','Swimming','Cycling','Skateboarding','Jogging']
  },
  {
    name: 'team',
    label: 'Team',
    image: teamwork,
    habits: ['Club','Society','Group Study Sesh','Book Club']
  }
]
  //toggle logic
  function toggleCategory(category){
    activeCategory.value = activeCategory.value == category ? null : category
  }

function selectHabit(habitName){
  selectedHabit.value = habitName
  form.value = {
    name: habitName,
    description: '',
    frequency: 'daily'
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function submitHabit() {
  formError.value = ''
  successMessage.value = ''
  if (!form.value.name.trim()) {
    formError.value = 'Habit name is required.'
    return
  }

  saving.value = true

  try {
    await handleUpsertHabit({
      name: form.value.name,
      description: '',
      frequency: form.value.frequency
    })
    successMessage.value = 'Habit added successfully!'
    showModal.value = false

    //router.push('/')
  } catch (e) {
    formError.value = e.message || "Failed to save habit"
  } finally {
    saving.value = false
  }
}

</script>

<template>
  <div style="min-height:100vh; background:#f4f9f6; font-family:'Montserrat',sans-serif;">
    <Nav />
    <h1 style="font-size:1.8rem; font-weight:800; color:#071c07; text-align: center;">
            Explore Habits
    </h1>
    <p style="text-align: center;">Need some inspo for a new hobby?.....</p>
    <div class="container">
    <div v-for="cat in categories" :key="cat.name">
      <div
      class = "pic" 
      :style="{ backgroundImage: `url(${cat.image})`}"
      @click ="toggleCategory(cat.name)">
      {{ cat.label }}
    </div>
    <div v-if="activeCategory === cat.name" class = "habit-grid">
      <div
        v-for="habit in cat.habits"
        :key="habit"
        class = "habit"
        @click="selectHabit(habit)"
        >
        {{  habit }}
        </div>
      </div>
    </div>
    </div>
    </div>
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
              Add Habit
            </h2>
            <button @click="showModal = false" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#5a7a5a; line-height:1;">✕</button>
          </div>

          <!-- Modal body -->
          <div style="padding:20px 24px 24px; display:flex; flex-direction:column; gap:16px;">

            <p style="font-weight:700; color:#071c07;">
              {{ form.name }}
            </p>

            <div style="display:flex; flex-direction:column; gap:6px; text-align:left;">
              <select
                v-model="form.frequency"
                style="height:44px; padding:0 12px; border:1.5px solid #d4ead9; border-radius:8px; font-family:inherit; font-size:0.9rem; outline:none; color:#071c07;"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
              </select>
            </div>

            <p v-if="formError" style="color:#aa010d; font-size:0.82rem; font-weight:600; margin:0;">{{ formError }}</p>
            <p v-if="successMessage" style="color:#2B8C64; font-weight:600;">
                {{ successMessage }}
            </p>
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:4px;">
              <button
                @click="showModal = false"
                style="background:none; border:1.5px solid #d4ead9; border-radius:100px; padding:8px 20px; font-family:inherit; font-size:0.85rem; font-weight:600; color:#5a7a5a; cursor:pointer;">
                Cancel
              </button>
              <button
                @click="submitHabit"
                :disabled="saving"
                style="background:#2B8C64; color:#fff; border:none; border-radius:100px; padding:8px 24px; font-family:inherit; font-size:0.85rem; font-weight:700; cursor:pointer;">
                {{ saving ? 'Saving…' : 'Add Habit' }}
              </button>
            </div>

          </div>
        </div>
      </div>
    </Teleport>
</template>
<style>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.pic {
  color: black;
  display: block;
  width: 100%;
  height: 200px;
  margin: 12px 0;
  align-self: center;
  text-align: center;
  font-size: 2rem;
  line-height: 180px;
  box-shadow: 0 2px 6px rgba(255,255,255,0.5);
  font-weight: 700;
  letter-spacing: 1px; 
}
 .habit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin: 10px 0 20px;
 }
 .habit {
  font-family:'Montserrat',sans-serif;
  background: white;
  text-align:center;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  cursor: pointer;
}

</style>