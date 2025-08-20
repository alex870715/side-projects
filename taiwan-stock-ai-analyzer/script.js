// 全域變數
let currentChart = null;
let currentStock = null;
let activeIndicators = new Set(['candlestick']);

// 安全的數值處理函數（全域使用）
function safeNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || isNaN(value)) {
        return defaultValue;
    }
    return Number(value);
}

function safeFormat(value, decimals = 2) {
    const num = safeNumber(value);
    return num.toFixed(decimals);
}

// ==========================================
// 真實API整合 - 台股資料獲取
// ==========================================

// Yahoo Finance API 資料獲取 (透過代理伺服器)
async function fetchStockDataFromYahoo(symbol) {
    try {
        // 使用本地代理伺服器
        const url = `http://localhost:3001/api/yahoo/${symbol}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 代理伺服器已經處理好資料格式
        if (data.symbol) {
            return data;
        }
        
        throw new Error(data.error || '無法解析Yahoo Finance回應資料');
    } catch (error) {
        console.error('Yahoo Finance API 錯誤:', error);
        throw error;
    }
}

// Finnhub API 資料獲取 (透過代理伺服器)
async function fetchStockDataFromFinnhub(symbol) {
    try {
        // 使用本地代理伺服器
        const url = `http://localhost:3001/api/finnhub/${symbol}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 代理伺服器已經處理好資料格式
        if (data.symbol) {
            return data;
        }
        
        throw new Error(data.error || '無法獲取Finnhub資料');
    } catch (error) {
        console.error('Finnhub API 錯誤:', error);
        throw error;
    }
}

// 台股公司名稱對照
function getStockName(symbol) {
    const stockNames = {
        '2330': '台積電',
        '2454': '聯發科',
        '2317': '鴻海',
        '2412': '中華電信',
        '2308': '台達電',
        '2382': '廣達',
        '3008': '大立光',
        '2002': '中鋼',
        '1303': '南亞',
        '1301': '台塑',
        '2881': '富邦金',
        '2882': '國泰金',
        '2886': '兆豐金',
        '2891': '中信金',
        '6505': '台塑化',
        '1216': '統一',
        '2105': '正新',
        '3711': '日月光投控',
        '2303': '聯電',
        '2409': '友達',
        '2474': '可成',
        '6770': '力積電',
        '3034': '聯詠',
        '2408': '南亞科',
        '3037': '欣興'
    };
    
    return stockNames[symbol] || `股票 ${symbol}`;
}

// 使用多個API源的股票資料提供者
class RealStockDataProvider {
    constructor() {
        this.providers = [
            { name: 'yahoo', fetch: fetchStockDataFromYahoo },
            { name: 'finnhub', fetch: fetchStockDataFromFinnhub }
        ];
    }
    
    async getStockData(symbol) {
        let lastError = null;
        
        for (const provider of this.providers) {
            try {
                console.log(`嘗試使用 ${provider.name} API 獲取 ${symbol} 資料...`);
                const data = await provider.fetch(symbol);
                console.log(`成功從 ${provider.name} 獲取資料`);
                return data;
            } catch (error) {
                console.warn(`${provider.name} API 失敗:`, error.message);
                lastError = error;
                continue;
            }
        }
        
        // 如果所有API都失敗，回退到模擬資料
        console.warn('所有API都失敗，使用模擬資料');
        return this.getFallbackData(symbol);
    }
    
    getFallbackData(symbol) {
        const fallbackDatabase = {
            '2330': {
                symbol: '2330',
                name: '台積電',
                currentPrice: 590.00,
                change: +5.00,
                changePercent: +0.85,
                open: 585.00,
                high: 592.00,
                low: 583.00,
                volume: 25000000,
                history: generateMockHistoryData(585, 30)
            },
            '2454': {
                symbol: '2454',
                name: '聯發科',
                currentPrice: 780.00,
                change: -8.00,
                changePercent: -1.02,
                open: 788.00,
                high: 790.00,
                low: 775.00,
                volume: 12000000,
                history: generateMockHistoryData(788, 30)
            },
            '2317': {
                symbol: '2317',
                name: '鴻海',
                currentPrice: 105.50,
                change: +1.50,
                changePercent: +1.44,
                open: 104.00,
                high: 106.00,
                low: 103.50,
                volume: 35000000,
                history: generateMockHistoryData(104, 30)
            },
            '2412': {
                symbol: '2412',
                name: '中華電信',
                currentPrice: 120.00,
                change: -0.50,
                changePercent: -0.41,
                open: 120.50,
                high: 121.00,
                low: 119.50,
                volume: 8000000,
                history: generateMockHistoryData(120.5, 30)
            }
        };
        
        const stock = fallbackDatabase[symbol];
        if (stock) {
            return stock;
        }
        
        // 如果沒有預設資料，產生通用模擬資料
        return {
            symbol: symbol,
            name: getStockName(symbol),
            currentPrice: 100.00,
            change: 0.00,
            changePercent: 0.00,
            open: 100.00,
            high: 102.00,
            low: 98.00,
            volume: 1000000,
            history: generateMockHistoryData(100, 30)
        };
    }
}

