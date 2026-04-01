<script setup>
import { ref, computed, onMounted } from "vue";
import Nav from "@/components/Nav.vue";
import { useHabits } from "@/composables/useHabits";

const { handleGetHabits } = useHabits();

const viewMode = ref("month"); // can also be set to week
const habits = ref([]);
const today = new Date();
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
//monthly view
const todayStr = today.toISOString().split("T")[0];

//used to get weekly view
const enlargedDay = ref(null)
const day = today.getDay();
const week = ref([]);

const generateWeek = () => {
  week.value = [];
  const monday = new Date(today);  
  const mondayOffset = day === 0 ? -6 : 1 - day;//either -6 if its on sunday or else -day value
  monday.setDate(today.getDate() + mondayOffset);// move to Monday
 

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.value.push({
      day: d.getDay(),                        // 0=Sun..6=Sat
      date: d.getDate(),                       // 1..31
      fullDate: d.toISOString().split("T")[0] // YYYY-MM-DD, useful for habits
    });
  }
};
generateWeek();

const displayedDays = computed(() => {
      if (enlargedDay.value == null) {
        return week.value
    }
return [enlargedDay.value]
})


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

//Navigation
function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value--;
  } else viewMonth.value--;
}
function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value++;
  } else viewMonth.value++;
}

// Monthly
const monthName = computed(() =>
  new Date(viewYear.value, viewMonth.value).toLocaleDateString("en-IE", {
    month: "long",
    year: "numeric",
  }),
);

const calendarDays = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1).getDay(); // get day for first of month 0=Sun
  const daysInMonth = new Date(viewYear.value,viewMonth.value + 1, 0).getDate();//go to next month then back 1 day, last day in month to get total days
  const days = [];

  // Empty cells before the 1st
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(viewMonth.value + 1).padStart(2, "0");//1 goes to 01, 10 would stay same
    const dd = String(d).padStart(2, "0");
    days.push(`${viewYear.value}-${mm}-${dd}`);
  }

  return days;
});

//Per-day data

const habitsForDay = (selectedDay) => {
  let temp=[]
  let habitsMapped=habits.value.map((h) => ({
  id: h.id,
  name: h.name,
  des: h.description,
  freq: h.frequency,
  done: h.completedDays?.includes(selectedDay) ?? false,}));
  const date = new Date(selectedDay) //make date object so i can easily access day
  const dayCheck = date.getDay();
  for(const h of habitsMapped){
    if(h.freq=="daily")
      {
        temp.push(h)
      }
      else if (h.freq=="weekly" && dayCheck===0)
      {
        temp.push(h)
      }
      else if (h.freq=="weekends" && (dayCheck===6 || dayCheck===0))
      {
        temp.push(h)
      }
      else if (h.freq=="weekdays" && (dayCheck===1 || dayCheck===2 || dayCheck===3 || dayCheck===4 || dayCheck===5))
      {
        temp.push(h)
      }
    }
  return temp
}

// Dot colour per habit — cycle through a palette
const palette = [
  "#2B8C64",
  "#4A90D9",
  "#E07B00",
  "#9B59B6",
  "#E74C3C",
  "#1ABC9C",
  "#F39C12",
];
function habitColour(index) {
  return palette[index % palette.length];//using modulo so when it gets to end it just loops
}


function isToday(dateStr) {
  return (dateStr === todayStr);
}
function isFuture(dateStr) {
  return (dateStr > todayStr);
}

//Day click
function clickDay(dateStr) {
  if (!dateStr || isFuture(dateStr)) return;//if blank block at start of month or in the future nothing happens on click
  if(selectedDay.value=== dateStr) {selectedDay.value= null;}
  else {selectedDay.value= dateStr;}
  //either select or deselect
}


</script>

