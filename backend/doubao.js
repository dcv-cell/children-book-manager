const axios = require('axios');

/**
 * 使用豆包大模型分析图书信息（通过 ISBN 或文本描述）
 * @param {string} isbn - ISBN 号码
 * @param {string} description - 图书描述（可选，当 ISBN 查询失败时使用）
 * @returns {Promise<Object>} 图书信息
 */
async function analyzeBookWithDoubao(isbn, description = '') {
  try {
    const apiKey = process.env.VOLCENGINE_API_KEY;
    if (!apiKey) {
      throw new Error('未配置 VOLCENGINE_API_KEY');
    }

    // 从环境变量获取模型 ID，如果没有则使用默认值
    const modelId = process.env.VOLCENGINE_MODEL_ID || 'doubao-seed-2-0-code-250615';
    const endpoint = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    let prompt = '';
    if (isbn) {
      prompt = `请根据 ISBN "${isbn}" 分析这本图书，提取以下信息。
如果无法通过 ISBN 获取信息，请根据常见的儿童绘本知识进行合理推测。

请以 JSON 格式返回，不要包含其他文字：
{
  "title": "书名",
  "author": "作者",
  "publisher": "出版社",
  "price": "定价（数字，如：39.80）",
  "age_range": "适合年龄（如：3-6岁）",
  "tags": "主题标签（逗号分隔，如：启蒙,科普,故事）",
  "description": "图书简介（50-100字）"
}`;
    } else if (description) {
      prompt = `请根据以下图书描述分析这本图书，提取以下信息。
请以 JSON 格式返回，不要包含其他文字：
{
  "title": "书名",
  "author": "作者",
  "publisher": "出版社",
  "price": "定价（数字，如：39.80）",
  "age_range": "适合年龄（如：3-6岁）",
  "tags": "主题标签（逗号分隔，如：启蒙,科普,故事）",
  "description": "图书简介（50-100字）"
}

图书描述：${description}`;
    } else {
      throw new Error('需要提供 ISBN 或图书描述');
    }

    const response = await axios.post(
      endpoint,
      {
        model: modelId,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    // 提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      // 确保价格是数字
      if (result.price && typeof result.price === 'string') {
        result.price = parseFloat(result.price.replace(/[^\d.]/g, ''));
      }
      return result;
    }
    return null;
  } catch (err) {
    console.error('豆包分析失败:', err.response?.data || err.message);
    throw err;
  }
}

/**
 * 混合模式：先尝试 Open Library API，失败后使用豆包大模型
 * @param {string} isbn - ISBN 号码
 * @returns {Promise<Object>} 图书信息
 */
async function getBookInfoHybrid(isbn) {
  const { getBookInfoByISBN } = require('./isbn');
  
  try {
    // 先尝试 Open Library API
    console.log(`尝试通过 Open Library 查询 ISBN: ${isbn}`);
    const openLibraryResult = await getBookInfoByISBN(isbn);
    
    if (openLibraryResult && openLibraryResult.title) {
      console.log('Open Library 查询成功');
      // 如果 Open Library 返回的信息不完整，尝试用豆包补充
      if (!openLibraryResult.age_range || !openLibraryResult.tags) {
        try {
          console.log('尝试使用豆包补充信息...');
          const doubaoResult = await analyzeBookWithDoubao(isbn);
          if (doubaoResult) {
            return {
              ...openLibraryResult,
              age_range: openLibraryResult.age_range || doubaoResult.age_range || '',
              tags: openLibraryResult.tags || doubaoResult.tags || '',
              description: doubaoResult.description || ''
            };
          }
        } catch (doubaoErr) {
          console.log('豆包补充失败，继续使用 Open Library 结果:', doubaoErr.message);
        }
      }
      return openLibraryResult;
    }
  } catch (openLibErr) {
    console.log('Open Library 查询失败:', openLibErr.message);
  }
  
  // Open Library 失败，尝试豆包大模型
  console.log('尝试通过豆包大模型查询...');
  try {
    const doubaoResult = await analyzeBookWithDoubao(isbn);
    if (doubaoResult) {
      console.log('豆包查询成功');
      return doubaoResult;
    }
  } catch (doubaoErr) {
    console.log('豆包查询也失败，返回基本信息:', doubaoErr.message);
  }
  
  // 都失败了，返回基本信息结构
  console.log('所有查询方式都失败，返回空结果');
  return null;
}

module.exports = {
  analyzeBookWithDoubao,
  getBookInfoHybrid
};
