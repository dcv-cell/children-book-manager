
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import AddBook from '../views/AddBook.vue';
import ShareLink from '../views/ShareLink.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/add-book', name: 'AddBook', component: AddBook },
  { path: '/share/:code', name: 'ShareLink', component: ShareLink }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
