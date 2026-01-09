let deferredPrompt;
const installBtn = document.getElementById("installApp");

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", async () => {
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = "none";
});

// Dados Financeiros
let renda = 0, despesas = 0;
const historico = [];

function atualizarResumo() {
  document.getElementById("renda").textContent = renda.toFixed(2);
  document.getElementById("despesas").textContent = despesas.toFixed(2);
  document.getElementById("saldo").textContent = (renda - despesas).toFixed(2);
  atualizarHistorico();
  atualizarGrafico();
}

function adicionarItem(tipo, descricao, valor) {
  if(tipo === "renda") renda += valor;
  else despesas += valor;
  historico.push({ tipo, descricao, valor });
  atualizarResumo();
}

function atualizarHistorico() {
  const lista = document.getElementById("listaHistorico");
  lista.innerHTML = "";
  historico.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.tipo.toUpperCase()} | ${item.descricao} | R$ ${item.valor.toFixed(2)}`;
    lista.appendChild(li);
  });
}

// Gráfico
let grafico = null;
function atualizarGrafico() {
  const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
  const labels = historico.map((_,i) => i+1);
  const data = historico.map(i => i.tipo === "renda" ? i.valor : -i.valor);

  if(grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Financeiro',
        data,
        backgroundColor: data.map(v => v>=0 ? '#1abc9c':'#e74c3c')
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// PDF (ultra profissional)
document.getElementById("exportPDF").addEventListener("click", () => {
  import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(jsPDF => {
    const { jsPDF: JSPDF } = jsPDF;
    const pdf = new JSPDF();
    pdf.setFontSize(18);
    pdf.text("MoneyZen CS - Relatório Financeiro", 10, 20);
    pdf.setFontSize(12);
    pdf.text(`Renda: R$ ${renda.toFixed(2)}`, 10, 35);
    pdf.text(`Despesas: R$ ${despesas.toFixed(2)}`, 10, 45);
    pdf.text(`Saldo: R$ ${(renda - despesas).toFixed(2)}`, 10, 55);

    // histórico
    pdf.text("Histórico:", 10, 65);
    historico.forEach((item,i)=>{
      pdf.text(`${i+1}) ${item.tipo.toUpperCase()} | ${item.descricao} | R$ ${item.valor.toFixed(2)}`, 10, 75+(i*10));
    });

    pdf.save("MoneyZen-CS-Relatorio.pdf");
  });
});

// Exemplo rápido para teste
adicionarItem("renda","Salário",5000);
adicionarItem("despesa","Aluguel",1500);
adicionarItem("despesa","Supermercado",800);