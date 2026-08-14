const defaultState = {
  childName: "Amaya",
  coins: 165,
  streak: 4,
  goal: {
    name: "Movie Night",
    cost: 200
  },
  chores: [
    { id: 1, name: "Make your bed", coins: 5, emoji: "🛏️", done: false },
    { id: 2, name: "Homework", coins: 15, emoji: "📚", done: false },
    { id: 3, name: "Clean your room", coins: 20, emoji: "🧹", done: false }
  ],
  rewards: [
    { id: 1, name: "Movie Night", cost: 200, emoji: "🍿" },
    { id: 2, name: "Ice Cream Trip", cost: 120, emoji: "🍦" },
    { id: 3, name: "Choose Dinner", cost: 150, emoji: "🍕" }
  ]
};

let state = loadState();
let currentTab = "home";

const $ = (id) => document.getElementById(id);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("starChoresState"));
    return saved ? { ...defaultState, ...saved } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem("starChoresState", JSON.stringify(state));
}

function setGreeting() {
  const hour = new Date().getHours();
  const text = hour < 12 ? "Good morning," : hour < 18 ? "Good afternoon," : "Good evening,";
  $("timeGreeting").textContent = text;
}

function render() {
  $("childName").textContent = state.childName;
  $("profileName").textContent = state.childName;
  $("nameInput").value = state.childName;
  $("coinBalance").textContent = state.coins;
  $("streakCount").textContent = state.streak;
  $("rewardName").textContent = state.goal.name;
  $("rewardProgressText").textContent = state.coins;
  $("rewardGoalText").textContent = state.goal.cost;

  const percent = Math.min(100, Math.round((state.coins / state.goal.cost) * 100));
  $("rewardProgressBar").style.width = `${percent}%`;

  if (state.coins >= state.goal.cost) {
    $("rewardNote").textContent = "You did it! Your reward is ready! 🎉";
  } else if (percent >= 75) {
    $("rewardNote").textContent = "You're so close! Keep it up! 💜";
  } else {
    $("rewardNote").textContent = "Every chore gets you closer! ⭐";
  }

  renderChores();
  renderRewards();
  showTab(currentTab);
}

function renderChores() {
  const list = $("choreList");
  list.innerHTML = "";

  state.chores.forEach((chore) => {
    const card = document.createElement("div");
    card.className = "chore-card";
    card.innerHTML = `
      <div class="chore-icon">${escapeHtml(chore.emoji)}</div>
      <div class="chore-copy">
        <h3>${escapeHtml(chore.name)}</h3>
        <p>+${chore.coins} coins ⭐</p>
      </div>
      <button class="${chore.done ? "undo-btn" : "done-btn"}" data-id="${chore.id}">
        ${chore.done ? "Undo" : "Done ✓"}
      </button>
    `;

    card.querySelector("button").addEventListener("click", () => toggleChore(chore.id));
    list.appendChild(card);
  });
}

function renderRewards() {
  const list = $("rewardList");
  list.innerHTML = "";

  state.rewards.forEach((reward) => {
    const canAfford = state.coins >= reward.cost;
    const item = document.createElement("div");
    item.className = "reward-item";
    item.innerHTML = `
      <div class="reward-emoji">${escapeHtml(reward.emoji)}</div>
      <div>
        <h3>${escapeHtml(reward.name)}</h3>
        <p>${reward.cost} coins</p>
      </div>
      <button class="redeem-btn" ${canAfford ? "" : "disabled"} data-id="${reward.id}">
        Redeem
      </button>
    `;
    item.querySelector("button").addEventListener("click", () => redeemReward(reward.id));
    list.appendChild(item);
  });
}

function toggleChore(id) {
  const chore = state.chores.find(c => c.id === id);
  if (!chore) return;

  if (chore.done) {
    chore.done = false;
    state.coins = Math.max(0, state.coins - chore.coins);
    showToast(`-${chore.coins} coins`);
  } else {
    chore.done = true;
    state.coins += chore.coins;
    showToast(`+${chore.coins} coins! Great job! ⭐`);
    burstConfetti();
  }

  saveState();
  render();
}

