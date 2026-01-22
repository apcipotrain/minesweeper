/*核心数据结构，封装棋盘与函数*/
export class MinesweeperGame {
    constructor(rows, cols, mineCount){
        this.rows = rows; // 行
        this.cols = cols; // 列
        this.mineCount = mineCount; // 雷数

        this.board = [];
        this.isFirstClick = true;
        this.minesLeft = mineCount; // 剩余雷数
        this.gameOver = false;
        this.startTime = null;
        this.endTime = null;

        this.initBoard();
    }

    /*初始化棋盘*/
    initBoard() {
        this.board = [];
        for (let r = 0; r < this.rows; r++){
            const row = [];
            for (let c = 0; c < this.cols; c++){
                row.push({
                    isMine: false,
                    isOpen: false,
                    isFlag: false,
                    count: 0
                });
            }
            this.board.push(row);
        }
    }

    /*随机布雷（排除首次点击区）*/
    placeMines(firstR, firstC) {
        /*确定安全区：把点击的周围所有点都当安全点位*/
        const safeZone = new Set();
        /*集合，确保不允许重复元素*/
        for(let dr = -1; dr <= 1; dr++){
            for(let dc = -1; dc <= 1; dc++){
                const nr = firstR + dr, nc = firstC + dc;
                if(nr >= 0 && nr < this.rows && nc>=0 && nc < this.cols){
                    safeZone.add(`${nr},${nc}`);
                }
            }
        }

        /*布雷*/
        let placed = 0;
        while (placed < this.mineCount) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            /*math.random()表示从[0,1)取一个数，math.floor()表示向下取整*/
            if (!this.board[r][c].isMine && !safeZone.has(`${r},${c}`)){
                /*如果这个位置之前没有被标记过，而且也不是安全区域，那么当雷*/
                this.board[r][c].isMine = true;
                placed++;
            }
        }

