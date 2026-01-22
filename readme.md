# 💣 Minesweeper Online · 高级扫雷网页项目

## 🧭 项目简介
本项目是一个完全前端实现的网页版扫雷游戏，采用 **HTML + CSS + JavaScript (ES Module)** 技术栈，  

由 Python 简易本地服务器提供页面支持。

包括以下功能：

- ✅ 经典 16×30 扫雷布局（99 雷）
- ✅ 扫雷残局关卡模式，不限时间，解出即可得到圣经指点
- ✅ 首次点击自动避雷、左键点开、右键插旗、双键连开功能
- ✅ 保留动态计时器、剩余雷数显示，雷数、时间、胜负实时更新

---

## ⚙️ （以下为用户需要了解的）运行环境要求

###  1️⃣ 安装 Python 环境
确保本地已安装 Python（推荐版本 ≥ 3.8）。  

可在命令行输入以下命令验证：

```bash
python --version
```

若能输出版本号（如 Python 3.12.1），说明环境正常。

### 2️⃣ 启动本地服务器

（1）项目根目录下提供批处理文件：

```bash
start_server.bat
```

运行方法：

双击 start_server.bat 即可

内容如下：

```bat
@echo off
chcp 65001 >nul
title Minesweeper Local Server
echo 🚀 启动本地服务器中，请稍候...
echo --------------------------------------
echo 访问地址:  http://localhost:8080
echo (请在浏览器中打开该地址)
echo --------------------------------------
python -m http.server 8080
pause
```

（2）或在命令行进入项目目录，执行：

```bash
python -m http.server 8080
```

🔹 启动成功后，在浏览器访问：
http://localhost:8080

------

## 🌐 访问方式

服务器启动后，在浏览器中访问：

