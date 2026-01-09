"use strict";

let transacoes = JSON.parse(localStorage.getItem('moneyzen_data')) || [];
let meuGrafico = null;

window.onload = () => {
    // Carregar tema salvo
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    atualizarInterface();
};

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    atualizarInterface(); // Redesenha o gráfico para ajustar as cores da legenda
}

function adicionar(tipo) {
    const nomeInput = document.getElementById('nomeDesc');
    const valorInput = document.getElementById('valorMontante');
    const nome = nomeInput.value.trim();
    const valor = parseFloat(valorInput.value);

    if (!nome || isNaN(valor) || valor <= 0) {
        alert("Preencha o nome e o valor corretamente.");
        return;
    }

    transacoes.push({
        id: Date.now(),
        nome,
        valor,
        tipo,
        data: new Date().toLocaleDateString('pt-BR')
    });

    nomeInput.value = '';
    valorInput.value = '';
    salvarEAtualizar();
}

function salvarEAtualizar() {
    localStorage.setItem('moneyzen_data', JSON.stringify(transacoes));
    atualizarInterface();
}

function atualizarInterface() {
    const lista = document.getElementById('listaHistorico');
    if (!lista) return;

    let totalRenda = 0, totalDespesa = 0;
    let htmlRendas = "<h4>Rendas</h4>", htmlDespesas = "<h4>Despesas</h4>";

    transacoes.forEach(t => {
        const itemHtml = `<div class="hist-item">
            <span>${t.data} - ${t.nome}</span> 
            <b class="${t.tipo}">R$ ${t.valor.toFixed(2)}</b>
        </div>`;
        if (t.tipo === 'renda') { totalRenda += t.valor; htmlRendas += itemHtml; }
        else { totalDespesa += t.valor; htmlDespesas += itemHtml; }
    });

    lista.innerHTML = htmlRendas + "<br>" + htmlDespesas;
    document.getElementById('resumoRenda').innerText = `R$ ${totalRenda.toFixed(2)}`;
    document.getElementById('resumoDespesa').innerText = `R$ ${totalDespesa.toFixed(2)}`;
    document.getElementById('resumoSaldo').innerText = `R$ ${(totalRenda - totalDespesa).toFixed(2)}`;

    renderGrafico(totalRenda, totalDespesa);
}

function renderGrafico(renda, despesa) {
    const canvas = document.getElementById('graficoFinanceiro');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (meuGrafico) meuGrafico.destroy();
    if (renda === 0 && despesa === 0) return;

    const isDark = document.body.classList.contains('dark-mode');

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Renda', 'Despesas'],
            datasets: [{
                data: [renda, despesa],
                backgroundColor: ['#1b465a', '#d14d4d'],
                borderWidth: 0
            }]
        },
        options: { 
            plugins: { 
                legend: { 
                    position: 'bottom',
                    labels: { color: isDark ? '#ffffff' : '#333333' }
                } 
            } 
        }
    });
}

function zerarDados() {
    if (confirm("⚠️ ATENÇÃO: Isso apagará TODO o seu histórico. Continuar?")) {
        localStorage.removeItem('moneyzen_data');
        window.location.reload();
    }
}

async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const agora = new Date();
    const dataHora = `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;

    doc.setFont("helvetica", "bold").setFontSize(18);
    doc.text("MoneyZen CS", 105, 20, { align: "center" });
    doc.setFontSize(10).setFont("helvetica", "normal");
    doc.text("Relatório Financeiro Completo", 105, 27, { align: "center" });
    doc.setFontSize(8).setTextColor(100);
    doc.text(`Gerado em: ${dataHora}`, 105, 33, { align: "center" });

    const rT = transacoes.filter(t => t.tipo === 'renda').reduce((a, b) => a + b.valor, 0);
    const dT = transacoes.filter(t => t.tipo === 'despesa').reduce((a, b) => a + b.valor, 0);

    doc.setTextColor(0).setFontSize(11);
    doc.text(`Renda Total: R$ ${rT.toFixed(2)}`, 20, 48);
    doc.text(`Despesas Totais: R$ ${dT.toFixed(2)}`, 20, 55);
    doc.text(`Saldo Final: R$ ${(rT - dT).toFixed(2)}`, 20, 62);

    const canvas = document.getElementById('graficoFinanceiro');
    if (rT > 0 || dT > 0) doc.addImage(canvas.toDataURL('image/png'), 'PNG', 65, 75, 80, 80);

    let y = 175;
    doc.setFont("helvetica", "bold").text("Histórico de Movimentações", 20, y);
    doc.setFont("helvetica", "normal").setFontSize(9);
    transacoes.forEach(t => {
        y += 6; if (y > 275) { doc.addPage(); y = 20; }
        doc.text(`${t.data} - ${t.nome}: R$ ${t.valor.toFixed(2)} (${t.tipo.toUpperCase()})`, 20, y);
    });

    doc.setFontSize(8).setTextColor(150);
    doc.text(`MoneyZen CS © C.Silva — Extraído em ${dataHora}`, 105, 285, { align: "center" });
    doc.save(`Relatorio_MoneyZen.pdf`);
}
