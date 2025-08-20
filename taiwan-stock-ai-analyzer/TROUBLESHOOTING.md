# 🔧 故障排除指南

## 🚨 常見問題解決

### ❌ 問題1: 網站無法載入/空白頁面

**症狀：** 開啟index.html後頁面空白或無反應

**解決方案：**
1. **檢查瀏覽器控制台**
   - 按F12開啟開發者工具
   - 查看Console頁籤中的錯誤訊息
   - 查看Network頁籤確認檔案載入狀況

2. **確認檔案完整性**
   ```bash
   # 檢查必要檔案是否存在
   ls index.html script.js styles.css real-api-client.js
   ```

3. **使用測試版本**
   - 開啟 `test-local.html` 確認基本功能
   - 這個版本有內建的備用方案

### ❌ 問題2: localhost:3001 無法連接

**症狀：** 瀏覽器顯示"無法連上網站"

**解決方案：**
1. **啟動代理伺服器**
   ```bash
   # 確認在正確目錄
   cd taiwan-stock-ai-analyzer
   
   # 啟動伺服器
   npm start
   ```

2. **檢查端口佔用**
   ```bash
   # Windows
   netstat -an | findstr :3001
   
   # 如果端口被佔用，結束進程或更換端口
   ```

3. **不使用伺服器模式**
   - 直接開啟 `index.html` 檔案
   - 系統已設計為可獨立運行

### ❌ 問題3: API資料無法載入

**症狀：** 搜尋股票後顯示錯誤或載入失敗

**解決方案：**
1. **檢查網路連線**
   - 確認可以正常上網
   - 檢查防火牆設定

2. **使用備用模式**
   - 系統會自動切換到智能模擬資料
   - 觀察資料來源提示

3. **檢查控制台日誌**
   ```javascript
   // 手動測試API
   console.log(typeof DirectStockAPIClient);
   
   // 如果顯示undefined，檔案載入有問題
   ```

### ❌ 問題4: 圖表無法顯示

**症狀：** 技術指標圖表區域空白

**解決方案：**
1. **檢查Chart.js載入**
   ```javascript
   // 在控制台檢查
   console.log(typeof Chart);
   ```

2. **重新整理頁面**
   - 按Ctrl+F5強制重新載入
   - 清除瀏覽器快取

3. **檢查Canvas支援**
   - 確認瀏覽器支援Canvas
   - 更新瀏覽器到最新版本

### ❌ 問題5: JavaScript錯誤

**症狀：** 控制台顯示JavaScript錯誤

**解決方案：**
1. **檢查檔案載入順序**
   ```html
   <!-- 正確順序 -->
   <script src="real-api-client.js"></script>
   <script src="script.js"></script>
   ```

2. **使用相容模式**
   - 開啟 `test-local.html`
   - 內建容錯機制

3. **瀏覽器相容性**
   - 使用Chrome、Firefox、Edge最新版
   - 避免使用IE瀏覽器

## 🛠️ 除錯工具

### 📊 系統檢查
在瀏覽器控制台執行：
```javascript
// 檢查系統狀態
console.log('=== 系統檢查 ===');
console.log('Chart.js:', typeof Chart !== 'undefined' ? '✅' : '❌');
console.log('DirectStockAPIClient:', typeof DirectStockAPIClient !== 'undefined' ? '✅' : '❌');
console.log('directAPI:', typeof directAPI !== 'undefined' ? '✅' : '❌');

// 手動測試股票搜尋
if (typeof selectStock === 'function') {
    selectStock('2330');
}
```

### 🔍 API測試
```javascript
// 手動測試API
async function testAPI() {
    try {
        const data = await directAPI.getStockData('2330');
        console.log('✅ API測試成功:', data);
    } catch (error) {
        console.error('❌ API測試失敗:', error);
    }
}

testAPI();
```

### 📈 圖表測試
```javascript
// 檢查圖表元素
const canvas = document.getElementById('stockChart');
console.log('Canvas元素:', canvas ? '✅ 存在' : '❌ 不存在');

// 檢查Chart.js實例
console.log('當前圖表:', currentChart ? '✅ 已建立' : '❌ 未建立');
```

## 🚀 快速修復

### 方法1: 重置系統
```javascript
// 在控制台執行完整重置
location.reload(true); // 強制重新載入
```

### 方法2: 使用測試版
```html
<!-- 開啟test-local.html而不是index.html -->
<!-- 這個版本有更強的容錯能力 -->
```

### 方法3: 手動初始化
```javascript
// 如果自動初始化失敗，手動執行
document.addEventListener('DOMContentLoaded', function() {
    if (typeof selectStock === 'function') {
        selectStock('2330');
    }
});
```

## 📱 瀏覽器特定問題

### Chrome
- 檢查安全性設定
- 允許載入本地檔案
- 停用廣告攔截器

### Firefox
- 確認JavaScript已啟用
- 檢查隱私設定
- 允許彈出視窗

### Edge
- 更新到最新版本
- 重設瀏覽器設定
- 清除快取資料

### Safari
- 啟用開發者選單
- 允許跨域請求
- 檢查隱私設定

## 📞 獲得協助

### 🔍 收集資訊
如果問題仍未解決，請提供：
1. 瀏覽器版本和作業系統
2. 控制台錯誤訊息截圖
3. 網路狀況（能否正常上網）
4. 具體操作步驟

### 🛠️ 臨時解決方案
1. **使用test-local.html**：更穩定的測試版本
2. **重新下載檔案**：確保檔案完整性
3. **使用其他瀏覽器**：排除瀏覽器特定問題
4. **關閉防毒軟體**：暫時停用可能的攔截

---

## ✅ 成功指標

系統正常運行時應該看到：
- ✅ 頁面正常載入，顯示搜尋框和按鈕
- ✅ 控制台顯示"🚀 台股AI分析系統已初始化"
- ✅ 可以搜尋股票並看到圖表
- ✅ 顯示資料來源提示
- ✅ AI分析報告正常顯示

*如果所有步驟都無法解決問題，建議使用test-local.html版本，它有內建的備用機制！*
