// ==========================================
// 台股API代理伺服器
// 解決CORS問題並提供統一的API介面
// ==========================================

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 提供靜態檔案
app.use(express.static(path.join(__dirname)));

// Yahoo Finance API 代理
app.get('/api/yahoo/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        console.log(`正在獲取 ${symbol} 的Yahoo Finance資料...`);
        
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.TW`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Yahoo API HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0];
            const stockData = parseYahooData(result, symbol);
            
            console.log(`成功獲取 ${symbol} 資料:`, stockData.name);
            res.json(stockData);
        } else {
            throw new Error('Yahoo Finance 無有效數據');
        }
        
    } catch (error) {
        console.error(`Yahoo API錯誤 (${req.params.symbol}):`, error.message);
        res.status(500).json({ 
            error: error.message,
            provider: 'Yahoo Finance'
        });
    }
});

// Finnhub API 代理
app.get('/api/finnhub/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        console.log(`正在獲取 ${symbol} 的Finnhub資料...`);
        
        // 免費API Key (限制較多，建議申請自己的)
        const apiKey = 'demo';
        const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
        
        const response = await fetch(quoteUrl);
        
        if (!response.ok) {
            throw new Error(`Finnhub API HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.c && data.c > 0) { // current price exists
            const stockData = parseFinnhubData(data, symbol);
            
            console.log(`成功獲取 ${symbol} 資料:`, stockData.name);
            res.json(stockData);
        } else {
            throw new Error('Finnhub 無有效數據');
        }
        
    } catch (error) {
        console.error(`Finnhub API錯誤 (${req.params.symbol}):`, error.message);
        res.status(500).json({ 
            error: error.message,
            provider: 'Finnhub'
        });
    }
});

// Alpha Vantage API 代理
app.get('/api/alphavantage/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        console.log(`正在獲取 ${symbol} 的Alpha Vantage資料...`);
        
        // 免費API Key (限制較多，建議申請自己的)
        const apiKey = 'demo';
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.TPE&apikey=${apiKey}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Alpha Vantage API HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data['Global Quote'] && data['Global Quote']['05. price']) {
            const stockData = parseAlphaVantageData(data['Global Quote'], symbol);
            
            console.log(`成功獲取 ${symbol} 資料:`, stockData.name);
            res.json(stockData);
        } else {
            throw new Error('Alpha Vantage 無有效數據');
        }
        
    } catch (error) {
        console.error(`Alpha Vantage API錯誤 (${req.params.symbol}):`, error.message);
        res.status(500).json({ 
            error: error.message,
            provider: 'Alpha Vantage'
        });
    }
});

// 備用資料API (當所有外部API都失敗時)
app.get('/api/fallback/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        console.log(`使用備用資料 ${symbol}...`);
        
        const stockData = generateFallbackData(symbol);
        res.json(stockData);
        
    } catch (error) {
        console.error(`備用資料錯誤 (${req.params.symbol}):`, error.message);
        res.status(500).json({ 
            error: error.message,
            provider: 'Fallback'
        });
    }
});

// 解析Yahoo Finance資料
function parseYahooData(result, symbol) {
    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    const timestamps = result.timestamp;
    
    if (!quotes || !timestamps) {
        throw new Error('Yahoo數據格式錯誤');
    }
    
    const currentPrice = meta.regularMarketPrice || quotes.close[quotes.close.length - 1];
    const previousClose = meta.previousClose || quotes.close[quotes.close.length - 2];
    
    return {
        symbol: symbol,
        name: getStockName(symbol),
        price: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat((currentPrice - previousClose).toFixed(2)),
        changePercent: parseFloat(((currentPrice - previousClose) / previousClose * 100).toFixed(2)),
        open: parseFloat((quotes.open[quotes.open.length - 1] || currentPrice).toFixed(2)),
        high: parseFloat(Math.max(...quotes.high.filter(h => h !== null)).toFixed(2)),
        low: parseFloat(Math.min(...quotes.low.filter(l => l !== null)).toFixed(2)),
        volume: Math.round(quotes.volume.reduce((sum, vol) => sum + (vol || 0), 0)),
        history: formatHistoryData(timestamps, quotes),
        dataSource: 'Yahoo Finance'
    };
}

// 解析Finnhub資料
function parseFinnhubData(data, symbol) {
    return {
        symbol: symbol,
        name: getStockName(symbol),
        price: parseFloat(data.c.toFixed(2)),
        change: parseFloat(data.d.toFixed(2)),
        changePercent: parseFloat(data.dp.toFixed(2)),
        open: parseFloat(data.o.toFixed(2)),
        high: parseFloat(data.h.toFixed(2)),
        low: parseFloat(data.l.toFixed(2)),
        volume: 0, // Finnhub quote API 不提供volume
        history: generateHistoryFromCurrent(data.c, 30),
        dataSource: 'Finnhub'
    };
}

