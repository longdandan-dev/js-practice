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
];

const hits = [];

for (const file of files) {
  const lines = fs.readFileSync(path.join(dir, file), "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const [re, msg] of rules) {
      if (msg.startsWith("占位规则")) continue;
      if (re.test(line)) {
        hits.push({ file, line: i + 1, content: line.trim().slice(0, 70), msg });
        break;
      }
    }
  });
}

console.log("=== 名字拼写哨兵 ===");
console.log("");
console.log("扫描了 " + files.length + " 个文件：" + files.join("、"));
console.log("");

if (hits.length === 0) {
  console.log("干净，没发现拼错的名字。可以跑别的检查了。");
} else {
  console.log("发现 " + hits.length + " 处，按这个顺序改：");
  console.log("");
  for (const h of hits) {
    console.log("[要改] " + h.file + " 第 " + h.line + " 行");
    console.log("       问题：" + h.msg);
    console.log("       这一行：" + h.content);
    console.log("");
  }
  console.log("改完保存，再跑一次 node 检查拼写.js。");
}
console.log("");
console.log("提醒：它只能查名字，查不出逻辑错。页面没变化还是先按 F12 看控制台的红字。");
