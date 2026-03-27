<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Chart from "chart.js/auto";
import Nav from "@/components/Nav.vue";
import { useHabits } from "@/composables/UseHabits";
import { useAuth } from '@/composables/useAuth'

const { handleGetHabits } = useHabits();
const { currentUser} = useAuth();

const habits = ref([]);
const today = new Date();

const todayStr = today.toISOString().split("T")[0];

const completedCount = computed(() =>
  habits.value.filter(h => h.completedDays?.includes(todayStr)).length
  )

//current month being viewed
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

function getLast7Days() {
  const days = [];

  for (let i=6; i>=0; i--){
    const d = new Date();
    d.setDate(today.getDate() - i);

    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-IE", { weekday: "short" });

    days.push({ dateStr, label });
  }
  return days;
}
//---------------MONTH BAR CHART
function getMonth() {
  const days = [];

  for (let i = 28; i >= 0; i--){
    const d = new Date();
    d.setDate(today.getDate() - i);

    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-IE", { weekday: "short"});

    days.push({ dateStr, label});
  }
  return days;
}

const monthlyData = computed(() => {
  const days = getMonth();

  return days.map(day => {
    const count = habits.value.filter(h =>
      h.completedDays?.includes(day.dateStr)
    ).length;

    return {
      label: day.label,
      count
    };
  });
});

const weeklyData = computed(() => {
  const days = getLast7Days();
  
  return days.map(day => {
    const count = habits.value.filter(h =>
      h.completedDays?.includes(day.dateStr)
      ).length;

      return {
        label: day.label,
        count
      };
  });
});
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
//------------------Weekly Review
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
//-------------Monthly Review
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
  <div style="min-height:100vh; background:#f4f9f6; font-family:'Montserrat',sans-serif;">
  <Nav />
  <h1 style="font-size:1.8rem; font-weight:800; color:#071c07; margin:0 0 4px; text-align:center;">
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

<style>
    .charts {
        max-width: 1000px; 
        margin: 0 auto; 
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .chart-box {
        background: #fff;
        border: 1.5px solid #d4ead9;
        border-radius: 16px;
        padding: 18px 20px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .pie-chart {
        width: 100%;
        max-width: 400px;
        height: auto;
        aspect-ratio: 1 / 1;
        position: relative;
    }
    .bar-chart {
        width: 100%;
        min-height: 250px;
        position: relative;
    }
    .chart-box canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    p {
        text-align: center; 
        margin-top:16px; 
        font-weight:600;
    }


</style>