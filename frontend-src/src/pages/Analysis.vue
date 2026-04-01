<script setup>
import { ref, computed, onMounted } from "vue";
import Chart from "chart.js/auto";
import Nav from "@/components/Nav.vue";
import { useHabits } from "@/composables/UseHabits";
import { useAuth } from '@/composables/useAuth'
import '@/assets/analysis.css'

//gets info about the habits and the users name
const { handleGetHabits } = useHabits();
const { currentUser} = useAuth();

const habits = ref([]);
const today = new Date();

const todayStr = today.toISOString().split("T")[0];

//finds what habits were completed today
const completedCount = computed(() =>
  habits.value.filter(h => h.completedDays?.includes(todayStr)).length
  )

const totalHabits = computed(() => habits.value.length)

//Chart.js 
//PIE CHART
const pieChart = ref(null);
let chartInstance = null;

//WEEKLY BAR CHART
const weeklyChart = ref(null);
let barChartInstance = null;

//MONTHLY BAR CHART
const monthlyChart = ref(null);
let barChart2Instance = null;

//function to get the previous days (could be week or month)
function getPreviousDays(numDays) {
  const days = [];   //array to store days
  for (let i=numDays-1; i>=0; i--){
    const d = new Date();   //create date object with current date and time
    d.setDate(today.getDate() - i);  //changes to a previous day
    const dateStr = d.toISOString().split("T")[0];   //converts to appropriate format
    const label = d.toLocaleDateString("en-IE", { weekday: "short" });
    days.push({ dateStr, label });
  }
  return days;
}

//finds habits completed on a certain date
function countCompleted(dateStr){
  return habits.value.filter(h=> h.completedDays?.includes(dateStr)).length;
}
//---------------Gets weekly and monthly data

const weeklyData = computed(() => getPreviousDays(7).map(d=> ({label: d.label, count: countCompleted(d.dateStr)})));
const monthlyData = computed(() => getPreviousDays(30).map(d => ({ label: d.label, count: countCompleted(d.dateStr)})));

//---------------Generate pie chart
function renderPieChart() {
  if(chartInstance) chartInstance.destroy();

  chartInstance = new Chart(pieChart.value, {
    type: "pie",
    data: {
      labels: ["Completed", "Remaining"],
      datasets: [
        {
          data: [
            completedCount.value,
            totalHabits.value - completedCount.value
          ],
          backgroundColor: [
            "#2cc359",
            "#da6c6c"
          ]
        }
      ]
    },
    options: {
      responsive: true,  //makes chart adjust to <div> size
      maintainAspectRatio: false
    }
  });
}
//------------------Generate Bar Chart of Weekly Review
function renderWeeklyChart() {
  if (!weeklyChart.value) return;

  if (barChartInstance) barChartInstance.destroy();

  barChartInstance = new Chart(weeklyChart.value, {
    type: "bar",
    data: {
      labels: weeklyData.value.map(d => d.label),
      datasets: [
        {
          label: "Habits",
          data: weeklyData.value.map(d => d.count),
          backgroundColor: "#43BA64"
        }
      ]
     },
    options: {
      responsive: true,  //makes chart adjust to <div> size
      maintainAspectRatio: false
    }
  });
}
//-------------Generate bar chart of Monthly Review
function renderMonthlyChart() {
  if (!monthlyChart.value) return;

  if (barChart2Instance) barChart2Instance.destroy();

  barChart2Instance = new Chart(monthlyChart.value, {
    type: "bar",
    data: {
      labels: monthlyData.value.map(d => d.label),
      datasets: [
        {
          label: "Habits",
          data: monthlyData.value.map(d => d.count),
          backgroundColor: "#43BA64"
        }
      ]
     },
    options: {
      responsive: true,  //makes chart adjust to <div> size
      maintainAspectRatio: false
    }
  });
}
 
onMounted(async () => {
  try {
    habits.value = await handleGetHabits();
    //load charts
    renderPieChart();
    renderWeeklyChart();
    renderMonthlyChart();
  } catch (e) {
    console.error("Failed to load habits:", e);
  }
});

</script>

<template>
  <div class="openDiv">
  <Nav />
  <h1>
   Habits Progress for {{ currentUser?.displayName || '' }}</h1>
   
   <div class = "charts">
        <div class="chart-box">
            <p> {{ completedCount }} / {{ totalHabits }} Habits Completed Today</p>
        <div class="pie-chart">
            <canvas ref="pieChart"></canvas>
        </div>
    </div>
  
   <div class = "chart-box">
        <p>Weekly Review</p>
        <div class="bar-chart">
            <canvas ref="weeklyChart"></canvas>
        </div>
   </div>
   
   <div class="chart-box">
    <p>Monthly Review</p>
    <div class="bar-chart">
        <canvas ref="monthlyChart"></canvas>
    </div>
   </div>
   </div>
   </div>
</template>