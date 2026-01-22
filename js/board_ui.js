// ================================
// 📘 BoardUI 类说明（最新版）
// 负责扫雷界面的：渲染、事件交互、UI 刷新、结算提示、重开逻辑
//
// 模块职责：
//   🟩 负责 DOM 与交互
//   🔷 不包含任何游戏逻辑（逻辑在 game_core.js）
//
// -------------------------------
// 🟢 运行层函数（游戏流程相关，随游戏不断调用）
//   • renderBoard()        — 创建棋盘 DOM 结构
//   • bindEvents()         — 绑定鼠标事件（左键、右键、双键）
//   • updateBoard()        — 按 game_core 状态刷新格子 UI
//   • startDisplayLoop()   — 定时刷新计时器 & 剩余雷数显示
//
// -------------------------------
// 🔵 系统层函数（系统级逻辑，如胜负、记录、重启）
//   • saveRecord()         — 保存成绩到 localStorage
//   • showResultAlert()    — 结算弹窗（胜/负 + 胜率统计）
//   • restartGame()        — 重建棋盘 + 重新开始游戏
//   • revealAllMines()     — 失败时翻开所有地雷（带动画）
//
// -------------------------------
// 🧩 与 game_core.js 的协作关系
//   • 只负责 UI、事件、成绩显示
//   • 所有游戏规则由 MinesweeperGame 提供
//   • 通过 this.game.method(...) 调用游戏逻辑
// ================================


import { MinesweeperGame } from "./game_core.js"

export class BoardUI {
    //------------运行层函数------------//
    constructor(container, rows = 16, cols = 30, mines = 99) {
        //接受容器元素（棋盘父）div
        this.container = container;
        //创建游戏核心对象
        this.game = new MinesweeperGame(rows, cols, mines);
        //渲染棋盘
        this.renderBoard();
        //绑定鼠标事件
        this.bindEvents();

        // 定位计时器和雷数显示 DOM 元素
        this.timerEl = document.getElementById("timer");
        this.mineEl = document.getElementById("mine-left");

        // 启动一个显示循环，但计时逻辑仍来自 game_core
        this.startDisplayLoop();
    }
    /*生成棋盘结构*/
    renderBoard() {
        //清空div盒子的内容，例如<div id="board">旧内容</div>变成<div id="board"></div>
        this.container.innerHTML = "";
        //给元素加一个CSS类名，如<div id="board"></div>变成<div id="board" class="board"></div>
        this.container.classList.add("board");

        for (let r = 0; r < this.game.rows; r++) {
            const rowEl = document.createElement("div");
            rowEl.classList.add("row");

            for (let c = 0; c < this.game.cols; c++) {
                const cellEl = document.createElement("div");
                cellEl.classList.add("cell");
                cellEl.dataset.row = r;
                cellEl.dataset.col = c;
                rowEl.appendChild(cellEl);
            }
            this.container.appendChild(rowEl);
        }
    }
    /*绑定交互事件*/
    bindEvents() {
        this.leftDown = false;
        this.rightDown = false;
        //检测按下（单独按下，还没起来）
        this.container.addEventListener("mousedown", e => {
            const cell = e.target.closest(".cell");
            if (!cell) return;
            //类型转换运算符，从字符串变成数字，下面的parseInt也是同样的功能
            const r = +cell.dataset.row;
            const c = +cell.dataset.col;
            //0是左键，1是滚轮，2是右键
            if(e.button === 0) this.leftDown = true;
            if(e.button === 2) this.rightDown = true;
            
            if(this.leftDown && this.rightDown) {
                const result = this.game.chordOpen(r, c);
                this.updateBoard();
                if (result === "boom") this.showResultAlert("lose");
                if (result === "win") {
                    setTimeout(() => {
                        this.updateBoard();
                        this.showResultAlert("win");
                    }, 150);
                }
            }
        });
        //按下了需要重置
        this.container.addEventListener("mouseup", e => {
            if (e.button === 0) this.leftDown = false;
            if (e.button === 2) this.rightDown = false;
        });

        //左键：打开格子
        this.container.addEventListener("click", e => {
            //click代表左键点击事件
            const cell = e.target.closest(".cell");
            if (!cell) return ;

            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);

            const result = this.game.openCell(r, c);
            this.updateBoard();

            if (result === "boom") this.showResultAlert("lose");
            if (result === "win") {
                setTimeout(() => {
                    this.updateBoard();
                    this.showResultAlert("win");
                }, 150);
            }
        });

