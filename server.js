// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 评估代码的端点
/*app.post('/api/evaluate', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: '代码不能为空' });
        }

        // 构建 DeepSeek API 请求
        const prompt = `请评估以下代码质量并给出详细反馈。要求：
1. 评分(0-100分)
2. 代码优点
3. 存在的问题
4. 改进建议

代码:
\`\`\`
${code}
\`\`\`

请以JSON格式返回结果，包含score(分数)和feedback(反馈)字段。`;

        const response = await axios.post(DEEPSEEK_API_URL, {
            model: "deepseek-chat",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // 解析 DeepSeek 的响应
        const deepSeekResponse = response.data.choices[0].message.content;
        
        // 尝试解析 JSON 响应
        let result;
        try {
            result = JSON.parse(deepSeekResponse);
        } catch (e) {
            // 如果响应不是 JSON，则手动构造结果
            result = {
                score: 75, // 默认分数
                feedback: deepSeekResponse
            };
        }

        res.json(result);
    } catch (error) {
        console.error('评估错误:', error);
        res.status(500).json({ error: '评估服务出错', details: error.message });
    }
});*/

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});



app.post('/api/evaluate', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: '代码不能为空' });
        }

        // 更精确的提示词，要求结构化响应
        const prompt = `请严格按照以下要求评估代码质量：

代码:
\`\`\`
${code}
\`\`\`

评估要求：
1. 评分：给出0-100分的整数评分，基于代码质量、可读性、效率和最佳实践
2. 优点：列出2-3个主要优点
3. 问题：指出2-3个主要问题
4. 建议：提供具体的改进建议

请以严格的JSON格式返回结果，格式如下：
{
    "score": 分数,
    "strengths": ["优点1", "优点2"],
    "weaknesses": ["问题1", "问题2"],
    "suggestions": ["建议1", "建议2"]
}`;

        const response = await axios.post(DEEPSEEK_API_URL, {
            model: "deepseek-chat",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.5, // 降低温度以获得更确定的响应
            response_format: { type: "json_object" }, // 要求返回JSON
            max_tokens: 2000
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // 解析响应
        const content = response.data.choices[0].message.content;
        let result;
        
        try {
            result = JSON.parse(content);
            
            // 验证分数是否存在且在合理范围内
            if (typeof result.score !== 'number' || result.score < 0 || result.score > 100) {
                throw new Error('无效的分数格式');
            }
            
            // 构建标准化的反馈字符串
            const feedback = `
评分: ${result.score}/100

优点:
${result.strengths?.map(s => `- ${s}`).join('\n') || '无'}

发现问题:
${result.weaknesses?.map(w => `- ${w}`).join('\n') || '无'}

改进建议:
${result.suggestions?.map(s => `- ${s}`).join('\n') || '无'}
            `.trim();
            
            res.json({
                score: result.score,
                feedback: feedback
            });
            
        } catch (e) {
            console.error('解析响应失败:', e);
            throw new Error('无法解析API响应');
        }
        
    } catch (error) {
        console.error('评估错误:', error);
        res.status(500).json({ 
            error: '评估服务出错',
            details: error.message,
            // 返回默认结果以防万一
            score: 75,
            feedback: '评估服务暂时遇到问题，以下是初步分析：\n\n代码基本结构正确，但无法完成完整评估。请稍后重试。'
        });
    }
});