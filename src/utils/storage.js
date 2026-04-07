import localForage from 'localforage';

// 配置 localForage
localForage.config({
  name: 'ChildrenBookManager',
  version: 1.0,
  storeName: 'books',
  description: '儿童绘本二手书管理系统数据存储'
});

/**
 * 获取所有图书
 * @returns {Promise<Array>} 图书列表
 */
export async function getAllBooks() {
  try {
    const keys = await localForage.keys();
    const books = [];
    for (const key of keys) {
      if (key.startsWith('book_')) {
        const book = await localForage.getItem(key);
        if (book) {
          books.push(book);
        }
      }
    }
    // 按创建时间倒序排列
    return books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('获取图书列表失败:', error);
    return [];
  }
}

/**
 * 获取单本图书
 * @param {string} id - 图书ID
 * @returns {Promise<Object|null>} 图书信息
 */
export async function getBook(id) {
  try {
    return await localForage.getItem(`book_${id}`);
  } catch (error) {
    console.error('获取图书失败:', error);
    return null;
  }
}

/**
 * 添加图书
 * @param {Object} book - 图书信息
 * @returns {Promise<Object>} 创建的图书
 */
export async function addBook(book) {
  try {
    const id = Date.now().toString();
    const newBook = {
      id,
      ...book,
      status: book.status || 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await localForage.setItem(`book_${id}`, newBook);
    return newBook;
  } catch (error) {
    console.error('添加图书失败:', error);
    throw error;
  }
}

/**
 * 更新图书
 * @param {string} id - 图书ID
 * @param {Object} updates - 要更新的字段
 * @returns {Promise<Object>} 更新后的图书
 */
export async function updateBook(id, updates) {
  try {
    const existingBook = await getBook(id);
    if (!existingBook) {
      throw new Error('图书不存在');
    }
    const updatedBook = {
      ...existingBook,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await localForage.setItem(`book_${id}`, updatedBook);
    return updatedBook;
  } catch (error) {
    console.error('更新图书失败:', error);
    throw error;
  }
}

/**
 * 删除图书
 * @param {string} id - 图书ID
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteBook(id) {
  try {
    await localForage.removeItem(`book_${id}`);
    return true;
  } catch (error) {
    console.error('删除图书失败:', error);
    return false;
  }
}

/**
 * 生成分享文本
 * @param {Object} book - 图书信息
 * @returns {string} 分享文本
 */
export function generateShareText(book) {
  let text = `【出闲置】${book.title}\n\n`;
  
  if (book.author) {
    text += `✍️ 作者：${book.author}\n`;
  }
  if (book.publisher) {
    text += `🏢 出版社：${book.publisher}\n`;
  }
  if (book.price) {
    text += `💰 定价：${book.price}元\n`;
  }
  if (book.sellingPrice) {
    text += `🎯 售价：${book.sellingPrice}元\n`;
  }
  if (book.ageRange) {
    text += `👶 适合年龄：${book.ageRange}\n`;
  }
  if (book.location) {
    text += `📍 存放位置：${book.location}\n`;
  }
  if (book.tags) {
    text += `🏷️ 标签：${book.tags}\n`;
  }
  
  text += `\n📖 绘本状态：品相好\n\n`;
  text += `💡 说明：二手绘本，一经售出不退不换，介意慎拍。`;
  
  return text;
}

/**
 * 导出所有数据
 * @returns {Promise<string>} JSON 字符串
 */
export async function exportData() {
  try {
    const books = await getAllBooks();
    return JSON.stringify({
      version: '1.0',
      exportAt: new Date().toISOString(),
      books
    }, null, 2);
  } catch (error) {
    console.error('导出数据失败:', error);
    throw error;
  }
}

/**
 * 导入数据
 * @param {string} jsonString - JSON 字符串
 * @returns {Promise<number>} 导入的图书数量
 */
export async function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.books || !Array.isArray(data.books)) {
      throw new Error('无效的数据格式');
    }
    
    let count = 0;
    for (const book of data.books) {
      const id = book.id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
      await localForage.setItem(`book_${id}`, {
        ...book,
        id,
        createdAt: book.createdAt || new Date().toISOString(),
        updatedAt: book.updatedAt || new Date().toISOString()
      });
      count++;
    }
    
    return count;
  } catch (error) {
    console.error('导入数据失败:', error);
    throw error;
  }
}

export default {
  getAllBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  generateShareText,
  exportData,
  importData
};
