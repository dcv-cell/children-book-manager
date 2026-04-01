
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000
});

export default {
  // 图书相关
  getBooks: (params = {}) => api.get('/books', { params }),
  getBook: (id) => api.get(`/books/${id}`),
  getBookByISBN: (isbn) => api.get(`/books/isbn/${isbn}`),
  addBook: (formData) => api.post('/books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateBook: (id, formData) => api.put(`/books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteBook: (id) => api.delete(`/books/${id}`),
  analyzeCover: (formData) => api.post('/books/analyze-cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // 分享链接相关
  createShareLink: (data) => api.post('/share-links', data),
  getShareLink: (code) => api.get(`/share-links/${code}`),
  
  // 购物车相关
  addToCart: (data) => api.post('/carts', data),
  getCart: (shareLinkId) => api.get(`/carts/${shareLinkId}`),
  removeFromCart: (id) => api.delete(`/carts/${id}`)
};
