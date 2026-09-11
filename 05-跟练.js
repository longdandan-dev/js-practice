/* ============================================================
   学习日 3 · 跟练本（循环 + 字符串）
   ------------------------------------------------------------
   老规矩：跟着聊天里我给的代码，一段一段自己敲，敲完就运行。
   在终端运行：node 05-跟练.js
   报错就整段发我，别自己硬耗。
   ============================================================ */


// ---- 跟练 1：for 循环打印 1 到 5 ----

// 在这里敲：
for (let i=1;i<=5;i++){
   console.log(i);
}


// ---- 跟练 2：for 循环累加 1 到 100（结果应该是 5050）----

// 在这里敲：
let sum = 0;
for (let i=1;i<=100;i++){
   sum = sum + i;
}
console.log(sum);

// ---- 跟练 3：while 循环倒计时 5 4 3 2 1 ----

// 在这里敲：
let i = 5;
while ( i >= 1){
   console.log(i);
   i--;
}


// ---- 跟练 4：break 和 continue 各体验一次 ----

// 在这里敲：
for (let i = 1;i<= 10; i++){
   if(i === 4)break;
   if(i === 2)continue;
   console.log(i); 
}


// ---- 跟练 5：字符串的 length、索引、indexOf、includes、slice ----

// 在这里敲：
const s ="深圳前端学习";
console.log(s.length);
console.log(s[0]);
console.log(s.indexOf("前端"));
console.log(s.includes("前端"));
console.log(s.slice(0,2));
console.log(s.slice(2));




// ---- 跟练 6：模板字符串（反引号 + ${}）----

// 在这里敲：
const name = "龙丹丹";
console.log(`我是${name},正在学前端`);


// ---- 跟练 7：用 for 循环把字符串倒过来（拆开再拼回去）----

// 在这里敲：
const q = "深圳前端";
let result = "";
for (let i = q.length - 1; i >=0; i--){
   result = result + q[i];
}
console.log(result);