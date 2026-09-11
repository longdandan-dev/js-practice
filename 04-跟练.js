const a = 7;
const b = 2;
console.log(a + b);
console.log(a * b);
console.log(a - b);
console.log(a / b);
console.log(a % b);

console.log("1" +2);
console.log("1" - 2);

console.log(7 > 2);
console.log(7 < 2);
console.log(7 === 7);//全等
console.log(7 === "7");
console.log(7 == "7");//先转型再比较
console.log(7 !==2);

console.log(true && false);
console.log(true || false);
console.log( !true);

const score = 86;
if (score >= 90){
    console.log("A");
} else if (score >= 80){
   console.log("B");
} else if (score >= 70){
    console.log("C");
} else{
    console.log("D");
};

const age = 20;
const result = age >= 18 ? "已成年" : "未成年";
console.log(age + "岁:" +result );

const n = 10;
if(n%2 === 0){
    console.log(n + "是偶数");
}else{
    console.log(n + "是奇数");
}
