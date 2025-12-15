# User Behavior Monitor SDK

轻量级、零依赖的前端用户行为监控 SDK。
专为现代 Web 应用设计，支持 PV/UV 统计、精准停留时长计算、用户点击行为追踪以及 SPA（单页应用）路由监控。

## 核心特性

- ** 基础指标**: 自动采集 **PV** (Page View) 和 **UV** (Unique Visitor)。
- ** 精准停留**: 基于 `visibilitychange` 和 `beforeunload` 精准计算页面实际停留时长。
- ** 点击追踪**: 通过 `data-track-click` 属性实现无侵入式全自动点击埋点。
- ** SPA 支持**: 完美支持 Vue/React 等单页应用的路由跳转监控（Hash & History 模式）。
- ** 稳健上报**: 优先使用 `navigator.sendBeacon` 确保页面关闭时数据不丢失，自动降级 `fetch`。

## 安装

```bash
npm install
npm run build
```

## 快速开始

### 1. 引入 SDK

支持 ES Module (推荐) 或 Script 标签引入。

```javascript
import { initUserBehaviorMonitor } from './dist/index.esm.js';

initUserBehaviorMonitor({
  projectName: 'my-awesome-project', // 项目标识
  reportUrl: 'http://your-server.com/report', // 数据上报地址
});
```

### 2. 自动捕获点击

只需在 HTML 元素上添加 `data-track-click` 属性，SDK 会自动捕获点击并上报。

```html
<!-- 点击后自动上报: { behavior: 'click', action: 'buy_btn', ... } -->
<button data-track-click="buy_btn">立即购买</button>
```

## 运行 Demo

本项目内置了一个基于 Express 的测试环境，方便您直观体验监控效果。

1. **安装依赖**

   ```bash
   npm install
   ```

2. **构建 SDK**

   ```bash
   npm run build
   ```

3. **启动 Demo**

   ```bash
   npm run demo
   ```

   > 终端会显示：`测试服务器已启动! 👉 页面地址: http://localhost:3000/index.html`

4. **体验功能**
   - 打开浏览器访问 `http://localhost:3000/index.html`
   - **点击按钮**: 观察终端输出 `behavior: 'click'`
   - **模拟路由跳转**: 点击 "模拟路由跳转"，观察 `dwell` (旧页面停留) 和 `pv` (新页面) 上报
   - **刷新/关闭页面**: 观察 `dwell` (页面卸载) 上报

## 数据格式示例

SDK 上报的数据格式如下 (JSON):

**PV (页面访问)**

```json
{
  "behavior": "pv",
  "projectName": "demo",
  "pageUrl": "http://localhost:3000/",
  "pv": 15,
  "userId": "xxxx-xxxx"
}
```

**Dwell (停留时长)**

```json
{
  "behavior": "dwell",
  "dwellTime": 4520, // 毫秒
  "pageUrl": "http://localhost:3000/"
}
```

## 开发

- `npm run dev`: 监听源码变化并自动重新构建
- `npm run build`: 生产环境构建 (输出到 `dist/`)
