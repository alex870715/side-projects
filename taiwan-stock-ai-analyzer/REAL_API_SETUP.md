# 🔌 真實API設置指南

## 📋 系統要求

- **Node.js** >= 14.0.0
- **npm** 或 **yarn**
- 網際網路連接

## 🚀 快速開始

### 1. 安裝依賴項
```bash
# 進入專案目錄
cd taiwan-stock-ai-analyzer

# 安裝依賴項
npm install
```

### 2. 啟動代理伺服器
```bash
# 啟動代理伺服器 (包含前端頁面)
npm start

# 或者單獨啟動代理伺服器
npm run proxy
```

### 3. 開啟瀏覽器
自動開啟或手動導航至：
- **前端應用**: http://localhost:3001/
- **代理伺服器健康檢查**: http://localhost:3001/health

## 🔧 API 端點

### Yahoo Finance (主要)
```
GET /api/yahoo/{股票代號}
範例: http://localhost:3001/api/yahoo/2330
```

### Finnhub (備用)
```
GET /api/finnhub/{股票代號}
範例: http://localhost:3001/api/finnhub/2454
```

### 批量查詢
```
POST /api/stocks
Body: {"symbols": ["2330", "2454", "2317"]}
```

## 📊 支援的股票代號

### 🔥 熱門股票
| 代號 | 公司名稱 | 產業 |
|------|----------|------|
| 2330 | 台積電 | 半導體 |
| 2454 | 聯發科 | 半導體 |
| 2317 | 鴻海 | 電子製造 |
| 2412 | 中華電信 | 電信 |
| 2308 | 台達電 | 電子零組件 |
| 2382 | 廣達 | 電腦及週邊設備 |
| 3008 | 大立光 | 光學器材 |
| 2002 | 中鋼 | 鋼鐵 |

### 📈 金融股
- **2881** - 富邦金
- **2882** - 國泰金
- **2886** - 兆豐金
- **2891** - 中信金

### 🏭 傳統產業
- **1301** - 台塑
- **1303** - 南亞
- **1216** - 統一
- **2105** - 正新

## 🔍 測試API

### 使用 curl 測試
```bash
# 測試Yahoo Finance API
curl http://localhost:3001/api/yahoo/2330

# 測試Finnhub API
curl http://localhost:3001/api/finnhub/2454

# 測試健康檢查
curl http://localhost:3001/health

# 批量查詢
curl -X POST http://localhost:3001/api/stocks \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["2330", "2454"]}'
```

### 範例回應
```json
{
  "symbol": "2330",
  "name": "台積電",
  "currentPrice": 590.00,
  "change": 5.00,
  "changePercent": 0.85,
  "open": 585.00,
  "high": 592.00,
  "low": 583.00,
  "volume": 25000000,
  "history": [
    {
      "date": "2024-01-15",
      "open": 580.00,
      "high": 585.00,
      "low": 578.00,
      "close": 583.00,
      "volume": 22000000
    }
  ]
}
```

## ⚠️ 重要注意事項

### API限制
- **Yahoo Finance**: 免費但有頻率限制
- **Finnhub**: 免費帳戶每分鐘60次請求
- **建議**: 申請自己的Finnhub API Key

### 資料延遲
- **即時資料**: 可能有15-20分鐘延遲
- **歷史資料**: 通常為前一交易日資料
- **成交量**: 累計成交量

### 錯誤處理
系統自動使用fallback機制：
1. 先嘗試Yahoo Finance
2. 失敗後嘗試Finnhub
3. 最後使用模擬資料

## 🔧 進階設置

### 申請Finnhub API Key
1. 訪問 https://finnhub.io/
2. 註冊免費帳戶
3. 獲取API Key
4. 修改 `proxy-server.js` 中的 `apiKey` 變數

### 自定義設置
在 `proxy-server.js` 中修改：
```javascript
const PORT = 3001; // 修改埠號
const apiKey = 'your_finnhub_api_key'; // 你的API Key
```

### 添加新的股票名稱
在 `getStockName()` 函數中添加：
```javascript
const stockNames = {
    '2330': '台積電',
    '你的代號': '公司名稱',
    // ...
};
```

## 🐛 常見問題

### Q: 代理伺服器無法啟動？
**A**: 檢查Node.js版本和埠號是否被占用
```bash
node --version  # 應該 >= 14.0.0
netstat -an | findstr :3001  # 檢查埠號
```

### Q: API回應錯誤？
**A**: 檢查網路連接和API限制
```bash
curl http://localhost:3001/health  # 檢查伺服器狀態
```

### Q: 股票資料不準確？
**A**: 免費API可能有延遲，建議：
- 申請付費API服務
- 使用官方券商API
- 加入免責聲明

### Q: CORS錯誤？
**A**: 確保使用代理伺服器，而非直接呼叫外部API

## 📈 效能優化

### 快取機制
```javascript
// 在proxy-server.js中添加簡單快取
const cache = new Map();
const CACHE_TTL = 60000; // 1分鐘

app.get('/api/yahoo/:symbol', async (req, res) => {
    const cacheKey = `yahoo_${req.params.symbol}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
    }
    
    // ... 原有邏輯
    
    cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
    });
});
```

### 批量請求
```javascript
// 前端批量查詢範例
async function fetchMultipleStocks(symbols) {
    const response = await fetch('http://localhost:3001/api/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
    });
    return response.json();
}
```

## 🔮 生產環境部署

### 環境變數
```bash
# 設置環境變數
export PORT=3001
export FINNHUB_API_KEY=your_api_key
export NODE_ENV=production
```

### Docker化
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### 部署建議
- 使用PM2進行程序管理
- 設置Nginx反向代理
- 啟用HTTPS
- 監控API使用量

---

*🚀 現在您可以使用真實的台股資料進行分析了！*