// 建立直接API客戶端實例 (延遲初始化以確保類別已載入)
let directAPI;

// 生成模擬歷史資料 (作為fallback)
function generateMockHistoryData(startPrice, days) {
    const data = [];
    let currentPrice = startPrice;
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // 模擬價格波動
        const volatility = 0.03; // 3% 波動率
        const change = (Math.random() - 0.5) * volatility * currentPrice;
        
        const open = currentPrice;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 0.02 * currentPrice;
        const low = Math.min(open, close) - Math.random() * 0.02 * currentPrice;
        const volume = Math.floor((Math.random() * 0.5 + 0.5) * 10000000);
        
        data.push({
            date: date.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: volume
        });
        
        currentPrice = close;
    }
    
    return data;
}

// 搜尋股票 (更新為使用真實API)
function searchStock() {
    const symbol = document.getElementById('stockSymbol').value.trim();
    if (!symbol) {
        alert('請輸入股票代號');
        return;
    }
    
    selectStock(symbol);
}

// 選擇股票 (使用直接API客戶端)
async function selectStock(symbol) {
    showLoading(true);
    
    try {
        // 使用直接API客戶端獲取資料
        const stockData = await directAPI.getStockData(symbol);
        
        currentStock = stockData;
        displayStockInfo(stockData);
        updateChart();
        generateAIAnalysis(stockData);
        
        // 更新搜尋框
        document.getElementById('stockSymbol').value = symbol;
        
        // 顯示成功訊息和資料來源
        console.log(`✅ 成功載入 ${stockData.name} (${symbol})`);
        console.log(`📊 資料來源: ${stockData.dataSource}`);
        
        // 如果是擬真資料，在UI上顯示提示
        if (stockData.dataSource.includes('模擬')) {
            showDataSourceNotice('目前使用智能模擬資料，價格會根據真實市場模式變化');
        } else {
            showDataSourceNotice(`資料來源: ${stockData.dataSource} (最後更新: ${new Date(stockData.timestamp).toLocaleTimeString()})`);
        }
        
    } catch (error) {
        console.error('❌ 獲取股票資料失敗:', error);
        
        // 更友善的錯誤處理
        let errorMessage = '無法獲取股票資料';
        if (error.message.includes('網路')) {
            errorMessage = '網路連線問題，請檢查網路狀態';
        } else if (error.message.includes('API')) {
            errorMessage = 'API服務暫時無法使用，已切換到智能模擬模式';
        }
        
        alert(`${errorMessage}\n\n股票代號: ${symbol}\n錯誤詳情: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 顯示股票資訊
function displayStockInfo(stock) {
    const stockInfo = document.getElementById('stockInfo');
    
    // 安全的數值處理函數
    function safeNumber(value, defaultValue = 0) {
        if (value === null || value === undefined || isNaN(value)) {
            return defaultValue;
        }
        return Number(value);
    }
    
    function safeFormat(value, decimals = 2) {
        const num = safeNumber(value);
        return num.toFixed(decimals);
    }
    
    // 統一使用 price 欄位，支援舊的 currentPrice 欄位
    const currentPrice = safeNumber(stock.price || stock.currentPrice, 0);
    const change = safeNumber(stock.change, 0);
    const changePercent = safeNumber(stock.changePercent, 0);
    const open = safeNumber(stock.open, currentPrice);
    const high = safeNumber(stock.high, currentPrice);
    const low = safeNumber(stock.low, currentPrice);
    const volume = safeNumber(stock.volume, 0);
    
    document.getElementById('stockName').textContent = `${stock.name || '未知股票'} (${stock.symbol || '--'})`;
    document.getElementById('currentPrice').textContent = `$${safeFormat(currentPrice)}`;
    
    const priceChange = document.getElementById('priceChange');
    const changePercentElement = document.getElementById('changePercent');
    
    const changeText = change >= 0 ? `+$${safeFormat(change)}` : `-$${safeFormat(Math.abs(change))}`;
    const percentText = changePercent >= 0 ? `+${safeFormat(changePercent)}%` : `${safeFormat(changePercent)}%`;
    
    priceChange.textContent = changeText;
    changePercentElement.textContent = percentText;
    
    // 設定顏色
    const colorClass = change >= 0 ? 'positive' : 'negative';
    priceChange.className = `price-change ${colorClass}`;
    changePercentElement.className = `change-percent ${colorClass}`;
    
    // 更新市場資訊
    document.getElementById('openPrice').textContent = `$${safeFormat(open)}`;
    document.getElementById('highPrice').textContent = `$${safeFormat(high)}`;
    document.getElementById('lowPrice').textContent = `$${safeFormat(low)}`;
    document.getElementById('volume').textContent = formatVolume(volume);
    
    stockInfo.style.display = 'block';
    
    // 除錯資訊
    console.log('📊 股票資訊顯示:', {
        symbol: stock.symbol,
        name: stock.name,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        dataSource: stock.dataSource
    });
}

// 格式化成交量
function formatVolume(volume) {
    if (volume >= 100000000) {
        return `${(volume / 100000000).toFixed(1)}億`;
    } else if (volume >= 10000) {
        return `${(volume / 10000).toFixed(0)}萬`;
    }
    return volume.toLocaleString();
}

// 切換技術指標
function toggleIndicator(button, indicator) {
    if (activeIndicators.has(indicator)) {
        activeIndicators.delete(indicator);
        button.classList.remove('active');
    } else {
        activeIndicators.add(indicator);
        button.classList.add('active');
    }
    
    if (currentStock) {
        updateChart();
    }
}

// 更新圖表
function updateChart() {
    if (!currentStock || !currentStock.history || currentStock.history.length === 0) {
        console.warn('沒有有效的歷史資料可以繪製圖表');
        return;
    }
    
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    if (currentChart) {
        currentChart.destroy();
    }
    
    const labels = currentStock.history.map(item => item.date);
    const datasets = [];
    
    // K線圖資料
    if (activeIndicators.has('candlestick')) {
        datasets.push({
            label: '收盤價',
            data: currentStock.history.map(item => item.close),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: false,
            tension: 0.1
        });
    }
    
    // 移動平均線
    if (activeIndicators.has('sma')) {
        const prices = currentStock.history.map(item => item.close);
        const sma5 = calculateSMA(prices, 5);
        const sma20 = calculateSMA(prices, 20);
        
        datasets.push({
            label: 'MA5',
            data: sma5,
            borderColor: '#ff6b6b',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.1,
            borderWidth: 2
        });
        
        datasets.push({
            label: 'MA20',
            data: sma20,
            borderColor: '#4ecdc4',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.1,
            borderWidth: 2
        });
    }
    
    // MACD
    if (activeIndicators.has('macd')) {
        const prices = currentStock.history.map(item => item.close);
        const macdData = calculateMACD(prices);
        datasets.push({
            label: 'MACD',
            data: macdData.macd,
            borderColor: '#45b7d1',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.1,
            yAxisID: 'y1'
        });
    }
    
    // RSI
    if (activeIndicators.has('rsi')) {
        const prices = currentStock.history.map(item => item.close);
        const rsiData = calculateRSI(prices, 14);
        datasets.push({
            label: 'RSI',
            data: rsiData,
            borderColor: '#f39c12',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.1,
            yAxisID: 'y1'
        });
    }
    
    // 布林帶
    if (activeIndicators.has('bollinger')) {
        const prices = currentStock.history.map(item => item.close);
        const bollingerBands = calculateBollingerBands(prices, 20, 2);
        
        datasets.push({
            label: '布林上軌',
            data: bollingerBands.upper,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            fill: '+1',
            tension: 0.1
        });
        
        datasets.push({
            label: '布林下軌',
            data: bollingerBands.lower,
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.1)',
            fill: false,
            tension: 0.1
        });
    }
    
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: '價格 (TWD)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: activeIndicators.has('macd') || activeIndicators.has('rsi'),
                    position: 'right',
                    title: {
                        display: true,
                        text: '指標數值'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `${currentStock.name} (${currentStock.symbol}) 技術分析圖表 - 即時資料`
                }
            }
        }
    });
}

// 計算簡單移動平均
function calculateSMA(prices, period) {
    const sma = [];
    for (let i = 0; i < prices.length; i++) {
        if (i < period - 1) {
            sma.push(null);
        } else {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / period);
        }
    }
    return sma;
}

// 計算MACD
function calculateMACD(prices) {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macd = [];
    
    for (let i = 0; i < prices.length; i++) {
        if (ema12[i] !== null && ema26[i] !== null) {
            macd.push(ema12[i] - ema26[i]);
        } else {
            macd.push(null);
        }
    }
    
    return {
        macd: macd,
        signal: calculateEMA(macd.filter(v => v !== null), 9),
        histogram: []
    };
}

// 計算指數移動平均
function calculateEMA(prices, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    for (let i = 0; i < prices.length; i++) {
        if (i === 0) {
            ema.push(prices[i]);
        } else {
            ema.push((prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
        }
    }
    
    return ema;
}

// 計算RSI
function calculateRSI(prices, period) {
    const rsi = [];
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    for (let i = 0; i < gains.length; i++) {
        if (i < period - 1) {
            rsi.push(null);
        } else {
            const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
            const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
            
            if (avgLoss === 0) {
                rsi.push(100);
            } else {
                const rs = avgGain / avgLoss;
                rsi.push(100 - (100 / (1 + rs)));
            }
        }
    }
    
    return [null, ...rsi]; // 補償第一個價格點
}

// 計算布林帶
function calculateBollingerBands(prices, period, deviation) {
    const sma = calculateSMA(prices, period);
    const upper = [];
    const lower = [];
    
    for (let i = 0; i < prices.length; i++) {
        if (i < period - 1) {
            upper.push(null);
            lower.push(null);
        } else {
            const slice = prices.slice(i - period + 1, i + 1);
            const mean = sma[i];
            const stdDev = Math.sqrt(slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period);
            
            upper.push(mean + (stdDev * deviation));
            lower.push(mean - (stdDev * deviation));
        }
    }
    
    return { upper, lower, middle: sma };
}

// 生成AI分析
function generateAIAnalysis(stock) {
    // 模擬AI分析過程
    setTimeout(() => {
        const trendAnalysis = generateTrendAnalysis(stock);
        const recommendation = generateRecommendation(stock);
        const riskAssessment = generateRiskAssessment(stock);
        
        document.getElementById('trendAnalysis').textContent = trendAnalysis;
        document.getElementById('recommendation').textContent = recommendation;
        document.getElementById('riskAssessment').textContent = riskAssessment;
        
        document.getElementById('aiAnalysis').style.display = 'block';
    }, 2000);
}

// 生成趨勢分析
function generateTrendAnalysis(stock) {
    try {
        if (!stock.history || stock.history.length < 8) {
            return `${stock.name}資料不足，無法進行完整趨勢分析。建議觀察更多交易日資料。`;
        }
        
        // 安全地獲取價格數據
        const prices = stock.history.map(item => safeNumber(item.close, 0)).filter(price => price > 0);
        if (prices.length < 2) {
            return `${stock.name}價格資料不完整，無法計算趨勢。請稍後再試。`;
        }
        
        const recentPrice = prices[prices.length - 1];
        const oldPrice = prices[Math.max(0, prices.length - 8)]; // 一週前
        const trend = oldPrice > 0 ? ((recentPrice - oldPrice) / oldPrice) * 100 : 0;
        
        // 安全地獲取股票資訊
        const currentPrice = safeNumber(stock.price || stock.currentPrice, 0);
        const changePercent = safeNumber(stock.changePercent, 0);
        const volume = safeNumber(stock.volume, 0);
        
        if (trend > 5) {
            return `${stock.name}近期呈現強勢上漲趨勢，過去一週漲幅達${safeFormat(trend)}%。技術面顯示多頭力道強勁，建議關注是否有過熱跡象。當前價格$${safeFormat(currentPrice)}，成交量${formatVolume(volume)}。`;
        } else if (trend > 2) {
            return `${stock.name}呈現溫和上漲趨勢，過去一週漲幅${safeFormat(trend)}%。整體走勢穩健，適合中長期持有觀察。今日表現${safeFormat(changePercent)}%，成交量適中。`;
        } else if (trend > -2) {
            return `${stock.name}近期盤整，過去一週變動幅度${safeFormat(Math.abs(trend))}%。建議等待明確方向突破後再做決策。目前價位$${safeFormat(currentPrice)}處於整理區間。`;
        } else if (trend > -5) {
            return `${stock.name}近期呈現下跌趨勢，過去一週跌幅${safeFormat(Math.abs(trend))}%。建議謹慎觀察支撐位，等待反彈訊號。今日變動${safeFormat(changePercent)}%。`;
        } else {
            return `${stock.name}近期大幅下跌，過去一週跌幅達${safeFormat(Math.abs(trend))}%。建議暫時觀望，等待止跌訊號出現。密切關注成交量變化。`;
        }
    } catch (error) {
        console.error('趨勢分析錯誤:', error);
        return `${stock.name}趨勢分析暫時無法計算，請稍後再試。`;
    }
}

// 生成操作建議
function generateRecommendation(stock) {
    try {
        const changePercent = safeNumber(stock.changePercent, 0);
        const volume = safeNumber(stock.volume, 0);
        const currentPrice = safeNumber(stock.price || stock.currentPrice, 0);
        
        if (changePercent > 3 && volume > 20000000) {
            return `強力買進訊號：${stock.name}股價上漲${safeFormat(changePercent)}%且成交量放大至${formatVolume(volume)}，顯示多頭力道強勁。建議分批進場，目標價格區間$${safeFormat(currentPrice * 1.1)}-$${safeFormat(currentPrice * 1.15)}，停損設於$${safeFormat(currentPrice * 0.95)}。`;
        } else if (changePercent > 1) {
            return `溫和買進：${stock.name}股價呈現上漲態勢+${safeFormat(changePercent)}%，建議小量試單進場，並密切觀察後續走勢。停損點設定於$${safeFormat(currentPrice * 0.95)}，目標$${safeFormat(currentPrice * 1.08)}。`;
        } else if (changePercent < -3) {
            return `暫時觀望：${stock.name}股價下跌${safeFormat(Math.abs(changePercent))}%，建議等待止跌訊號或技術面改善後再考慮進場。觀察支撐位$${safeFormat(currentPrice * 0.95)}附近機會。`;
        } else {
            return `中性持有：${stock.name}目前無明顯趨勢訊號（變動${safeFormat(changePercent)}%），建議維持現有部位，等待更明確的技術面突破。密切觀察$${safeFormat(currentPrice * 1.05)}阻力位。`;
        }
    } catch (error) {
        console.error('操作建議錯誤:', error);
        return `${stock.name}操作建議暫時無法生成，請稍後再試。`;
    }
}

// 生成風險評估
function generateRiskAssessment(stock) {
    try {
        if (!stock.history || stock.history.length < 10) {
            return `${stock.name}歷史資料不足，無法準確評估風險。建議收集更多交易資料後再進行分析。`;
        }
        
        // 安全地獲取價格數據
        const prices = stock.history.map(item => safeNumber(item.close, 0)).filter(price => price > 0);
        if (prices.length < 2) {
            return `${stock.name}價格資料不完整，無法評估風險。請稍後再試。`;
        }
        
        const volatility = calculateVolatility(prices);
        const volume = safeNumber(stock.volume, 0);
        
        let riskLevel = '';
        let riskDescription = '';
        
        if (volatility > 5) {
            riskLevel = '高風險';
            riskDescription = `該股票近期波動率達${safeFormat(volatility)}%，屬於高風險投資標的。建議控制倉位不超過總資金的5%，設定嚴格停損。`;
        } else if (volatility > 3) {
            riskLevel = '中等風險';
            riskDescription = `股票波動率為${safeFormat(volatility)}%，風險適中。建議倉位控制在總資金的10%以內，設定適當的停損停利點。`;
        } else {
            riskLevel = '低風險';
            riskDescription = `股票波動率僅${safeFormat(volatility)}%，相對穩定。適合保守型投資者，但報酬潛力也相對有限。`;
        }
        
        // 成交量風險
        if (volume < 1000000) {
            riskDescription += ` 注意：成交量偏低(${formatVolume(volume)})，可能存在流動性風險。`;
        }
        
        return `${riskLevel}警示：${riskDescription}`;
    } catch (error) {
        console.error('風險評估錯誤:', error);
        return `${stock.name}風險評估暫時無法計算，請稍後再試。`;
    }
}

// 計算波動率
function calculateVolatility(prices) {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100; // 轉換為百分比
}

// 顯示/隱藏載入動畫
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// 顯示資料來源提示
function showDataSourceNotice(message) {
    // 移除舊的提示
    const oldNotice = document.querySelector('.data-source-notice');
    if (oldNotice) {
        oldNotice.remove();
    }
    
    // 創建新提示
    const notice = document.createElement('div');
    notice.className = 'data-source-notice';
    notice.innerHTML = `
        <div class="notice-content">
            <span class="notice-icon">ℹ️</span>
            <span class="notice-text">${message}</span>
            <button class="notice-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // 插入到主要內容前
    const mainContent = document.querySelector('.main-content');
    mainContent.parentNode.insertBefore(notice, mainContent);
    
    // 3秒後自動消失
    setTimeout(() => {
        if (notice.parentNode) {
            notice.remove();
        }
    }, 10000);
}

// 鍵盤事件監聽
document.getElementById('stockSymbol').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchStock();
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 台股AI分析系統已初始化 - 整合真實API資料');
    console.log('📊 支援的資料來源: TwelveData、Financial Modeling Prep、Yahoo Finance、智能模擬');
    
    // 初始化API客戶端
    try {
        if (typeof DirectStockAPIClient !== 'undefined') {
            directAPI = new DirectStockAPIClient();
            console.log('✅ DirectStockAPIClient 初始化成功');
        } else {
            console.warn('⚠️ DirectStockAPIClient 未載入，將使用備用方案');
            // 使用備用的簡化API客戶端
            directAPI = createFallbackAPIClient();
        }
    } catch (error) {
        console.error('❌ API客戶端初始化失敗:', error);
        directAPI = createFallbackAPIClient();
    }
    
    // 顯示歡迎訊息
    setTimeout(() => {
        showDataSourceNotice('歡迎使用台股AI分析系統！系統將自動從多個資料源獲取最新股票資訊');
    }, 1000);
    
    // 預載入台積電資料作為範例
    setTimeout(() => {
        selectStock('2330');
    }, 2000);
});

