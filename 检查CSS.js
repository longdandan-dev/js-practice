/* ============================================================
   CSS 体检脚本
   ------------------------------------------------------------
   用法（和检查HTML.js 一样，默认检查当前文件夹里所有 .html）：
     在终端运行：node 检查CSS.js
   只检查某一个文件：
     node 检查CSS.js 10-跟练-CSS.html
   ============================================================ */

const fs = require("fs");
const path = require("path");

const WANT = [
  ["color", "文字颜色"],
  ["background-color", "背景色"],
  ["font-family", "字体"],
  ["font-size", "字号"],
  ["padding", "内边距（盒模型）"],
  ["border", "边框"],
  ["margin", "外边距"],
  ["text-align", "对齐"],
];

function checkFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  // 先把 HTML 注释去掉，注释里写的代码不算数
  const src = raw.replace(/<!--[\s\S]*?-->/g, "");

  const styleBlocks = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
  // 再把 CSS 注释去掉：注释里写的 padding: 16px 只是提示，不算真的写了样式
  const css = styleBlocks.join("\n").replace(/\/\*[\s\S]*?\*\//g, "");
  const inlineCount = (src.match(/style\s*=\s*["']/gi) || []).length;
  const linkCss = /<link[^>]+stylesheet/i.test(src);

  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const selectors = rules.map((r) => r[1].trim().replace(/\s+/g, " ")).filter(Boolean);

  const open = (css.match(/\{/g) || []).length;
  const close = (css.match(/\}/g) || []).length;

  const badDecl = [];
  for (const [i, r] of rules.entries()) {
    for (const part of r[2].split(";")) {
      const t = part.trim();
      if (!t) continue;
      if (!t.includes(":")) {
        badDecl.push((selectors[i] || "某条规则") + " 里这一行不像样式（少写分号？）：" + t);
      }
    }
  }

  // border 简写少写样式关键字（solid/dashed…）时，浏览器根本不会画线
  const badBorder = [...css.matchAll(/(?:^|[^-a-z])border(-(?:top|right|bottom|left))?\s*:\s*([^;}]+)/gi)]
    .filter((m) => !/(solid|dashed|dotted|double|groove|ridge|inset|outset|none|hidden)/i.test(m[2]))
    .map((m) => m[0].trim());

  // style 标签写到了 body 外面（浏览器能忍，但不是标准写法）
  const styleOutside = /<\/body>[\s\S]*<style/i.test(src);

  // CSS 掉进页面正文：会被浏览器当成文字直接显示出来
  const text = src
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  const leaked = /(padding|margin|border|background-color|font-size|font-family|text-align|color)\s*:/.test(text);

  console.log("=== " + path.basename(file) + " ===");
  console.log("");

  console.log("[1] 样式写在哪儿：");
  console.log("      style 标签：" + (styleBlocks.length ? styleBlocks.length + " 段" : "没有"));
  console.log("      行内 style 属性：" + (inlineCount ? inlineCount + " 处" : "没有"));
  console.log("      外链 css 文件：" + (linkCss ? "有" : "没有"));
  if (!css.trim() && !linkCss && !inlineCount) {
    console.log("      → 这个文件里一行样式都没有，页面会是浏览器默认样子。");
  }
  console.log("");

  console.log("[2] 选择器和样式条数：" + rules.length + " 条规则");
  if (selectors.length) console.log("      " + selectors.join(" / "));
  console.log("");

  console.log("[3] 大括号配对：" + (open === close ? "OK" : "不配对（" + open + " 个 {，" + close + " 个 }）"));
  console.log("");

  console.log("[4] 常用属性检查：");
  for (const [prop, label] of WANT) {
    // 允许 margin-bottom / padding-left 这种带后缀的写法
    const hit = new RegExp("(^|[^-a-z])" + prop + "(-[a-z]+)?\\s*:", "i").test(css);
    console.log("      " + (hit ? "[有]" : "[没有]") + " " + prop + "（" + label + "）");
  }
  console.log("");

  console.log("[5] 容易犯的错：");
  if (badDecl.length) {
    for (const b of badDecl) console.log("      少分号或写错了：" + b);
  } else {
    console.log("      没发现少分号的问题。");
  }
  if (badBorder.length) {
    for (const b of badBorder) {
      console.log(
        "      写了边框但不会显示：" + b + " → 少了边框样式，补上 solid（实线）或 dashed（虚线）才对，例如 border: 1px solid #dddddd;"
      );
    }
  }
  if (styleOutside) {
    console.log(
      "      style 标签位置不对：它写在了 body 结束标签的后面。浏览器能忍，但标准写法是放进 head 里（和 title 放一起）。"
    );
  }
  console.log(
    "      " + (leaked
      ? "注意：样式好像掉到页面正文里了（浏览器的页面上会直接显示这些字），检查一下是不是写在了 style 标签外面。"
      : "样式没有掉进页面正文。")
  );
  if (inlineCount >= 5) {
    console.log("      提示：行内 style 用得有点多，正式写法建议集中写在 style 标签或 .css 文件里。");
  }
  console.log("");
  console.log("----------------------------------------");
  console.log("");
}

const args = process.argv.slice(2);
let files = args.map((a) => path.resolve(a));

if (files.length === 0) {
  files = fs
    .readdirSync(process.cwd())
    .filter((f) => f.toLowerCase().endsWith(".html") || f.toLowerCase().endsWith(".htm"))
    .map((f) => path.resolve(f));
}

if (files.length === 0) {
  console.log("没找到 .html 文件。");
  console.log("用法：node 检查CSS.js [文件名]");
} else {
  for (const f of files) {
    if (!fs.existsSync(f)) {
      console.log("找不到这个文件：" + f);
      console.log("");
      continue;
    }
    checkFile(f);
  }
}