// 解析Alpha Vantage資料
function parseAlphaVantageData(quote, symbol) {
    const currentPrice = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
    
    return {
        symbol: symbol,
        name: getStockName(symbol),
        price: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        volume: parseInt(quote['06. volume']),
        history: generateHistoryFromCurrent(currentPrice, 30),
        dataSource: 'Alpha Vantage'
    };
}

// 格式化歷史資料
function formatHistoryData(timestamps, quotes) {
    if (!timestamps || !quotes) return [];
    
    return timestamps.map((timestamp, index) => {
        if (!quotes.open[index] || !quotes.close[index]) return null;
        
        return {
            date: new Date(timestamp * 1000).toISOString().split('T')[0],
            open: parseFloat(quotes.open[index].toFixed(2)),
            high: parseFloat(quotes.high[index].toFixed(2)),
            low: parseFloat(quotes.low[index].toFixed(2)),
            close: parseFloat(quotes.close[index].toFixed(2)),
            volume: Math.round(quotes.volume[index] || 0)
        };
    }).filter(item => item !== null);
}

// 從當前價格生成歷史資料
function generateHistoryFromCurrent(currentPrice, days) {
    const data = [];
    let price = currentPrice * 0.95; // 從稍低的價格開始
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const volatility = 0.02;
        const change = (Math.random() - 0.5) * volatility * price;
        
        const open = price;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 0.01 * price;
        const low = Math.min(open, close) - Math.random() * 0.01 * price;
        const volume = Math.floor((Math.random() * 0.5 + 0.5) * 10000000);
        
        data.push({
            date: date.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: volume
        });
        
        price = close;
    }
    
    return data;
}

// 獲取股票名稱
function getStockName(symbol) {
    const stockNames = {
        '2330': '台積電',
        '2454': '聯發科',
        '2317': '鴻海',
        '2412': '中華電信',
        '0050': '元大台灣50',
        '0056': '元大高股息',
        '2303': '聯電',
        '2308': '台達電',
        '2881': '富邦金',
        '2882': '國泰金',
        '2886': '兆豐金',
        '6505': '台塑化',
        '2002': '中鋼',
        '1301': '台塑',
        '1303': '南亞'
    };
    
    return stockNames[symbol] || `股票 ${symbol}`;
}

// 生成備用資料
function generateFallbackData(symbol) {
    const fallbackData = {
        '2330': { basePrice: 625, name: '台積電' },
        '2454': { basePrice: 890, name: '聯發科' },
        '2317': { basePrice: 112, name: '鴻海' },
        '2412': { basePrice: 123, name: '中華電信' },
        '0050': { basePrice: 145, name: '元大台灣50' },
        '0056': { basePrice: 32, name: '元大高股息' }
    };
    
    const base = fallbackData[symbol] || { basePrice: 100, name: `股票 ${symbol}` };
    const randomChange = (Math.random() - 0.5) * 0.05 * base.basePrice;
    const currentPrice = base.basePrice + randomChange;
    
    return {
        symbol: symbol,
        name: base.name,
        price: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat(randomChange.toFixed(2)),
        changePercent: parseFloat((randomChange / base.basePrice * 100).toFixed(2)),
        open: parseFloat(base.basePrice.toFixed(2)),
        high: parseFloat((currentPrice + Math.abs(randomChange * 0.5)).toFixed(2)),
        low: parseFloat((currentPrice - Math.abs(randomChange * 0.5)).toFixed(2)),
        volume: Math.floor(Math.random() * 50000000),
        history: generateHistoryFromCurrent(base.basePrice, 30),
        dataSource: 'Fallback Data'
    };
}

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 台股API代理伺服器已啟動`);
    console.log(`📍 本地地址: http://localhost:${PORT}`);
    console.log(`📊 前端介面: http://localhost:${PORT}/index.html`);
    console.log(`🔧 API端點:`);
    console.log(`   - Yahoo Finance: http://localhost:${PORT}/api/yahoo/:symbol`);
    console.log(`   - Finnhub: http://localhost:${PORT}/api/finnhub/:symbol`);
    console.log(`   - Alpha Vantage: http://localhost:${PORT}/api/alphavantage/:symbol`);
    console.log(`   - 備用資料: http://localhost:${PORT}/api/fallback/:symbol`);
    console.log(`\n💡 範例: http://localhost:${PORT}/api/yahoo/2330`);
});

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n正在關閉代理伺服器...');
    process.exit(0);
});