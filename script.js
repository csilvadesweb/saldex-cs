"use strict";

(() => {
  const LICENSE = "SALDEX-CS-ENTERPRISE-2026-BY-CSILVA";
  let dados = JSON.parse(localStorage.getItem('saldex_data')) || [];
  let grafico;

  window.onload = () => {
    if (localStorage.getItem('theme') === 'dark')
      document.body.classList.add('dark-mode');
    atualizar();
  };

  window.toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme',
      document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  };

  window.adicionar = tipo => {
    const nome = nomeDesc.value.trim();
    const valor = parseFloat(valorMontante.value);
    if (!nome || valor <= 0) return alert("Dados inválidos");

    dados.push({ nome, valor, tipo, data: new Date().toLocaleDateString('pt-BR') });
    nomeDesc.value = valorMontante.value = '';
    salvar();
  };

  function salvar() {
    localStorage.setItem('saldex_data', JSON.stringify(dados));
    atualizar();
  }

  function atualizar() {
    let r = 0, d = 0;
    listaHistorico.innerHTML = '';

    dados.forEach(t => {
      t.tipo === 'renda' ? r += t.valor : d += t.valor;
      listaHistorico.innerHTML += `<div class="hist-item">
        <span>${t.data} - ${t.nome}</span>
        <b class="${t.tipo}">R$ ${t.valor.toFixed(2)}</b>
      </div>`;
    });

    resumoRenda.textContent = `R$ ${r.toFixed(2)}`;
    resumoDespesa.textContent = `R$ ${d.toFixed(2)}`;
    resumoSaldo.textContent = `R$ ${(r-d).toFixed(2)}`;
    graf(r,d);
  }

  function graf(r,d) {
    if (grafico) grafico.destroy();
    grafico = new Chart(graficoFinanceiro, {
      type:'doughnut',
      data:{labels:['Renda','Despesas'],datasets:[{data:[r,d]}]}
    });
  }

  window.zerarDados = () => {
    if (confirm("Excluir todos os dados?")) {
      localStorage.removeItem('saldex_data');
      location.reload();
    }
  };

  window.exportarPDF = () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.text("SALDEX CS — Relatório Enterprise", 105, 20, {align:"center"});
    pdf.text(`Licença: ${LICENSE}`, 105, 28, {align:"center"});
    pdf.save("SALDEX_CS_Relatorio.pdf");
  };
})();