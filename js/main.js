import { BoardUI } from "./board_ui.js"
import { classicTemplate } from "./templates/classic_template.js"

function startClassicGame() {
    //1.清空原页面内容
    document.body.innerHTML = classicTemplate;
    
    //2.创建扫雷棋盘
    const boardUI = new BoardUI(
        document.getElementById("board"),   //棋盘容器，getElementById是获取网页上的元素DOM对象
        16, 30, 99                          //行，列，雷数
    );
    
    //3.设置计时器和剩余雷数
    const timerEl = document.getElementById("timer");
    const mineEl = document.getElementById("mine-left");

    const timerInterval = setInterval(() => {
        timerEl.textContent = boardUI.game.getElapsedTime();
        mineEl.textContent = boardUI.game.minesLeft;
        if (boardUI.game.gameOver) clearInterval(timerInterval);
    }, 100);

    //4.返回按钮，回到封面
    document.getElementById("back-btn").addEventListener("click", () => {
        clearInterval(timerInterval);
        location.reload(); // 重新载入页面回到封面
    });

    //5.重开按钮
    document.getElementById("restart-btn").addEventListener("click", () => {
        const confirmRestart = confirm("确定重新开始游戏吗？现在的进度不会保存哦！");
        if (confirmRestart) {
            clearInterval(timerInterval);
            boardUI.restartGame();
        }
    });
}

//6.给封面按钮绑定事件，如果点击到index.html的“实战演练”，那么就开始进入扫雷界面。
document.getElementById("classic-btn").addEventListener("click", startClassicGame);
