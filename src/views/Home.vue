<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import storage from '../utils/storage';

const router = useRouter();
const books = ref([]);
const filters = ref({ status: '', ageRange: '' });

const filteredBooks = computed(() => {
  return books.value.filter(book => {
    const statusMatch = !filters.value.status || book.status === filters.value.status;
    const ageMatch = !filters.value.ageRange || book.ageRange === filters.value.ageRange;
    return statusMatch && ageMatch;
  });
});

const loadBooks = async () => {
  try {
    books.value = await storage.getAllBooks();
  } catch (err) {
    console.error('加载图书失败:', err);
    alert('加载图书失败，请刷新重试');
  }
};

const deleteBook = async (id) => {
  if (!confirm('确定要删除这本图书吗？')) return;
  try {
    await storage.deleteBook(id);
    loadBooks();
  } catch (err) {
    console.error('删除图书失败:', err);
    alert('删除图书失败');
  }
};

const shareBook = (book) => {
  const shareText = storage.generateShareText(book);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('分享文本已复制到剪贴板！');
    }).catch(() => {
      fallbackCopy(shareText);
    });
  } else {
    fallbackCopy(shareText);
  }
};

const fallbackCopy = (text) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    alert('分享文本已复制到剪贴板！');
  } catch (err) {
    alert('复制失败，请手动复制:\n\n' + text);
  }
  document.body.removeChild(textarea);
};

const editBook = (id) => {
  router.push(`/add-book?id=${id}`);
};

const exportAllData = async () => {
  try {
    const jsonString = await storage.exportData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `children-books-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('导出失败:', err);
    alert('导出失败');
  }
};

const importData = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const count = await storage.importData(e.target.result);
      alert(`成功导入 ${count} 本图书！`);
      loadBooks();
    } catch (err) {
      console.error('导入失败:', err);
      alert('导入失败，请检查文件格式');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
};

onMounted(() => {
  loadBooks();
});
</script>

<template>
  <div class="home">
    <div class="page-header">
      <h1>图书管理</h1>
      <div class="header-actions">
        <label class="btn btn-import">
          📥 导入数据
          <input type="file" accept=".json" @change="importData" style="display: none" />
        </label>
        <button class="btn btn-export" @click="exportAllData">📤 导出数据</button>
      </div>
    </div>
    
    <div class="filters">
      <select v-model="filters.status">
        <option value="">全部状态</option>
        <option value="available">待售</option>
        <option value="sold">已售</option>
        <option value="kept">自留</option>
      </select>
      <select v-model="filters.ageRange">
        <option value="">全部年龄</option>
        <option value="0-2岁">0-2岁</option>
        <option value="3-6岁">3-6岁</option>
        <option value="7-10岁">7-10岁</option>
      </select>
    </div>

    <div v-if="filteredBooks.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <p>还没有图书，去添加一本吧！</p>
      <router-link to="/add-book" class="btn btn-primary">+ 添加图书</router-link>
    </div>

    <div v-else class="book-list">
      <div v-for="book in filteredBooks" :key="book.id" class="book-card">
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <p v-if="book.author">作者: {{ book.author }}</p>
          <p v-if="book.publisher">出版社: {{ book.publisher }}</p>
          <p v-if="book.sellingPrice">售价: ¥{{ book.sellingPrice }}</p>
          <p v-if="book.ageRange">年龄: {{ book.ageRange }}</p>
          <p v-if="book.location">位置: {{ book.location }}</p>
          <p class="status-badge" :class="book.status">
            {{ book.status === 'available' ? '待售' : book.status === 'sold' ? '已售' : '自留' }}
          </p>
        </div>
        <div class="book-actions">
          <button class="btn btn-share" @click="shareBook(book)">📋 分享</button>
          <button class="btn btn-edit" @click="editBook(book.id)">✏️ 编辑</button>
          <button class="btn btn-delete" @click="deleteBook(book.id)">🗑️ 删除</button>
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.filters {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filters select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.book-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* 平板端（2列） */
@media (min-width: 600px) {
  .book-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
  }
}

/* 桌面端（3+列） */
@media (min-width: 1024px) {
  .book-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }
}

.book-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.book-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.15rem;
  color: #333;
}

.book-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.status-badge.available {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.sold {
  background: #ffebee;
  color: #c62828;
}

.status-badge.kept {
  background: #e3f2fd;
  color: #1565c0;
}

.book-actions {
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b983;
  color: white;
  text-decoration: none;
  display: inline-block;
}

.btn-primary:hover {
  background: #3aa876;
}

.btn-share {
  background: #e3f2fd;
  color: #1976d2;
  flex: 1;
}

.btn-share:hover {
  background: #bbdefb;
}

.btn-edit {
  background: #fff3e0;
  color: #ef6c00;
  flex: 1;
}

.btn-edit:hover {
  background: #ffe0b2;
}

.btn-delete {
  background: #ffebee;
  color: #c62828;
}

.btn-delete:hover {
  background: #ffcdd2;
}

.btn-import, .btn-export {
  background: #f5f5f5;
  color: #333;
}

.btn-import:hover, .btn-export:hover {
  background: #e0e0e0;
}
</style>
