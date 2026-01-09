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
        alert("Preencha corretamente o nome e o valor.");
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
    let htmlRendas = "<h4>Histórico de Rendas</h4>";
    let htmlDespesas = "<h4>Histórico de Despesas</h4>";

    transacoes.forEach(t => {
        const itemHtml = `<div style="display:flex; justify-content:space-between; font-size: 0.9em; margin-bottom:4px;">
            <span>${t.data} - ${t.nome}</span> 
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

async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const agora = new Date();
    const dataHora = `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;

    doc.setFont("helvetica", "bold").setFontSize(18);
    doc.text("MoneyZen CS", 105, 20, { align: "center" });
    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.text("Relatório Financeiro Completo", 105, 27, { align: "center" });
    doc.setFontSize(8).setTextColor(100);
    doc.text(`Gerado em: ${dataHora}`, 105, 32, { align: "center" });
    doc.setTextColor(0);

    const rTotal = transacoes.filter(t => t.tipo === 'renda').reduce((a, b) => a + b.valor, 0);
    const dTotal = transacoes.filter(t => t.tipo === 'despesa').reduce((a, b) => a + b.valor, 0);

    doc.setFontSize(11);
    doc.text(`Renda Total: R$ ${rTotal.toFixed(2)}`, 20, 45);
    doc.text(`Despesas Totais: R$ ${dTotal.toFixed(2)}`, 20, 52);
    doc.text(`Saldo Final: R$ ${(rTotal - dTotal).toFixed(2)}`, 20, 59);

    const canvas = document.getElementById('graficoFinanceiro');
    if (rTotal > 0 || dTotal > 0) {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 65, 65, 80, 80);
    }

    let y = 160;
    doc.setFont("helvetica", "bold").text("Histórico de Movimentações", 20, y);
    doc.setFont("helvetica", "normal").setFontSize(9);
    
    transacoes.forEach(t => {
        y += 6;
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(`${t.data} - [${t.tipo.toUpperCase()}] ${t.nome}: R$ ${t.valor.toFixed(2)}`, 20, y);
    });

    doc.setFontSize(8).setTextColor(150);
    doc.text(`MoneyZen CS © C.Silva — Extraído em ${dataHora}`, 105, 285, { align: "center" });
    doc.save(`Relatorio_MoneyZen_${agora.toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
}
