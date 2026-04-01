
const { Ark } = require('@volcengine/ark');

const client = new Ark({
  apiKey: process.env.VOLCENGINE_API_KEY
});

async function analyzeBookCover(imageBase64) {
  try {
    const response = await client.chat.completions.create({
      model: 'doubao-seed-2.0-vision',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请分析这张图书封面图片，提取以下信息，以 JSON 格式返回，不要包含其他文字：\n{\n  "title": "书名",\n  "author": "作者",\n  "age_range": "适合年龄（如：3-6岁）",\n  "tags": "主题标签（逗号分隔，如：启蒙,科普,故事）"\n}'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ]
    });

    const content = response.choices[0].message.content;
    // 提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (err) {
    console.error('封面分析失败:', err);
    throw err;
  }
}

module.exports = { analyzeBookCover };
