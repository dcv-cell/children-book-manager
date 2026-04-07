import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import AddBook from '../views/AddBook.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/add-book', name: 'AddBook', component: AddBook }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
