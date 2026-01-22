export const classicTemplate = `
<link rel="stylesheet" href="style/board.css">
<div class="game-wrapper">
    <!-- 顶部控制区 -->
    <div class="top-bar">
        <div class="left-group">
            <button id="back-btn" class="top-btn">返回</button>
            <button id="restart-btn" class="top-btn">重新开始</button>
        </div>

        <div class="center-group status-left">⏱  <span id="timer">0</span>s</div>
        <div class="right-group status-right">💣  <span id="mine-left">99</span></div>
    </div>
    <!-- 棋盘容器 -->
    <div id="board"></div>
</div>
`;
