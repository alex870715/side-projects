// ==========================================
// 台股API整合示例 - 真實API串接參考
// ==========================================

/**
 * 這個檔案示範如何整合真實的台股API
 * 目前main script.js使用模擬資料，此檔案提供真實API整合的範例
 */

// ==========================================
// 1. Yahoo Finance API (非官方但免費)
// ==========================================

async function fetchStockDataFromYahoo(symbol) {
    try {
        // Yahoo Finance API (第三方免費服務)
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.TW`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0];
            const meta = result.meta;
            const quotes = result.indicators.quote[0];
            const timestamps = result.timestamp;
            
            return {
                symbol: symbol,
                name: meta.symbol,
                currentPrice: meta.regularMarketPrice,
                change: meta.regularMarketPrice - meta.previousClose,
                changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
                open: quotes.open[quotes.open.length - 1],
                high: Math.max(...quotes.high),
                low: Math.min(...quotes.low),
                volume: quotes.volume.reduce((sum, vol) => sum + (vol || 0), 0),
                history: timestamps.map((timestamp, index) => ({
                    date: new Date(timestamp * 1000).toISOString().split('T')[0],
                    open: quotes.open[index],
                    high: quotes.high[index],
                    low: quotes.low[index],
                    close: quotes.close[index],
                    volume: quotes.volume[index]
                })).filter(item => item.open !== null)
            };
        }
        
        throw new Error('無法獲取股票資料');
    } catch (error) {
        console.error('Yahoo Finance API 錯誤:', error);
        throw error;
    }
}

// ==========================================
// 2. Alpha Vantage API (需要免費API Key)
// ==========================================

async function fetchStockDataFromAlphaVantage(symbol, apiKey) {
    try {
        // Alpha Vantage API (需要註冊免費API Key)
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}.TPE&apikey=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data['Time Series (Daily)']) {
            const timeSeries = data['Time Series (Daily)'];
            const dates = Object.keys(timeSeries).sort();
            const latestDate = dates[dates.length - 1];
            const latestData = timeSeries[latestDate];
            const previousData = timeSeries[dates[dates.length - 2]];
            
            const currentPrice = parseFloat(latestData['4. close']);
            const previousClose = parseFloat(previousData['4. close']);
            
            return {
                symbol: symbol,
                name: `股票 ${symbol}`,
                currentPrice: currentPrice,
                change: currentPrice - previousClose,
                changePercent: ((currentPrice - previousClose) / previousClose) * 100,
                open: parseFloat(latestData['1. open']),
                high: parseFloat(latestData['2. high']),
                low: parseFloat(latestData['3. low']),
                volume: parseInt(latestData['5. volume']),
                history: dates.slice(-30).map(date => ({
                    date: date,
                    open: parseFloat(timeSeries[date]['1. open']),
                    high: parseFloat(timeSeries[date]['2. high']),
                    low: parseFloat(timeSeries[date]['3. low']),
                    close: parseFloat(timeSeries[date]['4. close']),
                    volume: parseInt(timeSeries[date]['5. volume'])
                }))
            };
        }
        
        throw new Error('無法獲取股票資料');
    } catch (error) {
        console.error('Alpha Vantage API 錯誤:', error);
        throw error;
    }
}

// ==========================================
// 3. 台灣證券交易所公開資料
// ==========================================

async function fetchStockDataFromTWSE(symbol) {
    try {
        // 台灣證券交易所公開資料 (可能有CORS限制，需要代理伺服器)
        const today = new Date();
        const dateStr = today.getFullYear() + 
                       String(today.getMonth() + 1).padStart(2, '0') + 
                       String(today.getDate()).padStart(2, '0');
        
        const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${dateStr}&stockNo=${symbol}`;
        
        // 注意：此API可能因CORS政策無法直接從瀏覽器呼叫
        // 需要設置代理伺服器或使用後端API
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.stat === 'OK' && data.data && data.data.length > 0) {
            const latestData = data.data[data.data.length - 1];
            const [date, volume, , , , close, change, open, high, low] = latestData;
            
            return {
                symbol: symbol,
                name: data.title.split(' ')[0],
                currentPrice: parseFloat(close.replace(',', '')),
                change: parseFloat(change.replace(',', '')),
                changePercent: (parseFloat(change.replace(',', '')) / (parseFloat(close.replace(',', '')) - parseFloat(change.replace(',', '')))) * 100,
                open: parseFloat(open.replace(',', '')),
                high: parseFloat(high.replace(',', '')),
                low: parseFloat(low.replace(',', '')),
                volume: parseInt(volume.replace(/,/g, '')),
                history: data.data.map(item => ({
                    date: item[0].replace(/\//g, '-'),
                    open: parseFloat(item[7].replace(',', '')),
                    high: parseFloat(item[8].replace(',', '')),
                    low: parseFloat(item[9].replace(',', '')),
                    close: parseFloat(item[5].replace(',', '')),
                    volume: parseInt(item[1].replace(/,/g, ''))
                }))
            };
        }
        
        throw new Error('無法獲取股票資料');
    } catch (error) {
        console.error('TWSE API 錯誤:', error);
        throw error;
    }
}

