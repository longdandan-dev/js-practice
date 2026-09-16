/* ============================================================
   布局体检脚本（阶段 0 · 模块 4：Flex + Grid）
   ------------------------------------------------------------
   用法（在练习目录里运行）：
     node 检查布局.js                 → 默认检查 25-布局练习页.html
     node 检查布局.js 某个文件.html   → 检查指定的文件

   它查什么：Flex / Grid 该用的招式用没用上、样式是不是真的生效、
             常见拼写错误、值忘写单位、CSS 写到不该写的地方
   它查不出什么：页面到底好不好看——那个要你自己拖浏览器窗口看
   ============================================================ */

const fs = require("fs");
const path = require("path");

const DEFAULT_FILE = "25-布局练习页.html";

// 布局里最常见的拼写错误：[写错的, 应该写]
const TYPOS = [
  ["justify-contnet", "justify-content"],
  ["justify-conten:", "justify-content:"],
  ["space-bewteen", "space-between"],
  ["space-betwen", "space-between"],
  ["spacebetwen", "space-between"],
  ["algin-items", "align-items"],
  ["align-itmes", "align-items"],
  ["align-item:", "align-items:"],
  ["centre", "center（CSS 里是美式拼写）"],
  ["displya", "display"],
  ["dispaly", "display"],
  ["dislay:", "display:"],
  ["flex-direction: colunm", "flex-direction: column"],
  ["colunm", "column"],
  ["collum", "column"],
  ["flex-warp", "flex-wrap"],
  ["flexwrap", "flex-wrap"],
  ["grid-teamplte-columns", "grid-template-columns"],
  ["grid-template-colums", "grid-template-columns"],
  ["grid-templat-columns", "grid-template-columns"],
  ["min-max(", "minmax("],
  ["minMax(", "minmax("],
  ["repaet(", "repeat("],
  ["repeate(", "repeat("],
  ["autofit", "auto-fit"],
  ["auto_fit", "auto-fit"],
  ["widht", "width"],
  ["heigth", "height"],
  ["positon", "position"],
  ["@meidia", "@media"],
  ["madia", "media"],
  ["padigng", "padding"],
  ["paddding", "padding"],
  ["background-colo:", "background-color:"],
];

// 这些属性后面必须带单位（0 除外）
const NEED_UNIT = ["gap", "row-gap", "column-gap", "padding", "margin", "width", "height", "min-height", "max-width", "font-size", "border-radius"];

function checkFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  // HTML 注释里的代码只是提示，不算数
  const src = raw.replace(/<!--[\s\S]*?-->/g, "");

  const styleBlocks = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
  // CSS 注释里写的 display: flex 也只是提示，同样不算数
  const css = styleBlocks.join("\n").replace(/\/\*[\s\S]*?\*\//g, "");

  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];

  // 页面里真正用到的类名
  const htmlClasses = new Set();
  for (const m of src.matchAll(/class\s*=\s*"([^"]*)"/gi)) {
    m[1]
      .split(/\s+/)
      .filter(Boolean)
      .forEach((c) => htmlClasses.add(c));
  }
  // CSS 里写了一堆选择器，抽出其中的类名
  const cssClasses = new Set();
  for (const m of css.matchAll(/\.([A-Za-z][A-Za-z0-9_-]*)/g)) cssClasses.add(m[1]);

  const has = (re) => re.test(css);

  const twoColumn = [...css.matchAll(/grid-template-columns\s*:\s*([^;}]+)/gi)].some(
    (m) => /fr/i.test(m[1]) && /(px|rem|em|%)/i.test(m[1])
  );

  const checks = [
    ["第 1 题 · 导航栏用了 Flex（display: flex）", has(/(^|[^-a-z])display\s*:\s*(inline-)?flex\b/i), "给 .nav 那一条写 display: flex;（flex 写在父容器身上）"],
    ["第 1 题 · 导航栏两端分开（justify-content: space-between）", has(/justify-content\s*:\s*space-between/i), "justify-content: space-between 就是“两头贴边”"],
    ["第 1 题 · 导航栏竖直居中（align-items: center）", has(/align-items\s*:\s*center/i), "align-items: center;"],
    ["第 2 题 · 卡片墙用了 Grid（display: grid）", has(/(^|[^-a-z])display\s*:\s*(inline-)?grid\b/i), "给 .card-wall 写 display: grid;"],
    ["第 2 题 · 卡片墙分了列（grid-template-columns）", has(/grid-template-columns\s*:/i), "grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));"],
    ["第 2 题 · 会自动换行（repeat + auto-fit）", has(/repeat\s*\(\s*auto-fit/i), "repeat(auto-fit, ...) 让浏览器自己决定一行放几张"],
    ["第 2 题 · 每列有最小宽度（minmax）", has(/minmax\s*\(\s*\d/i), "minmax(220px, 1fr) 里 220px 是“最窄这么宽”"],
    ["第 3 题 · 两栏布局（一栏固定 + 一栏自适应）", twoColumn, "grid-template-columns: 240px 1fr;（同时出现 px 和 fr）"],
    ["第 4 题 · 卡片内部竖排（flex-direction: column）", has(/flex-direction\s*:\s*column/i), "卡片里从上往下排，就写 flex-direction: column;"],
    ["第 4 题 · 把多余空间让给描述（flex: 1）", has(/(^|[^-a-z])flex\s*:\s*[1-9]/i), "给 .card p 写 flex: 1，底部那行才会贴到最下面"],
    ["第 5 题 · 有媒体查询（@media）", has(/@media[^{]*\(/i), "@media (max-width: 768px) { ... }"],
    ["第 5 题 · 窄屏允许换行（flex-wrap: wrap）", has(/flex-wrap\s*:\s*wrap/i), "窄屏时导航挤不下，就给它 flex-wrap: wrap;"],
    ["第 6 题 · 居中三件套（justify-content + align-items 都用上）", has(/justify-content\s*:\s*center/i) && has(/align-items\s*:\s*center/i), "display: flex + justify-content: center + align-items: center"],
    ["有间距（gap）", has(/(^|[^-a-z])gap\s*:\s*\d/i), "gap: 16px; 比一个个 margin 靠谱"],
  ];

  console.log("=== 阶段 0 模块 4 产出 · 布局练习页（" + path.basename(file) + "）===");
  console.log("");

  if (!css.trim()) {
    console.log("style 里还是空的（或者只有注释）。先动笔写，再来跑这个脚本。");
    console.log("");
    return;
  }

  console.log("[1] 招式检查（模块 4 该会的东西）");
  let pass = 0;
  for (const [name, ok, tip] of checks) {
    console.log("      " + (ok ? "[通过]" : "[未通过]") + " " + name);
    if (!ok) console.log("             → " + tip);
    if (ok) pass += 1;
  }
  console.log("");
  console.log("通过 " + pass + " / " + checks.length);
  console.log("");

  console.log("[2] 容易犯的错");
  const problems = [];

  for (const [wrong, right] of TYPOS) {
    if (css.includes(wrong)) problems.push("拼写：发现了“" + wrong + "”，应该写 “" + right + "”");
  }

  // 同一个规则里同名属性写了两遍：后面的赢，前面那句等于没写
  for (const r of rules) {
    const seen = {};
    for (const part of r[2].split(";")) {
      const t = part.trim();
      if (!t.includes(":")) continue;
      const prop = t.split(":")[0].trim().toLowerCase();
      if (!prop) continue;
      seen[prop] = (seen[prop] || 0) + 1;
    }
    for (const prop of Object.keys(seen)) {
      if (seen[prop] > 1) {
        const sel = (r[1] || "").trim().replace(/\s+/g, " ").slice(0, 30);
        problems.push(
          "“" + sel + "” 里 “" + prop + "” 写了两遍（共 " + seen[prop] + " 次）——同一条规则里同名属性后面的赢，前面那句白写，想对比不同值请一次只留一个"
        );
      }
    }
  }

  // 值里面出现了像是另一个属性名：八成是上一行末尾少写了分号
  const PROP_WORDS =
    "display|align-items|justify-content|flex-direction|flex-wrap|flex|grid-template-columns|grid-template-rows|min-height|max-height|min-width|max-width|font-size|font-weight|padding|margin|width|height|gap|border-radius|background-color|text-align|line-height|position|transition|box-shadow";
  // 这些属性后面本来就允许跟属性名（比如 transition: background-color 0.2s），跳过
  const VALUE_MAY_HOLD_PROP = ["transition", "will-change", "animation", "grid-template-areas", "font", "background", "content"];
  for (const r of rules) {
    for (const part of r[2].split(";")) {
      const t = part.trim();
      if (!t.includes(":")) continue;
      const prop = t.split(":")[0].trim().toLowerCase();
      if (VALUE_MAY_HOLD_PROP.includes(prop)) continue;
      const value = t.slice(t.indexOf(":") + 1);
      // 注意两点：
      //   ① 前面必须有一个空格（值开头的属性名是合法写法，比如 transition: box-shadow 0.2s）
      //   ② 后面要么跟冒号（上一行没写分号，两行粘成一行），要么跟一个数字（属性名后漏了冒号）
      const m = value.match(new RegExp("\\s(" + PROP_WORDS + ")\\s*(?::|\\d)", "i"));
      if (m) {
        const sel = (r[1] || "").trim().replace(/\s+/g, " ").slice(0, 30);
        const oneLine = t.replace(/\s+/g, " ");
        problems.push(
          "“" + sel + "” 里这一句看着不对：`" + oneLine + "` —— 值里面出现了 “" + m[1] + "”，大概率是上一行末尾少写了分号"
        );
      }
    }
  }

  // 列宽单位写错（1fr 写成 ifr 这类）
  for (const m of css.matchAll(/grid-template-columns\s*:\s*([^;}]+)/gi)) {
    for (const tk of m[1].split(/[\s,]+/).filter(Boolean)) {
      if (/fr$/i.test(tk) && !/^\d+(\.\d+)?fr$/i.test(tk)) {
        problems.push(
          "列宽写错了：`" + tk + "` 不是合法的列宽（想写 1fr 吗？）。CSS 遇到不认识的值不会报错，只会把这一条当没写"
        );
      }
    }
  }

  // 边框简写少了 solid/dashed 时，浏览器根本不画线
  for (const m of css.matchAll(/(?:^|[^-a-z])border(-(?:top|right|bottom|left))?\s*:\s*([^;}]+)/gi)) {
    const val = m[2].trim();
    if (!/\d/.test(val)) continue;
    if (/^\s*0(px)?\s*$/.test(val)) continue;
    if (/(solid|dashed|dotted|double|groove|ridge|inset|outset|none|hidden)/i.test(val)) continue;
    problems.push(
      "边框不会显示：`" + m[0].trim() + "` 少了边框样式关键字，补上 solid（实线）或 dashed（虚线），例如 border: 1px solid #dddddd;"
    );
  }

  // 中文标点：这是最容易让人懵的一种错——整条样式直接失效
  const cnPunct = css.match(/[：；，（）]/g);
  if (cnPunct) {
    problems.push("标点：CSS 里出现了 " + cnPunct.length + " 个中文标点（：；，（）），浏览器不认，整条样式会失效，改成英文标点");
  }

  // 驼峰属性名：那是 JS 的写法，CSS 里不认
  const camel = css.match(/(^|[;{\s])([a-z]+[A-Z][A-Za-z]*)\s*:/g);
  if (camel) {
    problems.push("属性名写成了驼峰（" + camel.map((c) => c.trim()).join("、") + "）——CSS 里要写成中划线，比如 justifyContent 要写成 justify-content");
  }

  // 值忘写单位
  for (const prop of NEED_UNIT) {
    for (const m of css.matchAll(new RegExp("(^|[^-a-z])" + prop + "\\s*:\\s*([^;}]+)", "gi"))) {
      for (const part of m[2].split(/\s+/)) {
        if (!/^\d/.test(part)) continue;
        const num = parseFloat(part);
        if (num === 0) continue;
        if (/^[\d.]+(px|rem|em|%|vh|vw|fr|s|ms)?$/.test(part) && !/(px|rem|em|%|vh|vw|fr|s|ms)$/.test(part)) {
          problems.push("单位：`" + prop + ": " + m[2].trim() + "` 里的 " + part + " 没写单位，除了 0 和 flex: 1 这种，其他都要写（12px / 1rem / 100%）");
        }
      }
    }
  }

  // 大括号和分号
  const open = (css.match(/\{/g) || []).length;
  const close = (css.match(/\}/g) || []).length;
  if (open !== close) problems.push("大括号不配对：" + open + " 个 {，" + close + " 个 }");

  for (const [i, r] of rules.entries()) {
    for (const part of r[2].split(";")) {
      const t = part.trim();
      if (!t) continue;
      if (!t.includes(":") && !t.startsWith("@")) {
        const sel = (r[1] || "").trim().replace(/\s+/g, " ").slice(0, 30);
        problems.push("“" + sel + "” 里这一行不像样式（少写冒号或分号？）：" + t);
      }
    }
  }

  // 老办法做布局
  if (/(^|[^-a-z])float\s*:/i.test(css)) {
    problems.push("提示：用 float 做布局是十年前的老办法，现在都用 flex / grid，能换就换掉");
  }

  // CSS 掉进正文 / style 放到 body 外
  if (/<\/body>[\s\S]*<style/i.test(src)) {
    problems.push("style 写在 </body> 后面了，标准写法是放进 head 里");
  }
  const plainText = src
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  if (/(display|justify-content|align-items|grid-template-columns|gap|padding)\s*:/.test(plainText)) {
    problems.push("样式好像掉进页面正文里了（页面上会直接显示这些字），检查是不是写到了 style 标签外面");
  }

  if (problems.length) {
    for (const p of problems) console.log("      · " + p);
  } else {
    console.log("      没发现拼写、标点、单位这类问题。");
  }
  console.log("");

  console.log("[3] 类名对得上吗（CSS 和 HTML 对暗号）");
  const cssOnly = [...cssClasses].filter((c) => !htmlClasses.has(c));
  const htmlOnly = [...htmlClasses].filter((c) => !cssClasses.has(c));
  if (!cssClasses.size) {
    console.log("      CSS 里一个类选择器都没有——是不是忘了写 . 号？");
  } else if (!cssOnly.length && !htmlOnly.length) {
    console.log("      两边完全对得上（CSS 写的每个类，HTML 里都有）。");
  } else {
    for (const c of cssOnly) console.log("      · CSS 里写了 ." + c + "，但 HTML 里没有这个类名 → 拼错了？还是 HTML 忘了加？");
    for (const c of htmlOnly) console.log("      · HTML 用了 class=\"" + c + "\"，但 CSS 里没给它写样式 → 它现在还是“裸奔”的");
  }
  console.log("");

  console.log("----------------------------------------");
  console.log("");
  console.log("过了招式这一关，别忘了第二关：");
  console.log("  把浏览器窗口从最宽拖到最窄，看导航栏、卡片墙、两栏跟着变不变。");
  console.log("  布局的手感只在拖窗口的时候长出来，脚本查不了这个。");
  console.log("");
}

const args = process.argv.slice(2);
let files = args.length ? args.map((a) => path.resolve(a)) : [path.resolve(DEFAULT_FILE)];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log("找不到这个文件：" + f);
    console.log("默认检查的是 " + DEFAULT_FILE + "，也可以自己指定：node 检查布局.js 别的文件.html");
    console.log("");
    continue;
  }
  checkFile(f);
}
