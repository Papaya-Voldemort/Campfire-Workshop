const countries = ["United States", "Canada", "United Kingdom", "Germany", "Brazil", "India", "Japan", "Australia"];
const firstNames = ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Avery"];
const lastNames = ["Rivera", "Kim", "Patel", "Carter", "Nguyen", "Smith"];

const state = {
  alive: true,
  age: 0,
  firstName: "",
  lastName: "",
  gender: "",
  country: "",
  educationLevel: "None",
  job: "None",
  money: 0,
  debt: 0,
  partner: null,
  kids: 0,
  house: null,
  car: null,
  stats: {
    health: 0,
    happiness: 0,
    smarts: 0,
    looks: 0,
    discipline: 0,
  },
  journal: [],
};

const jobsByEducation = {
  None: ["Cashier", "Delivery Driver", "Cleaner"],
  HighSchool: ["Administrative Assistant", "Technician", "Sales Associate"],
  University: ["Software Engineer", "Nurse", "Teacher", "Accountant", "Lawyer"],
};

const ui = {
  creator: document.getElementById("creator"),
  game: document.getElementById("game"),
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  gender: document.getElementById("gender"),
  country: document.getElementById("country"),
  startLifeBtn: document.getElementById("startLifeBtn"),
  fullName: document.getElementById("fullName"),
  headline: document.getElementById("headline"),
  ageUpBtn: document.getElementById("ageUpBtn"),
  statsGrid: document.getElementById("statsGrid"),
  journal: document.getElementById("journal"),
  tabContent: document.getElementById("tabContent"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  modal: document.getElementById("eventModal"),
  eventTitle: document.getElementById("eventTitle"),
  eventText: document.getElementById("eventText"),
  eventChoices: document.getElementById("eventChoices"),
};

let activeTab = "activities";

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function init() {
  countries.forEach((c) => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    ui.country.appendChild(option);
  });
  ui.firstName.value = randomFrom(firstNames);
  ui.lastName.value = randomFrom(lastNames);

  ui.startLifeBtn.addEventListener("click", startLife);
  ui.ageUpBtn.addEventListener("click", ageUp);
  ui.tabs.forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));
}

function startLife() {
  state.firstName = ui.firstName.value.trim() || randomFrom(firstNames);
  state.lastName = ui.lastName.value.trim() || randomFrom(lastNames);
  state.gender = ui.gender.value;
  state.country = ui.country.value;
  state.age = 0;
  state.alive = true;
  state.educationLevel = "None";
  state.job = "None";
  state.money = rand(0, 300);
  state.debt = 0;
  state.partner = null;
  state.kids = 0;
  state.house = null;
  state.car = null;
  state.stats.health = rand(60, 95);
  state.stats.happiness = rand(50, 90);
  state.stats.smarts = rand(50, 90);
  state.stats.looks = rand(40, 90);
  state.stats.discipline = rand(35, 85);
  state.journal = [];

  log(`You were born in ${state.country}.`);
  ui.creator.classList.add("hidden");
  ui.game.classList.remove("hidden");
  render();
}

function log(msg) {
  state.journal.unshift(`Age ${state.age}: ${msg}`);
  state.journal = state.journal.slice(0, 150);
}

function applyStat(name, delta) {
  state.stats[name] = clamp(state.stats[name] + delta);
}

function yearlyProgression() {
  if (state.age === 5) {
    log("You started primary school.");
  }
  if (state.age === 14) {
    state.educationLevel = "HighSchool";
    log("You started high school.");
  }
  if (state.age === 18) {
    if (state.stats.smarts >= 65) {
      state.educationLevel = "University";
      state.debt += rand(12000, 50000);
      log("You enrolled in university with student loans.");
    } else {
      log("You graduated high school and skipped university.");
    }
  }
  if (state.age >= 22 && state.job === "None") {
    chooseJob();
  }

  if (state.job !== "None") {
    const salary = annualSalary();
    state.money += salary;
    log(`You earned $${salary.toLocaleString()} from your job as ${state.job}.`);
  }

  const yearlyExpenses = rand(1200, 7000);
  state.money -= yearlyExpenses;

  if (state.debt > 0) {
    const payment = Math.min(state.debt, rand(500, 6000));
    state.debt -= payment;
    state.money -= Math.floor(payment / 2);
  }

  if (state.money < 0) {
    applyStat("happiness", -8);
    applyStat("health", -4);
    log("Financial stress hit you hard this year.");
  }

  if (state.age > 50) applyStat("health", -rand(1, 4));
  if (state.age > 70) applyStat("health", -rand(2, 6));
  applyStat("looks", -rand(0, 2));
  applyStat("happiness", rand(-2, 2));
}

