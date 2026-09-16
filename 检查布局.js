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
  ["text-emphasis", "text-decoration（想给链接去掉下划线，用的是 text-decoration: none）"],
  ["text-deocration", "text-decoration"],
  ["box-shodow", "box-shadow"],
  ["transiton", "transition"],
  ["transtion", "transition"],
];

// 这些属性后面必须带单位（0 除外）
const NEED_UNIT = ["gap", "row-gap", "column-gap", "padding", "margin", "width", "height", "min-height", "max-width", "font-size", "border-radius"];

// 认识的单位（写错了会当场报出来，比如 1ppx）
const KNOWN_UNITS = ["px", "rem", "em", "%", "vh", "vw", "vmin", "vmax", "ch", "ex", "cm", "mm", "in", "pt", "pc", "fr", "deg", "turn", "s", "ms", "dpi", "dppx"];

// 把 @media 整段从 CSS 里摘掉：剩下的就是"宽屏默认样式"。
// 招式检查只在默认样式里查，免得窄屏规则把宽屏的问题掩盖过去。
function stripMedia(css) {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const idx = css.indexOf("@media", i);
    if (idx === -1) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, idx);
    const open = css.indexOf("{", idx);
    if (open === -1) break;
    let depth = 0;
    let k = open;
    for (; k < css.length; k++) {
      if (css[k] === "{") depth += 1;
      else if (css[k] === "}") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    i = k + 1;
  }
  return out;
}

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

  // ==== 选择器级检查：招式是不是写在"该写的那个容器"上 ====
  // 以前只查"整份文件里出现过 display: grid 没有"，结果 .layout 上的 grid
  // 会把 .card-wall 缺 grid 这件事掩盖过去。现在按选择器分开查。
  const desktopCss = stripMedia(css);
  const desktopRules = [...desktopCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)];

  // 取出某个选择器名下所有声明（同名选择器写了多块会合并）
  const bodyOf = (selector) =>
    desktopRules
      .filter((r) => r[1].split(",").map((s) => s.trim()).includes(selector))
      .map((r) => r[2])
      .join(";");

  const on = (selector, re) => re.test(bodyOf(selector));

  const checks = [
    ["第 1 题 · 导航栏用了 Flex（.nav 上写了 display: flex）", on(".nav", /display\s*:\s*(inline-)?flex\b/i), "display: flex 要写在 .nav 这条规则里（父容器），写在子元素身上没用"],
    ["第 1 题 · 导航栏两端分开（.nav 上写了 space-between）", on(".nav", /justify-content\s*:\s*space-between/i), "justify-content: space-between 就是“两头贴边”"],
    ["第 1 题 · 导航栏竖直居中（.nav 上写了 align-items: center）", on(".nav", /align-items\s*:\s*center/i), "align-items: center;"],
    ["第 2 题 · 卡片墙用了 Grid（.card-wall 上写了 display: grid）", on(".card-wall", /display\s*:\s*(inline-)?grid\b/i), "display: grid 要写在 .card-wall 这条规则里——写错元素的话，卡片只会一直竖着堆"],
    ["第 2 题 · 卡片墙分了列（.card-wall 上写了 grid-template-columns）", on(".card-wall", /grid-template-columns\s*:/i), "grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));"],
    ["第 2 题 · 会自动换行（.card-wall 里写了 repeat(auto-fit…)）", on(".card-wall", /repeat\s*\(\s*auto-fit/i), "repeat(auto-fit, ...) 让浏览器自己决定一行放几张"],
    ["第 2 题 · 每列有最小宽度（.card-wall 里写了 minmax…）", on(".card-wall", /minmax\s*\(\s*\d/i), "minmax(240px, 1fr) 里 240px 是“最窄这么宽”"],
    ["第 3 题 · 两栏布局（.layout 上写了 display: grid + 固定栏 + 自适应栏）", on(".layout", /display\s*:\s*(inline-)?grid\b/i) && /grid-template-columns\s*:\s*[^;}]*\d+(px|rem)[^;}]*fr/i.test(bodyOf(".layout")), "grid-template-columns: 240px 1fr;（同一句里既要有 px 也要有 fr）"],
    ["第 4 题 · 卡片内部竖排（.card 上写了 flex-direction: column）", on(".card", /flex-direction\s*:\s*column/i), "卡片里从上往下排，就写 flex-direction: column;"],
    ["第 4 题 · 把多余空间让给描述（.card p 上写了 flex: 1）", on(".card p", /(^|[^-a-z])flex\s*:\s*[1-9]/i), "给 .card p 写 flex: 1，底部那行才会贴到最下面"],
    ["第 5 题 · 有媒体查询（@media）", has(/@media[^{]*\(/i), "@media (max-width: 768px) { ... }"],
    ["第 5 题 · 窄屏允许换行（.nav 上有 flex-wrap: wrap）", on(".nav", /flex-wrap\s*:\s*wrap/i), "窄屏时导航挤不下，就给它 flex-wrap: wrap;"],
    ["第 6 题 · 居中三件套（.hero 上写了 justify-content + align-items）", on(".hero", /justify-content\s*:\s*center/i) && on(".hero", /align-items\s*:\s*center/i), "display: flex + justify-content: center + align-items: center"],
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

  // 单位写法可疑：1ppx 这种，浏览器不认，整条样式作废
  // 前面必须紧跟着 空白 / : ( , ; —— 这样才不会把 #2563eb 这种十六进制颜色认成单位
  for (const m of css.matchAll(/(^|[\s:(,;])(\d+(?:\.\d+)?)([a-z]{2,4})(?![a-z0-9])/gi)) {
    const unit = m[3].toLowerCase();
    if (KNOWN_UNITS.includes(unit)) continue;
    problems.push(
      "单位写法可疑：`" + m[2] + m[3] + "` —— 浏览器不认识 “" + unit + "”，常见的长度单位是 px / rem / em / % / vh / vw / fr"
    );
  }

  // 渐变色不能写在 background-color 上
  for (const m of css.matchAll(/background-color\s*:\s*([^;}]*gradient[^;}]*)/gi)) {
    problems.push(
      "渐变没生效：`background-color` 后面不能写 linear-gradient，它只认单色。改成 background: " + m[1].trim() + ";"
    );
  }

  // CSS 变量：用了但没定义 → 整条样式失效
  const definedVars = new Set([...css.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)].map((m) => m[1]));
  const usedVars = [...new Set([...css.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)].map((m) => m[1]))];
  for (const v of usedVars) {
    if (!definedVars.has(v)) {
      problems.push("变量 " + v + " 用了但没定义（拼错的可能性最大）——浏览器不认识它，这一整条样式都会失效");
    }
  }

  // 同一个选择器写了两块：不是错，但很容易互相覆盖，建议合并成一块
  // 只数"单独成块"的选择器：.nav, .hero { ... } 这种共用一块是正常写法，不算重复
  const selCount = {};
  for (const r of desktopRules) {
    const sels = r[1].split(",").map((x) => x.trim()).filter(Boolean);
    if (sels.length !== 1) continue;
    selCount[sels[0]] = (selCount[sels[0]] || 0) + 1;
  }
  for (const s of Object.keys(selCount)) {
    if (selCount[s] > 1) {
      problems.push("提示：" + s + " 写了 " + selCount[s] + " 块（分散在文件不同位置）——同一套样式建议合并成一块，不然以后改一处、留一处，很容易自己跟自己打架");
    }
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