function redeemReward(id) {
  const reward = state.rewards.find(r => r.id === id);
  if (!reward || state.coins < reward.cost) return;

  state.coins -= reward.cost;
  saveState();
  showToast(`${reward.emoji} ${reward.name} redeemed!`);
  burstConfetti();
  render();
}

function showTab(tab) {
  currentTab = tab;

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });

  const homeParts = [
    document.querySelector(".encouragement"),
    document.querySelector(".balance-card"),
    document.querySelector(".reward-card"),
    document.querySelector(".chores-section")
  ];

  homeParts.forEach(el => el.classList.add("hidden"));
  $("rewardsPage").classList.add("hidden");
  $("profilePage").classList.add("hidden");

  if (tab === "home") {
    homeParts.forEach(el => el.classList.remove("hidden"));
  } else if (tab === "chores") {
    document.querySelector(".chores-section").classList.remove("hidden");
  } else if (tab === "rewards" || tab === "store") {
    $("rewardsPage").classList.remove("hidden");
  } else if (tab === "profile") {
    $("profilePage").classList.remove("hidden");
  }
}

function openModal(kind) {
  $("modalBackdrop").classList.remove("hidden");

  if (kind === "reward") {
    $("modalTitle").textContent = "Add reward";
    $("choreForm").classList.add("hidden");
    $("rewardForm").classList.remove("hidden");
  } else {
    $("modalTitle").textContent = "Add chore";
    $("rewardForm").classList.add("hidden");
    $("choreForm").classList.remove("hidden");
  }
}

function closeModal() {
  $("modalBackdrop").classList.add("hidden");
}

function addChore() {
  const name = $("choreNameInput").value.trim();
  const coins = Number($("choreCoinsInput").value);
  const emoji = $("choreEmojiInput").value.trim() || "⭐";

  if (!name || !Number.isFinite(coins) || coins < 1) {
    showToast("Add a chore name and coin value.");
    return;
  }

  state.chores.push({
    id: Date.now(),
    name,
    coins,
    emoji,
    done: false
  });

  saveState();
  closeModal();
  $("choreNameInput").value = "";
  $("choreCoinsInput").value = "10";
  $("choreEmojiInput").value = "⭐";
  render();
  showToast("Chore added! ✅");
}

function addReward() {
  const name = $("rewardNameInput").value.trim();
  const cost = Number($("rewardCostInput").value);
  const emoji = $("rewardEmojiInput").value.trim() || "🎁";

  if (!name || !Number.isFinite(cost) || cost < 1) {
    showToast("Add a reward name and cost.");
    return;
  }

  state.rewards.push({
    id: Date.now(),
    name,
    cost,
    emoji
  });

  saveState();
  closeModal();
  $("rewardNameInput").value = "";
  $("rewardCostInput").value = "100";
  $("rewardEmojiInput").value = "🎁";
  render();
  showToast("Reward added! 🎁");
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 2200);
}

function burstConfetti() {
  const pieces = ["⭐", "✨", "💜", "🎉", "🟣", "🟡"];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    el.style.left = `${Math.random() * 100}vw`;
    el.style.fontSize = `${14 + Math.random() * 18}px`;
    el.style.animationDelay = `${Math.random() * .35}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2100);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => showTab(btn.dataset.tab));
});

$("addChoreBtn").addEventListener("click", () => openModal("chore"));
$("addRewardBtn").addEventListener("click", () => openModal("reward"));
$("modalClose").addEventListener("click", closeModal);
$("modalBackdrop").addEventListener("click", (e) => {
  if (e.target === $("modalBackdrop")) closeModal();
});

$("saveChoreBtn").addEventListener("click", addChore);
$("saveRewardBtn").addEventListener("click", addReward);

$("avatarBtn").addEventListener("click", () => showTab("profile"));
$("menuBtn").addEventListener("click", () => showToast("Menu coming next! ☰"));

$("saveProfileBtn").addEventListener("click", () => {
  const name = $("nameInput").value.trim();
  if (!name) return;
  state.childName = name;
  saveState();
  render();
  showToast("Profile saved! 💜");
});

$("resetBtn").addEventListener("click", () => {
  const ok = confirm("Reset coins, chores and rewards back to the demo?");
  if (!ok) return;
  state = structuredClone(defaultState);
  saveState();
  render();
  showToast("Demo reset.");
});

setGreeting();
render();
