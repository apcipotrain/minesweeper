/* =========================================
   challenge_feedback.js
   残局挑战 · 交互反馈层
   只负责 UI 提示，不参与任何规则判断
========================================= */

/**
 * 创建并显示反馈遮罩
 * @param {"success" | "fail"} type
 * @param {string} successText
 */
export function showFeedback(type, successText = "") {
    // 防止重复创建
    if (document.getElementById("challenge-feedback")) return;

    const overlay = document.createElement("div");
    overlay.id = "challenge-feedback";

    overlay.innerHTML = `
        <div class="feedback-panel ${type}">
            <h2 class="feedback-title">
                ${type === "success" ? "挑战成功" : "挑战失败"}
            </h2>
            ${successText ? `<div class="feedback-sub">${successText}</div>` : ""}
            <div class="feedback-actions">
                <button id="feedback-retry">重试</button>
                <button id="feedback-back">返回</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    /* ---- 交互行为 ---- */

    // 重试：刷新当前关卡
    document.getElementById("feedback-retry").onclick = () => {
        location.reload();
    };

    // 返回：回到关卡选择
    document.getElementById("feedback-back").onclick = () => {
        history.back();
    };
}
