# L2Web • 吳奕霆 個人入口網站 & 極光動態時鐘

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://dds852456tw.github.io/L2Web/)
[![GitHub repo](https://img.shields.io/badge/Repository-dds852456tw/L2Web-darkblue?style=for-the-badge&logo=github)](https://github.com/dds852456tw/L2Web)

> 現代深色極光毛玻璃（Aurora Glassmorphism）風格的個人入口網站、高精度即時動態時鐘與專案展示中心。

---

## 🌐 Live Demo
👉 **線上即時預覽：[https://dds852456tw.github.io/L2Web/](https://dds852456tw.github.io/L2Web/)**

---

## ✨ 核心特色與亮點 (Features)

### 1. ⏱️ 極光高精度時鐘引擎 (Precision Timekeeper)
- **高精度運算**：採用 `requestAnimationFrame` 平滑循環，精準呈現時、分、秒、毫秒（ms）以及 UNIX 紀元時間戳。
- **SVG 動態秒數進度環**：環形漸層光圈隨秒數流暢轉動，搭配跳秒心跳脈衝。
- **12H / 24H 雙模式即時切換**：自動適應 AM/PM 動態標籤。
- **時鐘嘀嗒擬真音效**：內建 Procedural Web Audio API，無需外掛音檔即時合成機械擺鐘音效（支援一鍵靜音）。

### 2. 🌌 多主題極光毛玻璃美學 (Themes & Glassmorphism)
- **三大主題循環切換**：
  - 🌌 **Aurora（預設極光）**：深邃賽博夜空，搭配藍紫交織的動態漂浮光球。
  - ⚪ **Minimal（極簡黑白）**：瑞士包浩斯現代極簡風。
  - 🌅 **Sunset（夕陽暮光）**：暖橘瑰麗漸層霞光。
- **3D 互動視差傾斜（Interactive 3D Tilt）**：滑鼠懸停時卡片隨游標細膩傾斜，展現景深立體感。

### 3. 📂 抽屜式作品集與個人探索器 (Portfolio Drawer)
- **非同步動態載入**：自動讀取 `projects.json`，展現 AIoT、Edge AI、嵌入式與 Web 專案卡片。
- **多分頁系統**：支援「精選專案 (Projects)」、「關於我 (About)」、「聯繫方式 (Connect)」。
- **鍵盤快捷鍵極致體驗**：
  - `ESC`：關閉側邊抽屜
  - `Z`：一鍵進入 **Zen Mode（專注全螢幕桌面時鐘模式）**
  - `C`：一鍵複製格式化當前時間戳至剪貼簿

### 4. 👤 個人化設定即時持久化 (State Persistence)
- 姓名、稱號支援點擊直接編輯（Inline Editing）。
- 所有自訂設定與主題狀態即時儲存至 `localStorage`，刷新頁面不遺失。

---

## 🛠️ 技術棧 (Tech Stack)

- **核心技術**：純原生 HTML5、現代 CSS3 (CSS Variables, Backdrop Filter)、Vanilla JavaScript (ES6+)。
- **音訊引擎**：Web Audio API (Oscillator & Gain Node 實時音效合成)。
- **字體設計**：[Outfit](https://fonts.google.com/specimen/Outfit)（現代幾何無襯線體）、[JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)（等寬數字字型）。
- **架構原則**：單一狀態樹（Single State Tree）、響應式無障礙設計（A11y ARIA compliant）。

---

## 🚀 本地快速啟動 (Getting Started)

本專案無需任何繁雜的建置流程，直接開箱即用：

```bash
# 1. 複製倉庫
git clone https://github.com/dds852456tw/L2Web.git
cd L2Web

# 2. 本地啟動伺服器 (支援讀取 projects.json)
python -m http.server 8080
```

瀏覽器打開 [http://localhost:8080](http://localhost:8080) 即可使用！

---

## 📢 開啟 GitHub Pages 部署指南

若要在您個人的 GitHub 倉庫啟用 Live Demo，請按以下步驟操作：
1. 前往倉庫設定頁面：`https://github.com/dds852456tw/L2Web/settings/pages`
2. 在 **Build and deployment** > **Branch** 中選擇：
   - 分支：`main`
   - 資料夾：`/ (root)`
3. 點擊 **Save**，約 1~2 分鐘後即可透過 [https://dds852456tw.github.io/L2Web/](https://dds852456tw.github.io/L2Web/) 存取！
