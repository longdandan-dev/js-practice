/* ============================================================
   模块 3 · 跟练本 A 代码注释版（你写的每一行，逐行讲）
   ------------------------------------------------------------
   这份就是你的 18-跟练-异步.js，一行代码没改，只是每行都加了注释。
   跑法一样：node 21-代码注释版-异步.js
   读法建议：左边开着 18 你写的原版，右边开这份，一行一行对着看。
   ============================================================ */


/* ============ 跟练 1：同步（代码从上往下排队）============ */

console.log("1 起床");
// console = 控制台这个"工具"；.log() = 往控制台打印；括号里 = 要打印的东西
// 结尾的分号表示"这句话说完了"（JS 里可以省略，但写着更清楚）

console.log("2 刷牙");
console.log("3 吃饭");
// 三行都在"同一批任务"里，谁也不等谁 → 按写的顺序一个个执行 → 输出 1、2、3
// 这就是"同步"：一件事做完才做下一件


/* ============ 跟练 2：异步（setTimeout 会"让开"）============ */

console.log("1,点外卖");
// 不用等的事，先干

setTimeout(() => {
  console.log("3,外卖到了");
}, 2000);
// setTimeout = 定时器，两个参数：
//   第一个参数：一个函数，写"到点了要做什么" —— 这里用的是箭头函数 () => { ... }
//   第二个参数：等多少毫秒（2000 = 2 秒）
// 注意最后一行 } 后面是 , 2000) —— 说明整个函数是 setTimeout 的第一个参数
// ★ 关键：这个函数不会马上执行，要等 2 秒后 JS 才回头做它

console.log("2继续学js");
// 不等定时器，接着往下跑

// 所以顺序是：1 → 2 →（大约 2 秒后）3
// 一句话：JS 不会站在那儿等外卖，它先把手上所有不用等的活干完


/* ============ 跟练 3：回调套回调（能跑，但难看）============ */

setTimeout(() => {
  console.log("第一步，下单");

  setTimeout(() => {
    console.log("第二步，商家接单");

    setTimeout(() => {
      console.log("第三步，骑手送餐");
    }, 1000);
    // ↑ 第 3 层：再等 1 秒

  }, 1000);
  // ↑ 第 2 层：再等 1 秒（它整个写在第 1 层里面）

}, 1000);
// ↑ 第 1 层：等 1 秒

// 三步一共 3 秒走完。
// 看形状：每往里一层，代码就往右缩一次 —— 这就是"回调地狱"的样子
// 为什么难看：后一步被"关"在前一步的括号里，想加第四步就得再往里钻一层


/* ============ 跟练 4：Promise + then（先给你一张饭票）============ */

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});
// 拆开看这一行：
//   (ms) => ...        箭头函数，参数 ms 是"等多少毫秒"
//   new Promise(...)   造一张 Promise（饭票）
//   (resolve) => {...} Promise 内部是一个函数，它拿到一个开关 resolve
//   setTimeout(resolve, ms) 到点后调用 resolve。
//     ★ 注意这里 resolve 后面没有括号 —— 是把"开关"本身交给定时器，到点了由它来按
//   调用 resolve() 的那一刻，这张票就"兑现"了

console.log("开始等1秒...");

wait(1000)
// 调用 wait，立刻拿到一张"1 秒后兑现"的票
  .then(() => {
  // .then 的意思是"等这张票兑现之后再执行"——不是马上执行
    console.log("1 秒到了");
  });

console.log("不等你，我先往下走");
// 这句话不等票兑现，直接跑 → 所以它排在"1 秒到了"前面


/* ============ 跟练 5：then 链（把跟练 3 的嵌套拍平）============ */

const step = (text, ms) => new Promise((resolve) => {
  setTimeout(() => resolve(text), ms);
});
// step = 造一张"等 ms 毫秒后，交出一个文本 text"的票
// 到点后执行 () => resolve(text)，把文字交给开关

step("1 下单", 500)
// 第一步：拿到第一张票
  .then((r) => {
    console.log(r);
    return step("2 商家接单", 500);
  })
  // r = 上一步兑现出来的结果（"1 下单"）
  // ★ return 一张新票，才能接着往下 .then —— 忘了 return，下面就接不上了
  .then((r) => {
    console.log(r);
    return step("3 骑手取餐", 500);
  })
  .then((r) => {
    console.log(r);
    console.log("2 流程结束");
  });
  // 最后一条不用 return 了，流程到这儿就结束

// 对比跟练 3：同样三步，这里不往右缩了，改成往下排队 —— 这就是 Promise 的价值


