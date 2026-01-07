let registros = JSON.parse(localStorage.getItem("moneyzen")) || [];
let grafico;

const temaSalvo = localStorage.getItem("tema");
if (temaSalvo === "dark") document.body.classList.add("dark");

function salvar() {
  localStorage.setItem("moneyzen", JSON.stringify(registros));
}

function atualizar(lista = registros) {
  let renda = 0, despesa = 0;
  const tbody = document.getElementById("tabelaHistorico");
  tbody.innerHTML = "";

  lista.forEach(r => {
    if (r.tipo === "renda") renda += r.valor;
    else despesa += r.valor;

    tbody.innerHTML += `
      <tr>
        <td>${r.data}</td>
        <td>${r.descricao}</td>
        <td>${r.categoria}</td>
        <td>${r.tipo}</td>
        <td>R$ ${r.valor.toFixed(2)}</td>
      </tr>
    `;
  });

  document.getElementById("totalRenda").textContent = renda.toFixed(2);
  document.getElementById("totalDespesa").textContent = despesa.toFixed(2);
  document.getElementById("saldo").textContent = (renda - despesa).toFixed(2);

  if (grafico) grafico.destroy();
  grafico = new Chart(document.getElementById("graficoFluxo"), {
    type: "bar",
    data: {
      labels: ["Renda", "Despesa"],
      datasets: [{
        data: [renda, despesa],
        backgroundColor: ["#2ecc71","#e74c3c"]
      }]
    }
  });
}

document.getElementById("adicionar").onclick = () => {
  registros.push({
    descricao: descricao.value,
    valor: Number(valor.value),
    tipo: tipo.value,
    categoria: categoria.value,
    data: data.value
  });
  salvar();
  atualizar();
};

document.getElementById("toggleTema").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("tema",
    document.body.classList.contains("dark") ? "dark" : "light");
};

document.getElementById("limparHistorico").onclick = () => {
  if (confirm("Apagar tudo?")) {
    registros = [];
    salvar();
    atualizar();
  }
};

document.getElementById("salvarHistorico").onclick = () => {
  const blob = new Blob([JSON.stringify(registros)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "moneyzen-backup.json";
  a.click();
};

document.getElementById("exportarCSV").onclick = () => {
  let csv = "Data,Descrição,Categoria,Tipo,Valor\n";
  registros.forEach(r => {
    csv += `${r.data},${r.descricao},${r.categoria},${r.tipo},${r.valor}\n`;
  });
  const blob = new Blob([csv],{type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "MoneyZen-CS.csv";
  a.click();
};

document.getElementById("exportarPDF").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("MoneyZen-CS - Relatório Completo", 14, 20);

  doc.autoTable({
    startY: 30,
    head: [["Data","Descrição","Categoria","Tipo","Valor"]],
    body: registros.map(r => [
      r.data,r.descricao,r.categoria,r.tipo,`R$ ${r.valor}`
    ])
  });

  doc.text(
    `Resumo Final | Saldo: R$ ${saldo.textContent}`,
    14,
    doc.lastAutoTable.finalY + 15
  );

  doc.save("MoneyZen-CS.pdf");
};

atualizar();