        //计算临雷数
        for (let r = 0; r < this.rows; r++){
            for (let c = 0; c < this.cols; c++){
                this.board[r][c].count = this.countAdjacentMines(r, c);
            }
        }
    }

    /*计算某个点位的临雷数*/
    countAdjacentMines(r, c) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++){
            for (let dc = -1; dc <= 1; dc++){
                /*==类型可以不同，在比较不同类型时，会先尝试把两边转换成同一类型，===类型严格相等，这就牵扯到了js的弱语言特性，不严格区分int floor char等，只有一个数值类型number*/
                if(dr === 0 && dc === 0)
                    continue;
                const nr = r + dr, nc = c + dc;
                if(nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols){
                    if(this.board[nr][nc].isMine){
                        count++;
                    }
                }
            }
        }
        return count;
    }

    /*插旗和取消插旗*/
    toggleFlag(r, c) {
        if (r < 0 || c < 0 || r >= this.rows || c >= this.cols)
            return ;
        //如果点开了肯定不能插旗喵
        if (this.board[r][c].isOpen || this.gameOver)
            return ;
        //异或运算，是旗子就变不是，不是变是，妙哉
        this.board[r][c].isFlag = !this.board[r][c].isFlag;
        //剩下的棋子数，如果是旗子就加一，如果不是就减一
        this.minesLeft += this.board[r][c].isFlag ? -1 : 1;
    }

    /**********打开格子，这是最核心的函数**********/
    openCell(r, c) {
        //判定r和c合法
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols)
            return ;
        //如果游戏结束或者插上旗子，就不能点开
        if(this.gameOver || this.board[r][c].isFlag)
            return ;
        //首次点击
        if(this.isFirstClick) {
            this.placeMines(r, c);      //布雷
            this.isFirstClick = false;  //这个点击标志归零
            this.startTimer();          //开始计时
        }
        //把点击的位置记为元素cell
        const cell = this.board[r][c];
        if (cell.isOpen)
            return ;
        cell.isOpen = true ;

        //踩雷，游戏失败
        if (cell.isMine) {
            this.gameOver = true;
            this.revealMines();
            return "boom";
        }
        //踩0，扩展
        if (cell.count === 0)
            this.expandZeros(r, c);
        //如果踩到最后一个，那就判定胜利
        if (this.checkWin()){
            this.stopTimer();
            this.gameOver = true;
            return "win";
        }
        //普通情况
        return "safe";
    }

    /*扩展零格*/
    expandZeros(r, c) {
        const queue = [[r, c]]
        const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        //上熟悉的bfs，条件特殊了一点，如果碰见了0，那么0这个点入队，反之不入队
        while (queue.length > 0) {
            const [x, y] = queue.shift();
            for (const [dx, dy] of dirs) {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= this.rows || ny < 0 || ny >= this.cols)
                    continue;
                const neighbor = this.board[nx][ny];
                if (!neighbor.isOpen && !neighbor.isFlag) {
                    neighbor.isOpen = true;
                    if(neighbor.count === 0) {
                        queue.push([nx,ny]);
                    }
                }
            }
        }
    }

    /*双键扩展*/
    chordOpen(r, c) {
        const cell = this.board[r][c];
        if (!cell.isOpen || cell.count === 0)
            return ;
        //旗子数统计，等会比较是否等于该点count
        let flagCount = 0;
        const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        for (const [dx, dy] of dirs) {
            const nx = r + dx, ny = c + dy;
            if (nx < 0 || nx >= this.rows || ny < 0 || ny >= this.cols)
                continue;
            if (this.board[nx][ny].isFlag)
                flagCount++;
        }
        //如果点数更少那么不展开，如果等于甚至大于那么展开
        if (flagCount === cell.count) {
            for (const [dx, dy] of dirs) {
                const nx = r + dx, ny = c + dy;
                if (nx < 0 || nx >= this.rows || ny < 0 || ny >= this.cols)
                    continue;
                const neighbor = this.board[nx][ny];
                if (!neighbor.isOpen && !neighbor.isFlag) {
                    const result = this.openCell(nx, ny);//点开
                    if (result === "boom")
                        return "boom";
                    if (result === "win")
                        return "win";
                }
            }
        }
    }

    /*胜负判断*/
    checkWin() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board[r][c];
                if (!cell.isMine && !cell.isOpen) return false;
            }
        }
        return true;
    }

    /*显示所有雷*/
    revealMines() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board[r][c];
                if (cell.isMine) cell.isOpen = true;
            }
        }
    }

    /*计时器*/
    startTimer() {
        this.startTime = Date.now();
    }
    stopTimer() {
        this.endTime = Date.now();
    }
    getElapsedTime() {
        if (!this.startTime)
            return 0;
        return Math.floor(((this.endTime || Date.now()) - this.startTime) / 1000);
    }


    //  * 使用关卡文件（txt）中的数据来初始化一局残局扫雷该方法用于「残局挑战模式」，不会影响经典模式
    initFromMap({ rows, cols, mineMap, openMap, remainMines }) {
        /* ---------- 1. 基础属性重置 ---------- */
        // 残局不是新游戏，因此不允许“首次点击免死”
        this.isFirstClick = false;
        this.rows = rows;
        this.cols = cols;
        // 剩余雷数直接来自关卡文件
        this.mineCount = remainMines;
        this.minesLeft = remainMines;
        this.gameOver = false;
        this.win = false;
        /* ---------- 2. 初始化空棋盘结构 ---------- */
        // 这一步复用你原有的 initBoard（只生成 cell，不布雷）
        this.initBoard();
        /* ---------- 3. 按关卡数据写入雷 & 翻开状态 ---------- */
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = this.board[r][c];
                // 设置雷
                if (mineMap[r][c] === "*") {
                    cell.isMine = true;
                }
                // 设置是否已翻开
                cell.isOpen = openMap[r][c] === "1";
                // 残局中不考虑旗帜初始状态（如以后需要可扩展）
                cell.isFlagged = false;
            }
        }
        /* ---------- 4. 重新计算每个格子的临雷数 ---------- */
        // 不能信任 txt 中的数字，必须由引擎统一计算
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.board[r][c].count = this.countAdjacentMines(r, c);
            }
        }
    }

}

//const game = new MinesweeperGame(16, 30, 99);
