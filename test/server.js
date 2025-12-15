import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 1. 开启 CORS 允许跨域请求
app.use(cors());

// 2. 支持解析 JSON 和 sendBeacon 发送的文本数据
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

// 3. 静态资源服务
// 服务 dist 目录，以便 HTML 可以访问构建后的 SDK
app.use('/dist', express.static(path.join(__dirname, '../dist')));
// 服务 test 目录中的静态文件（如 index.html）
app.use(express.static(__dirname));

// 4. 接收上报数据的接口
app.post('/report', (req, res) => {
  let data = req.body;

  // 兼容处理：有时 sendBeacon 的数据会被识别为 string，需要手动 parse
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      // 忽略解析错误
    }
  }

  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] 📡 收到上报数据 (${data.behavior}):`);
  console.log(JSON.stringify(data, null, 2));
  console.log('--------------------------------------------------');

  // 204 No Content 是上报接口常用的响应码
  res.status(204).send();
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
🚀 测试服务器已启动!
👉 页面地址: http://localhost:${PORT}/index.html
👉 上报接口: http://localhost:${PORT}/report
  `);
});