function annualSalary() {
  const base = {
    "Cashier": [18000, 28000],
    "Delivery Driver": [22000, 36000],
    "Cleaner": [18000, 30000],
    "Administrative Assistant": [28000, 42000],
    "Technician": [30000, 52000],
    "Sales Associate": [26000, 50000],
    "Software Engineer": [70000, 160000],
    "Nurse": [55000, 100000],
    "Teacher": [42000, 78000],
    "Accountant": [50000, 95000],
    "Lawyer": [80000, 180000],
  };
  const [min, max] = base[state.job] || [15000, 30000];
  return rand(min, max);
}

function chooseJob() {
  const pool = jobsByEducation[state.educationLevel] || jobsByEducation.None;
  state.job = randomFrom(pool);
  log(`You started working as a ${state.job}.`);
}

function randomEvent() {
  const r = Math.random();
  if (r < 0.28) {
    return showModal(
      "School Fight",
      "A classmate keeps insulting you in front of everyone.",
      [
        ["Walk away", () => { applyStat("discipline", 4); applyStat("happiness", -2); log("You walked away from conflict."); }],
        ["Fight back", () => { applyStat("health", -8); applyStat("discipline", -6); log("You got in a fight and were suspended."); }],
      ]
    );
  }
  if (r < 0.56) {
    return showModal(
      "Street Wallet",
      "You found a wallet with cash and ID inside.",
      [
        ["Return it", () => { state.money += rand(10, 200); applyStat("happiness", 3); log("You returned the wallet and were rewarded."); }],
        ["Keep the cash", () => { state.money += rand(60, 800); applyStat("discipline", -5); applyStat("happiness", -2); log("You kept the wallet cash."); }],
      ]
    );
  }
  if (r < 0.78) {
    return showModal(
      "Relationship",
      state.partner ? "Your partner says you've been distant lately." : "You met someone charming at an event.",
      state.partner
        ? [
            ["Plan quality time", () => { applyStat("happiness", 8); log("You repaired your relationship."); }],
            ["Ignore it", () => { applyStat("happiness", -10); state.partner = null; log("Your relationship ended."); }],
          ]
        : [
            ["Ask them out", () => { state.partner = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`; applyStat("happiness", 9); log(`You started dating ${state.partner}.`); }],
            ["Move on", () => { applyStat("discipline", 2); log("You focused on yourself."); }],
          ]
    );
  }

  return showModal(
    "Health Check",
    "Your doctor recommends major lifestyle changes.",
    [
      ["Follow advice", () => { applyStat("health", 10); applyStat("discipline", 4); state.money -= 300; log("You committed to a healthier lifestyle."); }],
      ["Ignore", () => { applyStat("health", -12); log("Your health declined due to neglect."); }],
    ]
  );
}

function showModal(title, text, choices) {
  ui.eventTitle.textContent = title;
  ui.eventText.textContent = text;
  ui.eventChoices.innerHTML = "";

  choices.forEach(([label, onPick]) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      onPick();
      ui.modal.classList.add("hidden");
      maybeDeath();
      render();
    });
    ui.eventChoices.appendChild(btn);
  });

  ui.modal.classList.remove("hidden");
}

function maybeDeath() {
  if (state.stats.health <= 0 || state.age >= 120) {
    state.alive = false;
    log(`You died at age ${state.age}. Net worth: $${Math.floor(state.money - state.debt).toLocaleString()}.`);
    ui.ageUpBtn.disabled = true;
  }
}

function ageUp() {
  if (!state.alive) return;
  state.age += 1;

  yearlyProgression();
  maybeHaveKid();
  randomEvent();
  maybeDeath();
  render();
}

function maybeHaveKid() {
  if (!state.partner || state.age < 20 || state.age > 45) return;
  if (Math.random() < 0.09) {
    state.kids += 1;
    applyStat("happiness", 8);
    log(`You had a child. Total children: ${state.kids}.`);
  }
}

function switchTab(name) {
  activeTab = name;
  ui.tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  renderTab();
}

function renderStats() {
  const keys = Object.keys(state.stats);
  ui.statsGrid.innerHTML = "";
  keys.forEach((key) => {
    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `<span>${capitalize(key)}</span><progress max="100" value="${state.stats[key]}"></progress><strong>${state.stats[key]}</strong>`;
    ui.statsGrid.appendChild(row);
  });
}

function renderTab() {
  if (activeTab === "activities") {
    ui.tabContent.innerHTML = `
      <div class="action-grid">
        <button id="studyBtn">Study harder</button>
        <button id="gymBtn">Go to gym</button>
        <button id="partyBtn">Go partying</button>
        <button id="crimeBtn">Commit crime</button>
      </div>`;

    document.getElementById("studyBtn").onclick = () => {
      applyStat("smarts", rand(4, 10));
      applyStat("discipline", 2);
      applyStat("happiness", -rand(0, 2));
      log("You studied hard.");
      render();
    };
    document.getElementById("gymBtn").onclick = () => {
      state.money -= 40;
      applyStat("health", rand(4, 9));
      applyStat("looks", rand(2, 6));
      log("You hit the gym.");
      render();
    };
    document.getElementById("partyBtn").onclick = () => {
      state.money -= rand(50, 300);
      applyStat("happiness", rand(4, 10));
      applyStat("health", -rand(0, 5));
      log("You went partying.");
      render();
    };
    document.getElementById("crimeBtn").onclick = () => {
      const success = Math.random() < (0.25 + state.stats.smarts / 400);
      if (success) {
        const take = rand(100, 3000);
        state.money += take;
        applyStat("discipline", -8);
        log(`Crime succeeded. You stole $${take}.`);
      } else {
        const penalty = rand(150, 5000);
        state.money -= penalty;
        applyStat("happiness", -10);
        applyStat("health", -rand(0, 8));
        log(`Crime failed. You paid $${penalty} in fines/legal fees.`);
      }
      render();
    };
    return;
  }

  if (activeTab === "school") {
    ui.tabContent.innerHTML = `
      <p><span class="badge">Education</span> ${state.educationLevel}</p>
      <p><span class="badge">Career</span> ${state.job}</p>
      <p><span class="badge">Debt</span> $${Math.floor(state.debt).toLocaleString()}</p>
      <p><span class="badge">Cash</span> $${Math.floor(state.money).toLocaleString()}</p>`;
    return;
  }

  if (activeTab === "relationships") {
    ui.tabContent.innerHTML = `
      <p><span class="badge">Partner</span> ${state.partner || "Single"}</p>
      <p><span class="badge">Children</span> ${state.kids}</p>`;
    return;
  }

  ui.tabContent.innerHTML = `
    <div class="action-grid">
      <button id="buyCarBtn">Buy a car ($8,000)</button>
      <button id="buyHouseBtn">Buy a house ($120,000)</button>
      <button id="sellAssetsBtn">Sell all assets</button>
    </div>
    <p><span class="badge">Car</span> ${state.car || "None"}</p>
    <p><span class="badge">House</span> ${state.house || "None"}</p>`;

  document.getElementById("buyCarBtn").onclick = () => {
    if (state.money >= 8000) {
      state.money -= 8000;
      state.car = randomFrom(["Compact", "Sedan", "SUV"]);
      log(`You bought a ${state.car}.`);
      applyStat("happiness", 3);
    } else {
      log("You couldn't afford a car.");
    }
    render();
  };

  document.getElementById("buyHouseBtn").onclick = () => {
    if (state.money >= 120000) {
      state.money -= 120000;
      state.house = randomFrom(["Small House", "Townhouse", "Luxury Home"]);
      log(`You bought a ${state.house}.`);
      applyStat("happiness", 7);
    } else {
      log("You couldn't afford a house.");
    }
    render();
  };

  document.getElementById("sellAssetsBtn").onclick = () => {
    let total = 0;
    if (state.car) total += rand(3000, 12000);
    if (state.house) total += rand(70000, 220000);
    state.money += total;
    if (state.car || state.house) {
      log(`You sold your assets for $${total.toLocaleString()}.`);
    } else {
      log("You have no assets to sell.");
    }
    state.car = null;
    state.house = null;
    render();
  };
}

function renderJournal() {
  ui.journal.innerHTML = "";
  state.journal.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    ui.journal.appendChild(li);
  });
}

function render() {
  ui.fullName.textContent = `${state.firstName} ${state.lastName}`;
  ui.headline.textContent = `Age ${state.age} • ${state.country} • ${state.alive ? "Alive" : "Deceased"}`;
  renderStats();
  renderTab();
  renderJournal();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

init();
