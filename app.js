// JEJUM TIMER + PROTOCOL
let startTime = localStorage.getItem("startTime");
let duration = Number(localStorage.getItem("duration")) || 16 * 3600;
let interval;
let fastsDone = Number(localStorage.getItem("fastsDone")) || 0;

// DIÁRIO
let entries = JSON.parse(localStorage.getItem("entries")) || [];

// AGUA
let water = Number(localStorage.getItem("water")) || 0;
let waterHistory = JSON.parse(localStorage.getItem("waterHistory")) || [];

const timerEl = document.getElementById("timer");
const progress = document.getElementById("progress");
const statusEl = document.getElementById("status");

const tableBody = document.getElementById("tableBody");
const pesoAtual = document.getElementById("pesoAtual");
const statusAtual = document.getElementById("statusAtual");

// TABS
document.querySelectorAll(".tab").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tabcontent").forEach(tc => tc.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});

// PROTOCOL SELECT
document.getElementById("protocol").onchange = e => {
  duration = e.target.value * 3600;
  localStorage.setItem("duration", duration);
};

// START
document.getElementById("start").onclick = () => {
  startTime = Date.now();
  localStorage.setItem("startTime", startTime);
  statusEl.textContent = "Jejum em andamento";
  fastsDone++;
  localStorage.setItem("fastsDone", fastsDone);
  runTimer();
};

// STOP
document.getElementById("stop").onclick = () => {
  clearInterval(interval);
  progress.style.strokeDashoffset = 660;
  statusEl.textContent = "Jejum finalizado 🎉";
  localStorage.removeItem("startTime");
  updateDashboard();
};

// TIMER
function runTimer() {
  clearInterval(interval);
  interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = duration - elapsed;

    if (remaining <= 0) {
      clearInterval(interval);
      statusEl.textContent = "Jejum concluído 🎉";
      updateDashboard();
      return;
    }

    const h = String(Math.floor(remaining / 3600)).padStart(2, "0");
    const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");

    timerEl.textContent = `${h}:${m}:${s}`;
    progress.style.strokeDashoffset = 660 - (elapsed / duration) * 660;
  }, 1000);
}

if (startTime) runTimer();

// —— DIÁRIO —— //

function saveEntries() {
  localStorage.setItem("entries", JSON.stringify(entries));
}

document.getElementById("addEntry").onclick = () => {
  const date = document.getElementById("dataInput").value;
  const weight = document.getElementById("pesoInput").value;
  const yf = document.getElementById("jejumInput").value;
  if (!date || !weight) return;

  entries.push({ date, weight, fast: yf });
  saveEntries();
  renderTable();
  updateDashboard();
};

function renderTable() {
  tableBody.innerHTML = "";
  let lastWeight = null;
  entries.forEach((e, i) => {
    let diff = lastWeight ? (e.weight - lastWeight).toFixed(1) : "-";
    let status = diff < 0 ? "Evoluindo" : diff > 0 ? "Atenção" : "Estável";
    lastWeight = e.weight;

    tableBody.innerHTML += `
      <tr>
        <td>${e.date}</td>
        <td>${e.weight}</td>
        <td>${e.fast}</td>
        <td>${diff}</td>
        <td>${status}</td>
      </tr>`;
  });
}

document.getElementById("exportCSV").onclick = () => {
  let csv = "data,peso,jejum\n";
  entries.forEach(e => (csv += `${e.date},${e.weight},${e.fast}\n`));
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "diario.csv";
  link.click();
};

// —— ÁGUA —— //

document.getElementById("addWater").onclick = () => {
  water++;
  waterHistory.push(Date.now());
  localStorage.setItem("water", water);
  localStorage.setItem("waterHistory", JSON.stringify(waterHistory));
  document.getElementById("waterCount").textContent = water;
};

document.getElementById("undoWater").onclick = () => {
  if (water > 0) {
    water--;
    waterHistory.pop();
    localStorage.setItem("water", water);
    localStorage.setItem("waterHistory", JSON.stringify(waterHistory));
    document.getElementById("waterCount").textContent = water;
  }
};

// —— DASHBOARD —— //

function updateDashboard() {
  pesoAtual.textContent = entries.length ? entries.at(-1).weight : "--";
  statusAtual.textContent = statusEl.textContent;
  document.getElementById("fastsDone").textContent = fastsDone;
}

renderTable();
updateDashboard();