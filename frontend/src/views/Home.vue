
<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const books = ref([]);
const filters = ref({ status: '', age_range: '' });

const loadBooks = async () => {
  try {
    const res = await api.getBooks(filters.value);
    books.value = res.data.books;
  } catch (err) {
    console.error('加载图书失败:', err);
  }
};

const deleteBook = async (id) => {
  if (!confirm('确定要删除这本图书吗？')) return;
  try {
    await api.deleteBook(id);
    loadBooks();
  } catch (err) {
    console.error('删除图书失败:', err);
  }
};

onMounted(() => {
  loadBooks();
});
</script>

<template>
  <div class="home">
    <h1>图书管理</h1>
    
    <div class="filters">
      <select v-model="filters.status" @change="loadBooks">
        <option value="">全部状态</option>
        <option value="available">待售</option>
        <option value="sold">已售</option>
        <option value="kept">自留</option>
      </select>
      <select v-model="filters.age_range" @change="loadBooks">
        <option value="">全部年龄</option>
        <option value="0-2岁">0-2岁</option>
        <option value="3-6岁">3-6岁</option>
        <option value="7-10岁">7-10岁</option>
      </select>
    </div>

    <div class="book-list">
      <div v-for="book in books" :key="book.id" class="book-card">
        <img v-if="book.cover_url" :src="book.cover_url" alt="封面" class="book-cover" />
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <p>作者: {{ book.author }}</p>
          <p>售价: ¥{{ book.selling_price }}</p>
          <p>年龄: {{ book.age_range }}</p>
          <p>位置: {{ book.location }}</p>
          <p>状态: {{ book.status === 'available' ? '待售' : book.status === 'sold' ? '已售' : '自留' }}</p>
        </div>
        <div class="book-actions">
          <button class="btn btn-edit">编辑</button>
          <button class="btn btn-delete" @click="deleteBook(book.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.filters {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
}

.filters select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.book-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.book-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.book-info h3 {
  margin: 0;
  font-size: 1.1rem;
}

.book-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.book-actions {
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit {
  background: #42b983;
  color: white;
}

.btn-delete {
  background: #ff4444;
  color: white;
}
</style>
