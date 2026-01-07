let data = JSON.parse(localStorage.getItem('moneyzen')) || [];
const ctx = document.getElementById('chart');

const themeBtn = document.getElementById('toggleTheme');
themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark'));
};

if (localStorage.getItem('theme') === 'true') {
  document.body.classList.add('dark');
}

function addTransaction() {
  const t = {
    date: date.value,
    desc: desc.value,
    value: Number(value.value),
    type: type.value,
    category: category.value
  };
  data.push(t);
  save();
}

function save() {
  localStorage.setItem('moneyzen', JSON.stringify(data));
  render();
}

function render() {
  history.innerHTML = '';
  let income = 0, expense = 0;

  data.forEach(t => {
    if (t.type === 'income') income += t.value;
    else expense += t.value;

    history.innerHTML += `
      <div>
        ${t.date} • ${t.desc} • ${t.category} • R$ ${t.value}
      </div>`;
  });

  summary.innerHTML = `
    <h3>Resumo Final</h3>
    <p>Rendas: R$ ${income}</p>
    <p>Despesas: R$ ${expense}</p>
    <p>Saldo: R$ ${income - expense}</p>
  `;

  drawChart(income, expense);
}

function drawChart(i, e) {
  if (window.chart) window.chart.destroy();
  window.chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Rendas', 'Despesas'],
      datasets: [{ data: [i, e] }]
    }
  });
}

function exportCSV() {
  let csv = 'Data,Descrição,Categoria,Tipo,Valor\n';
  data.forEach(t => {
    csv += `${t.date},${t.desc},${t.category},${t.type},${t.value}\n`;
  });
  download(csv, 'moneyzen.csv', 'text/csv');
}

function exportPDF() {
  const el = document.body.cloneNode(true);
  el.querySelector('button').remove();
  html2pdf().from(el).save('MoneyZen-CS.pdf');
}

function clearAll() {
  if (confirm('Deseja apagar tudo?')) {
    data = [];
    save();
  }
}

function download(content, file, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = file;
  a.click();
}

render();