/* ============ 跟练 6：async / await（把 Promise 写得像同步）============ */

async function runOrder() {
  // 函数前面加 async = 声明"这个函数里面可以写 await"

  const a = await step("1 下单", 500);
  // await 的意思：等右边这张票兑现，把兑现出来的结果交给左边变量 a
  // 这一行跑完，a 就是字符串 "1 下单"（不是 Promise）
  console.log("awit版：", a);
  // 小提醒：字符串里的 "awit" 是拼错的（应该是 await），
  //        它只是打印给人看的字，不影响运行 —— 但下一行开始要注意

  const b = await step("2 商家接单", 500);
  // 上一步等完了，才轮到这一步 —— 看起来就像同步代码，一行接一行
  console.log("awit版：", b);

  const c = await step("3 骑手取餐", 500);
  console.log("awit版：", c);

  console.log("awit版：流程结束");
}

runOrder();
// 函数写好了必须调用它 —— 不写这一行，函数永远不会执行


/* ============ 跟练 7：经典坑 —— 忘了写 await ============ */

async function wrong() {
  const r = step("我是数据", 500);
  // ❌ 这里没写 await → r 拿到的是"票"，不是数据
  console.log("忘了 await 拿到得是：", r);
  // 打印出来是 Promise { <pending> }：一张还没兑现的票
}
wrong();

async function right() {
  const r = await step("我是数据", 500);
  // ✓ 写了 await → r 拿到的是数据本身
  console.log("加了 await 拿到得是：", r);
  // 打印出来是 "我是数据"
}
right();


/* ============ 跟练 8：出错怎么办（try / catch）============ */

const risk = (ok) => new Promise((resolve, reject) => {
  // 这次的 Promise 里有两条路：
  //   resolve(值) = 办成了，把结果交出去
  //   reject(原因) = 办砸了，把原因交出去
  setTimeout(() => {
    // 0.5 秒后给答复
    if (ok) {
      resolve("数据到手");
      // ok 是 true → 成功
    } else {
      reject("服务器说：找不到这个用户（404）");
      // ok 是 false → 失败，理由是这段文字
    }
  }, 500);
});

async function getData(ok) {
  try {
    // try = "这段代码可能会出事，出事别崩，交给我处理"
    const data = await risk(ok);
    // await 等结果：成功 → 把值给 data；失败 → 把错误"抛"出来
    console.log("成功:", data);
  } catch (err) {
    // 只要 try 里出了事，立刻跳到这里；err 里装着失败的原因
    console.log("失败：", err);
    // err 就是上面 reject("服务器说…") 塞进去的那句话
  }
}

getData(true);
// 传 true → 走成功分支 → 打印"成功: 数据到手"
getData(false);
// 传 false → 走失败分支 → 打印"失败： 服务器说：找不到这个用户（404）"
// 两次都没有让程序崩掉 —— 这就是 try / catch 的作用


/* ============ 跟练 9：Promise.all（几件事同时等）============ */

async function parallel() {
  console.time("并行");
  // 按下秒表，给它起个名字叫"并行"

  const all = await Promise.all([step("A", 500), step("B", 500), step("C", 500)]);
  // Promise.all([...])：把三个 Promise 一起等着
  // 三个都兑现之后，把结果按顺序装进一个数组交给 all

  console.timeEnd("并行");
  // 停表并打印耗时：大约 500ms（不是 1500ms！因为三件事是同时进行的）

  console.log("一起等到", all);
  // 结果是 [ 'A', 'B', 'C' ]
}
parallel();


/* ============ 你自己加的小实验（同一张票能不能反复兑）============ */

async function test() {
  const p = step("我是数据", 500);
  // 先拿一张票，先不兑

  console.log("1) 不await :", p);
  // 看到 Promise { <pending> }：票还没兑现

  const data = await step("我是数据", 500);
  // 注意：这里其实又调了一次 step，拿到的是"另一张票"
  // （更严谨的写法是 const data = await p，用同一张票）
  console.log("2) await 之后 :", data);
  // "我是数据"

  console.log("3) 再问一次这张票 :", await p);
  // 回头兑最开始那张票 p：它早就兑现过了，答案是"我是数据"
  // ★ 结论：Promise 的答案会被记住，之后每次 await 都拿到同一个值
}
test();


/* ============================================================
   整个文件的三句话总结
   1. 要等的事（setTimeout、fetch、网络请求）都会给回一张"票"（Promise）
   2. 拿票要用 await（或 .then）——不加，你手里永远只有票，没有数据
   3. 会出错的事要用 try / catch 兜住，别让整个页面跟着崩
   ============================================================ */