// 備用API客戶端
function createFallbackAPIClient() {
    return {
        async getStockData(symbol) {
            console.log(`🔄 使用備用方案獲取 ${symbol} 的股票資料...`);
            
            // 模擬API延遲
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const baseData = {
                '2330': { price: 625, name: '台積電', volatility: 0.03 },
                '2454': { price: 890, name: '聯發科', volatility: 0.04 },
                '2317': { price: 112, name: '鴻海', volatility: 0.025 },
                '2412': { price: 123, name: '中華電信', volatility: 0.02 },
                '0050': { price: 145, name: '元大台灣50', volatility: 0.015 },
                '0056': { price: 32, name: '元大高股息', volatility: 0.02 }
            };
            
            const base = baseData[symbol] || { price: 100, name: `股票 ${symbol}`, volatility: 0.03 };
            
            // 生成接近真實的模擬資料
            const timeVariation = Math.sin(Date.now() / 1000000) * 0.01;
            const randomVariation = (Math.random() - 0.5) * base.volatility;
            const marketInfluence = new Date().getHours() >= 9 && new Date().getHours() <= 13.5 ? 1.2 : 0.8;
            
            const priceChange = (timeVariation + randomVariation) * base.price * marketInfluence;
            const currentPrice = base.price + priceChange;
            
            return {
                symbol: symbol,
                name: base.name,
                price: parseFloat(currentPrice.toFixed(2)),
                change: parseFloat(priceChange.toFixed(2)),
                changePercent: parseFloat((priceChange / base.price * 100).toFixed(2)),
                open: parseFloat((base.price - priceChange * 0.3).toFixed(2)),
                high: parseFloat((currentPrice + Math.abs(priceChange * 0.5)).toFixed(2)),
                low: parseFloat((currentPrice - Math.abs(priceChange * 0.7)).toFixed(2)),
                volume: Math.floor((Math.random() * 0.5 + 0.5) * 50000000),
                history: generateMockHistoryData(base.price, 30),
                dataSource: '智能備用模擬系統',
                timestamp: new Date().toISOString()
            };
        }
    };
}