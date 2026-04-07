import axios from 'axios';

/**
 * 使用豆包大模型分析图书信息
 * @param {string} description - 图书描述
 * @param {string} imageBase64 - 图片 base64（可选）
 * @returns {Promise<Object>} 图书信息
 */
export async function analyzeBookWithDoubao(description, imageBase64 = null) {
  try {
    const apiKey = import.meta.env.VITE_VOLCENGINE_API_KEY;
    if (!apiKey) {
      throw new Error('请先配置火山引擎 API Key');
    }

    const modelId = import.meta.env.VITE_VOLCENGINE_MODEL_ID || 'Ark_bd2000000683509497186';
    const endpoint = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    let prompt = '';
    let messages = [];

    if (imageBase64) {
      // 有图片的情况
      prompt = `请分析这张图书封面图片，提取以下信息。
如果图片中还有其他文字描述，也请一并分析。

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

      messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ];
    } else {
      // 只有文字描述的情况
      prompt = `请根据以下图书描述分析这本图书，提取以下信息。
如果描述信息不完整，请根据常见的儿童绘本知识进行合理推测。

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

      messages = [
        {
          role: 'user',
          content: prompt
        }
      ];
    }

    const response = await axios.post(
      endpoint,
      {
        model: modelId,
        messages: messages,
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
      // 转换字段名，使用驼峰命名
      return {
        title: result.title || '',
        author: result.author || '',
        publisher: result.publisher || '',
        price: result.price ? parseFloat(result.price) : null,
        ageRange: result.age_range || '',
        tags: result.tags || '',
        description: result.description || ''
      };
    }
    return null;
  } catch (err) {
    console.error('豆包分析失败:', err.response?.data || err.message);
    throw err;
  }
}

export default {
  analyzeBookWithDoubao
};
