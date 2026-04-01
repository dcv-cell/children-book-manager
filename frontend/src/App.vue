
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
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.nav-brand {
  font-size: 1.25rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: rgba(255,255,255,0.1);
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255,255,255,0.2);
  text-decoration: underline;
}

.main-content {
  flex: 1;
  padding: 1rem;
}

/* 平板/桌面端优化 */
@media (min-width: 768px) {
  .navbar {
    flex-direction: row;
    justify-content: space-between;
    padding: 1rem 2rem;
  }

  .nav-brand {
    font-size: 1.5rem;
  }

  .main-content {
    padding: 2rem;
  }
}
</style>
