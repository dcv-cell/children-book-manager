
const https = require('https');

// 通过 Open Library API 查询图书信息
function getBookInfoByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'openlibrary.org',
      path: `/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const key = `ISBN:${isbn}`;
          
          if (result[key]) {
            const book = result[key];
            resolve({
              title: book.title || '',
              author: book.authors ? book.authors.map(a => a.name).join(', ') : '',
              publisher: book.publishers ? book.publishers.map(p => p.name).join(', ') : '',
              price: null, // Open Library 不提供价格
              age_range: '', // 需要手动补充
              cover_url: book.cover ? `https://covers.openlibrary.org/b/id/${book.cover.id}-L.jpg` : ''
            });
          } else {
            resolve(null);
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

module.exports = { getBookInfoByISBN };
