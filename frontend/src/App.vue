
<script setup>
</script>

<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">📚 儿童绘本管理</div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">图书管理</router-link>
        <router-link to="/add-book" class="nav-link">录入图书</router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: #42b983;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
}

.nav-link:hover {
  text-decoration: underline;
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>