<template>
  <div style="min-height: 100vh; background: #f4f9f6;">

    <Nav />
    <button @click="enlargedDay=null;viewMode = viewMode === 'week' ? 'month' : 'week'" class="btn btn-success">
  {{ viewMode === 'week' ? 'Switch to Month' : 'Switch to Week' }}
    </button>
    <div v-if="viewMode==='week'">
    
      <div v-if="enlargedDay!=null" style="text-align: center;"><button @click="enlargedDay=null" class="navButton"><</button></div>
      <div  class="week row g-2 d-flex justify-content-center align-items-stretch">
        <div v-for="d in displayedDays" @click="enlargedDay=d" :key="d.date" class="col text-center p-4 regDay clickable" :class="{ today: d.day == day, enlarged: enlargedDay!=null}">
          <div>{{ dayNames[d.day] }}</div>
          <div>{{ d.date }}</div>
        <div class="mt-2 border-top pt-2" style="min-height: 50px">
          <div v-for="habit in habitsForDay(d.fullDate)"  class="calendar-event" >
          {{ habit.name }} #
          <span >{{ habit.done ? "Done" : "Missed" }}</span>
          <div v-if="enlargedDay" style="font-size:0.7rem">
              {{habit.des}}
              {{habit.freq }}
          </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    
    <div v-else>
    <div style="max-width: 900px; margin: 0 auto; padding: 32px 24px">
      <!--Month header-->
      <div class="header" style="font-size: 1.4rem; font-weight: 800;">

        <button @click="prevMonth" class="navButton" ><</button>
        <h2>
          {{ monthName }}
        </h2>
        <button @click="nextMonth" class="navButton">></button>

      </div>

      <!--Day of week labels-->
      <div class="weekLabels">
        <div v-for="d in dayNames">
          {{ d }}
        </div>
      </div>

      <!--Calendar grid-->
      <div
        style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px"
      >
        <div
          v-for="(dateStr, i) in calendarDays"
          @click="clickDay(dateStr)"
          class="regDay"
          :class="{select: dateStr===selectedDay, today: isToday(dateStr), clickable: dateStr && !isFuture(dateStr), future: isFuture(dateStr) }"
        >
          <!-- Day number -->
          <div
            v-if="dateStr"
            :class="{select: dateStr===selectedDay, today: isToday(dateStr)}"
            :style="{border:0}"
          >
            {{(dateStr.split("-")[2]) }}
          </div>

          <!-- Habit dots -->
          <div
            v-if="dateStr"
            style="display: flex; flex-wrap: wrap; gap: 3px; margin-top: 2px"
          >
            <div
              v-for="(habit, idx) in habitsForDay(dateStr)"
              class="habitDot"
              :style="{background: habit.done ? habitColour(idx) : '#d4ead9'}"
            ></div>
          </div>
        </div>
      </div>
      </div>
      <!-- ── Legend ── -->
      <div v-if="habits.length" style="display: flex; gap: 12px;">
        <span>Habits:</span>
        <div v-for="(habit, idx) in habits" style="display: flex; align-items: center; gap: 5px">
          <div class="habitDot" :style="{background: habitColour(idx)}"></div>
          {{habit.name}}
        </div>
      </div>

      <!-- ── Day summary panel ── -->
      <div v-if="selectedDay" style="background: #fff; border-radius: 15px; overflow: hidden;">
        <!-- Panel header -->
        <div class="header" style=" background: #2b8c64; padding: 20px;">
          <div style="color: #fff; font-weight: 800;"> <!--White bold text for the date-->
              {{ selectedDay }}
          </div>
          
          <button @click="selectedDay = null" class="navButton">✕</button><!--exit button-->
        </div>

        <!-- Habit info in panel-->
        <div style= "padding: 20px; display: flex; flex-direction: column; gap: 10px;">

          <div v-for="(habit, idx) in habitsForDay(selectedDay)" style="display: flex; align-items: center; gap: 12px">
            <!-- Coloured dot -->
            <div class="habitDot":style="{background: habitColour(idx)}"> </div>

            <!-- Name -->
            <span
              :style="{flex: '1', color: habit.done ? '#000000' : '#aaa'}"> <!--if done then text white-->
              {{ habit.name }}
            </span>

            <!-- Status badge -->
            <span
              :style="{padding: '5px', borderRadius: '100px',
                background: habit.done ? '#d4f0e0' : '#f5f5f5',
                color: habit.done ? '#071c07' : '#aaa',}"><!--If done then green, rounded border-->
              {{ habit.done ? "Done" : "Missed" }}
            </span>
          </div>

          <p v-if="!habitsForDay(selectedDay).length">
            No habits were tracked on this day.
          </p>
        </div>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
.navButton{
  border: 1.5px solid #d4ead9;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 1rem;
  color: #2b8c64;
  background-color: #fff;
}

 .week{
    width: 95vw;
    height: 60vh;
    margin: 10vh auto;
 }

 .calendar-event {
    background-color: #0feb8f;
    color: white;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-bottom: 6px;
    text-align: left;
    transition: 0.2s;
}

.regDay{
  min-height: 72px;
  border-radius: 10px;
  padding: 6px 8px;
  border: 1.5px solid #e4efe6;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: background 150ms;
  font-size: 0.82rem;
  color: #000000;
  font-weight: 600;
  line-height: 1;
}
.today {
  border: 2px solid #2B8C64;
  color: #2B8C64;
  font-weight: 800;
  
}
.clickable{
  cursor: pointer;
}
.future{
  opacity: 0.4;
}
.select{
  background: #2B8C64 !important;
  color: #fff !important;
}
.weekLabels{
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 6px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #5a7a5a;
  padding: 4px 0;
  text-transform: uppercase;
}
.enlarged{
  max-width: 400px; /* restrict width */
}

.habitDot{
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.header{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>