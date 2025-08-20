# 🔧 API限制解決方案

## 🎯 問題說明

您看到「目前使用智能模擬資料」的原因是：

### 📊 API限制情況
1. **Demo API Key限制**：目前使用演示金鑰，每日呼叫次數極少
2. **免費方案限制**：大部分API免費版都有嚴格的使用限制
3. **CORS限制**：瀏覽器安全政策阻止直接API呼叫

### 🔄 自動降級機制
系統設計了智能降級：
```
真實API → 代理API → 智能模擬資料
```

## 🚀 解決方案

### 方案1: 申請免費API Key（推薦）

#### **TwelveData** (最推薦)
- **免費額度**: 每日800次呼叫
- **申請網址**: https://twelvedata.com/
- **優點**: 台股支援度高、資料準確

```javascript
// 在 real-api-client.js 第56行修改
apikey: 'YOUR_TWELVEDATA_API_KEY' // 替換 'demo'
```

#### **Financial Modeling Prep**
- **免費額度**: 每日250次呼叫  
- **申請網址**: https://financialmodelingprep.com/
- **優點**: 資料完整、包含基本面

```javascript
// 在 real-api-client.js 第82行修改
const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}.TPE?apikey=YOUR_FMP_API_KEY`;
```

#### **Alpha Vantage**
- **免費額度**: 每日500次呼叫
- **申請網址**: https://www.alphavantage.co/
- **優點**: 歷史資料豐富

### 方案2: 使用代理伺服器

啟動本地代理伺服器可以繞過CORS限制：

```bash
# 在專案目錄執行
npm start

# 然後開啟 http://localhost:3001/index.html
```

### 方案3: 改善智能模擬（短期方案）

如果暫時無法申請API，我們可以改善模擬資料的真實度：

#### 優點：
- ✅ 不受API限制
- ✅ 24/7可用
- ✅ 基於真實市場模式
- ✅ 技術指標計算準確

#### 改善方向：
- 🔄 即時價格變動
- 📈 市場開盤時間影響
- 📊 成交量模擬
- 🎯 個股特性模擬

## 🛠️ 快速設定指南

### 立即改善：申請TwelveData API

1. **註冊帳號**
   - 前往 https://twelvedata.com/
   - 點擊 "Get Free API Key"
   - 填寫基本資料

2. **獲取API Key**
   - 登入後到 Dashboard
   - 複製您的 API Key

3. **更新設定**
   ```javascript
   // 編輯 real-api-client.js
   // 找到第56行左右
   apikey: 'YOUR_ACTUAL_API_KEY' // 替換這裡
   ```

4. **重新載入**
   - 重新整理瀏覽器
   - 現在應該會顯示真實資料

### 檢查API狀態

在瀏覽器控制台執行：
```javascript
// 查看當前API狀態
console.log('API快取狀態:', directAPI.cache);

// 測試API連線
directAPI.getStockData('2330').then(data => {
    console.log('API測試結果:', data.dataSource);
});
```

## 📊 API使用量監控

### 建議的使用策略：
1. **快取機制**: 5分鐘內不重複呼叫相同股票
2. **分時使用**: 避開尖峰時段
3. **輪替API**: 多個API輪流使用
4. **智能降級**: 失敗時自動切換

### 每日建議呼叫次數：
- **TwelveData**: < 500次 (保留緩衝)
- **FMP**: < 200次 (保留緩衝)
- **組合使用**: 可達1000+次

## 🎯 最佳化建議

### 短期 (今天就能解決)
1. 申請TwelveData免費API Key
2. 啟動本地代理伺服器
3. 使用改善版智能模擬

### 中期 (1週內)
1. 申請多個API Key輪替使用
2. 實作更智能的快取機制
3. 添加API使用量監控

### 長期 (未來擴展)
1. 考慮付費API方案
2. 建立專屬資料庫
3. 實作即時串流資料

## 🚨 緊急處理

如果急需真實資料，立即執行：

```bash
# 1. 申請TwelveData API Key (5分鐘)
# 2. 更新API Key到程式碼
# 3. 重新載入頁面

# 或者啟動代理伺服器
npm start
# 開啟 http://localhost:3001/index.html
```

---

**💡 建議**: 先申請TwelveData的免費API Key，這是最快速有效的解決方案！