> 📍 [http://localhost:8080](http://localhost:8080)

即可进入封面界面。

### 🧩 游戏操作说明

- 左键：打开格子  
- 右键：插旗  
- 左右键同时按下：同时打开周围格子（若数字周围旗数正确）  
- 鼠标操作经过防误触优化，支持在 Chrome 中流畅游玩  
- 禁止中键滚动、文字选中与浏览器手势返回，避免误触退出页面  

### ♻️ 重新开始与返回封面

游戏界面顶部提供了 **「重新开始」** 与 **「返回」** 按钮：  

- **重新开始**：重置棋盘与计时，重新生成雷区；  
- 弹出提示 ”确定要重新开始游戏吗？现在的进度不会保存哦！“，  选择确定则立即重开，取消则继续当前游戏。  
- **返回**：中止当前游戏并回到主封面。 

### ⚙️ 清除历史记录

如果您希望清除之前的扫雷记录，请按照以下步骤：

F12->Application->Local storage->http://localhost:8080

找到 key->records，点击右键，选中 delete 即可。

### 💾 Tips

为了获得最佳的扫雷体验，  我们强烈建议 **使用 Google Chrome 浏览器** 进行游戏。

开发者在测试中花了大量时间研究“**浏览器层面的系统级手势**”这一机制。  

结果发现，只有 Chrome 能稳定屏蔽这些系统手势（例如鼠标双键滑动返回上一页），  

而在其他浏览器（尤其是 Edge）中，这些手势依然存在，  

会导致在“双键同时按下并且快速移动鼠标”时，  

页面被误判为“返回上一页”（左移）或“触发右键菜单”（上移），从而中断游戏，让扫雷时间大大降低。

（这些问题以开发者的实力尚且无法解决，它们属于浏览器内核层级的系统行为，目前找不到在前端代码层面彻底屏蔽的方法。）

在 Chrome 中，无需任何额外设置即可畅玩，  

操作体验与经典 WinMine 几乎一致，  

你可以完全沉浸在扫雷的逻辑与速度之中。）

------

## 💻 文件结构

```csharp
minesweeper/
    
index.html
run_server.bat
readme.md
/assets
 /images
  main_background0.png
  main_background1.png
  main_background2.png
 /challenges
  /chapter1
  /chapter2
  /chapter3

/js
 board_ui.js
 game_core.js
 main.js
 /templates
  classic_template.js

/style
 base.css
 board.css

/challenge
 /css
  challenge_game.css
  challenge_home.css
  chapter_levels.css
 /html
  challenge_game.html
  challenge_home.html
  chapter_levels.html
 /js
  challenge_game.js
  challenge_home.js
  chapter_levels.js
```



## 📦 （以下供开发者学习）模块与函数实现说明

本项目使用 **模块化 ES6 架构**，代码被拆分为核心逻辑与界面逻辑两层：

- **核心层（game_core.js）**  

  负责游戏数据、布雷、计数、判定逻辑；

- **表现层（board_ui.js）**  
  
  负责棋盘渲染、鼠标事件绑定、更新显示；
  
- **控制层（main.js + classic_template.js）**  
  
  管理页面切换与模板注入；
  
- **样式层（base.css / board.css）**  
  
  控制视觉效果、动画、颜色与布局。

---

### 📘 1. game_core.js —— 游戏核心逻辑模块

该模块定义了唯一的核心类：

class MinesweeperGame

封装了游戏的所有状态与算法。负责处理扫雷的主要逻辑，包括布雷、计数、展开与胜负判断。

🔹 构造函数

```js
constructor(rows, cols, mineCount)
```

rows：棋盘行数, cols：棋盘列数, mineCount：地雷数量

初始化棋盘、重置状态。

🔹 主要属性

| 属性名              | 类型     | 说明                                                      |
| ------------------- | -------- | --------------------------------------------------------- |
| rows                | number   | 行数                                                      |
| cols                | number   | 列数                                                      |
| mineCount           | number   | 地雷总数                                                  |
| board               | 2D array | 棋盘状态矩阵（每格包含 isMine / isOpen / isFlag / count） |
| isFirstClick        | boolean  | 首次点击标记（用于避雷）                                  |
| minesLeft           | number   | 剩余未标记雷数                                            |
| gameOver            | boolean  | 游戏结束标志                                              |
| startTime / endTime | Date     | 计时器控制                                                |

🔹 主要方法

| 方法名                     | 功能             | 说明                                |
| -------------------------- | ---------------- | ----------------------------------- |
| initBoard()                | 初始化棋盘       | 生成空矩阵并重置状态                |
| placeMines(firstR, firstC) | 随机布雷         | 确保首次点击点无雷                  |
| countMinesAround(r, c)     | 统计周围雷数     | 返回该格的 8 邻域地雷数量           |
| openCell(r, c)             | 打开格子         | 若踩雷返回 "boom"，若胜利返回 "win" |
| chordOpen(r, c)            | 双键连开         | 当周围旗数与数字一致时批量展开      |
| toggleFlag(r, c)           | 插旗 / 取消旗    | 更新格子与剩余雷数                  |
| getElapsedTime()           | 返回当前游戏用时 | 用于计时器显示                      |

🧠 本模块完全独立于 UI，可在控制台中独立运行测试。

### 🎨 2. board_ui.js —— 棋盘显示与交互模块

该模块定义了扫雷界面的主要交互类：

```js
class BoardUI
```

负责渲染棋盘、监听鼠标事件、更新视觉状态，并在游戏结束后触发统一结算与统计。

**🔹 构造函数**

```js
constructor(container, rows, cols, mines)
```

`container`：棋盘容器 DOM 节点

创建 `MinesweeperGame` 游戏核心对象

`renderBoard()` 渲染 DOM 棋盘

`bindEvents()` 绑定交互

自动定位计时器与剩余雷数 DOM

启动 UI 刷新循环 `startDisplayLoop()`

**🔹 主要方法**

🟩 **运行层方法（每局游戏流程）**

| 方法名                 | 功能           | 说明                                        |
| ---------------------- | -------------- | ------------------------------------------- |
| **renderBoard()**      | 渲染棋盘 DOM   | 创建 `.row` 和 `.cell`，注入到容器中        |
| **bindEvents()**       | 绑定鼠标事件   | 左键开格 / 右键插旗 / 左右双键连开（chord） |
| **updateBoard()**      | 刷新 DOM 状态  | 根据 game_core 的 board 数组刷新 UI         |
| **startDisplayLoop()** | 计时与雷数刷新 | 每 100ms 更新计时器与剩余雷数，胜负后停止   |

------

🔵 **系统层方法（结算、记录、重启）**

| 方法名                      | 功能         | 说明                                            |
| --------------------------- | ------------ | ----------------------------------------------- |
| **saveRecord(result)**      | 保存游戏成绩 | 用 localStorage 存储：日期 / 用时 / 胜负        |
| **showResultAlert(result)** | 显示结算提示 | 支持胜利立即弹窗 / 失败动画延迟弹窗             |
| **revealAllMines()**        | 翻出所有地雷 | 失败时播放爆炸闪烁动画                          |
| **restartGame()**           | 完整重建棋盘 | 克隆 DOM 容器，解绑旧事件，重置计时器，一键重开 |

**🔹 结算与交互机制**

1. **踩雷失败**：立即翻出所有地雷并播放红色闪烁动画（约 0.5 秒），动画结束后弹出失败提示。
2. **通关胜利**：无需延迟，立即弹出胜利提示。
3. **弹窗内容**：包含本局用时、最佳用时、历史日期、累计局数、胜局数与胜率；所有数据都持久化保存到浏览器 LocalStorage。
4. **弹窗操作**：
   - 「再玩一局」→ 调用内部重开功能，完整重置棋盘；
   - 「返回封面」→ 直接离开游戏界面。
5. **双键连开与单击均统一采用同一结算流程**，不会漏判胜利/失败状态。
6. **内置重复触发保护**，保证结算只会触发一次。
7. 防止重复触发：`showResultAlert()` 内含 `if (this.game.gameOver) return;` 检查。

**🔹 特殊控制**

1. 禁止右键菜单、文字选中、拖拽、中键滚动；
2. 阻止双键触发浏览器“前进/后退”手势；
3. cellEl.dataset.num 自动触发数字染色；
4. 支持 chordOpen() 双键连开操作。
5. 支持动画延迟，保证爆炸效果完整播放。

### 🧭 3. main.js —— 页面控制逻辑

该模块管理封面与游戏界面的切换。

导入模板 classicTemplate ，点击「实战演练」按钮后：

1. 清空页面；

2. 插入扫雷模板；

3. 创建 `BoardUI` 实例；

4. 启动计时器与剩余雷数刷新；

5. 绑定返回按钮回到封面；

6. 绑定重新开始按钮（确认后重新生成棋盘并重置计时）；

7. 监听弹窗触发的 `restartGame` 事件，统一执行完整重启。

**🔹 主要函数**

只有一个入口函数：

| 函数名                 | 功能     | 说明                                                         |
| ---------------------- | -------- | ------------------------------------------------------------ |
| **startClassicGame()** | 启动游戏 | 清空封面 → 注入模板 → 创建 BoardUI → 启动计时 → 绑定返回/重开 |

**🔹 计时与同步逻辑（v1.3）**

- UI 每 100ms 自动刷新计时器与剩余雷数
- `boardUI.game.gameOver === true` 时停止刷新
- 重开或返回必须调用 `clearInterval(timerInterval)` 避免叠加
- BoardUI 内部保留自己的计时（getElapsedTime()），保持逻辑统一

### 🧱 4. classic_template.js —— 界面模板模块

导出经典扫雷模式的 HTML 模板。

在页面切换时注入 `document.body`，包含：

- 顶部控制栏（返回按钮、计时器、剩余雷数、重新开始按钮）；
- 棋盘主容器 `#board`；
- 计时与雷数均由 main.js 动态刷新。

### 🧩 5. 样式模块（base.css 与 board.css）

base.css：定义封面背景、标题、按钮样式；

board.css：定义棋盘布局、格子样式、数字颜色、动画效果；

1. .cell.open[data-num='X']：根据数字自动着色；

2. .cell.flag、.cell.mine：显示 🚩 与 💣；

3. .top-bar、.top-btn、.status-left、.status-right：计时与雷数显示框；

4. 响应式布局与放大比例控制。


### 📁 6. assets/images/

存放背景图与自定义素材，可替换为：

main_background0.png：主背景图；

可添加旗帜、炸弹、计时器等自定义 PNG 图标。

### 🧩 7. challenge_home.js —— 残局模式入口与章节选择

该模块负责 **残局挑战模式的入口页面**，用于展示章节列表并跳转到关卡选择界面。

🔹 主要职责

- 渲染「章节选择」界面；
- 为每个章节卡片绑定跳转事件；
- 通过 URL 参数传递章节信息。

🔹 核心逻辑

```
card.addEventListener("click", () => {
    window.location.href =
        `chapter_levels.html?chapter=${chapterId}`;
});
```

📌 **设计说明**：

- 不在 JS 中硬编码关卡数据；
- 章节信息仅通过 URL 传递，保持页面解耦；
- 所有章节资源统一存放于 `/assets/challenges/`。

------

### 🗂️ 8. chapter_levels.js —— 章节内关卡选择界面

该模块负责 **展示某一章节下的关卡列表**（如 1-1、1-2、1-3 …）。

🔹 主要职责

- 解析 URL 中的 `chapter` 参数；
- 根据章节号渲染关卡按钮；
- 点击关卡后跳转至具体挑战页面。

🔹 关键实现点

```
const params = new URLSearchParams(location.search);
const chapter = params.get("chapter");
window.location.href =
  `challenge_game.html?chapter=${chapter}&level=${level}`;
```

📌 **设计说明**：

- 章节与关卡编号全部通过 URL 管理；
- 页面本身不关心关卡内容；
- 保证后续可无缝增加新章节 / 新关卡。

------

### 🎮 9. challenge_game.js —— 残局挑战核心控制模块（重点）

该模块是**残局模式的中枢**，负责：

> **关卡数据解析 + 棋盘构建 + 尺寸计算 + 正确性判定**

它不替代 `game_core.js`，而是**复用并约束它**。

------

🔹 9.1 关卡数据读取与解析

通过 `fetch()` 加载 `.txt` 文件：

```
const text = await fetch(levelPath).then(r => r.text());
```

解析字段包括：

- 关卡名
- 行 / 列
- 真实雷区（realMap）
- 初始翻开状态（openMap）
- 剩余雷数
- 成功提示文案

📌 **关键原则**：

- txt 是**唯一真相源（Single Source of Truth）**
- 所有 UI 状态由数据驱动，而非写死逻辑

------

🔹 9.2 棋盘构建（DOM 结构复用）

挑战模式**严格复用**经典扫雷的 DOM 结构：

```
<div id="board">
  <div class="row">
    <div class="cell"></div>
    ...
  </div>
</div>
```

这样可以：

- 直接复用 `board.css`
- 保持数字颜色、旗子、雷、动画完全一致

------

🔹 9.3 动态格子尺寸计算（自适应）

为支持任意大小关卡，challenge 模式在 JS 中接管尺寸控制：

```
function calcCellSize(rows, cols) {
    const maxWidth = Math.min(window.innerWidth * 0.8, 720);
    const maxHeight = window.innerHeight * 0.45;

    return Math.floor(
        Math.min(maxWidth / cols, maxHeight / rows)
    );
}
```

并在 `renderBoard()` 中注入：

```
cellDiv.style.width = cellSize + "px";
cellDiv.style.height = cellSize + "px";
cellDiv.style.lineHeight = cellSize + "px";
```

📌 **工程意义**：

- CSS 提供默认尺寸（42px）；
- JS 在残局模式中动态覆盖；
- 不影响经典扫雷模式。

------

🔹 9.4 正确性判定逻辑（核心差异）

✅ 正确胜利条件（唯一）

> **所有“题目未给、且不是雷”的格子，均已被翻开**

形式化定义：

```
S = { (r,c) | realMap[r][c] ≠ '*' 且 openMap[r][c] = '0' }

胜利 ⇔ ∀ (r,c) ∈ S : cell.isOpen === true
```

失败条件（唯一）

```
realMap[r][c] === '*'
AND
openMap[r][c] === '0'
AND
cell.isOpen === true
```

📌 **重要语义区分**：

- `game.gameOver === true`
   👉 仅表示 **游戏结束**
- 是否失败，必须结合胜利判定一起判断

------

🔹 9.5 成功提示文案的数据驱动

关卡成功提示不写死在 JS 中，而是来自 txt 文件最后一行：

```
逻辑正确，沉得住气。
```

在通关时传入 UI：

```
showFeedback("success", levelData.successText);
```

📌 **优点**：

- 文案可随关卡变化；
- 不需要改代码即可调整表现；
- 非常适合逻辑题 / 教学关卡。

------

### 🎨 10. challenge_game.css —— 残局模式页面样式

该样式文件**只负责页面外壳**，包括：

- 背景图（按章节切换）；
- 居中布局；
- 返回按钮；
- 成功 / 失败弹窗。

📌 **严格约束**：

> ```
> challenge_game.css`
>  ❌ 不允许定义 `.cell` / `.row`
>  ✅ 所有棋盘样式来自 `board.css
> ```

## 🎓 学习提示

本项目 **非常适合中高级前端开发者** 用于以下进阶学习：

🧠 架构与设计

- 单一职责原则（SRP）在前端中的真实应用；
- 核心逻辑与 UI 表现的彻底解耦；
- **“状态标志” vs “业务语义” 的区分（gameOver ≠ failed）**；
- 数据驱动 UI（txt → 解析 → 判定 → 表现）。

🎮 游戏与交互

- 网页游戏中的事件系统设计；
- 左键 / 右键 / 双键（Chord）的统一判定；
- 动态棋盘尺寸计算与响应式布局；
- UI 动画与逻辑判定的时间解耦。

🧱 工程实践

- 如何在**不推翻旧系统**的前提下扩展新玩法；
- 如何避免“复制一套代码”的灾难性重构；
- 如何让 CSS 成为真正的“组件样式”；
- 如何通过 URL 参数管理状态与页面流转。

------

📌 强烈建议重点阅读

- `game_core.js` —— 核心算法与状态语义；
- `challenge_game.js` —— 规则解耦与判定设计；
- `board_ui.js` —— 复杂交互与事件防抖；
- `board.css` —— 可复用组件样式的范例。

------

## 🧠 版权与作者

本项目用于前端学习与扫雷算法实践演示。

作者：@apcipot_rain

欢迎用于教学、练习与开源展示，但请保留原始署名。

版本：v1.0 (2025.12.31)

该版本可改进空间包括但不限于：

1. 关卡更新、内容丰富
2. 设置关卡解锁功能
3. UI界面加工优化
4. 现在整个开发的安全性几乎是0。

------

## 💬 致谢

感谢AI大模型技术，尤其是 ChatGPT5.0 。

感谢所有扫雷社区的经典算法与界面启发。