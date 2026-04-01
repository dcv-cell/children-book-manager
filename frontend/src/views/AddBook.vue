
<script setup>
import { ref } from 'vue';
import api from '../api';
import Quagga from 'quagga';

const isbn = ref('');
const bookForm = ref({
  title: '',
  author: '',
  publisher: '',
  price: '',
  selling_price: '',
  age_range: '',
  tags: '',
  location: '',
  status: 'available',
  cover_url: ''
});
const photos = ref([]);
const isScanning = ref(false);

const searchByISBN = async () => {
  if (!isbn.value) return;
  try {
    const res = await api.getBookByISBN(isbn.value);
    const book = res.data.book;
    bookForm.value = {
      ...bookForm.value,
      title: book.title || '',
      author: book.author || '',
      publisher: book.publisher || '',
      price: book.price || '',
      cover_url: book.cover_url || ''
    };
  } catch (err) {
    alert('未找到该 ISBN 对应的图书，请手动填写');
  }
};

const startScan = () => {
  isScanning.value = true;
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#scanner'),
      constraints: {
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader"]
    }
  }, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected((data) => {
    isbn.value = data.codeResult.code;
    stopScan();
    searchByISBN();
  });
};

const stopScan = () => {
  isScanning.value = false;
  Quagga.stop();
};

const handlePhotoChange = (e) => {
  photos.value = Array.from(e.target.files);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  Object.keys(bookForm.value).forEach(key => {
    if (bookForm.value[key]) {
      formData.append(key, bookForm.value[key]);
    }
  });
  formData.append('isbn', isbn.value);
  photos.value.forEach(photo => {
    formData.append('photos', photo);
  });

  try {
    await api.addBook(formData);
    alert('图书添加成功！');
    isbn.value = '';
    bookForm.value = {
      title: '',
      author: '',
      publisher: '',
      price: '',
      selling_price: '',
      age_range: '',
      tags: '',
      location: '',
      status: 'available',
      cover_url: ''
    };
    photos.value = [];
  } catch (err) {
    console.error('添加图书失败:', err);
    alert('添加图书失败');
  }
};
</script>

<template>
  <div class="add-book">
    <h1>录入图书</h1>

    <div class="isbn-section">
      <label>ISBN 编号</label>
      <div class="isbn-input-group">
        <input v-model="isbn" type="text" placeholder="输入或扫描 ISBN" />
        <button @click="searchByISBN" class="btn btn-primary">查询</button>
        <button @click="isScanning ? stopScan() : startScan()" class="btn">
          {{ isScanning ? '停止扫描' : '开始扫描' }}
        </button>
      </div>
      <div id="scanner" v-if="isScanning" class="scanner"></div>
    </div>

    <form @submit="handleSubmit" class="book-form">
      <div class="form-group">
        <label>书名</label>
        <input v-model="bookForm.title" type="text" required />
      </div>
      <div class="form-group">
        <label>作者</label>
        <input v-model="bookForm.author" type="text" />
      </div>
      <div class="form-group">
        <label>出版社</label>
        <input v-model="bookForm.publisher" type="text" />
      </div>
      <div class="form-group">
        <label>定价</label>
        <input v-model="bookForm.price" type="number" step="0.01" />
      </div>
      <div class="form-group">
        <label>售价</label>
        <input v-model="bookForm.selling_price" type="number" step="0.01" required />
      </div>
      <div class="form-group">
        <label>适合年龄</label>
        <select v-model="bookForm.age_range">
          <option value="">请选择</option>
          <option value="0-2岁">0-2岁</option>
          <option value="3-6岁">3-6岁</option>
          <option value="7-10岁">7-10岁</option>
        </select>
      </div>
      <div class="form-group">
        <label>主题标签（逗号分隔）</label>
        <input v-model="bookForm.tags" type="text" placeholder="如：启蒙, 科普, 故事" />
      </div>
      <div class="form-group">
        <label>存放位置</label>
        <input v-model="bookForm.location" type="text" placeholder="如：书架 A-3" />
      </div>
      <div class="form-group">
        <label>状态</label>
        <select v-model="bookForm.status">
          <option value="available">待售</option>
          <option value="sold">已售</option>
          <option value="kept">自留</option>
        </select>
      </div>
      <div class="form-group">
        <label>封面 URL</label>
        <input v-model="bookForm.cover_url" type="url" />
      </div>
      <div class="form-group">
        <label>实物照片（最多 5 张）</label>
        <input type="file" multiple accept="image/*" @change="handlePhotoChange" />
      </div>
      <button type="submit" class="btn btn-primary btn-large">保存图书</button>
    </form>
  </div>
</template>

<style scoped>
.add-book {
  max-width: 800px;
  margin: 0 auto;
}

.isbn-section {
  margin-bottom: 2rem;
}

.isbn-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.isbn-input-group input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.scanner {
  width: 100%;
  height: 400px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.book-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-large {
  width: 100%;
  margin-top: 1rem;
}
</style>
