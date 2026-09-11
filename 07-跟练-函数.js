/* ============================================================
   学习日 4 · 跟练本（函数）
   ------------------------------------------------------------
   老规矩：跟着聊天里我给的代码，一段一段自己敲，敲完就跑。
   在终端运行：node 07-跟练-函数.js
   报错就整段发我，别自己硬耗。
   ============================================================ */


// ---- 跟练 1：最简单的函数（声明 + 调用）----

// 在这里敲：
function sayHello(){
   console.log("你好我叫丹丹");
}
sayHello();
sayHello();

// ---- 跟练 2：带参数的函数 ----

// 在这里敲：
function greet(name){
   console.log("你好,"+name);
}
greet("丹丹");
greet("前端");


// ---- 跟练 3：带返回值的函数（return 和 console.log 的区别）----

// 在这里敲：
function  add(a,b){
   return a + b;
} 
const result = add(3,5);
console.log("加法结果",result);
console.log("再算一次",add(10,20));

function add2(a,b){
   console.log("我只打印，不交结果",a + b);
}
const r2 = add2(3,5);
console.log("r2是",r2);


// ---- 跟练 4：函数表达式（把一个函数存进变量）----

// 在这里敲：
const multiply = function(a , b){
   return a * b;
};
console.log("乘法",multiply(6,7));


// ---- 跟练 5：箭头函数（换个写法）----

// 在这里敲：
const minus = (a,b) => a - b;
console.log("减法",minus(10,3));

// ---- 跟练 6：综合练习（把学习日 2 的等级判断包成函数）----

// 在这里敲：
function getlevel(score){
   if(score >= 90){
      return "A";
   }else if (score >=80){
      return "B";
   }else if (score >=60){
      return "C";
   }else{
      return "D";
   }
}
console.log("90分是",getlevel(90));
console.log("82分是",getlevel(82));
console.log("59分是",getlevel(59));
/* ===== 敲完之后 =====
   1. 在终端运行：node 07-跟练-函数.js
   2. 把输出发我，有报错就整段发
*/
