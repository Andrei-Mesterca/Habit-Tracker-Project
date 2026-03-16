<script setup>
    import { ref, computed } from 'vue'
    const d = ref(new Date());
    const day = computed(() => d.value.getDay())
    const date = computed(() => d.value.getDate())
    const mondayDate = computed(() => date.value-day.value)
    const week = ref([])
    const selectedDay = ref(null)

    const displayedDays = computed(() => {
      if (selectedDay.value == null) {
        return week.value
    }
    return [selectedDay.value]
    })

    //const habits = ref([])
    
    for (let i = 0; i < 7; i++) {
    week.value.push({
        day: i,
        date: mondayDate.value + i
    })
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  /*onMounted(async () => {//get habits
  try {
    const res = await fetch('/api/habits')
    habits.value = await res.json()
  } catch (err) {
    console.error('Error fetching habits:', err)
  }
  })*/
  const habits = ref([
  { id: 1, title: "Workout", occurs: "weekly" , day: 2},
  { id: 2, title: "Read 30 mins", occurs: "weekly" , day: 1},
  { id: 7, title: "Meal Prep", occurs: "daily"},
  { id: 8, title: "Plan Week", occurs: "weekly", day: 0}
  ])

  const habitsForDay = (weekday) => {
    let temp=[]
    for(const h of habits.value){
      if(h.occurs=="daily")
      {
        temp.push(h)
      }
      else if (h.occurs=="weekly" && h.day==weekday)
      {
        temp.push(h)
      }
    }
  return temp
  }

</script>
<template>
<div>
  <div v-if="selectedDay!=null"><button @click="selectedDay=null">Back</button></div>
  <div  class="week row g-2 d-flex justify-content-center d-flex align-items-stretch">
    <div v-for="d in displayedDays" :key="d.date" class="col text-center border rounded bg-light bg-opacity-75 p-4" :class="{today: d.day==day}">
        <button @click="selectedDay=d">
        <div>{{ dayNames[d.day] }}</div>
        <div>{{ d.date }}</div>
        </button>
      <div class="mt-2 border-top pt-2" style="min-height: 60px">
        <div v-for="habit in habitsForDay(d.day)" class="calendar-event">
          {{ habit.title }}
        </div>
      </div>
    </div>
  </div>
</div>
  
</template>

<style scoped>
 .week{
    width: 95vw;
    height: 60vh;
    margin: 10vh auto;
 }

 .calendar-event {
    background-color: hsl(155, 88%, 49%);
    color: white;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-bottom: 6px;
    text-align: left;
    transition: 0.2s;
}

.today {
  border: 3px solid #0d6efd;
  background-color: #8ff7b3 !important;
}
</style>