/* ============================================================
   阶段 0 · 模块 1 跟练本（对象 + 数组方法）
   ------------------------------------------------------------
   老规矩：跟着聊天里我给的代码，一段一段自己敲，敲完就跑。
   在终端运行：node 13-跟练-对象.js

   上半场：对象（跟练 1-4）
   下半场：数组方法（跟练 5-8）
   ============================================================ */


// ---- 跟练 1：第一个对象（点取值）----

// 在这里敲：
const songs = [{name : " 晴天",singer:"周杰伦"},{name :"稻香",singer:"周杰伦"}];
const products = [{title : " 杯子",price:99},{title : " 手机",price:5880}];
const todos = [{text : " 跑步",done:false},{text : " 学习",done:false}];
const song = {name:"告白气球",singer:"周杰伦",time:269}
console.log(song.singer);
console.log(song.name);
console.log(song.time);

// ---- 跟练 2：方括号取值、改值、加属性 ----

// 在这里敲：
console.log(song["name"]);
song.time = 270;
song.album = "叶惠美";
console.log(song);
delete song.album;
console.log(song);

// ---- 跟练 3：数组里放对象（歌单）----

// 在这里敲：
const playlist = [
   {name:"晴天", singer:"周杰伦",time:269},
   {name:"稻香", singer:"周杰伦",time:255},
   {name:"告白气球", singer:"周杰伦",time:300},
   {name:"七里香", singer:"周杰伦",time:241}
];
console.log(playlist.length);
console.log(playlist[1].name);


// ---- 跟练 4：用 for 循环遍历歌单 ----

// 在这里敲：
for (let i =0;i <playlist.length;i++){
   console.log(i +1,playlist[i].name,"-",playlist[i].singer);
}


// ---- 跟练 5：forEach 遍历 ----
//forEach 逐个处理，只为"跑一遍"
// 在这里敲：
playlist.forEach((item) =>{
   console.log("歌名：",item.name);
});


// ---- 跟练 6：map 生成新数组 ----
//map 没项加工成新的样子
// 在这里敲：
const labels = playlist.map((item)=>{
   return item.name + " - " + item.singer;
}) ;
console.log(labels);


// ---- 跟练 7：filter 按条件筛选 ----
//filter 按条件筛选
// 在这里敲：
const jay = playlist.filter((item)=>item.singer === "周杰伦");
console.log("周杰伦的歌有",jay.length,"首");
console.log(jay)


// ---- 跟练 8：综合（算总时长，秒换算成 分:秒）----

// 在这里敲：
let total = 0;
playlist.forEach((item) =>{
   total = total + item.time;
});
console.log("总时长",Math.floor(total / 60 ),"分", total %60,"秒")


/* ===== 敲完之后 =====
   1. 终端运行：node 13-跟练-对象.js
   2. 把输出发我，有报错就整段发
*/
