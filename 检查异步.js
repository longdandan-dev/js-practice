/* ============================================================
   阶段 0 · 模块 3 自动检查（第一道关）
   ------------------------------------------------------------
   用法：在终端运行 node 检查异步.js
   它检查的是"你代码里有没有用上这些本事"。

   注意：它查的是"有没有"，不查"写得对不对"，
        所以全绿 ≠ 一定跑对了，输出还得你自己看一眼。
   ============================================================ */

const fs = require("fs");
const path = require("path");

// 把注释掏空，避免提示文字里的关键词骗过检查
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^[ \t]*\/\/[^\n]*$/gm, "");
}

function readIfExists(file) {
  const full = path.join(__dirname, file);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf8");
}

function runChecks(title, checks) {
  console.log(title);
  console.log("");
  let pass = 0;
  for (const [desc, ok] of checks) {
    if (ok) pass++;
    console.log((ok ? "[通过] " : "[未通过] ") + desc);
  }
  console.log("");
  console.log("通过 " + pass + " / " + checks.length);
  console.log("");
  return { pass, total: checks.length };
}

let dealFailed = false;

// ---------------- 跟练本 A：18-跟练-异步.js ----------------
const drill = readIfExists("18-跟练-异步.js");

if (drill === null) {
  console.log("没找到 18-跟练-异步.js，先确认文件名和位置对不对。");
} else {
  const code = stripComments(drill);

  const drillChecks = [
    ["跟练 1：写了三条同步的 console.log", /console\.log/.test(code)],
    ["跟练 2：用了 setTimeout", /setTimeout/.test(code)],
    ["跟练 3：回调嵌套至少两层", (code.match(/setTimeout/g) || []).length >= 3],
    ["跟练 4：用了 new Promise", /new\s+Promise/.test(code)],
    ["跟练 4/5：用了 .then", (code.match(/\.then\s*\(/g) || []).length >= 2],
    ["跟练 5：then 链至少有 3 个 then", (code.match(/\.then\s*\(/g) || []).length >= 3],
    ["跟练 6：写了 async 函数", /async\s+function|async\s*\(/.test(code)],
    ["跟练 6：用了 await", (code.match(/await\s/g) || []).length >= 3],
    ["跟练 6：调用过 async 函数", /runOrder\s*\(/.test(code)],
    ["跟练 8：用了 try / catch", /\btry\b/.test(code) && /\bcatch\b/.test(code)],
    ["跟练 8：给调用处传了 true 和 false 两种参数", /getData\s*\(\s*true\s*\)/.test(code) && /getData\s*\(\s*false\s*\)/.test(code)],
  ];

  // 逐段检查"有没有哪一段空着"
  // 按"// 跟练 N：标题"这一整行切开，切完每段里就只剩你自己敲的代码
  const parts = drill.split(/\/\/\s*=+\s*\r?\n\/\/\s*跟练\s*(\d+)[^\n]*\r?\n/);
  const emptySections = [];
  for (let i = 1; i < parts.length; i += 2) {
    const no = parts[i];
    const body = stripComments(parts[i + 1] || "").replace(/[=\/\s]+/g, "");
    if (body.length < 5) emptySections.push(no);
  }
  for (const no of emptySections) {
    drillChecks.push(["跟练 " + no + "：还没写东西", false]);
  }

  const r1 = runChecks("=== 阶段 0 模块 3 跟练本 A · 异步三件套（18-跟练-异步.js）===", drillChecks);

  if (r1.pass < r1.total) {
    dealFailed = true;
    console.log("没过的项：回文件里补齐，保存后再跑一次 node 检查异步.js。");
    console.log("跟练 9（Promise.all）是加分题，不算在分数里。");
    console.log("");
  } else {
    console.log("跟练本 A 该用的本事都用上了。把 node 18-跟练-异步.js 的输出发我，");
    console.log("顺便回答文件末尾那两个问题，我们就进跟练本 B（浏览器里真的去要数据）。");
    console.log("");
  }
}

// ---------------- 产出：20-接口列表页.html（还没写就先跳过） ----------------
const product = readIfExists("20-接口列表页.html");

if (product === null) {
  console.log("----------------------------------------");
  console.log("");
  console.log("产出文件 20-接口列表页.html 还没建（没关系，跟着进度走）。");
  console.log("它出现之后，再跑一次这个脚本，会自动多出一组产出检查。");
} else {
  const scripts = product.match(/<script[\s\S]*?<\/script>/gi) || [];
  const code = stripComments(scripts.join("\n"));

  const productChecks = [
    ["页面里有输入框（搜索框）", /<input/i.test(product)],
    ["有一个列表容器（ul / ol / div）", /<ul|<ol|id="list"/i.test(product)],
    ["用了 fetch 去要数据", /fetch\s*\(/.test(code)],
    ["接口地址是真实的 http 地址（写在常量里也算）", /https?:\/\/[^\s"'`]+/.test(product) && /fetch\s*\(/.test(code)],
    ["用了 async / await", /async\s+function|async\s*\(/.test(code) && /await\s/.test(code)],
    ["用了 try / catch 处理失败", /\btry\b/.test(code) && /\bcatch\b/.test(code)],
    ["先检查响应是否成功（response.ok 或状态码）", /\.ok\b|status\s*===?\s*200|status\s*>=?\s*400/.test(code)],
    ["有加载中的提示（loading）", /loading|加载中|请稍等|正在加载/i.test(product)],
    ["有出错时的提示文字", /失败|出错|错误|没找到|异常|重试/.test(product)],
    ["搜索用了 filter + toLowerCase", /\.filter\s*\(/.test(code) && /toLowerCase/.test(code)],
    ["搜索前把输入去空格（trim）", /\.trim\s*\(/.test(code)],
    ["搜不到的时候有提示文字", /没有匹配|没有找到|没有搜到|无结果/.test(product)],
    ["重新渲染前清空列表（innerHTML 或 replaceChildren）", /innerHTML\s*=\s*["'`]{2}|replaceChildren/.test(code)],
  ];

  const r2 = runChecks("=== 阶段 0 模块 3 产出 · 接口列表页（20-接口列表页.html）===", productChecks);

  if (r2.pass < r2.total) {
    dealFailed = true;
    console.log("没过的项：回文件里补齐，保存后再跑一次 node 检查异步.js。");
    console.log("");
  } else {
    console.log("代码层面齐了。接下来在浏览器里真跑一遍：");
    console.log("  1. 打开页面 → 先看到「加载中…」，随后出现列表");
    console.log("  2. 搜索框输入关键字 → 列表只剩匹配的项，输入框清空后恢复全部");
    console.log("  3. 把接口地址改成一个不存在的用户 → 出现失败提示（页面不白屏）");
    console.log("  4. F12 控制台没有红字");
    console.log("");
  }
}

console.log("----------------------------------------");
console.log("");
console.log("提醒：这个脚本查不出逻辑错。页面没变化，还是先按 F12 看控制台的红字。");
