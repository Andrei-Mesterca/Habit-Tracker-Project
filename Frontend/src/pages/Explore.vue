<script setup>
import { ref } from 'vue'
import Nav from '@/components/Nav.vue'
import { useHabits } from '@/composables/UseHabits'

//import images and CSS
import creative from '@/assets/creative.jpg'
import healthy from '@/assets/healthy.jpg'
import sport from '@/assets/sports.jpg'
import teamwork from '@/assets/teamwork.jpg'
import outdoor from '@/assets/outdoor.webp'
import '@/assets/explore.css'
 
const { handleUpsertHabit } = useHabits()
const showModal = ref(false);
const selectedHabit = ref(null);
const activeCategory = ref(null);
const successMessage = ref('');
//form needed to enter habits
const form = ref({
  name: '',
  description: '',
  frequency: 'daily'
})
const saving = ref(false)
const formError = ref('')

//categories are created and the habits inside them are stored
const categories = [
  {
    name: 'creative',
    label: 'Creative',
    image: creative,
    habits: ['Painting','Drawing','Journalling','Photography','Baking','Pottery','Knitting']
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
    habits: ['Football','Hurling','Basketball','Gym','Running','Swimming','Cycling','Skateboarding','Jogging','Golf']
  },
  {
    name: 'team',
    label: 'Team',
    image: teamwork,
    habits: ['Club','Society','Group Study Sesh','Book Club','Board Games']
  },
  {
    name: 'outdoor',
    label: 'Outdoor',
    image: outdoor,
    habits: ['Gardening','Hiking','Fishing','Bird Watching']
  }
]
//toggle logic
function toggleCategory(category){
  activeCategory.value = activeCategory.value == category ? null : category
}


function selectHabit(habitName){
  selectedHabit.value = habitName
  form.value = {
    name: habitName,   //name is set to habit name
    description: '',
    frequency: 'daily'  //placeholder value
  }
  successMessage.value = '';
  formError.value = '';
  showModal.value = true
}

//function to close the pop up
function closeModal() {
  showModal.value = false
}

//what happens when the user tries to add the habit
async function submitHabit() {
  formError.value = ''
  successMessage.value = ''
  if (!form.value.name.trim()) {
    formError.value = 'Habit name is required.'
    return
  }
  saving.value = true
  try {
    await handleUpsertHabit({   //uses HabitsService.js function
      name: form.value.name,
      description: '',
      frequency: form.value.frequency
    })
    successMessage.value = 'Habit added successfully!'
    showModal.value = false
  } catch (e) {
    formError.value = e.message || "Failed to save habit"
  } finally {
    saving.value = false
  }
}
</script>
<template>
  <div class="openDiv">
    <Nav />
    <h1>
        Explore Habits
    </h1>
    <p style="text-align: center;">Need some inspo for a new hobby?.....</p>
    <div class="container">
      <!-- Display Categories-->
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
      <div v-if="showModal" @click.self="closeModal" class="modal">
        <div class="form">

          <!-- Modal header -->
          <div class="modalHeader">
            <h2>Add Habit</h2>
            <button @click="closeModal" class="xButton">✕</button>
          </div>

          <!-- Modal body -->
          <div class="modalBody">
            <p style="font-weight:700; color:#071c07;">
              {{ form.name }}
            </p>

            <div class="formGroup" style="text-align:left;">
              <select v-model="form.frequency">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
              </select>
            </div>

            <p v-if="formError" class="error">{{ formError }}</p>
            <p v-if="successMessage" class="success">
                {{ successMessage }}
            </p>
            <div class="cancel">
              <button @click="closeModal" class="cancelButton">
              Cancel
              </button>
              <button
                @click="submitHabit"
                :disabled="saving">
                {{ saving ? 'Saving…' : 'Add Habit' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
</template>