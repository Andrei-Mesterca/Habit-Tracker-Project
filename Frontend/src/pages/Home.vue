<script setup>
    import logo from '@/assets/HabitualLogo.png'  //Logo displayed in the top left corner
    import heroImage from '@/assets/pexels-kunstbube-6818620 (1).jpg' //Abstract background image
    import '@/assets/home.css'  //A new CSS page specifically made for the home page as login CSS style is completely different
</script>

<template>
    <div>
      <header class="navbar"> <!--Creating a nav bar for the pages-->
        <div class="logo"> <!--Displays the Habitual logo-->
          <img :src="logo" alt="Logo" />
        </div>

        <nav>
          <a class="active" href="#">Home</a> <!--This is the active page so will have separate styling properties in the CSS-->
          <a href="#">Your Habits</a><!--This tracks the users habits. Not currently router link as page hasn't been made yet-->
          <router-link to="/cal">Calendar</router-link> <!--This tracks the current date and week while tracking the current progress of a users goals-->
          <router-link to="/login">Log-In</router-link><!--This page sends the user to sign into their account.-->
        </nav>
      </header>

      <section class="hero" :style="{ backgroundImage: `url(${heroImage})` }">  <!--A hero is used to welcome visitors to a webpage-->
        <div class="overlay"></div>

        <div class="hero-inner">  <!--Here is the left hand side of the hero-->
        <div class="hero-content">
          <h1>Design your<br />Discipline!</h1><br> <!--Message on the left and learning more about what the website is about-->
          <h4>Build habits that build you.</h4>
          <a href="#" class="btn">Learn More</a>
        </div>

          <aside class ="hero-side">  <!--This is the right side for a task bar-->
            <div class="glass card">
              <div class="card-top">
                <div>
                  <div class="muted">Today</div>
                  <div class="title">3 habits remaining</div>
                </div>
              </div>
              <div class="checklist">
                <label class="item"><input type="checkbox" /> Workout</label>
                <label class="item"><input type="checkbox" /> Read 10 pages</label>
                <label class="item"><input type="checkbox" /> Meditate</label>
                <button class="add">+ Add Habit</button>
              </div>
            </div>

            <div class="glass card small">
              <div class="card-top">
                <div class="muted">Today</div>
              </div>

              <div class="streak">
                <span class="flame">🔥</span>
                <div>
                  <div class="title">Daily Streak: <b>5 days</b></div>
                  <div class="muted">( Best Streak: 9 days )</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
</template>