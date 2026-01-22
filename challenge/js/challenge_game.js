/* =========================================
   challenge_game.js
   残局挑战 · 游戏主控制
   只负责：读关卡 / 绑定事件 / 渲染 UI
========================================= */

import { MinesweeperGame } from "../../js/game_core.js";
import { showFeedback } from "./challenge_feedback.js";

/* -------------------------
   读取 URL 参数
-------------------------- */
const params = new URLSearchParams(location.search);
const chapter = parseInt(params.get("chapter"));
const level = parseInt(params.get("level"));

/* -------------------------
   DOM 元素
-------------------------- */
const boardEl = document.getElementById("board");
const titleEl = document.getElementById("level-title");
const mineLeftEl = document.getElementById("mine-count");

/* -------------------------
   游戏对象
-------------------------- */
let game = null;
let levelData = null;
let gameFinished = false;

/* -------------------------
   鼠标状态（关键）
-------------------------- */
let leftDown = false;
let rightDown = false;

/* =========================
   初始化入口
========================= */
init();

async function init() {
    // 设置背景（必须最先做）
    document.body.style.backgroundImage =
        `url("../../assets/images/main_background${chapter - 1}.png")`;

    // 加载关卡
    levelData = await loadLevel(chapter, level);

    // 标题
    titleEl.textContent =
        `第 ${chapter} 章 · 第 ${level} 关 · ${levelData.name}`;

    // 初始化游戏
    game = new MinesweeperGame();
    game.initFromMap(levelData);

    window.__debugGame = game;

    renderBoard();
}

/* =========================
   加载关卡 txt
========================= */
async function loadLevel(chapter, level) {
    const url = `../../assets/challenges/chapter${chapter}/${level}.txt`;
    const text = await fetch(url).then(r => r.text());
    return parseLevel(text);
}

/* =========================
   解析关卡文本
========================= */
function parseLevel(text) {
    const lines = text.trim().split(/\r?\n/);

    const name = lines[0];
    const [rows, cols] = lines[1].split(" ").map(Number);

    const mineMap = lines.slice(2, 2 + rows);
    const openMap = lines.slice(2 + rows, 2 + rows * 2);
    const remainMines = parseInt(lines[2 + rows * 2]);
    const successText = lines[2 + rows * 2 + 1] || "";

    return {
        name,
        rows,
        cols,
        mineMap,
        openMap,
        remainMines,
        successText
    };
}

/* =========================
   渲染棋盘
========================= */
function renderBoard() {
    boardEl.innerHTML = "";
    const cellSize = calcCellSize(game.rows, game.cols);

    for (let r = 0; r < game.rows; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";

        for (let c = 0; c < game.cols; c++) {
            const cell = game.board[r][c];
            const cellDiv = document.createElement("div");
            cellDiv.className = "cell";

            /* ★★★ 把尺寸真正用上 ★★★ */
            cellDiv.style.width = cellSize + "px";
            cellDiv.style.height = cellSize + "px";
            cellDiv.style.lineHeight = cellSize + "px";

            if (cell.isOpen) {
                cellDiv.classList.add("open");
                if (cell.isMine) {
                    cellDiv.classList.add("mine");
                    cellDiv.textContent = "💣";
                } else if (cell.count > 0) {
                    cellDiv.textContent = cell.count;
                    cellDiv.dataset.num = cell.count;
                }
            } else if (cell.isFlag) {
                cellDiv.classList.add("flag");
                cellDiv.textContent = "🚩";
            }

            bindCellEvents(cellDiv, r, c);
            rowDiv.appendChild(cellDiv);
        }

        boardEl.appendChild(rowDiv);
    }

    mineLeftEl.textContent = game.minesLeft;
}


/* =========================
   绑定扫雷事件（稳定版）
========================= */
function bindCellEvents(cellDiv, r, c) {
    // 禁止浏览器右键菜单
    cellDiv.oncontextmenu = e => e.preventDefault();

    cellDiv.addEventListener("mousedown", e => {
        if (gameFinished) return;

        if (e.button === 0) leftDown = true;
        if (e.button === 2) rightDown = true;
    });

    cellDiv.addEventListener("mouseup", e => {
        if (gameFinished) return;

        // ★ 一次操作只处理一次
        if (leftDown && rightDown) {
            game.chordOpen(r, c);
            afterAction();
        }
        else if (e.button === 0) {
            game.openCell(r, c);
            afterAction();
        }
        else if (e.button === 2) {
            game.toggleFlag(r, c);
            afterAction();
        }

        leftDown = false;
        rightDown = false;
    });
}

/* =========================
   操作后的统一结算
========================= */
function afterAction() {
    renderBoard();

    // ✅ 先判胜利
    if (game.checkWin()) {
        gameFinished = true;
        showFeedback("success", levelData.successText);
        return;
    }

    // ❌ 再判失败
    if (game.gameOver) {
        gameFinished = true;
        showFeedback("fail");
        return;
    }
}

/* =========================
   计算格子尺寸
========================= */
function calcCellSize(rows, cols) {
    const maxWidth = Math.min(window.innerWidth * 0.9, 1080);
    const maxHeight = window.innerHeight * 0.7;

    return Math.floor(
        Math.min(maxWidth / cols, maxHeight / rows)
    );
}


/* -----------------------------
   返回键
----------------------------- */
document.getElementById("back-btn").onclick = () => {
    history.back();
};
