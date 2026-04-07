
import axios from 'axios';

/**
 * 通过 Open Library API 查询图书信息
 * @param {string} isbn - ISBN 编号
 * @returns {Promise<Object|null>} 图书信息
 */
export async function getBookInfoByISBN(isbn) {
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`;
    const response = await axios.get(url);

    const key = `ISBN:${isbn}`;
    if (response.data[key]) {
      const book = response.data[key];
      return {
        title: book.title || '',
        author: book.authors ? book.authors.map(a => a.name).join(', ') : '',
        publisher: book.publishers ? book.publishers.map(p => p.name).join(', ') : '',
        price: null, // Open Library 不提供价格
        ageRange: '', // 需要手动补充
        tags: '',
        description: book.notes || '',
        coverUrl: book.cover ? `https://covers.openlibrary.org/b/id/${book.cover.id}-L.jpg` : ''
      };
    }
    return null;
  } catch (err) {
    console.error('Open Library API 调用失败:', err);
    throw err;
  }
}

export default {
  getBookInfoByISBN
};
