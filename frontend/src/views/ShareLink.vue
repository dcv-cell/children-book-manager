
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';

const route = useRoute();
const shareLink = ref(null);
const books = ref([]);
const cart = ref([]);
const filters = ref({ age_range: '' });

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.selling_price || 0), 0);
});

const loadShareLink = async () => {
  try {
    const res = await api.getShareLink(route.params.code);
    shareLink.value = res.data.share_link;
    loadBooks();
  } catch (err) {
    alert('分享链接无效或已过期');
  }
};

const loadBooks = async () => {
  try {
    const params = { status: 'available', ...filters.value };
    const res = await api.getBooks(params);
    books.value = res.data.books;
  } catch (err) {
    console.error('加载图书失败:', err);
  }
};

const addToCart = (book) => {
  if (cart.value.push(book);
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};

onMounted(() => {
  loadShareLink();
});
</script>

<template>
  <div v-if="shareLink" class="share-link">
    <h1>📚 儿童绘本挑选</h1>
    
    <div class="filters">
      <select v-model="filters.age_range" @change="loadBooks">
        <option value="">全部年龄</option>
        <option value="0-2岁">0-2岁</option>
        <option value="3-6岁">3-6岁</option>
        <option value="7-10岁">7-10岁</option>
      </select>
    </div>

    <div class="content">
      <div class="book-list">
        <div v-for="book in books" :key="book.id" class="book-card">
          <img v-if="book.cover_url" :src="book.cover_url" alt="封面" class="book-cover" />
          <div class="book-info">
            <h3>{{ book.title }}</h3>
            <p>作者: {{ book.author }}</p>
            <p>售价: ¥{{ book.selling_price }}</p>
            <p>年龄: {{ book.age_range }}</p>
          </div>
          <button class="btn btn-add" @click="addToCart(book)">加入购物车</button>
        </div>
      </div>

      <div class="cart">
        <h2>购物车</h2>
        <div v-if="cart.length === 0" class="empty-cart">购物车是空的</div>
        <div v-else class="cart-items">
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <span>{{ item.title }}</span>
            <span>¥{{ item.selling_price }}</span>
            <button class="btn btn-remove" @click="removeFromCart(index)">×</button>
          </div>
        </div>
        <div class="cart-total">
          <strong>总计: ¥{{ totalPrice.toFixed(2) }}</strong>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<style scoped>
.share-link {
  max-width: 1400px;
  margin: 0 auto;
}

.filters {
  margin-bottom: 2rem;
}

.filters select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
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
  height: 180px;
  object-fit: cover;
  border-radius: 4px;
}

.book-info h3 {
  margin: 0;
  font-size: 1rem;
}

.book-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.85rem;
}

.cart {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.cart h2 {
  margin-top: 0;
}

.empty-cart {
  color: #999;
  text-align: center;
  padding: 2rem 0;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-add {
  background: #42b983;
  color: white;
  margin-top: auto;
}

.btn-remove {
  background: #ff4444;
  color: white;
  padding: 0.25rem 0.5rem;
}

.cart-total {
  font-size: 1.2rem;
  text-align: right;
  padding-top: 1rem;
  border-top: 2px solid #ddd;
}

.loading {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
}
</style>
