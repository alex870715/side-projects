# 📝 待辦事項清單 (Todo List)

一個功能完整的待辦事項管理應用，支援日期管理、月曆視圖和智能篩選，使用純 HTML、CSS 和 JavaScript 開發。

![Todo List Preview](https://img.shields.io/badge/Status-Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ 功能特色

- 🎨 **現代化設計** - 使用漸層背景和圓角設計，視覺效果優美
- 📱 **響應式設計** - 完美支援桌面和行動裝置
- 📅 **日期管理** - 為每個待辦事項設定日期，支援日期篩選
- 📊 **月曆視圖** - 直觀的月曆介面，一目了然查看每日任務
- 🔄 **雙視圖模式** - 清單視圖和月曆視圖自由切換
- 💾 **本地儲存** - 使用 LocalStorage 自動儲存您的待辦事項
- 🔍 **智能篩選** - 可篩選全部、進行中、已完成、今日、即將到期
- ✏️ **編輯功能** - 隨時編輯任何待辦事項內容和日期
- 🗑️ **批量清除** - 一鍵清除已完成或全部任務
- 📊 **統計資訊** - 即時顯示總計、已完成和今日任務數量
- 🔔 **通知系統** - 操作時會顯示友善的通知訊息
- ⚡ **快速操作** - 支援 Enter 鍵快速新增任務

## 🚀 快速開始

### 方法一：直接使用
1. 下載所有檔案到本地資料夾
2. 用瀏覽器開啟 `index.html` 即可開始使用

### 方法二：使用 Live Server
如果您使用 VS Code：
1. 安裝 Live Server 擴充功能
2. 右鍵點擊 `index.html`
3. 選擇 "Open with Live Server"

## 📖 使用方法

### 新增待辦事項
1. 在輸入框中輸入您的待辦事項
2. 選擇日期（預設為今天）
3. 點擊 ➕ 按鈕或按 Enter 鍵新增

### 視圖切換
- **清單視圖** - 傳統的列表形式，適合查看詳細內容
- **月曆視圖** - 月曆形式，適合查看時間安排

### 管理待辦事項
- ✅ **標記完成** - 點擊勾選框標記任務為已完成
- ✏️ **編輯任務** - 點擊編輯按鈕修改任務內容
- 📅 **修改日期** - 點擊日曆按鈕修改任務日期
- 🗑️ **刪除任務** - 點擊刪除按鈕移除單一任務

### 篩選功能
- **全部** - 顯示所有待辦事項
- **進行中** - 只顯示未完成的任務
- **已完成** - 只顯示已完成的任務
- **今日** - 只顯示今天的任務
- **即將到期** - 只顯示今天及之後的未完成任務

### 月曆視圖操作
- **點擊日期** - 查看該日期的所有待辦事項
- **月份導航** - 使用左右箭頭切換月份
- **視覺指示** - 有任務的日期會顯示不同顏色
  - 黃色：有未完成任務
  - 綠色：所有任務都已完成

### 批量操作
- **清除已完成** - 一次性刪除所有已完成的任務
- **清除全部** - 刪除所有待辦事項

## 🛠️ 技術架構

- **前端框架** - 純 HTML5 + CSS3 + JavaScript (ES6+)
- **圖示庫** - Font Awesome 6.0
- **儲存方式** - LocalStorage API
- **動畫效果** - CSS3 Animations & Transitions
- **日期處理** - 原生 JavaScript Date API

## 📁 專案結構

```
todo-list/
├── index.html          # 主要 HTML 檔案
├── styles.css          # CSS 樣式檔案
├── script.js           # JavaScript 功能檔案
├── README.md          # 專案說明文件
├── .gitignore         # Git 忽略檔案
└── LICENSE            # 授權條款
```

## 🎯 核心功能實現

### 資料結構
```javascript
{
  id: Date.now(),
  text: "待辦事項內容",
  completed: false,
  date: "2024-01-01",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### 主要功能
- **TodoApp 類別** - 封裝所有應用邏輯
- **日期管理** - 完整的日期選擇和格式化功能
- **月曆渲染** - 動態生成月曆視圖
- **本地儲存** - 自動同步到瀏覽器 LocalStorage
- **事件處理** - 完整的 DOM 事件綁定
- **狀態管理** - 即時更新 UI 和統計資訊

## 🌐 部署到 GitHub Pages

### 步驟 1：建立 GitHub 儲存庫
1. 在 GitHub 建立新的儲存庫
2. 將專案檔案上傳到儲存庫

### 步驟 2：啟用 GitHub Pages
1. 進入儲存庫設定頁面
2. 找到 "Pages" 選項
3. 選擇 "Deploy from a branch"
4. 選擇 "main" 分支和 "/ (root)" 資料夾
5. 點擊 "Save"

### 步驟 3：存取您的應用
幾分鐘後，您的應用就會在以下網址上線：
```
https://[您的使用者名稱].github.io/[儲存庫名稱]
```

## 🔧 自訂設定

### 修改主題色彩
在 `styles.css` 中修改以下 CSS 變數：
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
}
```

### 新增功能
您可以在 `script.js` 中的 `TodoApp` 類別新增更多功能：
- 任務優先級
- 重複任務設定
- 任務分類標籤
- 匯出/匯入功能
- 提醒通知

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 這個專案
2. 建立您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權條款

這個專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- [Font Awesome](https://fontawesome.com/) - 提供美觀的圖示
- [Google Fonts](https://fonts.google.com/) - 提供字體支援
- [GitHub Pages](https://pages.github.com/) - 提供免費託管服務

## 📞 聯絡資訊

如果您有任何問題或建議，歡迎：
- 開啟 GitHub Issue
- 發送 Email 到 [您的 Email]
- 在 GitHub 上關注我

---

⭐ 如果這個專案對您有幫助，請給個 Star 支持一下！ 