        //右键：插旗
        this.container.addEventListener("contextmenu", e => {
            //contextmenu代表右键，因为默认情况下右键弹出系统菜单
            const cell = e.target.closest(".cell");
            if (!cell) return ;//不是格子就不拦截

            e.preventDefault();//是格子就要拦截
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);

            this.game.toggleFlag(r, c);
            this.updateBoard();
        });

        // 🧩 浏览器级防护，禁止手势导航和误触行为
        this.container.addEventListener("contextmenu", e => e.preventDefault()); // 右键菜单已在逻辑层处理
        this.container.addEventListener("selectstart", e => e.preventDefault()); // 禁止文字选中
        this.container.addEventListener("dragstart", e => e.preventDefault());   // 禁止拖拽
        this.container.addEventListener("mousedown", e => {
            // 禁止中键滚动
            if (e.button === 1) e.preventDefault();
            // 禁止左右键同时按下导致手势导航
            if (e.buttons === 3) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, { passive: false });
    }
    /*刷新显示*/
    updateBoard() {
        for (let r = 0; r < this.game.rows; r++){
            for (let c = 0; c < this.game.cols; c++){
                //cellEl是每个格子的HTML元素对象
                const cellEl = this.container.querySelector(
                    `.cell[data-row='${r}'][data-col='${c}']`
                );
                const cell = this.game.board[r][c];

                //重置class
                cellEl.className = "cell";
                
                //格子被点开，是地雷，显示炸弹，不是地雷显示边上雷的数字（可能不存在）
                if (cell.isOpen) {
                    if (cell.isMine) {
                        cellEl.classList.add("mine");
                        cellEl.textContent = "💣";
                    } else {
                        cellEl.classList.add("open");
                        cellEl.textContent = cell.count > 0 ? cell.count : ""; 
                        
                        //让CSS根据data-num为扫出来的数字着色
                        if (cell.count > 0) {
                            cellEl.dataset.num = cell.count;
                        } else {
                            cellEl.removeAttribute("data-num"); //没数字就移除属性
                        }
                    }
                } else if (cell.isFlag) {
                    cellEl.classList.add("flag");
                    cellEl.textContent = "🚩";
                } else {
                    cellEl.textContent = "";
                }
            }
        }
    }
    /* === ⏱ 启动显示循环 === */
    startDisplayLoop() {
        clearInterval(this.displayInterval);
        this.timerEl.textContent = "0";
        this.mineEl.textContent = this.game.mineCount;

        this.displayInterval = setInterval(() => {
            // 🧠 时间来源于 game_core 的 getElapsedTime()
            this.timerEl.textContent = this.game.getElapsedTime();
            this.mineEl.textContent = this.game.minesLeft;

            // 游戏结束后停止刷新
            if (this.game.gameOver) clearInterval(this.displayInterval);
        }, 100);
    }

    //------------系统层函数------------//
    /* === 🧩 保存成绩记录 === */
    saveRecord(result) {
        // 日期 用时 结果 2025-11-12 21:00 210 win
        const now = new Date();
        const timeUsed = this.game.getElapsedTime();
        //这句是从浏览器读取存档（成绩记录）的代码.localStorage 是浏览器内置“本地数据库”,localStorage.getItem("records") 取出字符串,JSON.parse() 把字符串转回数组对象
        const data = JSON.parse(localStorage.getItem("records") || "[]");

        data.push({
            date: now.toLocaleString(),
            time: timeUsed,
            result: result
        });
        localStorage.setItem("records", JSON.stringify(data));
    }
    /* === ♻️ 重新开始游戏 === */
    restartGame() {
        //移除旧事件监听器
        const newContainer = this.container.cloneNode(false);   //克隆新对象，不复制子元素，因为上一个棋盘带有很多状态
        this.container.parentNode.replaceChild(newContainer, this.container);   //新的容器代替旧的容器
        this.container = newContainer;  //指针指向这个容器

        //新建游戏对象
        this.game = new MinesweeperGame(this.game.rows, this.game.cols, this.game.mineCount);
        //重新绘制棋盘
        this.renderBoard();
        //重新绑定交互
        this.bindEvents();
        //重新刷新时间与雷数
        this.startDisplayLoop();
        //重新绑定返回按钮
        /*const backbtn = document.getElementById("back-btn");
        if (backbtn) {
            backbtn.onclick = () => location.reload();
        }*/
    }
    /* === 🏁 弹出结算信息 === */
    showResultAlert(result) {
        //if (this.game.gameOver) return; // 防止重复触发

        /* === 🏁 弹出结算信息 === */
        const timeUsed = this.game.getElapsedTime();
        this.saveRecord(result);
        //读取统计
        const data = JSON.parse(localStorage.getItem("records") || "[]");
        const total = data.length;
        const wins = data.filter(d => d.result === "win").length;
        const winRecords = data.filter(d => d.result === "win");
        const best = winRecords.length > 0 ? Math.min(...winRecords.map(d => d.time || 9999)) : 9999;
        const rate = ((wins / total) * 100).toFixed(1);
        const bestText = best === 9999 ? "暂无胜利记录" : `${best}秒`;
        const title = result === "win" ? "🎉 恭喜你赢了！" : "💣 很遗憾，你输了！";
        //这两个是箭头函数表达式。每个 d 就是数组中一条成绩记录对象。
        const msg = 
        `${title}

        本局用时：${timeUsed} 秒
        最佳时间：${bestText} 秒
        游戏日期：${new Date().toLocaleString()}
        已玩局数：${total}
        已胜局数：${wins}
        胜率：${rate}%

        要再玩一局吗？`;

        if (result === "lose") {
            this.revealAllMines();  // 先全部翻出来，播放动画
            this.updateBoard();     // 更新DOM渲染
            setTimeout(() => {
                const again = confirm(msg);  // 延迟0.6秒弹出提示框
                if (again) {
                    this.restartGame();  // 重新开始本局
                } else {
                    location.reload();   // ✅ 同样直接返回主界面
                }
            }, 600);  // 动画持续0.5秒，这里延迟略长一点
        }
        else {
            const again = confirm(msg);  // 胜利即时弹出
            if (again) {
                this.restartGame();  // 胜利后直接重开
            } else {
                location.reload();   // ✅ 同样直接返回主界面
            }
        }

    }
    //翻开雷的动画
    revealAllMines() {
        for (let r = 0; r < this.game.rows; r++) {
            for (let c = 0; c < this.game.cols; c++) {
                const cell = this.game.board[r][c];
                const cellEl = this.container.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
                if (cell.isMine) {
                    cellEl.classList.add("mine");
                    cellEl.textContent = "💣" ;
                }
            }
        }
    }
}
