 /* ============================================================
   学习日 5 · 独立练习：数组入门
   ------------------------------------------------------------
   规则不变：
   1. 写在每题 "// TODO:" 下面，Ctrl + S 保存
   2. 每题都用 "1)" "2)" 这样开头打印（批改脚本靠编号认题）
   3. 写完运行：node 检查.js
   ============================================================ */


// ===== 练习 1：建一个歌单数组 =====
// 要求：用 const 声明一个数组 songs，里面放 5 首歌名（你自己喜欢就行）
//       打印一行，以 "1)" 开头，把长度、第一首、最后一首都打出来
// 期望看到类似：1) 一共 5 首，第一首是 晴天，最后一首是 告白气球
// 提示：长度是 songs.length；第一首是 songs[0]；索引从 0 开始，最后一首是 songs[4]

// TODO: 在这里写你的代码
const songs = ["晴天","多远都要在一起","烟火里的尘埃","喜欢你","告白气球"]
console.log("1) 长度是", songs.length);
console.log("1) 第一首", songs[0]);
console.log("1) 第三首", songs[2]);
console.log("1) 最后一首", songs[songs.length - 1]);

// ===== 练习 2：push 和 pop（数组两头）=====
// 要求：用 push 往歌单末尾加一首歌，再用 pop 把末尾那首弹出来
//       打印一行，以 "2)" 开头，说明 push 之后有几首、pop 之后有几首
// 期望看到类似：2) push 之后 6 首，pop 之后 5 首
// 提示：push 和 pop 都会改变原数组；pop 会把弹出的那首"交出来"，可以用变量接住

// TODO: 在这里写你的代码
songs.push("简单爱");
console.log("2) push之后",songs.length,"首，最后一首是",songs[songs.length -1])

const out = songs.pop();
console.log("2) pop弹出了",out,"，现在剩",songs.length,"首");

songs.unshift("屋顶");
console.log("2) unshift之后第一首是",songs[0],"一共",songs.length,"首")

const first= songs.shift();
console.log("2) shift拿走了",first
,"，现在第一首是",songs[0]);
// ===== 练习 3：用 for 循环遍历数组 =====
// 要求：用 for 循环把 songs 里每一首都打印出来，格式："3) 第 1 首：晴天"
//       循环结束后再打印一行，以 "3)" 开头，说明一共有几首
// 期望看到类似：
//   3) 第 1 首：晴天
//   3) 第 2 首：稻香
//   ...
//   3) 一共 5 首
// 提示：序号写 i + 1，歌名写 songs[i]，循环条件用 i < songs.length

// TODO: 在这里写你的代码
for (let i = 0;i < songs.length;i++){
   console.log(" 3) 第",i + 1,"首：",songs[i]);
}
console.log("3) 一共",songs.length,"首");

// ===== 练习 4：数字数组求和 + 找最大值 =====
// 要求：声明 nums = [12, 5, 33, 8, 21]
//       用 for 循环算出总和，同时找出最大的那个数（不许直接用 Math.max）
//       打印一行，以 "4)" 开头
// 期望看到类似：4) 和是 79，最大是 33
// 提示：和先设 let sum = 0；最大值先设 let max = nums[0]，再一个一个比大小

// TODO: 在这里写你的代码
const nums = [12,5,33,8,21];
let sum = 0;
let max = nums[0];

for (let i = 0;i < nums.length;i++){
   sum = sum + nums[i];
   if (nums[i] >max){
      max = nums[i];
   }
}
console.log("4) 和是",sum ,"，最大值",max);

// ===== 练习 5：倒着遍历数组 =====
// 要求：声明 arr = [1, 2, 3, 4, 5]
//       用 for 循环从最后一个往前取，拼成一个字符串（不要加分隔符）
//       打印一行，以 "5)" 开头，把拼出来的数字和个数都打出来
// 期望看到类似：5) 倒着是 54321，一共 5 个数字
// 提示：先 let result = ""；循环里 result = result + arr[i]；最后一位下标是 arr.length - 1

// TODO: 在这里写你的代码
const arr = [1,2,3,4,5];
let result = "";
for(let i = arr.length - 1;i>=0;i--){
   result = result + arr[i];
}
console.log("5) 倒着是",result,"，一共",arr.length,"个数字")
/* ===== 写完之后 =====
   1. 终端运行：node 检查.js
   2. 结果发我
*/
