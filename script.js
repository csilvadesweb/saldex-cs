/**
 * MONEYZEN CS - SISTEMA BLINDADO
 * PROPRIEDADE EXCLUSIVA: C. SILVA (2026)
 */
"use strict";

(function() {
    const _LICENSE = "MONEYZEN-CS-2026-PRO-SECURITY-BY-CSILVA";
    let transacoes = JSON.parse(localStorage.getItem('moneyzen_data')) || [];
    let meuGrafico = null;

    window.onload = () => {
        if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
        atualizarInterface();
    };

    window.toggleTheme = function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        atualizarInterface();
    };

    window.adicionar = function(tipo) {
        const n = document.getElementById('nomeDesc'), v = document.getElementById('valorMontante');
        const nome = n.value.trim(), valor = parseFloat(v.value);
        if (!nome || isNaN(valor) || valor <= 0) return alert("Dados inválidos.");
        transacoes.push({ id: Date.now(), nome, valor, tipo, data: new Date().toLocaleDateString('pt-BR') });
        n.value = ''; v.value = '';
        salvarEAtualizar();
    };

    function salvarEAtualizar() {
        localStorage.setItem('moneyzen_data', JSON.stringify(transacoes));
        atualizarInterface();
    }

    function atualizarInterface() {
        const lista = document.getElementById('listaHistorico');
        let r = 0, d = 0;
        let hR = "<h4>Rendas</h4>", hD = "<h4>Despesas</h4>";
        transacoes.forEach(t => {
            const item = `<div class="hist-item"><span>${t.data} - ${t.nome}</span><b class="${t.tipo}">R$ ${t.valor.toFixed(2)}</b></div>`;
            if (t.tipo === 'renda') { r += t.valor; hR += item; } else { d += t.valor; hD += item; }
        });
        lista.innerHTML = hR + "<br>" + hD;
        document.getElementById('resumoRenda').innerText = `R$ ${r.toFixed(2)}`;
        document.getElementById('resumoDespesa').innerText = `R$ ${d.toFixed(2)}`;
        document.getElementById('resumoSaldo').innerText = `R$ ${(r - d).toFixed(2)}`;
        renderGrafico(r, d);
    }

    function renderGrafico(r, d) {
        const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
        if (meuGrafico) meuGrafico.destroy();
        if (r === 0 && d === 0) return;
        meuGrafico = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Renda', 'Despesas'],
                datasets: [{ data: [r, d], backgroundColor: ['#1b465a', '#d14d4d'], borderWidth: 0 }]
            },
            options: { plugins: { legend: { labels: { color: document.body.classList.contains('dark-mode') ? '#fff' : '#333' } } } }
        });
    }

    window.zerarDados = function() {
        if (confirm("⚠️ Apagar histórico exclusivo?")) {
            localStorage.removeItem('moneyzen_data');
            window.location.reload();
        }
    };

    window.exportarPDF = async function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const agora = new Date();
        const timestamp = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;
        
        // Cabeçalho
        doc.setFont("helvetica", "bold").setFontSize(18);
        doc.text("MoneyZen CS - Relatório Oficial", 105, 20, { align: "center" });
        doc.setFontSize(7).setTextColor(150);
        doc.text(`ID DE AUTENTICIDADE: ${_LICENSE}`, 105, 26, { align: "center" });

        const rT = transacoes.filter(t => t.tipo === 'renda').reduce((a, b) => a + b.valor, 0);
        const dT = transacoes.filter(t => t.tipo === 'despesa').reduce((a, b) => a + b.valor, 0);

        doc.setTextColor(0).setFontSize(11).text(`Gerado em: ${timestamp}`, 20, 40);
        doc.text(`Renda Total: R$ ${rT.toFixed(2)}`, 20, 48);
        doc.text(`Despesa Total: R$ ${dT.toFixed(2)}`, 20, 56);
        doc.text(`Saldo Líquido: R$ ${(rT - dT).toFixed(2)}`, 20, 64);

        // Gráfico
        const canvas = document.getElementById('graficoFinanceiro');
        if (rT > 0 || dT > 0) doc.addImage(canvas.toDataURL('image/png'), 'PNG', 65, 75, 80, 80);

        // CORREÇÃO: ADICIONANDO O HISTÓRICO NO PDF
        let y = 170;
        doc.setFont("helvetica", "bold").setFontSize(12).text("Histórico de Lançamentos:", 20, y);
        doc.setFont("helvetica", "normal").setFontSize(9);
        
        transacoes.forEach((t) => {
            y += 7;
            if (y > 275) { doc.addPage(); y = 20; } // Nova página se necessário
            const txt = `${t.data} - ${t.nome}: R$ ${t.valor.toFixed(2)} (${t.tipo.toUpperCase()})`;
            doc.text(txt, 20, y);
        });

        doc.setFontSize(8).setTextColor(150);
        doc.text("© 2026 MoneyZen CS. Propriedade Intelectual de C. Silva. Proibida Cópia.", 105, 285, { align: "center" });
        doc.save(`MoneyZen_Relatorio_Full.pdf`);
    };
})();
