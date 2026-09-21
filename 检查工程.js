/* ============================================================
   工程化体检脚本（阶段 0 · 模块 5：npm + Vite）
   ------------------------------------------------------------
   用法（在练习目录 D:\A-前端学习\js-practice 里运行）：
     node 检查工程.js                    → 默认检查 D:\A-前端学习\my-portfolio
     node 检查工程.js D:\别的\项目目录    → 检查指定的项目目录

   它查什么：项目骨架齐不齐、package.json 写对没有、依赖装没装、
             入口对不对、该忽略的有没有忽略、README 写没写
   它查不出什么：项目跑起来长什么样、热更新灵不灵——那个要你自己开
             npm run dev，改一行代码、看浏览器自己变
   ============================================================ */

const fs = require("fs");
const path = require("path");

const DEFAULT_DIR = "D:\\A-前端学习\\my-portfolio";
const dir = path.resolve(process.argv[2] || DEFAULT_DIR);

const results = [];
const add = (name, ok, hint) => results.push({ name, ok: !!ok, hint: hint || "" });

function read(file) {
  try {
    return fs.readFileSync(path.join(dir, file), "utf8");
  } catch (err) {
    return null;
  }
}

function exists(file) {
  return fs.existsSync(path.join(dir, file));
}

console.log("=== 阶段 0 模块 5 产出 · 工程化入门（npm + Vite）===\n");
console.log("检查目录：" + dir + "\n");

if (!fs.existsSync(dir)) {
  console.log("[未通过] 项目目录还不存在：");
  console.log("         " + dir);
  console.log("\n先按跟练手册第 1 步，在 D:\\A-前端学习 下把项目建出来，再回来跑这个脚本。");
  process.exit(0);
}

// ---------- 1. 项目骨架 ----------
console.log("[1] 项目骨架（一个 Vite 项目至少长这样）");

const pkgRaw = read("package.json");
let pkg = null;
try {
  pkg = pkgRaw ? JSON.parse(pkgRaw) : null;
} catch (err) {
  pkg = null;
}

const html = read("index.html");
const mainJs = read("src/main.js");

add("index.html 存在（页面入口）", html !== null, "Vite 项目的入口 HTML 就在根目录");
add("src/main.js 存在（JS 入口）", mainJs !== null, "src/ 放你自己写的源码");
add("src/style.css 存在（样式入口）", exists("src/style.css"), "CSS 也搬到 src/ 里，由 JS import 进来");

// ---------- 2. package.json ----------
console.log("");
console.log("[2] package.json（项目的身份证 + 命令清单）");

add("package.json 存在", pkgRaw !== null, "没有它就不是一个 npm 项目");
add("package.json 是合法 JSON（能解析）", pkg !== null, "少逗号、多逗号都会让整个文件作废");

const scripts = (pkg && pkg.scripts) || {};
add("scripts 里有 dev（npm run dev 就是它的别名）", /vite/.test(scripts.dev || ""), "一般是 \"dev\": \"vite\"");
add("scripts 里有 build（打包上线用）", /vite build/.test(scripts.build || ""), "一般是 \"build\": \"vite build\"");
add("scripts 里有 preview（预览打包结果）", !!scripts.preview, "一般是 \"preview\": \"vite preview\"");

const devDeps = (pkg && pkg.devDependencies) || {};
const deps = (pkg && pkg.dependencies) || {};
add("vite 写进了依赖清单", !!(devDeps.vite || deps.vite), "工具类依赖放 devDependencies");

// ---------- 3. 依赖装没装 ----------
console.log("");
console.log("[3] 依赖装没装（npm install 跑过了吗）");

add("node_modules 目录存在", exists("node_modules"), "这是 npm 从网上下回来的依赖，很大、不进 Git");
add("package-lock.json 存在", exists("package-lock.json"), "版本锁定文件，要提交进 Git");

// ---------- 4. 入口对不对 ----------
console.log("");
console.log("[4] 入口对不对（Vite 靠这些把项目串起来）");

const entryOk = !!html && /<script[^>]+type=["']module["'][^>]+src=["']\/?src\/main\.js["']/.test(html);
add("index.html 用 <script type=\"module\"> 引了 src/main.js", entryOk || /\/src\/main\.js/.test(html || ""), "这行就是 Vite 找到代码的线索");

let title = "";
const titleMatch = (html || "").match(/<title>([\s\S]*?)<\/title>/i);
if (titleMatch) title = titleMatch[1].trim();
const pkgName = (pkg && pkg.name) || "";
add(
  "index.html 的标题已经改成你自己的了",
  !!title && title !== pkgName && !/^vite/i.test(title),
  title ? "现在的标题是「" + title + "」，还跟模板一样" : "没找到 <title>"
);

const stillTemplate = /Get started/i.test(mainJs || "");
add("src/main.js 已经动手改过（模板文案删掉了）", mainJs !== null && !stillTemplate, "看到 \"Get started\" 说明还是照抄的模板");

// ---------- 5. Git 卫生 ----------
console.log("");
console.log("[5] 该忽略的有没有忽略（不然后面 push 会卡死）");

const ignore = read(".gitignore");
add(".gitignore 存在", ignore !== null, "create vite 会自动生成一份");
add(".gitignore 里忽略了 node_modules", /(^|\n)\s*node_modules\s*(\/)?\s*(\n|$)/.test(ignore || ""), "依赖文件夹上千个文件，绝不能提交");
add(".gitignore 里忽略了 dist", /(^|\n)\s*dist\s*(\/)?\s*(\n|$)/.test(ignore || ""), "打包产物是生成的，不进 Git");

// ---------- 6. README ----------
console.log("");
console.log("[6] README.md（别人打开你的仓库先看到的东西）");

const readme = read("README.md") || read("readme.md");
add("README.md 存在", readme !== null, "仓库的说明书");
add("README 里写了怎么装依赖", /npm\s+(install|i)\b/.test(readme || ""), "要有 npm install");
add("README 里写了怎么跑起来", /npm\s+run\s+dev/.test(readme || ""), "要有 npm run dev");

const readmeChars = (readme || "").replace(/\s/g, "").length;
add("README 不是一句话敷衍（有效内容 ≥ 120 字）", readmeChars >= 120, "现在约 " + readmeChars + " 字");

// ---------- 报告 ----------
const failed = results.filter((r) => !r.ok);
const passed = results.filter((r) => r.ok);

console.log("");
console.log("[7] 结论");
console.log("");
failed.forEach((r) => {
  console.log("  [未通过] " + r.name);
  if (r.hint) console.log("           → " + r.hint);
});
passed.forEach((r) => {
  console.log("  [通过] " + r.name);
});

console.log("");
console.log("通过 " + passed.length + " / " + results.length);

if (!failed.length) {
  console.log("");
  console.log("----------------------------------------");
  console.log("工程骨架这一关过了。别忘了第二关（脚本查不了的）：");
  console.log("  1. npm run dev 起服务，浏览器打开 http://localhost:5173");
  console.log("  2. 改一行 src/main.js 里的文字，Ctrl + S → 浏览器不刷新就变（这叫热更新）");
  console.log("  3. 终端里按 Ctrl + C 把服务停掉，看提示符回来");
  console.log("  4. git add . → commit → push，推完刷新 GitHub 页面确认");
}
