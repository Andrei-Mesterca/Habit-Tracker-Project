<script setup>
    import { ref, computed } from 'vue'
    const d = ref(new Date());
    const day = computed(() => d.value.getDay())
    const date = computed(() => d.value.getDate())
    const formattedDate = computed(() => d.value.toDateString())
    const mondayDate = computed(() => date.value-day.value)
    const week = ref([])
    
    for (let i = 0; i < 7; i++) {
    week.value.push({
        day: i,
        date: mondayDate.value + i
    })
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

</script>
<template>
  <div  class="week row g-2 d-flex justify-content-center d-flex align-items-center ">
    <div v-for="d in week" :key="d.date" class="col text-center border rounded bg-light bg-opacity-75 p-4">
        <div>{{ dayNames[d.day] }}</div>
        <div>{{ d.date }}</div>
        <div class="mt-2 border-top pt-2" style="min-height: 80px">
        <!-- events go here -->
        </div>
    </div>
  </div>
</template>

<style scoped>
 .week{
    height:100vh;
 }
</style>