// ==========================================
// 4. 整合API選擇邏輯
// ==========================================

class StockDataProvider {
    constructor(config = {}) {
        this.alphaVantageKey = config.alphaVantageKey;
        this.preferredProvider = config.preferredProvider || 'yahoo';
        this.fallbackOrder = config.fallbackOrder || ['yahoo', 'alphavantage', 'twse'];
    }
    
    async getStockData(symbol) {
        for (const provider of this.fallbackOrder) {
            try {
                switch (provider) {
                    case 'yahoo':
                        return await fetchStockDataFromYahoo(symbol);
                    case 'alphavantage':
                        if (this.alphaVantageKey) {
                            return await fetchStockDataFromAlphaVantage(symbol, this.alphaVantageKey);
                        }
                        break;
                    case 'twse':
                        return await fetchStockDataFromTWSE(symbol);
                }
            } catch (error) {
                console.warn(`${provider} API 失敗，嘗試下一個提供商:`, error.message);
                continue;
            }
        }
        
        throw new Error('所有API提供商都無法獲取資料');
    }
}

// ==========================================
// 5. 使用範例
// ==========================================

// 初始化API提供商
const stockAPI = new StockDataProvider({
    alphaVantageKey: 'YOUR_ALPHA_VANTAGE_API_KEY', // 到 https://www.alphavantage.co/ 申請
    preferredProvider: 'yahoo',
    fallbackOrder: ['yahoo', 'alphavantage']
});

// 在main script中替換模擬資料的函數
async function selectStockWithRealAPI(symbol) {
    showLoading(true);
    
    try {
        const stockData = await stockAPI.getStockData(symbol);
        
        currentStock = stockData;
        displayStockInfo(stockData);
        updateChart();
        generateAIAnalysis(stockData);
        
        document.getElementById('stockSymbol').value = symbol;
    } catch (error) {
        console.error('獲取股票資料失敗:', error);
        alert(`無法獲取 ${symbol} 的股票資料，請檢查代號是否正確或稍後再試。`);
    } finally {
        showLoading(false);
    }
}

// ==========================================
// 6. CORS 解決方案
// ==========================================

/**
 * 如果遇到CORS問題，可以考慮以下解決方案：
 * 
 * 1. 使用代理伺服器
 *    - 設置簡單的Express.js代理
 *    - 使用公共CORS代理服務
 * 
 * 2. 後端API
 *    - 創建Node.js/Python後端
 *    - 從後端呼叫股票API
 * 
 * 3. 瀏覽器擴展
 *    - 安裝CORS解除擴展(僅開發用)
 */

// Express.js 代理伺服器範例
/*
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/api/stock/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const data = await fetchStockDataFromYahoo(symbol);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('代理伺服器運行在 http://localhost:3001');
});
*/

// ==========================================
// 導出函數供其他檔案使用
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StockDataProvider,
        fetchStockDataFromYahoo,
        fetchStockDataFromAlphaVantage,
        fetchStockDataFromTWSE
    };
}
