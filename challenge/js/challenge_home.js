const carousel = document.getElementById("carousel");   //按id找到唯一元素
const cards = document.querySelectorAll(".card");   //找到所有匹配的元素
const bgBlur = document.querySelector(".bg-blur");  //找到第一个匹配的元素

let speed = 0;  //速度
let offset = 0; //位移

//单张卡片宽度600px+两侧80px
const CARD_WIDTH = 600;
const GAP = 80;
const STEP = CARD_WIDTH + GAP;  //从卡片中心移动到下一个卡片中心需要的offset增量
offset = 0;

// 鼠标位置控制移动速度
document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const width = window.innerWidth;

    const leftZone = width * 0.25;  //左边0.25
    const rightZone = width * 0.75; //右边0.75

    if (x < leftZone) {
        // 鼠标在左侧 -> 向右滑
        speed = -((leftZone - x) / leftZone) * 16;
    } 
    else if (x > rightZone) {
        // 鼠标在右侧 -> 向左滑
        speed = ((x - rightZone) / leftZone) * 16;
    } 
    else {
        // 中间 50% 区域：不滑动
        speed = 0;
    }
});

// 获取当前最居中的卡片
function getCenterCardIndex() {
    //offset通过CSS的padding-left/right让它等于0，step，2*step
    let index = Math.round(offset / STEP);
    index = Math.max(0, Math.min(index, cards.length - 1));
    return index;
}

// 跟随更换模糊背景
function updateBackground() {
    const index = getCenterCardIndex(); //和上面这个找到居中卡片联动
    const img = cards[index].querySelector(".card-img").src;//从当前居中的卡片中，取出img标签的图片路径
    bgBlur.style.transition = "background-image 0.4s ease"; //当background-image改变时，用0.4s变化
    bgBlur.style.backgroundImage = `url(${img})`;   //对应CSS
}

// 连续动画
function animate() {
    offset += speed;
    
    // 限制滑动范围：0~(卡片数-1)*card_width
    const maxOffset = (cards.length - 1) * STEP; // 卡片滑动限制
    offset = Math.max(0, Math.min(offset, maxOffset));
    //style.xxx是CSS属性操作，修改元素的内联样式
    carousel.style.transform = `translateX(${-offset}px)`;
    
    updateBackground();
    
    requestAnimationFrame(animate); //下一帧再调用
}
animate();

// 点击进入下一页
cards.forEach(card => {
    card.addEventListener("click", () => {
        const type = card.dataset.target;   //html的data属性读取
        const chapter = card.dataset.chapter;
        window.location.href =
            `../html/chapter_levels.html?chapter=${chapter}&type=${type}`;
    });
});

document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "../../index.html";
});
