// ==========================
// 章节配置（唯一入口）
// ==========================
const chapterConfigs = {
    1: {
        title: "第一章 基础规则",
        background: "../../assets/images/main_background0.png",
        panelBg: "rgba(0, 0, 0, 0.35)",
        levelBg: "linear-gradient(#e0e0e0, #5ff38eff)",
        levelText: "#333"
    },
    2: {
        title: "第二章 进阶公式",
        background: "../../assets/images/main_background1.png",
        panelBg: "rgba(20, 40, 60, 0.45)",
        levelBg: "linear-gradient(#b3e5fc, #f46ad9ff)",
        levelText: "#034a6b"
    },
    3: {
        title: "第三章 高难残局",
        background: "../../assets/images/main_background2.png",
        panelBg: "rgba(60, 20, 20, 0.45)",
        levelBg: "linear-gradient(#ffd54f, #47d3e5ff)",
        levelText: "#5d2f00"
    }
};

// ==========================
// 读取章节参数
// ==========================
const params = new URLSearchParams(location.search);
const chapterId = params.get("chapter") || "1";
const config = chapterConfigs[chapterId];

// ==========================
// 注入章节样式
// ==========================
document.getElementById("chapter-title").textContent = config.title;

document.body.style.backgroundImage = `url("${config.background}")`;

document.documentElement.style.setProperty("--panel-bg", config.panelBg);
document.documentElement.style.setProperty("--level-bg", config.levelBg);
document.documentElement.style.setProperty("--level-text", config.levelText);

// ==========================
// 生成 8 个关卡
// ==========================
const grid = document.querySelector(".level-grid");

for (let i = 1; i <= 8; i++) {
    const card = document.createElement("div");
    card.className = "level-card";
    card.textContent = i;

    card.onclick = () => {
        alert(`进入 第 ${chapterId} 章 · 第 ${i} 关`);
        // 之后这里跳转残局扫雷页面
        location.href = `./challenge_game.html?chapter=${chapterId}&level=${i}`;
    };

    grid.appendChild(card);
}

// ==========================
// 返回
// ==========================
document.getElementById("back-btn").onclick = () => {
    history.back();
};
