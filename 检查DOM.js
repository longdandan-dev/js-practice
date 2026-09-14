/* ============================================================
   待办清单 v1 自动检查（第一道关）
   ------------------------------------------------------------
   用法：在终端运行 node 检查DOM.js
   它检查的是"你代码里有没有用上这些本事"，只有代码层面能查的东西。
   真正的验收在浏览器里（页面打开后的 6 个动作），这部分我陪你一起过。

   注意：它查的是"有没有"，不查"写得对不对"，
        所以全绿 ≠ 页面一定好用，别只盯着绿字，回头把 6 个动作都试一遍。
   ============================================================ */

const fs = require("fs");
const path = require("path");

const file = "17-待办清单.html";
const full = path.join(__dirname, file);

if (!fs.existsSync(full)) {
  console.log("没找到 " + file + "，先确认文件名和位置对不对。");
  process.exit(0);
}

const source = fs.readFileSync(full, "utf8");

// 只保留 <script> 里的内容：HTML 里出现的关键词不算数
const scripts = source.match(/<script[\s\S]*?<\/script>/gi) || [];
const code = scripts
  .join("\n")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/\/\/[^\n]*/g, "");

const checks = [
  ["页面里有输入框和添加按钮", /<input/i.test(source) && /<button/i.test(source)],
  ["用 querySelector 找元素", /querySelector/.test(code)],
  ["用 addEventListener 挂事件（不是 onclick 属性）", /addEventListener/.test(code) && !/\sonclick=/i.test(source)],
  ["用 createElement 造列表项", /createElement/.test(code)],
  ["用 classList 切换完成样式", /classList/.test(code)],
  ["添加前过滤空内容（trim）", /trim\(\)/.test(code)],
  ["用 localStorage 存数据", /localStorage\.setItem/.test(code)],
  ["用 localStorage 读数据", /localStorage\.getItem/.test(code)],
  ["用 JSON.stringify / JSON.parse 转格式", /JSON\.stringify/.test(code) && /JSON\.parse/.test(code)],
  ["删除用到了 splice", /splice/.test(code)],
];

console.log("=== 阶段 0 模块 2 产出 · 待办清单 v1（" + file + "）===");
console.log("");

let pass = 0;
for (const [desc, ok] of checks) {
  if (ok) pass++;
  console.log((ok ? "[通过] " : "[未通过] ") + desc);
}

console.log("");
console.log("通过 " + pass + " / " + checks.length);
console.log(
  pass === checks.length
    ? "代码层面该用的本事都用上了，接下来去浏览器里跑那 6 个动作，把结果发我。"
    : "没过的项：回文件里补上，保存后再跑一次 node 检查DOM.js。卡住超过 20 分钟直接发我。"
);
console.log("");
console.log("----------------------------------------");
console.log("");
console.log("浏览器验收 6 步（这步必须真做）：");
console.log("  1. 打开页面 → 有两条示例待办");
console.log("  2. 输入「跑步」回车 → 多一条，输入框清空");
console.log("  3. 什么都不输入直接回车 → 不新增");
console.log("  4. 点「跑步」 → 变灰划线");
console.log("  5. 点某条的「删除」 → 它消失");
console.log("  6. F5 刷新 → 增删改都还在");
