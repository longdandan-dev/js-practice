/* ============================================================
   自动批改脚本
   ------------------------------------------------------------
   用法：在终端运行 node 检查.js
   它会把你写好的练习文件逐个跑一遍，逐题告诉你过没过。
   不过的题不用急，改完保存再跑一次就行。
   ============================================================ */

const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const days = [
  {
    file: "02-practice.js",
    title: "学习日 1 · 变量与数据类型（10 个变量）",
    rules: [
      [1, "用 let 声明变量", (c) => /\blet\s+/.test(c.source)],
      [2, "用 const 声明常量", (c) => /\bconst\s+/.test(c.source)],
      [3, "至少打印 10 行", (c) => (c.source.match(/console\.log/g) || []).length >= 10],
      [4, "有字符串变量", (c) => c.at("string")],
      [5, "有数字变量", (c) => c.at("number")],
      [6, "有布尔变量", (c) => c.at("boolean")],
      [7, "有没赋值的变量", (c) => c.at("undefined")],
      [8, "有 null 变量", (c) => c.at("object")],
    ],
  },
  {
    file: "03-运算符与判断.js",
    title: "学习日 2 · 运算符与条件判断",
    rules: [
      [1, "算术运算符（+ - * / %）", (c) => c.has(1, "9", "5", "14", "3.5", "1")],
      [2, "比较运算符（> 和 ===）", (c) => c.has(2, "true", "false")],
      [3, "逻辑运算符（&& || !）", (c) => c.src("&&") && c.src("||") && c.has(3, "true", "false")],
      [4, "判断奇数偶数", (c) => c.has(4, "偶数") && !c.has(4, "奇数")],
      [5, "成绩等级", (c) => c.has(5, "B")],
      [6, "是否成年（三元表达式）", (c) => c.has(6, "已成年") && !c.has(6, "未成年")],
      [7, "判断时段", (c) => c.has(7, "下午")],
    ],
  },
  {
    file: "06-循环与字符串.js",
    title: "学习日 3 · 循环与字符串",
    rules: [
      [1, "for 循环累加 1-100", (c) => c.has(1, "5050")],
      [2, "数偶数个数", (c) => c.has(2, "10")],
      [3, "while 倒计时", (c) => c.has(3, "倒计时")],
      [4, "break 提前结束", (c) => c.has(4, "55")],
      [5, "continue 跳过数字", (c) => c.has(5, "8")],
      [
        6,
        "字符串长度 + includes",
        (c) => c.src("length") && c.src("includes") && c.has(6, "true"),
      ],
      [7, "slice 拆日期", (c) => c.has(7, "2026", "年", "月", "日")],
      [8, "字符串反转", (c) => c.has(8, "端前圳深")],
    ],
  },
];

function loadPractice(file) {
  const full = path.join(__dirname, file);
  if (!fs.existsSync(full)) return { missing: true };

  const source = fs.readFileSync(full, "utf8");
  let output = "";
  let crash = "";

  try {
    output = execFileSync(process.execPath, [full], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    crash = String(err.stderr || err.message);
    output = String(err.stdout || "") + crash;
  }

  return { missing: false, source, output, crash };
}

function makeCtx(source, output) {
  const lines = output.split(/\r?\n/).map((l) => l.trim());
  const linesOf = (no) => lines.filter((l) => l.startsWith(no + ")"));
  return {
    source,
    src: (word) => source.includes(word),
    at: (word) => output.includes(word),
    linesOf,
    has: (no, ...words) =>
      linesOf(no).some((line) => words.every((w) => line.includes(w))),
    firstLineOf: (no) => linesOf(no)[0] || "",
  };
}

const skipped = [];

for (const day of days) {
  const data = loadPractice(day.file);
  if (data.missing) {
    skipped.push(day.file);
    continue;
  }

  console.log("=== " + day.title + "（" + day.file + "）===");
  console.log("");

  if (data.crash) {
    console.log("这段代码跑起来报错了，先把下面这段发给 Codex，一起看：");
    console.log("");
    console.log(data.crash.trim());
    console.log("");
  }

  const ctx = makeCtx(data.source, data.output);
  let pass = 0;

  for (const [no, desc, check] of day.rules) {
    let ok = false;
    try {
      ok = check(ctx);
    } catch (e) {
      ok = false;
    }
    if (ok) pass++;
    console.log((ok ? "[通过]" : "[未通过]") + " 第 " + no + " 题 · " + desc);
    if (!ok && ctx.firstLineOf(no)) {
      console.log("         你这一行打印的是：" + ctx.firstLineOf(no));
    }
  }

  console.log("");
  console.log("通过 " + pass + " / " + day.rules.length);
  console.log(
    pass === day.rules.length
      ? "这一天的练习全过，把结果发给 Codex，我们进下一步。"
      : "没过的题：回练习文件改完保存，再跑一次 node 检查.js。卡住超过 20 分钟直接发我。"
  );
  console.log("");
  console.log("----------------------------------------");
  console.log("");
}

if (skipped.length > 0) {
  console.log("还没创建的文件（已跳过）：" + skipped.join("、"));
}
