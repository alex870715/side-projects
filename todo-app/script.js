class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.currentView = 'list';
        this.currentDate = new Date();
        this.selectedDate = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
        this.renderCalendar();
        this.setDefaultDates();
    }

    bindEvents() {
        // 新增待辦事項
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // 視圖切換
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                this.switchView();
            });
        });

        // 篩選按鈕
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // 清除按鈕
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());

        // 月曆導航
        document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());

        // 模態框事件
        document.getElementById('datePickerModal').addEventListener('click', (e) => {
            if (e.target.id === 'datePickerModal') this.closeModal();
        });
        document.querySelector('.close-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelDate').addEventListener('click', () => this.closeModal());
        document.getElementById('confirmDate').addEventListener('click', () => this.confirmDate());
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('todoDate').value = today;
        document.getElementById('todoDueDate').value = today;
    }

    switchView() {
        document.querySelectorAll('.view-content').forEach(view => {
            view.classList.remove('active');
        });
        
        if (this.currentView === 'list') {
            document.getElementById('listView').classList.add('active');
        } else {
            document.getElementById('calendarView').classList.add('active');
        }
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const createDateInput = document.getElementById('todoDate');
        const dueDateInput = document.getElementById('todoDueDate');
        const text = input.value.trim();
        const createDate = createDateInput.value;
        const dueDate = dueDateInput.value;
        
        if (text && createDate && dueDate) {
            if (createDate > dueDate) {
                this.showNotification('建立日期不能晚於到期日期！', 'error');
                return;
            }

            const todo = {
                id: Date.now(),
                text: text,
                completed: false,
                createDate: createDate,
                dueDate: dueDate,
                createdAt: new Date().toISOString()
            };
            
            this.todos.unshift(todo);
            this.saveToLocalStorage();
            this.render();
            this.updateStats();
            this.renderCalendar();
            input.value = '';
            this.setDefaultDates();
            
            this.showNotification('待辦事項已新增！', 'success');
        } else if (!text) {
            this.showNotification('請輸入待辦事項內容！', 'warning');
        } else if (!createDate) {
            this.showNotification('請選擇建立日期！', 'warning');
        } else if (!dueDate) {
            this.showNotification('請選擇到期日期！', 'warning');
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
            this.updateStats();
            this.renderCalendar();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('編輯待辦事項:', todo.text);
        if (newText !== null && newText.trim() !== '') {
            todo.text = newText.trim();
            this.saveToLocalStorage();
            this.render();
            this.renderCalendar();
            this.showNotification('待辦事項已更新！', 'success');
        }
    }

    editTodoDate(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.selectedDate = todo;
        document.getElementById('modalCreateDate').value = todo.createDate;
        document.getElementById('modalDueDate').value = todo.dueDate;
        this.openModal();
    }

    openModal() {
        document.getElementById('datePickerModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('datePickerModal').style.display = 'none';
        this.selectedDate = null;
    }

    confirmDate() {
        if (this.selectedDate) {
            const newCreateDate = document.getElementById('modalCreateDate').value;
            const newDueDate = document.getElementById('modalDueDate').value;
            
            if (newCreateDate && newDueDate) {
                if (newCreateDate > newDueDate) {
                    this.showNotification('建立日期不能晚於到期日期！', 'error');
                    return;
                }
                
                this.selectedDate.createDate = newCreateDate;
                this.selectedDate.dueDate = newDueDate;
                this.saveToLocalStorage();
                this.render();
                this.renderCalendar();
                this.showNotification('日期已更新！', 'success');
            }
        }
        this.closeModal();
    }

    deleteTodo(id) {
        if (confirm('確定要刪除這個待辦事項嗎？')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.render();
            this.updateStats();
            this.renderCalendar();
            this.showNotification('待辦事項已刪除！', 'info');
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('沒有已完成的待辦事項！', 'warning');
            return;
        }

        if (confirm(`確定要刪除 ${completedCount} 個已完成的待辦事項嗎？`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToLocalStorage();
            this.render();
            this.updateStats();
            this.renderCalendar();
            this.showNotification(`${completedCount} 個待辦事項已清除！`, 'success');
        }
    }

    clearAll() {
        if (this.todos.length === 0) {
            this.showNotification('沒有待辦事項可以清除！', 'warning');
            return;
        }

        if (confirm(`確定要刪除所有 ${this.todos.length} 個待辦事項嗎？`)) {
            this.todos = [];
            this.saveToLocalStorage();
            this.render();
            this.updateStats();
            this.renderCalendar();
            this.showNotification('所有待辦事項已清除！', 'success');
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = this.getEmptyStateHTML();
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => this.getTodoHTML(todo)).join('');
        this.bindTodoEvents();
    }

    getFilteredTodos() {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            case 'today':
                return this.todos.filter(t => t.dueDate === today);
            case 'upcoming':
                return this.todos.filter(t => t.dueDate >= today && !t.completed);
            case 'overdue':
                return this.todos.filter(t => t.dueDate < today && !t.completed);
            default:
                return this.todos;
        }
    }

    getTodoHTML(todo) {
        const completedClass = todo.completed ? 'completed' : '';
        const checked = todo.completed ? 'checked' : '';
        const statusClass = this.getTodoStatusClass(todo);
        
        return `
            <li class="todo-item ${completedClass} ${statusClass}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${checked}>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-dates">
                    <span class="todo-date create-date">建立: ${this.formatDate(todo.createDate)}</span>
                    <span class="todo-date due-date ${this.getDueDateClass(todo)}">到期: ${this.formatDate(todo.dueDate)}</span>
                </div>
                <div class="todo-actions">
                    <button class="edit-btn" title="編輯">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="date-btn" title="修改日期">
                        <i class="fas fa-calendar"></i>
                    </button>
                    <button class="delete-btn" title="刪除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }

    getTodoStatusClass(todo) {
        if (todo.completed) return '';
        
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date(todo.dueDate);
        const todayDate = new Date(today);
        const diffTime = dueDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'overdue';
        } else if (diffDays <= 7) {
            return 'warning';
        }
        
        return '';
    }

    getDueDateClass(todo) {
        if (todo.completed) return '';
        
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date(todo.dueDate);
        const todayDate = new Date(today);
        const diffTime = dueDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'overdue';
        } else if (diffDays <= 7) {
            return 'warning';
        }
        
        return '';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (dateString === today.toISOString().split('T')[0]) {
            return '今天';
        } else if (dateString === tomorrow.toISOString().split('T')[0]) {
            return '明天';
        } else {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }
    }

    getEmptyStateHTML() {
        const messages = {
            all: '還沒有任何待辦事項，開始新增您的第一個任務吧！',
            active: '沒有進行中的待辦事項',
            completed: '沒有已完成的待辦事項',
            today: '今天沒有到期的待辦事項',
            upcoming: '沒有即將到期的待辦事項',
            overdue: '沒有逾期的待辦事項'
        };

        return `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>${messages[this.currentFilter]}</p>
            </div>
        `;
    }

    bindTodoEvents() {
        // 勾選框事件
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.closest('.todo-item').dataset.id);
                this.toggleTodo(id);
            });
        });

        // 編輯按鈕事件
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.todo-item').dataset.id);
                this.editTodo(id);
            });
        });

        // 日期按鈕事件
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.todo-item').dataset.id);
                this.editTodoDate(id);
            });
        });

        // 刪除按鈕事件
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.todo-item').dataset.id);
                this.deleteTodo(id);
            });
        });
    }

    // 月曆相關功能
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        document.getElementById('currentMonth').textContent = 
            `${year}年${month + 1}月`;
        
        this.renderCalendarDays(year, month);
    }

    renderCalendarDays(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';
        
        const today = new Date().toISOString().split('T')[0];
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dateString = currentDate.toISOString().split('T')[0];
            const dayTodos = this.todos.filter(t => t.dueDate === dateString);
            const completedTodos = dayTodos.filter(t => t.completed);
            const overdueTodos = dayTodos.filter(t => !t.completed && t.dueDate < today);
            const warningTodos = dayTodos.filter(t => !t.completed && !overdueTodos.includes(t));
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (currentDate.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (dateString === today) {
                dayElement.classList.add('today');
            }
            
            if (dayTodos.length > 0) {
                dayElement.classList.add('has-todos');
                if (completedTodos.length === dayTodos.length) {
                    dayElement.classList.add('completed');
                }
                if (overdueTodos.length > 0) {
                    dayElement.classList.add('has-overdue');
                }
            }
            
            dayElement.innerHTML = `
                <div class="day-number">${currentDate.getDate()}</div>
                <div class="day-todos">
                    ${dayTodos.length > 0 ? `${dayTodos.length} 項` : ''}
                </div>
                ${dayTodos.map(todo => `
                    <div class="todo-indicator ${this.getTodoIndicatorClass(todo)}"></div>
                `).join('')}
            `;
            
            dayElement.addEventListener('click', () => {
                this.showDayTodos(dateString, dayTodos);
            });
            
            calendarDays.appendChild(dayElement);
        }
    }

    getTodoIndicatorClass(todo) {
        if (todo.completed) return 'completed';
        
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date(todo.dueDate);
        const todayDate = new Date(today);
        const diffTime = dueDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'overdue';
        } else if (diffDays <= 7) {
            return 'warning';
        }
        
        return '';
    }

    showDayTodos(dateString, todos) {
        if (todos.length === 0) {
            this.showNotification('這一天沒有到期的待辦事項', 'info');
            return;
        }
        
        const dateDisplay = this.formatDate(dateString);
        const todoList = todos.map(todo => {
            const status = todo.completed ? '✅' : 
                          todo.dueDate < new Date().toISOString().split('T')[0] ? '🔴' : 
                          this.getTodoStatusClass(todo) === 'warning' ? '🟡' : '⭕';
            return `${status} ${todo.text}`;
        }).join('\n');
        
        alert(`${dateDisplay} 的待辦事項：\n\n${todoList}`);
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    updateStats() {
        const totalTasks = this.todos.length;
        const completedTasks = this.todos.filter(t => t.completed).length;
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = this.todos.filter(t => t.dueDate === today).length;
        const overdueTasks = this.todos.filter(t => t.dueDate < today && !t.completed).length;
        
        document.getElementById('totalTasks').textContent = `總計: ${totalTasks} 項`;
        document.getElementById('completedTasks').textContent = `已完成: ${completedTasks} 項`;
        document.getElementById('todayTasks').textContent = `今日: ${todayTasks} 項`;
        document.getElementById('overdueTasks').textContent = `逾期: ${overdueTasks} 項`;
    }

    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

// 初始化應用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
}); 