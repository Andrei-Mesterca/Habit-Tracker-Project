<script setup>
import { ref, computed, onMounted } from "vue";
import Nav from "@/components/Nav.vue";
import { useHabits } from "@/composables/UseHabits";

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

// ── Navigation ────────────────────────────────────────────────────────────────
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

// ── Calendar grid ─────────────────────────────────────────────────────────────
const monthName = computed(() =>
  new Date(viewYear.value, viewMonth.value).toLocaleDateString("en-IE", {
    month: "long",
    year: "numeric",
  }),
);

const calendarDays = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(
    viewYear.value,
    viewMonth.value + 1,
    0,
  ).getDate();

  const days = [];

  // Empty cells before the 1st
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(viewMonth.value + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    days.push(`${viewYear.value}-${mm}-${dd}`);
  }

  return days;
});

// ── Per-day data ──────────────────────────────────────────────────────────────

// Returns array of { name, done } for a given date string 
/*function habitsForDay(dateStr) {
  return habits.value.map((h) => ({
    id: h.id,
    name: h.name,
    done: h.completedDates?.includes(dateStr) ?? false,
  }));
}*/
  const habitsForDay = (selectedDay) => {
    let temp=[]
    let habitsMapped=habits.value.map((h) => ({
    id: h.id,
    name: h.name,
    des: h.description,
    freq: h.frequency,
    done: h.completedDates?.includes(selectedDay) ?? false,}));
    const date = new Date(selectedDay) 
    const dayCheck = date.getDay();
    for(const h of habitsMapped){
      if(h.freq=="daily")
      {
        temp.push(h)
      }
      else if (h.freq=="weekly" && dayCheck===1)
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
  return palette[index % palette.length];
}

// Background tint for a day cell based on completion ratio
function dayBg(dateStr) {
  if (!dateStr) return "transparent";
  if (dateStr > todayStr) return "#fff";
  const h = habitsForDay(dateStr);
  if (!h.length) return "#fff";
  const done = h.filter((x) => x.done).length;
  const ratio = done / h.length;
  if (ratio === 1) return "#d4f0e0";
  if (ratio > 0) return "#f0faf4";
  return "#fff";
}

function isToday(dateStr) {
  return dateStr === todayStr;
}
function isFuture(dateStr) {
  return dateStr > todayStr;
}

// ── Day click ─────────────────────────────────────────────────────────────────
function clickDay(dateStr) {
  if (!dateStr || isFuture(dateStr)) return;
  selectedDay.value = selectedDay.value === dateStr ? null : dateStr;
}

const selectedDayHabits = computed(() => {
  if (!selectedDay.value) return [];
  return habitsForDay(selectedDay.value);
});

const selectedDayFormatted = computed(() => {
  if (!selectedDay.value) return "";
  return new Date(selectedDay.value + "T12:00:00").toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const selectedDayCount = computed(() => {
  const done = selectedDayHabits.value.filter((h) => h.done).length;
  return `${done} / ${selectedDayHabits.value.length} completed`;
});
</script>

<template>
  <div
    style="
      min-height: 100vh;
      background: #f4f9f6;
    "
  >
    <Nav />
    <button @click="enlargedDay=null;viewMode = viewMode === 'week' ? 'month' : 'week'" class="btn btn-success">
  {{ viewMode === 'week' ? 'Switch to Month' : 'Switch to Week' }}
    </button>
    <div v-if="viewMode==='week'">
    
      <div v-if="enlargedDay!=null" style="text-align: center; margin-bottom: 12px;"><button @click="enlargedDay=null" class="navButton"><</button></div>
      <div  class="week row g-2 d-flex justify-content-center d-flex align-items-stretch">
        <div v-for="d in displayedDays" @click="enlargedDay=d" :key="d.date" class="col text-center p-4 regDay clickable" :class="{ today: d.day == day, enlarged: enlargedDay!=null}">
          <div>{{ dayNames[d.day] }}</div>
          <div>{{ d.date }}</div>
        <div class="mt-2 border-top pt-2" style="min-height: 50px">
          <div v-for="habit in habitsForDay(d.fullDate)" :key="habit.id" class="calendar-event">
          {{ habit.name }} {{ habit.done ? "✓ Done" : "✗ Missed" }}
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
      <!-- ── Month header ── -->
      <div 
          style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          font-size: 1.4rem; font-weight: 800; color: #071c07; margin: 0 ">

        <button @click="prevMonth" class="navButton" >‹</button>
        <h2 style="">
          {{ monthName }}
        </h2>
        <button @click="nextMonth" class="navButton">›</button>

      </div>

      <!-- ── Day of week labels ── -->
      <div class="weekLabels">
        <div v-for="d in dayNames" :key="d">
          {{ d }}
        </div>
      </div>

      <!-- ── Calendar grid ── -->
      <div
        style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px"
      >
        <div
          v-for="(dateStr, i) in calendarDays"
          :key="i"
          @click="clickDay(dateStr)"
          class="regDay"
          :class="{select: dateStr===selectedDay, today: isToday(dateStr), clickable: dateStr && !isFuture(dateStr), future: isFuture(dateStr) }"
          :style="{background: dateStr === selectedDay ? '#2B8C64' : dayBg(dateStr),}"
        >
          <!-- Day number -->
          <div
            v-if="dateStr"
            :class="{select: dateStr===selectedDay, today: isToday(dateStr)}"
            :style="{border:0}"
          >
            {{ parseInt(dateStr.split("-")[2]) }}
          </div>

          <!-- Habit dots -->
          <div
            v-if="dateStr && !isFuture(dateStr)"
            style="display: flex; flex-wrap: wrap; gap: 3px; margin-top: 2px"
          >
            <div
              v-for="(habit, idx) in habitsForDay(dateStr)"
              :key="habit.id"
              :style="{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: habit.done ? habitColour(idx) : '#d4ead9',
                flexShrink: '0',
              }"
            ></div>
          </div>
        </div>
      </div>
      </div>
      <!-- ── Legend ── -->
      <div
        v-if="habits.length"
        style="
          margin-top: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        "
      >
        <span
          style="
            font-size: 0.75rem;
            font-weight: 700;
            color: #5a7a5a;
            text-transform: uppercase;
          "
          >Habits:</span
        >
        <div
          v-for="(habit, idx) in habits"
          :key="habit.id"
          style="display: flex; align-items: center; gap: 5px"
        >
          <div
            :style="{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: habitColour(idx),
            }"
          ></div>
          <span style="font-size: 0.78rem; color: #3a5a3a; font-weight: 600">{{
            habit.name
          }}</span>
        </div>
      </div>

      <!-- ── Day summary panel ── -->
      <div
        v-if="selectedDay"
        style="
          margin-top: 24px;
          background: #fff;
          border-radius: 14px;
          border: 1.5px solid #d4ead9;
          overflow: hidden;
        "
      >
        <!-- Panel header -->
        <div
          style="
            background: #2b8c64;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <div>
            <div style="color: #fff; font-weight: 800; font-size: 1rem">
              {{ selectedDayFormatted }}
            </div>
            <div style="color: #a8dfc4; font-size: 0.82rem; margin-top: 2px">
              {{ selectedDayCount }}
            </div>
          </div>
          <button
            @click="selectedDay = null"
            style="
              background: rgba(255, 255, 255, 0.2);
              border: none;
              border-radius: 6px;
              color: #fff;
              font-size: 1rem;
              cursor: pointer;
              padding: 4px 10px;
              font-weight: 700;
            "
          >
            ✕
          </button>
        </div>

        <!-- Habit rows -->
        <div
          style="
            padding: 16px 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          "
        >
          <div
            v-for="(habit, idx) in selectedDayHabits"
            :key="habit.id"
            style="display: flex; align-items: center; gap: 12px"
          >
            <!-- Coloured dot -->
            <div
              :style="{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: habitColour(idx),
                flexShrink: '0',
              }"
            ></div>

            <!-- Name -->
            <span
              :style="{
                flex: '1',
                fontWeight: '600',
                fontSize: '0.9rem',
                color: habit.done ? '#071c07' : '#aaa',
                textDecoration: habit.done ? 'none' : 'none',
              }"
              >{{ habit.name }}</span
            >

            <!-- Status badge -->
            <span
              :style="{
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '100px',
                background: habit.done ? '#d4f0e0' : '#f5f5f5',
                color: habit.done ? '#1a6644' : '#aaa',
              }"
            >
              {{ habit.done ? "✓ Done" : "✗ Missed" }}
            </span>
          </div>

          <p
            v-if="!selectedDayHabits.length"
            style="
              color: #aaa;
              font-size: 0.88rem;
              text-align: center;
              padding: 12px 0;
            "
          >
            No habits were tracked on this day.
          </p>
        </div>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
.navButton{
  background: none;
  border: 1.5px solid #d4ead9;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 1.1rem;
  color: #2b8c64;
  font-weight: 700;
}

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
  color: #071c07;
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
</style>