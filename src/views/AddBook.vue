
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import storage from '../utils/storage';
import { analyzeBookWithDoubao } from '../utils/doubao';
import { getBookInfoByISBN } from '../utils/openlibrary';
import Quagga from 'quagga';

const router = useRouter();
const route = useRoute();

const isEdit = ref(false);
const loading = ref(false);
const analyzing = ref(false);
const isScanning = ref(false);
const isbn = ref('');
const bookForm = ref({
  title: '',
  author: '',
  publisher: '',
  price: '',
  sellingPrice: '',
  ageRange: '',
  tags: '',
  location: '',
  status: 'available',
  description: '',
  coverUrl: ''
});

const descriptionInput = ref('');
const coverImagePreview = ref('');
const coverImageFile = ref(null);

const loadBookForEdit = async (id) => {
  try {
    const book = await storage.getBook(id);
    if (book) {
      isEdit.value = true;
      bookForm.value = {
        title: book.title || '',
        author: book.author || '',
        publisher: book.publisher || '',
        price: book.price || '',
        sellingPrice: book.sellingPrice || '',
        ageRange: book.ageRange || '',
        tags: book.tags || '',
        location: book.location || '',
        status: book.status || 'available',
        description: book.description || '',
        coverUrl: book.coverUrl || ''
      };
      if (book.coverUrl) {
        coverImagePreview.value = book.coverUrl;
      }
    }
  } catch (err) {
    console.error('加载图书失败:', err);
    alert('加载图书失败');
  }
};

const searchByISBN = async () => {
  if (!isbn.value) {
    alert('请输入ISBN编号');
    return;
  }
  try {
    analyzing.value = true;
    const book = await getBookInfoByISBN(isbn.value);
    if (book) {
      bookForm.value = {
        ...bookForm.value,
        title: book.title || '',
        author: book.author || '',
        publisher: book.publisher || '',
        description: book.description || '',
        coverUrl: book.coverUrl || ''
      };
      if (book.coverUrl) {
        coverImagePreview.value = book.coverUrl;
      }
      alert('ISBN查询成功！请检查并补充信息');
    } else {
      alert('未找到该ISBN对应的图书，请手动填写');
    }
  } catch (err) {
    console.error('ISBN查询失败:', err);
    alert('ISBN查询失败，请检查网络连接或手动填写');
  } finally {
    analyzing.value = false;
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
      console.error('Quagga初始化失败:', err);
      alert('摄像头初始化失败，请检查权限');
      isScanning.value = false;
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

const handleCoverUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过 5MB');
    return;
  }
  
  coverImageFile.value = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    coverImagePreview.value = e.target.result;
    bookForm.value.coverUrl = e.target.result;
  };
  reader.readAsDataURL(file);
};

