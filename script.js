"use strict";

let transacoes = JSON.parse(localStorage.getItem('moneyzen_data')) || [];
let meuGrafico = null;

window.onload = function() {
    atualizarInterface();
};

function adicionar(tipo) {
    const nomeInput = document.getElementById('nomeDesc');
    const valorInput = document.getElementById('valorMontante');
    const nome = nomeInput.value.trim();
    const valor = parseFloat(valorInput.value);

    if (nome === "" || isNaN(valor) || valor <= 0) {
        alert("Insira um nome e um valor válido.");
        return;
    }

    const item = {
        id: Date.now(),
        nome: nome,
        valor: valor,
        tipo: tipo,
        data: new Date().toLocaleDateString('pt-BR')
    };

    transacoes.push(item);
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
    if(!lista) return;

    let totalRenda = 0;
    let totalDespesa = 0;

    let htmlRendas = "<h3>Histórico de Rendas</h3>";
    let htmlDespesas = "<h3>Histórico de Despesas</h3>";

    transacoes.forEach(t => {
        const itemHtml = `<div class="historico-item" style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>${t.data} - ${t.nome}:</span> 
            <b style="color: ${t.tipo === 'renda' ? '#1b465a' : '#d14d4d'}">R$ ${t.valor.toFixed(2)}</b>
        </div>`;

        if (t.tipo === 'renda') {
            totalRenda += t.valor;
            htmlRendas += itemHtml;
        } else {
            totalDespesa += t.valor;
            htmlDespesas += itemHtml;
        }
    });

    lista.innerHTML = htmlRendas + "<br>" + htmlDespesas;
    document.getElementById('resumoRenda').innerText = `R$ ${totalRenda.toFixed(2)}`;
    document.getElementById('resumoDespesa').innerText = `R$ ${totalDespesa.toFixed(2)}`;
    document.getElementById('resumoSaldo').innerText = `R$ ${(totalRenda - totalDespesa).toFixed(2)}`;

    atualizarGrafico(totalRenda, totalDespesa);
}

function atualizarGrafico(renda, despesa) {
    const canvas = document.getElementById('graficoFinanceiro');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if (meuGrafico) meuGrafico.destroy();
    if (renda === 0 && despesa === 0) return;

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
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

// --- FUNÇÃO EXPORTAR PDF (IGUAL À IMAGEM) ---
async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // Cabeçalho
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("MoneyZen CS", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório Financeiro Completo", 105, 27, { align: "center" });

    // Resumo
    const rendasTotal = transacoes.filter(t => t.tipo === 'renda').reduce((a, b) => a + b.valor, 0);
    const despesasTotal = transacoes.filter(t => t.tipo === 'despesa').reduce((a, b) => a + b.valor, 0);
    
    doc.setFontSize(11);
    doc.text(`Renda Total: R$ ${rendasTotal.toFixed(2)}`, 20, 45);
    doc.text(`Despesas Totais: R$ ${despesasTotal.toFixed(2)}`, 20, 52);
    doc.text(`Saldo Final: R$ ${(rendasTotal - despesasTotal).toFixed(2)}`, 20, 59);

    // Gráfico (Captura do Canvas)
    const canvas = document.getElementById('graficoFinanceiro');
    if (rendasTotal > 0 || despesasTotal > 0) {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 55, 65, 100, 100);
    }

    // Históricos
    let y = 175;
    doc.setFont("helvetica", "bold");
    doc.text("Histórico de Rendas", 20, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    transacoes.filter(t => t.tipo === 'renda').forEach(t => {
        y += 6;
        doc.text(`${t.data} - ${t.nome}: R$ ${t.valor.toFixed(2)}`, 20, y);
    });

    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Histórico de Despesas", 20, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    transacoes.filter(t => t.tipo === 'despesa').forEach(t => {
        y += 6;
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(`${t.data} - ${t.nome}: R$ ${t.valor.toFixed(2)}`, 20, y);
    });

    // Rodapé e Assinatura
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`MoneyZen CS © C.Silva — Relatório gerado em ${dataAtual}`, 105, 285, { align: "center" });

    doc.save(`Relatorio_MoneyZen.pdf`);
}
