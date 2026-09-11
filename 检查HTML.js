/* ============================================================
   HTML 体检脚本
   ------------------------------------------------------------
   用法（不用记参数，默认检查当前文件夹里所有 .html 文件）：
     在终端运行：node 检查HTML.js
   想只检查某一个文件，就在后面写上文件名：
     node 检查HTML.js 09-跟练-HTML.html
   ============================================================ */

const fs = require("fs");
const path = require("path");

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr"]);

const KNOWN = new Set(["html", "head", "body", "title", "meta", "link", "style", "script",
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "strong", "em", "b", "i", "u", "s",
  "ul", "ol", "li", "dl", "dt", "dd", "div", "span", "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td", "form", "input", "button", "label",
  "select", "option", "textarea", "section", "header", "footer", "nav", "main", "aside",
  "article", "video", "audio", "source", "canvas", "svg", "pre", "code", "blockquote"]);

function checkFile(file) {
  const src = fs.readFileSync(file, "utf8");
  const noComment = src.replace(/<!--[\s\S]*?-->/g, "");

  const stack = [];
  const unknown = [];
  const unclosed = [];
  const strayClose = [];
  const tags = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;

  while ((m = re.exec(noComment)) !== null) {
    const closing = m[1] === "/";
    const name = m[2].toLowerCase();
    const selfClose = m[4] === "/";
    tags.push(name);
    if (!KNOWN.has(name)) unknown.push(name);
    if (closing) {
      if (stack.length && stack[stack.length - 1] === name) stack.pop();
      else if (stack.includes(name)) {
        while (stack.length && stack.pop() !== name);
        unclosed.push(name);
      } else strayClose.push(name);
    } else if (!VOID.has(name) && !selfClose) {
      stack.push(name);
    }
  }

  const paired = unclosed.length === 0 && strayClose.length === 0 && stack.length === 0;
  const lang = (noComment.match(/<html[^>]*lang\s*=\s*"([^"]*)"/i) || ["", "（没写 lang）"])[1];
  const title = ((noComment.match(/<title>([\s\S]*?)<\/title>/i) || ["", "（没写 title）"])[1]).trim();
  const imgs = [...noComment.matchAll(/<img[^>]*src\s*=\s*"([^"]*)"/gi)].map((x) => x[1]);

  console.log("=== " + path.basename(file) + " ===");
  console.log("");
  console.log("[1] HTML 骨架：");
  console.log("      <!DOCTYPE html>：" + (/<!DOCTYPE html>/i.test(noComment) ? "有" : "没有（建议补上）"));
  console.log("      <html> / <head> / <body>：" + (["html", "head", "body"].every((t) => tags.includes(t)) ? "齐全" : "不齐"));
  console.log("      文字编码 meta charset：" + (/<meta[^>]+charset/i.test(noComment) ? "有（中文不会乱码）" : "没有（中文可能乱码）"));
  console.log("      页面语言 lang：" + lang + (lang === "zh-CN" ? "" : "（中文页面建议写 zh-CN）"));
  console.log("      标签页标题 title：" + title);
  console.log("");
  console.log("[2] 标签配对：" + (paired ? "OK" : "有问题"));
  if (unclosed.length) console.log("      少了结束标签的：" + unclosed.join("、"));
  if (strayClose.length) console.log("      孤零零的结束标签：" + strayClose.join("、"));
  if (stack.length) console.log("      一直没关上的：" + stack.join("、"));
  console.log("");
  console.log("[3] 浏览器不认识的标签：" + (unknown.length ? unknown.join("、") + "（多半是拼写错）" : "无"));
  console.log("");
  console.log("[4] 图片检查：" + (imgs.length === 0 ? "没有用 img 标签" : ""));
  for (const s of imgs) {
    const state = /^https?:/i.test(s)
      ? "外链"
      : (fs.existsSync(path.join(path.dirname(file), s)) ? "本地文件存在" : "本地文件不存在（页面会显示裂图）");
    console.log("      " + s + " → " + state);
  }
  console.log("");
  console.log("[5] 用到的标签：" + [...new Set(tags)].join(" "));
  console.log("");
  console.log("[6] 页面上会出现的文字：");
  console.log("      " + noComment.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  console.log("");
  console.log("----------------------------------------");
  console.log("");
}

const args = process.argv.slice(2);
let files = args.map((a) => path.resolve(a));

if (files.length === 0) {
  files = fs.readdirSync(process.cwd())
    .filter((f) => f.toLowerCase().endsWith(".html") || f.toLowerCase().endsWith(".htm"))
    .map((f) => path.resolve(f));
}

if (files.length === 0) {
  console.log("没找到 .html 文件。");
  console.log("用法：node 检查HTML.js [文件名]");
  console.log("（不带文件名，就检查当前文件夹里所有 .html 文件）");
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
