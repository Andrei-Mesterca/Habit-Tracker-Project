<script setup>
    import Nav from '@/components/Nav.vue'
    import { ref } from 'vue'
    import { onMounted } from "vue";
    import { useHabits } from "@/composables/useHabits";
    const login = ref('false');

    const { loading, error, handleGetHabits, handleUpsertHabit } = useHabits();
    const habits = ref([]);

</script>
<template>
    <div class="container">
        <Nav />
        <!--temporay nav bar to see all pages, Rian please put your actual home page here -Poppy -->
    </div>


</template>

<style>

</style>