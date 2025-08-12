class CybersecurityGame {
    constructor() {
        this.currentLevel = 0;
        this.score = 0;
        this.selectedDifficulty = null;
        this.questions = this.initializeQuestions();
        this.advancedChallenges = this.initializeAdvancedChallenges();
        this.currentQuestion = null;
        this.currentChallenge = null;
        this.selectedAnswer = null;
        this.selectedCodeOption = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.showScreen('startScreen');
    }

    bindEvents() {
        // 難度選擇
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectDifficulty(e.currentTarget.dataset.difficulty);
            });
        });

        // 開始遊戲
        document.getElementById('startGame').addEventListener('click', () => {
            this.startGame();
        });

        // 下一題
        document.getElementById('nextQuestion').addEventListener('click', () => {
            this.nextQuestion();
        });

        // 執行程式碼
        document.getElementById('runCode').addEventListener('click', () => {
            this.runCode();
        });

        // 下一關（進階）
        document.getElementById('nextAdvancedQuestion').addEventListener('click', () => {
            this.nextAdvancedQuestion();
        });

        // 再玩一次
        document.getElementById('playAgain').addEventListener('click', () => {
            this.restartGame();
        });

        // 回到首頁
        document.getElementById('backToStart').addEventListener('click', () => {
            this.showScreen('startScreen');
        });
    }

    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        
        // 移除所有選擇狀態
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // 添加選擇狀態
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('selected');
        
        // 啟用開始按鈕
        document.getElementById('startGame').disabled = false;
    }

    initializeQuestions() {
        return [
            // 關卡 1: 密碼安全
            {
                title: "選擇正確的密碼",
                text: "哪個密碼比較安全？",
                options: [
                    {
                        text: "password123",
                        description: "常見的弱密碼",
                        correct: false
                    },
                    {
                        text: "K9#mP2$vL8@nQ5",
                        description: "包含大小寫、數字和符號",
                        correct: true
                    },
                    {
                        text: "123456789",
                        description: "純數字密碼",
                        correct: false
                    },
                    {
                        text: "qwerty",
                        description: "鍵盤順序密碼",
                        correct: false
                    }
                ],
                tip: "強密碼應包含大小寫字母、數字和特殊符號，長度至少12位"
            },
            // 關卡 2: 釣魚攻擊
            {
                title: "識別釣魚郵件",
                text: "以下哪個是可疑的釣魚郵件？",
                options: [
                    {
                        text: "親愛的用戶，您的帳戶已被鎖定，請立即點擊連結重置密碼",
                        description: "緊急要求、可疑連結",
                        correct: true
                    },
                    {
                        text: "您的訂單 #12345 已發貨，追蹤號碼：ABC123",
                        description: "正常的訂單通知",
                        correct: false
                    },
                    {
                        text: "恭喜您獲得100萬元獎金，請提供銀行帳戶資訊",
                        description: "天上掉餡餅的好事",
                        correct: true
                    },
                    {
                        text: "您的密碼將於30天後過期，請登入系統更新",
                        description: "正常的系統通知",
                        correct: false
                    }
                ],
                tip: "釣魚郵件通常會製造緊急感、要求個人資訊或提供可疑連結"
            },
            // 關卡 3: 社交工程
            {
                title: "保護個人資訊",
                text: "在社交媒體上，哪些資訊不應該公開分享？",
                options: [
                    {
                        text: "您的生日和出生地",
                        description: "常用於密碼重置",
                        correct: true
                    },
                    {
                        text: "您的興趣愛好",
                        description: "一般可分享的資訊",
                        correct: false
                    },
                    {
                        text: "您的寵物名字",
                        description: "常用於密碼設定",
                        correct: true
                    },
                    {
                        text: "您今天的心情",
                        description: "一般可分享的資訊",
                        correct: false
                    }
                ],
                tip: "避免在社交媒體分享可能用於密碼重置或安全問題的個人資訊"
            },
            // 關卡 4: 網路安全
            {
                title: "安全上網行為",
                text: "在公共WiFi網路時，應該如何保護自己？",
                options: [
                    {
                        text: "使用VPN連接",
                        description: "加密網路流量",
                        correct: true
                    },
                    {
                        text: "登入銀行帳戶",
                        description: "避免在公共網路進行敏感操作",
                        correct: false
                    },
                    {
                        text: "分享個人照片",
                        description: "一般可分享的內容",
                        correct: false
                    },
                    {
                        text: "使用HTTPS網站",
                        description: "加密的網站連接",
                        correct: true
                    }
                ],
                tip: "在公共WiFi時使用VPN和HTTPS，避免進行敏感操作"
            },
            // 關卡 5: 資料保護
            {
                title: "保護重要資料",
                text: "如何保護您的數位資料？",
                options: [
                    {
                        text: "定期備份重要檔案",
                        description: "防止資料遺失",
                        correct: true
                    },
                    {
                        text: "將密碼存在手機備忘錄",
                        description: "不安全，容易被竊取",
                        correct: false
                    },
                    {
                        text: "使用密碼管理器",
                        description: "安全儲存密碼",
                        correct: true
                    },
                    {
                        text: "點擊所有彈出的連結",
                        description: "可能包含惡意軟體",
                        correct: false
                    }
                ],
                tip: "定期備份、使用密碼管理器，避免點擊可疑連結"
            }
        ];
    }

    initializeAdvancedChallenges() {
        return [
            // 挑戰 1: SQL注入防護
            {
                title: "SQL注入防護挑戰",
                description: "修復以下程式碼中的SQL注入漏洞",
                code: `function getUserData(username) {
    const query = "SELECT * FROM users WHERE username = '" + username + "'";
    return database.execute(query);
}`,
                options: [
                    {
                        code: `function getUserData(username) {
    const query = "SELECT * FROM users WHERE username = ?";
    return database.execute(query, [username]);
}`,
                        description: "使用參數化查詢防止SQL注入",
                        correct: true
                    },
                    {
                        code: `function getUserData(username) {
    const sanitizedUsername = username.replace(/'/g, "''");
    const query = "SELECT * FROM users WHERE username = '" + sanitizedUsername + "'";
    return database.execute(query);
}`,
                        description: "手動轉義單引號",
                        correct: false
                    },
                    {
                        code: `function getUserData(username) {
    const query = "SELECT * FROM users WHERE username = '" + username + "'";
    return database.execute(query);
}`,
                        description: "原始有漏洞的程式碼",
                        correct: false
                    }
                ],
                tip: "使用參數化查詢是防止SQL注入的最佳實踐，避免字串拼接"
            },
            // 挑戰 2: XSS攻擊防護
            {
                title: "XSS攻擊防護挑戰",
                description: "修復以下程式碼中的XSS漏洞",
                code: `function displayUserComment(comment) {
    document.getElementById('comments').innerHTML += '<div>' + comment + '</div>';
}`,
                options: [
                    {
                        code: `function displayUserComment(comment) {
    const div = document.createElement('div');
    div.textContent = comment;
    document.getElementById('comments').appendChild(div);
}`,
                        description: "使用textContent避免HTML注入",
                        correct: true
                    },
                    {
                        code: `function displayUserComment(comment) {
    const sanitizedComment = comment.replace(/<script>/gi, '');
    document.getElementById('comments').innerHTML += '<div>' + sanitizedComment + '</div>';
}`,
                        description: "簡單的腳本標籤過濾",
                        correct: false
                    },
                    {
                        code: `function displayUserComment(comment) {
    document.getElementById('comments').innerHTML += '<div>' + comment + '</div>';
}`,
                        description: "原始有漏洞的程式碼",
                        correct: false
                    }
                ],
                tip: "使用textContent或innerText而不是innerHTML來避免XSS攻擊"
            },
            // 挑戰 3: 密碼雜湊
            {
                title: "密碼安全儲存挑戰",
                description: "選擇正確的密碼儲存方式",
                code: `function saveUserPassword(password) {
    // 儲存密碼到資料庫
    database.save('password', password);
}`,
                options: [
                    {
                        code: `function saveUserPassword(password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    database.save('password', hashedPassword);
}`,
                        description: "使用bcrypt進行密碼雜湊",
                        correct: true
                    },
                    {
                        code: `function saveUserPassword(password) {
    const hashedPassword = md5(password);
    database.save('password', hashedPassword);
}`,
                        description: "使用MD5雜湊（不安全）",
                        correct: false
                    },
                    {
                        code: `function saveUserPassword(password) {
    database.save('password', password);
}`,
                        description: "明文儲存密碼",
                        correct: false
                    }
                ],
                tip: "使用bcrypt、scrypt或Argon2等現代雜湊演算法，避免使用MD5或SHA1"
            },
            // 挑戰 4: 網路滲透測試
            {
                title: "網路安全掃描挑戰",
                description: "選擇正確的網路安全掃描工具",
                code: `// 需要選擇適當的網路掃描工具
function scanNetwork(target) {
    // 選擇掃描工具
}`,
                options: [
                    {
                        code: `function scanNetwork(target) {
    // 使用Nmap進行端口掃描
    const result = nmap.scan(target, ['-sS', '-p', '1-1000']);
    return result;
}`,
                        description: "使用Nmap進行SYN掃描",
                        correct: true
                    },
                    {
                        code: `function scanNetwork(target) {
    // 使用ping掃描
    const result = ping.scan(target);
    return result;
}`,
                        description: "僅使用ping掃描",
                        correct: false
                    },
                    {
                        code: `function scanNetwork(target) {
    // 使用telnet掃描
    const result = telnet.scan(target, [21, 22, 23, 80]);
    return result;
}`,
                        description: "使用telnet掃描（不安全）",
                        correct: false
                    }
                ],
                tip: "Nmap是專業的網路掃描工具，支援多種掃描技術"
            }
        ];
    }

    startGame() {
        this.currentLevel = 0;
        this.score = 0;
        
        if (this.selectedDifficulty === 'easy') {
            this.showScreen('gameScreen');
            this.loadQuestion();
        } else if (this.selectedDifficulty === 'advanced') {
            this.showScreen('advancedGameScreen');
            this.loadAdvancedChallenge();
        }
    }

    loadQuestion() {
        if (this.currentLevel >= this.questions.length) {
            this.showResults();
            return;
        }

        this.currentQuestion = this.questions[this.currentLevel];
        this.selectedAnswer = null;

        // 更新UI
        document.getElementById('currentLevel').textContent = this.currentLevel + 1;
        document.getElementById('totalLevels').textContent = this.questions.length;
        document.getElementById('score').textContent = this.score;
        document.getElementById('questionTitle').textContent = this.currentQuestion.title;
        document.getElementById('questionText').textContent = this.currentQuestion.text;

        // 更新進度條
        const progress = ((this.currentLevel) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';

        // 更新選項
        this.updateOptions();

        // 重置按鈕狀態
        document.getElementById('nextQuestion').disabled = true;
    }

    loadAdvancedChallenge() {
        if (this.currentLevel >= this.advancedChallenges.length) {
            this.showResults();
            return;
        }

        this.currentChallenge = this.advancedChallenges[this.currentLevel];
        this.selectedCodeOption = null;

        // 更新UI
        document.getElementById('advancedCurrentLevel').textContent = this.currentLevel + 1;
        document.getElementById('advancedTotalLevels').textContent = this.advancedChallenges.length;
        document.getElementById('advancedScore').textContent = this.score;
        document.getElementById('challengeTitle').textContent = this.currentChallenge.title;
        document.getElementById('challengeDescription').textContent = this.currentChallenge.description;

        // 更新進度條
        const progress = ((this.currentLevel) / this.advancedChallenges.length) * 100;
        document.getElementById('advancedProgressFill').style.width = progress + '%';

        // 更新程式碼
        document.getElementById('codeContent').textContent = this.currentChallenge.code;

        // 更新程式碼選項
        this.updateCodeOptions();

        // 重置按鈕狀態
        document.getElementById('nextAdvancedQuestion').disabled = true;
    }

    updateOptions() {
        const optionsContainer = document.querySelector('.options-container');
        optionsContainer.innerHTML = '';

        this.currentQuestion.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.dataset.correct = option.correct;
            optionElement.dataset.index = index;

            optionElement.innerHTML = `
                <div class="option-icon">
                    <i class="fas fa-${option.correct ? 'check' : 'times'}"></i>
                </div>
                <div class="option-text">
                    <h4>${option.text}</h4>
                    <p>${option.description}</p>
                </div>
            `;

            optionElement.addEventListener('click', () => {
                this.selectAnswer(index);
            });

            optionsContainer.appendChild(optionElement);
        });
    }

    updateCodeOptions() {
        const optionsContainer = document.getElementById('codeOptions');
        optionsContainer.innerHTML = '';

        this.currentChallenge.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'code-option';
            optionElement.dataset.correct = option.correct;
            optionElement.dataset.index = index;

            optionElement.innerHTML = `
                <div class="code-option-header">
                    <span class="option-description">${option.description}</span>
                </div>
                <pre><code>${option.code}</code></pre>
            `;

            optionElement.addEventListener('click', () => {
                this.selectCodeOption(index);
            });

            optionsContainer.appendChild(optionElement);
        });
    }

    selectAnswer(index) {
        if (this.selectedAnswer !== null) return;

        this.selectedAnswer = index;
        const options = document.querySelectorAll('.option');
        const selectedOption = options[index];
        const isCorrect = this.currentQuestion.options[index].correct;

        // 顯示選擇結果
        options.forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
        });

        if (isCorrect) {
            selectedOption.classList.add('correct');
            this.score += 20;
            this.showNotification('正確！+20分', 'success');
        } else {
            selectedOption.classList.add('incorrect');
            // 顯示正確答案
            options.forEach((option, i) => {
                if (this.currentQuestion.options[i].correct) {
                    option.classList.add('correct');
                }
            });
            this.showNotification('錯誤！', 'error');
        }

        // 啟用下一題按鈕
        document.getElementById('nextQuestion').disabled = false;
    }

    selectCodeOption(index) {
        if (this.selectedCodeOption !== null) return;

        this.selectedCodeOption = index;
        const options = document.querySelectorAll('.code-option');
        const selectedOption = options[index];
        const isCorrect = this.currentChallenge.options[index].correct;

        // 顯示選擇結果
        options.forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
        });

        selectedOption.classList.add('selected');

        if (isCorrect) {
            this.score += 25;
            this.showNotification('正確的修復方案！+25分', 'success');
        } else {
            this.showNotification('錯誤的修復方案', 'error');
        }

        // 啟用下一關按鈕
        document.getElementById('nextAdvancedQuestion').disabled = false;
    }

    runCode() {
        if (this.selectedCodeOption === null) {
            this.showNotification('請先選擇一個修復方案', 'warning');
            return;
        }

        const selectedOption = this.currentChallenge.options[this.selectedCodeOption];
        
        // 模擬程式碼執行
        this.showNotification('正在執行程式碼...', 'info');
        
        setTimeout(() => {
            if (selectedOption.correct) {
                this.showNotification('程式碼執行成功！漏洞已修復', 'success');
            } else {
                this.showNotification('程式碼執行失敗！漏洞仍然存在', 'error');
            }
        }, 1500);
    }

    nextQuestion() {
        this.currentLevel++;
        this.loadQuestion();
    }

    nextAdvancedQuestion() {
        this.currentLevel++;
        this.loadAdvancedChallenge();
    }

    showResults() {
        this.showScreen('resultScreen');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('difficultyBadge').textContent = 
            this.selectedDifficulty === 'easy' ? '初級模式' : '進階模式';
        this.updateScoreBreakdown();
        this.updateSecurityTips();
    }

    updateScoreBreakdown() {
        const breakdown = document.getElementById('scoreBreakdown');
        const maxScore = this.selectedDifficulty === 'easy' ? 
            this.questions.length * 20 : this.advancedChallenges.length * 25;
        const percentage = Math.round((this.score / maxScore) * 100);

        breakdown.innerHTML = `
            <div class="tip-item">
                <h4>總分: ${this.score} / ${maxScore}</h4>
                <p>正確率: ${percentage}%</p>
            </div>
            <div class="tip-item">
                <h4>表現評級</h4>
                <p>${this.getPerformanceRating(percentage)}</p>
            </div>
        `;
    }

    getPerformanceRating(percentage) {
        if (percentage >= 90) return "資安專家 🏆";
        if (percentage >= 70) return "資安高手 🥇";
        if (percentage >= 50) return "資安新手 🥈";
        return "需要加強學習 📚";
    }

    updateSecurityTips() {
        const tipsContainer = document.getElementById('securityTips');
        let tips = [];

        if (this.selectedDifficulty === 'easy') {
            tips = [
                {
                    title: "強密碼原則",
                    content: "使用至少12位字符，包含大小寫字母、數字和特殊符號"
                },
                {
                    title: "釣魚防護",
                    content: "不要點擊可疑連結，不要回應緊急要求"
                },
                {
                    title: "個人資訊保護",
                    content: "避免在社交媒體分享可能用於密碼重置的資訊"
                },
                {
                    title: "網路安全",
                    content: "使用VPN和HTTPS，避免在公共WiFi進行敏感操作"
                },
                {
                    title: "資料備份",
                    content: "定期備份重要資料，使用密碼管理器"
                }
            ];
        } else {
            tips = [
                {
                    title: "SQL注入防護",
                    content: "使用參數化查詢，避免字串拼接SQL語句"
                },
                {
                    title: "XSS攻擊防護",
                    content: "使用textContent而不是innerHTML，對用戶輸入進行驗證"
                },
                {
                    title: "密碼安全儲存",
                    content: "使用bcrypt、scrypt或Argon2等現代雜湊演算法"
                },
                {
                    title: "網路安全掃描",
                    content: "使用Nmap等專業工具進行安全評估"
                },
                {
                    title: "程式碼安全審查",
                    content: "定期進行程式碼安全審查，使用靜態分析工具"
                }
            ];
        }

        tipsContainer.innerHTML = tips.map(tip => `
            <div class="tip-item">
                <h4>${tip.title}</h4>
                <p>${tip.content}</p>
            </div>
        `).join('');
    }

    restartGame() {
        this.currentLevel = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.selectedCodeOption = null;
        
        if (this.selectedDifficulty === 'easy') {
            this.showScreen('gameScreen');
            this.loadQuestion();
        } else {
            this.showScreen('advancedGameScreen');
            this.loadAdvancedChallenge();
        }
    }

    showScreen(screenId) {
        // 隱藏所有畫面
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // 顯示指定畫面
        document.getElementById(screenId).classList.add('active');
    }

    showNotification(message, type = 'info') {
        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // 添加樣式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // 3秒後自動移除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || '#17a2b8';
    }
}

// 添加通知動畫樣式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    new CybersecurityGame();
}); 