const analyzeWithDoubao = async () => {
  if (!descriptionInput.value && !coverImageFile.value) {
    alert('请输入图书描述或上传封面图片');
    return;
  }
  
  analyzing.value = true;
  try {
    let imageBase64 = null;
    
    if (coverImageFile.value) {
      const reader = new FileReader();
      imageBase64 = await new Promise((resolve) => {
        reader.onload = (e) => {
          const base64 = e.target.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(coverImageFile.value);
      });
    }
    
    const result = await analyzeBookWithDoubao(descriptionInput.value, imageBase64);
    
    if (result) {
      bookForm.value = {
        ...bookForm.value,
        title: result.title || bookForm.value.title,
        author: result.author || bookForm.value.author,
        publisher: result.publisher || bookForm.value.publisher,
        price: result.price || bookForm.value.price,
        ageRange: result.ageRange || bookForm.value.ageRange,
        tags: result.tags || bookForm.value.tags,
        description: result.description || bookForm.value.description
      };
      alert('智能识别成功！请检查并补充信息');
    }
  } catch (err) {
    console.error('识别失败:', err);
    alert('识别失败: ' + (err.message || '请检查 API Key 配置'));
  } finally {
    analyzing.value = false;
  }
};

const saveBook = async () => {
  if (!bookForm.value.title) {
    alert('请输入书名');
    return;
  }
  
  loading.value = true;
  try {
    if (isEdit.value && route.query.id) {
      await storage.updateBook(route.query.id, bookForm.value);
      alert('更新成功！');
    } else {
      await storage.addBook(bookForm.value);
      alert('添加成功！');
    }
    router.push('/');
  } catch (err) {
    console.error('保存失败:', err);
    alert('保存失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (route.query.id) {
    loadBookForEdit(route.query.id);
  }
});

onUnmounted(() => {
  if (isScanning.value) {
    Quagga.stop();
  }
});
</script>

<template>
  <div class="add-book">
    <h1>{{ isEdit ? '编辑图书' : '添加图书' }}</h1>
    
    <!-- ISBN 扫描区域 -->
    <div class="isbn-section">
      <h3>📖 ISBN 扫码查询</h3>
      <p class="hint">扫描图书封底的ISBN条码，自动获取图书信息</p>
      
      <div class="isbn-input-group">
        <input 
          v-model="isbn" 
          type="text" 
          placeholder="输入或扫描 ISBN" 
          @keyup.enter="searchByISBN"
        />
        <button class="btn btn-primary" @click="searchByISBN" :disabled="analyzing">
          {{ analyzing ? '查询中...' : '查询' }}
        </button>
        <button class="btn" @click="isScanning ? stopScan() : startScan()">
          {{ isScanning ? '停止扫描' : '📷 开始扫描' }}
        </button>
      </div>
      
      <div id="scanner" v-if="isScanning" class="scanner"></div>
    </div>
    
    <!-- AI 识别区域 -->
    <div class="ai-section">
      <h3>🤖 智能识别（可选）</h3>
      <p class="hint">输入图书描述或上传封面图片，让 AI 帮你自动填写信息</p>
      
      <div class="ai-inputs">
        <div class="input-group">
          <label>图书描述</label>
          <textarea 
            v-model="descriptionInput" 
            placeholder="例如：好饿的毛毛虫，艾瑞·卡尔著，适合3-6岁儿童阅读"
            rows="3"
          ></textarea>
        </div>
        
        <div class="input-group">
          <label>封面图片</label>
          <div class="upload-area" @click="$refs.coverInput.click()">
            <div v-if="coverImagePreview" class="preview">
              <img :src="coverImagePreview" alt="封面预览" />
            </div>
            <div v-else class="placeholder">
              <div class="icon">📷</div>
              <p>点击上传封面图片</p>
            </div>
          </div>
          <input 
            ref="coverInput"
            type="file" 
            accept="image/*" 
            @change="handleCoverUpload"
            style="display: none"
          />
        </div>
      </div>
      
      <button 
        class="btn btn-ai" 
        @click="analyzeWithDoubao" 
        :disabled="analyzing"
      >
        {{ analyzing ? '识别中...' : '✨ 智能识别' }}
      </button>
    </div>
    
    <!-- 图书信息表单 -->
    <div class="form-section">
      <h3>📝 图书信息</h3>
      
      <div class="form-grid">
        <div class="input-group">
          <label>书名 *</label>
          <input v-model="bookForm.title" type="text" placeholder="请输入书名" />
        </div>
        
        <div class="input-group">
          <label>作者</label>
          <input v-model="bookForm.author" type="text" placeholder="请输入作者" />
        </div>
        
        <div class="input-group">
          <label>出版社</label>
          <input v-model="bookForm.publisher" type="text" placeholder="请输入出版社" />
        </div>
        
        <div class="input-group">
          <label>定价</label>
          <input v-model="bookForm.price" type="number" step="0.01" placeholder="请输入定价" />
        </div>
        
        <div class="input-group">
          <label>售价</label>
          <input v-model="bookForm.sellingPrice" type="number" step="0.01" placeholder="请输入售价" />
        </div>
        
        <div class="input-group">
          <label>适合年龄</label>
          <select v-model="bookForm.ageRange">
            <option value="">请选择</option>
            <option value="0-2岁">0-2岁</option>
            <option value="3-6岁">3-6岁</option>
            <option value="7-10岁">7-10岁</option>
          </select>
        </div>
        
        <div class="input-group">
          <label>标签</label>
          <input v-model="bookForm.tags" type="text" placeholder="多个标签用逗号分隔" />
        </div>
        
        <div class="input-group">
          <label>存放位置</label>
          <input v-model="bookForm.location" type="text" placeholder="如：书架A-1" />
        </div>
        
        <div class="input-group">
          <label>状态</label>
          <select v-model="bookForm.status">
            <option value="available">待售</option>
            <option value="sold">已售</option>
            <option value="kept">自留</option>
          </select>
        </div>
      </div>
      
      <div class="input-group full-width">
        <label>图书简介</label>
        <textarea 
          v-model="bookForm.description" 
          placeholder="请输入图书简介"
          rows="4"
        ></textarea>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-secondary" @click="router.push('/')">
          取消
        </button>
        <button class="btn btn-primary" @click="saveBook" :disabled="loading">
          {{ loading ? '保存中...' : (isEdit ? '更新' : '保存') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-book {
  max-width: 800px;
  margin: 0 auto;
}

.add-book h1 {
  margin-bottom: 2rem;
}

.isbn-section, .ai-section, .form-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.isbn-section h3, .ai-section h3, .form-section h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.hint {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.isbn-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.isbn-input-group input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.scanner {
  width: 100%;
  height: 400px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.ai-inputs {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .ai-inputs {
    grid-template-columns: 1fr 1fr;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 500;
  color: #333;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #42b983;
}

.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #42b983;
  background: #f5fff9;
}

.preview img {
  max-height: 150px;
  border-radius: 8px;
}

.placeholder .icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.placeholder p {
  margin: 0;
  color: #666;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ai {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 500;
}

.btn-ai:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 600px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3aa876;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}
</style>

