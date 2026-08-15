const chores=[
 {icon:"🛏️",name:"Make your bed",coins:5,done:false},
 {icon:"📚",name:"Homework",coins:15,done:false},
 {icon:"🧹",name:"Clean your room",coins:20,done:false}
];
let balance=165;
const list=document.getElementById("choreList");
function render(){
 list.innerHTML="";
 chores.forEach((c,i)=>{
  const el=document.createElement("div"); el.className="chore";
  el.innerHTML=`<div class="icon">${c.icon}</div><div class="chore-info"><b>${c.name}</b><div>+${c.coins} coins 🪙</div></div><button class="done ${c.done?'':'pending'}">${c.done?'Done ✓':'Do it!'}</button>`;
  el.querySelector("button").onclick=()=>complete(i);
  list.appendChild(el);
 });
 document.getElementById("balance").textContent=balance;
 document.getElementById("progressNum").textContent=Math.min(balance,200);
 document.getElementById("remaining").textContent=Math.max(0,200-balance);
 document.getElementById("progressBar").style.width=Math.min(100,balance/200*100)+"%";
}
function complete(i){
 if(chores[i].done)return;
 chores[i].done=true; balance+=chores[i].coins;
 const t=document.getElementById("toast");t.style.display="block";setTimeout(()=>t.style.display="none",1500);render();
}
document.getElementById("addChore").onclick=()=>{
 const name=prompt("What chore would you like to add?");
 if(name){chores.push({icon:"⭐",name,coins:10,done:false});render();}
};
render();