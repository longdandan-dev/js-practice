/* 静态体检：不动浏览器，只把 HTML 文本拆开检查结构 */
const fs = require("fs");
const path = require("path");

const file = process.argv[2];
const src = fs.readFileSync(file, "utf8");
const noComment = src.replace(/<!--[\s\S]*?-->/g, "");

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr"]);
const KNOWN = new Set(["html", "head", "body", "title", "meta", "link", "style", "script",
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "strong", "em", "b", "i", "u", "s",
  "ul", "ol", "li", "dl", "dt", "dd", "div", "span", "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td", "form", "input", "button", "label",
  "select", "option", "textarea", "section", "header", "footer", "nav", "main", "aside",
  "article", "video", "audio", "source", "canvas", "svg", "pre", "code", "blockquote"]);

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
  const attrs = m[3] || "";
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

console.log("文件：" + path.basename(file));
console.log("字符数：" + src.length + "，字节：" + fs.statSync(file).size);
console.log("");
console.log("1) 标签是否配对：" + (unclosed.length === 0 && strayClose.length === 0 && stack.length === 0 ? "OK" : "有问题"));
if (unclosed.length) console.log("   少了结束标签的：" + unclosed.join("、"));
if (strayClose.length) console.log("   孤零零的结束标签：" + strayClose.join("、"));
if (stack.length) console.log("   一直没关上的：" + stack.join("、"));
console.log("2) 浏览器不认识的标签：" + (unknown.length ? unknown.join("、") : "无"));
console.log("3) meta charset：" + (/<meta[^>]+charset/i.test(noComment) ? "有" : "没有"));
console.log("4) html lang：" + (noComment.match(/<html[^>]*lang\s*=\s*"([^"]*)"/i) || ["", "（没写）"])[1]);
console.log("5) title：" + ((noComment.match(/<title>([\s\S]*?)<\/title>/i) || ["", "（没写）"])[1].trim()));
const imgs = [...noComment.matchAll(/<img[^>]*src\s*=\s*"([^"]*)"/gi)].map((x) => x[1]);
console.log("6) 图片：" + (imgs.length === 0 ? "没有用 img 标签" : imgs.map((s) => {
  const ok = /^https?:/i.test(s) ? "外链" : (fs.existsSync(path.join(path.dirname(file), s)) ? "本地文件存在" : "本地文件不存在");
  return s + "（" + ok + "）";
}).join("、")));
console.log("7) 标签清单：" + [...new Set(tags)].join(" "));
console.log("");
console.log("文件里出现过的文字（去掉标签）：");
console.log("   " + noComment.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
