/* ============================================================
   名字拼写哨兵
   ------------------------------------------------------------
   用法：在终端运行 node 检查拼写.js

   它只干一件事：把这个文件夹里所有 .js / .html 文件扫一遍，
   把"名字拼错了的名字""逗号打成了点""驼峰没转过来"这类问题揪出来，
   告诉你 文件:行号 和正确写法。

   为什么要有它：你前面的拼写坑已经攒了一串
   （salay、ture、consolr、sapn、fist、console,log、cosnole），
   这类错不会给提示、只会让代码整段不跑，最费时间。
   写完一段先跑一次这个，再跑其他的检查。
   ============================================================ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = __dirname;

// 跳过检查脚本自己（它们里面写着这些错拼的样子，会自己报自己）
const files = fs
  .readdirSync(dir)
  .filter((f) => /\.(js|html)$/i.test(f))
  .filter((f) => !f.startsWith("检查"));

const rules = [
  [/\bconsole\s*,\s*log/, "逗号要改成一个点：console.log"],
  [/\b(document|window|localStorage|JSON|Math|Array|Object)\s*,\s*[a-zA-Z]/, "逗号要改成一个点（后面是方法名的话）"],
  [/\b(cosnole|consolr|consoel|consle|concole|consoole|consolo)\b/, "console 拼错了"],
  [/\bconsole\.lgo\b/, "console.log 拼反了"],
  [/\bqueryselector\b/, "querySelector 里的 S 要大写"],
  [/\bQuerySelector\b/, "querySelector 里第一个 q 要小写"],
  [/\bquerSelector\b|\bquerySelctor\b|\bquerySeletor\b|\bquerySelecter\b|\bquerySelrctor\b/, "querySelector 拼错了（是 query + Selector）"],
  [/\btextcontent\b/, "textContent 里的 C 要大写"],
  [/\binnerHtml\b/, "innerHTML 里的 HTML 要大写"],
  [/\bclasslist\b/, "classList 里的 L 要大写"],
  [/\bclassList\s*,\s*(add|remove|toggle|contains)/, "classList 后面要用点：classList.add"],
  [/\bcreateelement\b|\bcreateElemnt\b|\bcreatElement\b/, "createElement 拼错了（注意中间的 E 要大写）"],
  [/\baddEventlistener\b|\baddeventlistener\b|\bAddEventListener\b|\bEventlistener\b/, "addEventListener 拼错了（Event 和 Listener 两个词都要大写首字母）"],
  [/\bpreventdefault\b/, "preventDefault 里的 D 要大写"],
  [/\blocalStorge\b|\blocalStroage\b|\blocalstorage\b|\bLocalStorage\b/, "localStorage 拼错了（S 要大写）"],
  [/\bJSON\.pars\b|\bJSON\.parsee\b|\bJson\.parse\b|\bJson\.stringify\b/, "JSON.parse / JSON.stringify 拼错了"],
  [/\bMath\.flor\b|\bMath\.floo\b|\bMath\.flor\b/, "Math.floor 拼错了"],
  [/\bture\b/, "true 拼错了"],
  [/\bflase\b|\bfales\b/, "false 拼错了"],
  [/\bfunctoin\b|\bfunciton\b|\bfuncion\b/, "function 拼错了"],
  [/\bretrun\b|\breturen\b/, "return 拼错了"],
  [/\bdocuemnt\b|\bdocment\b|\bdoccument\b/, "document 拼错了"],
  [/\blenght\b|\blengt\b/, "length 拼错了"],
  [/\.style\.[a-zA-Z]+-[a-z]+\s*=/, "JS 里要写驼峰，例如 background-color 要写成 backgroundColor"],
  [/\bawit\b|\bawiat\b|\bawaiit\b/, "await 拼错了（a-w-a-i-t）"],
  [/\basycn\b|\basnyc\b|\basyn\b|\bfnction\b/, "async / function 拼错了（async 是 a-s-y-n-c）"],
  [/\bPromsie\b|\bpromsie\b|\bPromis\b/, "Promise 拼错了（P 大写，中间是 mise）"],
  [/\breslove\b|\bResolve\b/, "resolve 拼错了（re + solve）"],
  [/\brejct\b|\brejeect\b|\bReject\b/, "reject 拼错了（re + ject）"],
];

// 附加项（2026-09-14 加：这三种都真实出现过）
const extras = [
  [
    /[)}];\s*[A-Za-z_$][\w$]*\s*$/,
    "分号后面多了字符，浏览器会把它当成一个没定义的变量，整段脚本从这里停住",
  ],
  [
    /\bconsole\.(?!log\b|error\b|warn\b|info\b|table\b|dir\b|clear\b|time\b|timeEnd\b|count\b|group\b|groupEnd\b|trace\b|assert\b|debug\b)[A-Za-z_$][\w$]*/,
    "console 后面只能跟 log / error / warn / info / table，别的方法名浏览器不认识",
  ],
  [
    /\bclassList\.(?!add\b|remove\b|toggle\b|contains\b|replace\b|item\b|length\b|value\b|entries\b|forEach\b|keys\b|values\b)[A-Za-z_$][\w$]*/,
    "classList 只有 add / remove / toggle / contains 这几个方法（想加类名用 add）",
  ],
  [
    /\blocalStorage\.(?!setItem\b|getItem\b|removeItem\b|clear\b|key\b|length\b)[A-Za-z_$][\w$]*/,
    "localStorage 只有 setItem / getItem / removeItem / clear 这几个方法",
  ],
  [
    /\.value\s*\(/,
    "value 是属性不是方法：读用 input.value，清空用 input.value = \"\"（不要加括号）",
  ],
  [
    /\bcloset\b/,
    "closest 拼错了（少写一个 s）：从被点的元素往上找最近的 li",
  ],
  [
    /\bcontain\s*\(/,
    "contains 拼错了（少写一个 s）：判断有没有这个类",
  ],
  [
    /\bappendchild\b|\bappendChid\b|\bremovechild\b/,
    "appendChild / removeChild 有大小写：中间那个 C 要大写",
  ],
  [
    /setItem\([^,]+,\s*[\[{]/,
    "setItem 的第二个参数不能直接放数组或对象，先用 JSON.stringify 打包成字符串",
  ],
  [
    /\breturn\s*\(\s*\)/,
    "return 是关键字不是函数，不能写成 return()；是不是想调用自己写的某个函数（比如 render()）？",
  ],
];

const KEYWORDS = new Set([
  "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "return",
  "function", "typeof", "instanceof", "new", "delete", "void", "in", "of", "this",
  "try", "catch", "finally", "throw", "class", "extends", "super", "await", "async", "yield",
]);

// 常见 HTML 标签（用于检查 createElement("xxx") 里的标签名对不对）
const HTML_TAGS = new Set(("a abbr address area article aside audio b base bdi bdo blockquote body br button " +
    "canvas caption cite code col colgroup data datalist dd details dfn dialog div dl dt em embed fieldset " +
    "figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd " +
    "label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p param " +
    "picture pre progress q rp rt ruby s samp script section select slot small source span strong style sub " +
    "summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr " +
    "svg path circle rect line g defs use polygon polyline ellipse").split(/\s+/));

const TAG_HINTS = {
    text: "text 不是 HTML 标签（造一段文字请用 span 或 p）",
    del: "del 是「删除线文本」标签，会自带一条横线；要做按钮请用 button",
    delete: "delete 不是 HTML 标签（要做按钮请用 button）",
    checkbox: "checkbox 不是标签名（要用 <input type=\"checkbox\">）",
};

const GLOBALS = new Set([
  "document", "window", "console", "localStorage", "sessionStorage", "JSON", "Math",
  "Object", "Array", "String", "Number", "Boolean", "Date", "RegExp", "Map", "Set",
  "Promise", "Symbol", "BigInt", "Error", "Function", "undefined", "NaN", "Infinity",
  "setTimeout", "setInterval", "clearInterval", "clearTimeout", "alert", "confirm",
  "prompt", "fetch", "parseInt", "parseFloat", "isNaN", "encodeURIComponent",
  "decodeURIComponent", "require", "module", "process", "exports", "__dirname",
  "history", "location", "navigator", "screen", "event", "arguments",
]);

function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

// 只保留 HTML 里 <script> 的内容，其余部分用空格填空（行号对得上原文件）
function codeTextFor(raw, isHtml) {
  if (!isHtml) return raw;

  // 先把 HTML 注释挖空（保留换行）：文件开头那段说明里也写着 <script>，
  // 不先处理的话下面的匹配会被它带偏
  const noComments = raw.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));

  return noComments
    .split(/(<script[\s\S]*?<\/script>)/i)
    .map((part) =>
      /^<script/i.test(part)
        ? part.replace(/^<script[^>]*>/i, "").replace(/<\/script>\s*$/i, "")
        : part.replace(/[^\n]/g, " ")
    )
    .join("");
}

// 把注释和字符串去掉（保留换行，行号不乱）
function stripNoise(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/"[^"\n]*"/g, '""')
    .replace(/'[^'\n]*'/g, "''")
    .replace(/`[^`]*`/g, "``");
}

// 只去注释，保留字符串（查 createElement("xxx") 这类要看字符串内容）
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));
}

// 查 createElement("xxx") 里的标签名是不是真的 HTML 标签
function checkTags(code, rawLines) {
  const out = [];
  const re = /createElement\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = re.exec(code))) {
    const tag = m[1].trim();
    const low = tag.toLowerCase();
    if (TAG_HINTS[low]) {
      const line = code.slice(0, m.index).split("\n").length;
      out.push({ line, msg: TAG_HINTS[low], text: (rawLines[line - 1] || "").trim().slice(0, 70) });
    } else if (!HTML_TAGS.has(low)) {
      const line = code.slice(0, m.index).split("\n").length;
      out.push({
        line,
        msg: "createElement(\"" + tag + "\") 里的名字不是常见 HTML 标签，检查一下（造文字用 span、做按钮用 button）",
        text: (rawLines[line - 1] || "").trim().slice(0, 70),
      });
    }
  }
  return out;
}

// 查编辑器"好心"自动补的导入（2026-09-15 新加：打 resolve 时 VS Code 自己加了两行 require）
function checkAutoImport(code, rawLines) {
  const out = [];
  const re = /require\(\s*["']node:[^"']+["']\s*\)/g;
  let m;
  while ((m = re.exec(code))) {
    const line = code.slice(0, m.index).split("\n").length;
    out.push({
      line,
      msg:
        "这一行多半不是你写的，是编辑器自动帮你补的导入（你打 resolve 的时候它顺手加的）。" +
        "练习文件里不需要 require / import，整行删掉。",
      text: (rawLines[line - 1] || "").trim().slice(0, 70),
    });
  }
  return out;
}

// 查 console.time / console.timeEnd 是不是配成了一对（标签名必须一模一样）
function checkTimers(code, rawLines) {
  const out = [];
  const starts = new Set();
  let m;
  const reStart = /console\.time\(\s*["']([^"']+)["']\s*\)/g;
  while ((m = reStart.exec(code))) starts.add(m[1]);

  const reEnd = /console\.timeEnd\(\s*["']([^"']+)["']\s*\)/g;
  while ((m = reEnd.exec(code))) {
    if (starts.has(m[1])) continue;
    const line = code.slice(0, m.index).split("\n").length;
    out.push({
      line,
      msg:
        "timeEnd(\"" + m[1] + "\") 找不到配对的开关：上面要有一句 console.time(\"" + m[1] + "\")。" +
        "检查是不是把 console.time 写成了 console.log。",
      text: (rawLines[line - 1] || "").trim().slice(0, 70),
    });
  }
  return out;
}

// 查"用了但没声明过的名字"（变量名拼错就是这么来的）
function checkUndeclared(code, rawLines) {
  const declared = new Set();
  let m;

  const add = (s) => {
    if (s) declared.add(s);
  };

  for (const re of [
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g,
    /\bfunction\s+([A-Za-z_$][\w$]*)/g,
  ]) {
    while ((m = re.exec(code))) add(m[1]);
  }

  for (const re of [
    /\bfunction\s*\(([^)]*)\)/g,
    /\bcatch\s*\(([^)]*)\)/g,
    /\(([^()]*)\)\s*=>/g,
    /(?<![\w$.])([A-Za-z_$][\w$]*)\s*=>/g,
  ]) {
    while ((m = re.exec(code))) {
      m[1].split(",").forEach((p) => add(p.trim().replace(/=.*/, "").trim()));
    }
  }

  const used = [];
  for (const re of [
    /(?<![\w$.])([A-Za-z_$][\w$]*)\s*\./g,
    /(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(/g,
  ]) {
    while ((m = re.exec(code))) used.push({ name: m[1], index: m.index });
  }

  const out = [];
  const seen = new Set();

  for (const u of used) {
    if (declared.has(u.name) || GLOBALS.has(u.name) || KEYWORDS.has(u.name)) continue;
    if (seen.has(u.name)) continue;
    seen.add(u.name);

    let best = "";
    let bestD = 99;
    for (const d of declared) {
      const dist = editDistance(u.name, d);
      if (dist < bestD) {
        bestD = dist;
        best = d;
      }
    }
    const closeEnough =
      bestD <= 1 || (bestD === 2 && u.name.length >= 4 && best.length >= 4);
    const suggest = closeEnough ? "，是不是想写 `" + best + "`？" : "";
    const line = code.slice(0, u.index).split("\n").length;

    out.push({
      line,
      msg: "`" + u.name + "` 没有声明过" + suggest,
      text: (rawLines[line - 1] || "").trim().slice(0, 70),
    });
  }

  return out;
}

const hits = [];

// 语法检查：把每个 <script> 交给 JS 引擎"编译一遍"（只编译，不执行）。
// 有语法错的话整段脚本一行都不会跑，浏览器只丢一句红字，非常难找，所以提前查。
function checkSyntax(file, raw) {
  const blocks = [];
  if (/\.html$/i.test(file)) {
    // 先挖掉 HTML 注释：文件开头的说明里也写着 <script>，不处理会被它带偏
    const source = raw.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));
    const re = /<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi;
    let mm;
    while ((mm = re.exec(source))) {
      const lineOfTag = source.slice(0, mm.index).split("\n").length;
      blocks.push({ code: mm[1], offset: lineOfTag - 1 });
    }
  } else {
    blocks.push({ code: raw, offset: 0 });
  }

  const found = [];
  for (const b of blocks) {
    try {
      new vm.Script(b.code);
    } catch (e) {
      const hit = String(e.stack || "").match(/evalmachine\.<anonymous>:(\d+)/);
      const innerLine = hit ? Number(hit[1]) : 1;
      found.push({
        line: b.offset + innerLine,
        msg:
          "语法错误 —— 这类错会让整段脚本一行都不跑：" +
          humanizeSyntaxError(e.message),
      });
    }
  }
  return found;
}

// 把引擎给的英文报错翻译成人话
function humanizeSyntaxError(msg) {
  if (/Illegal return statement/.test(msg)) {
    return msg + "（return 是关键字，不能当函数调用；是不是想写 render() 之类自己写的函数？）";
  }
  if (/Invalid or unexpected token/.test(msg)) {
    return msg + "（多半是多了个不能识别的字符，或者引号、括号少了一半）";
  }
  if (/already been declared/.test(msg)) {
    return msg + "（同一个名字用 const / let 声明了两次，改名或者直接用原来那个）";
  }
  if (/missing \)|\bmissing \)/.test(msg) || /Unexpected end of input/.test(msg)) {
    return msg + "（括号或花括号没配对，检查是不是少写了一个 } 或 )）";
  }
  if (/Unexpected token/.test(msg)) {
    return msg + "（多半是少了逗号、括号或引号）";
  }
  return msg;
}

for (const file of files) {
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  const rawLines = raw.split(/\r?\n/);

  // 语法错最致命，先报它
  for (const v of checkSyntax(file, raw)) {
    hits.push({ file, line: v.line, content: (rawLines[v.line - 1] || "").trim().slice(0, 70), msg: v.msg });
  }

  // 只看代码：HTML 里非 <script> 的部分（含 <style>、注释）先挖空，
  // 再去掉注释和字符串，这样 CSS 和说明文字不会被误报
  const code = stripNoise(codeTextFor(raw, /\.html$/i.test(file)));
  const codeRaw = stripComments(codeTextFor(raw, /\.html$/i.test(file)));
  const codeLines = code.split(/\r?\n/);

  codeLines.forEach((line, i) => {
    for (const [re, msg] of rules.concat(extras)) {
      if (re.test(line)) {
        hits.push({ file, line: i + 1, content: (rawLines[i] || "").trim().slice(0, 70), msg });
        break;
      }
    }
  });

  for (const v of checkUndeclared(code, rawLines)) {
    hits.push({ file, line: v.line, content: v.text, msg: v.msg });
  }

  for (const v of checkTags(codeRaw, rawLines)) {
    hits.push({ file, line: v.line, content: v.text, msg: v.msg });
  }

  for (const v of checkAutoImport(codeRaw, rawLines)) {
    hits.push({ file, line: v.line, content: v.text, msg: v.msg });
  }

  for (const v of checkTimers(codeRaw, rawLines)) {
    hits.push({ file, line: v.line, content: v.text, msg: v.msg });
  }
}

// 同一行只保留最前面那条（后面的多半是同一个错引出来的）
const deduped = [];
for (const h of hits) {
  if (deduped.some((d) => d.file === h.file && d.line === h.line)) continue;
  deduped.push(h);
}
deduped.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

console.log("=== 名字拼写哨兵 ===");
console.log("");
console.log("扫描了 " + files.length + " 个文件：" + files.join("、"));
console.log("");

if (deduped.length === 0) {
  console.log("干净，没发现拼错的名字。可以跑别的检查了。");
} else {
  console.log("发现 " + deduped.length + " 处，按这个顺序改：");
  console.log("");
  for (const h of deduped) {
    console.log("[要改] " + h.file + " 第 " + h.line + " 行");
    console.log("       问题：" + h.msg);
    console.log("       这一行：" + h.content);
    console.log("");
  }
  console.log("改完保存，再跑一次 node 检查拼写.js。");
}
console.log("");
console.log("提醒：它只能查名字，查不出逻辑错。页面没变化还是先按 F12 看控制台的红字。");
