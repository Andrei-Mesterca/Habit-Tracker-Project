<script setup>
import { ref, computed, onMounted } from "vue";
import Nav from "@/components/Nav.vue";
import { useHabits } from "@/composables/useHabits";

const { handleGetHabits } = useHabits();

const habits = ref([]);
const today = new Date();
const todayStr = today.toISOString().split("T")[0];

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
function habitsForDay(dateStr) {
  return habits.value.map((h) => ({
    id: h.id,
    name: h.name,
    done: h.completedDates?.includes(dateStr) ?? false,
  }));
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
      font-family: &quot;Montserrat&quot;, sans-serif;
    "
  >
    <Nav />

    <div style="max-width: 900px; margin: 0 auto; padding: 32px 24px">
      <!-- ── Month header ── -->
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        "
      >
        <button
          @click="prevMonth"
          style="
            background: none;
            border: 1.5px solid #d4ead9;
            border-radius: 8px;
            padding: 8px 14px;
            cursor: pointer;
            font-size: 1.1rem;
            color: #2b8c64;
            font-weight: 700;
          "
        >
          ‹
        </button>
        <h2
          style="font-size: 1.4rem; font-weight: 800; color: #071c07; margin: 0"
        >
          {{ monthName }}
        </h2>
        <button
          @click="nextMonth"
          style="
            background: none;
            border: 1.5px solid #d4ead9;
            border-radius: 8px;
            padding: 8px 14px;
            cursor: pointer;
            font-size: 1.1rem;
            color: #2b8c64;
            font-weight: 700;
          "
        >
          ›
        </button>
      </div>

      <!-- ── Day of week labels ── -->
      <div
        style="
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          margin-bottom: 6px;
        "
      >
        <div
          v-for="d in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
          :key="d"
          style="
            text-align: center;
            font-size: 0.75rem;
            font-weight: 700;
            color: #5a7a5a;
            padding: 4px 0;
            text-transform: uppercase;
          "
        >
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
          :style="{
            minHeight: '72px',
            borderRadius: '10px',
            padding: '6px 8px',
            background: dateStr === selectedDay ? '#2B8C64' : dayBg(dateStr),
            border: isToday(dateStr)
              ? '2px solid #2B8C64'
              : '1.5px solid #e4efe6',
            cursor: dateStr && !isFuture(dateStr) ? 'pointer' : 'default',
            opacity: isFuture(dateStr) ? '0.4' : '1',
            transition: 'background 150ms',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }"
        >
          <!-- Day number -->
          <div
            v-if="dateStr"
            :style="{
              fontSize: '0.82rem',
              fontWeight: isToday(dateStr) ? '800' : '600',
              color:
                dateStr === selectedDay
                  ? '#fff'
                  : isToday(dateStr)
                    ? '#2B8C64'
                    : '#071c07',
              lineHeight: '1',
            }"
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
