// 全域變數
let currentChart = null;
let currentStock = null;
let activeIndicators = new Set(['candlestick']);

// 模擬股票資料 (實際專案中應該從API獲取)
const stockDatabase = {
    '2330': {
        name: '台積電',
        symbol: '2330',
        price: 625.00,
        change: +15.50,
        changePercent: +2.55,
        open: 610.00,
        high: 628.00,
        low: 608.00,
        volume: 28450000,
        // 模擬歷史資料 (30天)
        history: generateMockHistoryData(610, 30)
    },
    '2454': {
        name: '聯發科',
        symbol: '2454', 
        price: 890.00,
        change: -12.00,
        changePercent: -1.33,
        open: 902.00,
        high: 905.00,
        low: 885.00,
        volume: 8930000,
        history: generateMockHistoryData(902, 30)
    },
    '2317': {
        name: '鴻海',
        symbol: '2317',
        price: 112.50,
        change: +2.50,
        changePercent: +2.27,
        open: 110.00,
        high: 113.00,
        low: 109.50,
        volume: 45670000,
        history: generateMockHistoryData(110, 30)
    },
    '2412': {
        name: '中華電',
        symbol: '2412',
        price: 123.00,
        change: +0.50,
        changePercent: +0.41,
        open: 122.50,
        high: 123.50,
        low: 122.00,
        volume: 12340000,
        history: generateMockHistoryData(122.5, 30)
    }
};

// 生成模擬歷史資料
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

// 搜尋股票
function searchStock() {
    const symbol = document.getElementById('stockSymbol').value.trim();
    if (!symbol) {
        alert('請輸入股票代號');
        return;
    }
    
    selectStock(symbol);
}

// 選擇股票
function selectStock(symbol) {
    showLoading(true);
    
    // 模擬API延遲
    setTimeout(() => {
        const stock = stockDatabase[symbol];
        
        if (!stock) {
            alert('找不到此股票代號，請檢查是否正確');
            showLoading(false);
            return;
        }
        
        currentStock = stock;
        displayStockInfo(stock);
        updateChart();
        generateAIAnalysis(stock);
        showLoading(false);
        
        // 更新搜尋框
        document.getElementById('stockSymbol').value = symbol;
    }, 1500);
}

// 顯示股票資訊
function displayStockInfo(stock) {
    const stockInfo = document.getElementById('stockInfo');
    
    document.getElementById('stockName').textContent = `${stock.name} (${stock.symbol})`;
    document.getElementById('currentPrice').textContent = `$${stock.price.toFixed(2)}`;
    
    const priceChange = document.getElementById('priceChange');
    const changePercent = document.getElementById('changePercent');
    
    const changeText = stock.change >= 0 ? `+$${stock.change.toFixed(2)}` : `-$${Math.abs(stock.change).toFixed(2)}`;
    const percentText = stock.changePercent >= 0 ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`;
    
    priceChange.textContent = changeText;
    changePercent.textContent = percentText;
    
    // 設定顏色
    const colorClass = stock.change >= 0 ? 'positive' : 'negative';
    priceChange.className = `price-change ${colorClass}`;
    changePercent.className = `change-percent ${colorClass}`;
    
    // 更新市場資訊
    document.getElementById('openPrice').textContent = `$${stock.open.toFixed(2)}`;
    document.getElementById('highPrice').textContent = `$${stock.high.toFixed(2)}`;
    document.getElementById('lowPrice').textContent = `$${stock.low.toFixed(2)}`;
    document.getElementById('volume').textContent = formatVolume(stock.volume);
    
    stockInfo.style.display = 'block';
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
    if (!currentStock) return;
    
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
        const sma5 = calculateSMA(currentStock.history.map(item => item.close), 5);
        const sma20 = calculateSMA(currentStock.history.map(item => item.close), 20);
        
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
        const macdData = calculateMACD(currentStock.history.map(item => item.close));
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
        const rsiData = calculateRSI(currentStock.history.map(item => item.close), 14);
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
        const bollingerBands = calculateBollingerBands(currentStock.history.map(item => item.close), 20, 2);
        
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
                    text: `${currentStock.name} (${currentStock.symbol}) 技術分析圖表`
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
    const prices = stock.history.map(item => item.close);
    const recentPrice = prices[prices.length - 1];
    const oldPrice = prices[prices.length - 8]; // 一週前
    const trend = ((recentPrice - oldPrice) / oldPrice) * 100;
    
    if (trend > 5) {
        return `${stock.name}近期呈現強勢上漲趨勢，過去一週漲幅達${trend.toFixed(2)}%。技術面顯示多頭力道強勁，建議關注是否有過熱跡象。`;
    } else if (trend > 2) {
        return `${stock.name}呈現溫和上漲趨勢，過去一週漲幅${trend.toFixed(2)}%。整體走勢穩健，適合中長期持有觀察。`;
    } else if (trend > -2) {
        return `${stock.name}近期盤整，過去一週變動幅度${Math.abs(trend).toFixed(2)}%。建議等待明確方向突破後再做決策。`;
    } else if (trend > -5) {
        return `${stock.name}近期呈現下跌趨勢，過去一週跌幅${Math.abs(trend).toFixed(2)}%。建議謹慎觀察支撐位，等待反彈訊號。`;
    } else {
        return `${stock.name}近期大幅下跌，過去一週跌幅達${Math.abs(trend).toFixed(2)}%。建議暫時觀望，等待止跌訊號出現。`;
    }
}

// 生成操作建議
function generateRecommendation(stock) {
    const changePercent = stock.changePercent;
    const volume = stock.volume;
    
    if (changePercent > 3 && volume > 20000000) {
        return `強力買進訊號：股價上漲${changePercent.toFixed(2)}%且成交量放大至${formatVolume(volume)}，顯示多頭力道強勁。建議分批進場，設定停利點於10-15%。`;
    } else if (changePercent > 1) {
        return `溫和買進：股價呈現上漲態勢，建議小量試單進場，並密切觀察後續走勢。設定停損點於-5%。`;
    } else if (changePercent < -3) {
        return `暫時觀望：股價下跌${Math.abs(changePercent).toFixed(2)}%，建議等待止跌訊號或技術面改善後再考慮進場。`;
    } else {
        return `中性持有：目前無明顯趨勢訊號，建議維持現有部位，等待更明確的技術面突破。`;
    }
}

// 生成風險評估
function generateRiskAssessment(stock) {
    const prices = stock.history.map(item => item.close);
    const volatility = calculateVolatility(prices);
    
    if (volatility > 5) {
        return `高風險警告：該股票近期波動率達${volatility.toFixed(2)}%，屬於高風險投資標的。建議控制倉位，不宜過度集中投資。`;
    } else if (volatility > 3) {
        return `中等風險：股票波動率為${volatility.toFixed(2)}%，風險適中。建議設定適當的停損停利點，控制投資風險。`;
    } else {
        return `低風險：股票波動率僅${volatility.toFixed(2)}%，相對穩定。適合保守型投資者，但報酬潛力也相對有限。`;
    }
}

// 計算波動率
function calculateVolatility(prices) {
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

// 鍵盤事件監聽
document.getElementById('stockSymbol').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchStock();
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('台股AI分析系統已初始化');
    
    // 預載入台積電資料作為範例
    setTimeout(() => {
        selectStock('2330');
    }, 500);
});
