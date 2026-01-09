"use strict";

(function () {

    const _LICENSE = "SALDEX-2026-PRO-SECURITY-BY-CSILVA";
    const STORAGE_KEY = "saldex_data";

    let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let meuGrafico = null;

    console.log("SALDEX carregado com blindagem ativa");

    window.onload = () => {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
        atualizarInterface();
    };

    window.toggleTheme = function () {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem(
            'theme',
            document.body.classList.contains('dark-mode') ? 'dark' : 'light'
        );
        atualizarInterface();
    };

    window.adicionar = function (tipo) {
        const n = document.getElementById('nomeDesc');
        const v = document.getElementById('valorMontante');

        const nome = n.value.trim();
        const valor = parseFloat(v.value);

        if (!nome || isNaN(valor) || valor <= 0) {
            alert("Dados inválidos.");
            return;
        }

        transacoes.push({
            id: Date.now(),
            nome,
            valor,
            tipo,
            data: new Date().toLocaleDateString('pt-BR')
        });

        n.value = '';
        v.value = '';

        salvarEAtualizar();
    };

    function salvarEAtualizar() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
        atualizarInterface();
    }

    function atualizarInterface() {
        const lista = document.getElementById('listaHistorico');

        let totalRenda = 0;
        let totalDespesa = 0;

        let htmlRenda = "<h4>Rendas</h4>";
        let htmlDespesa = "<h4>Despesas</h4>";

        transacoes.forEach(t => {
            const item = `
                <div class="hist-item">
                    <span>${t.data} - ${t.nome}</span>
                    <b class="${t.tipo}">R$ ${t.valor.toFixed(2)}</b>
                </div>
            `;

            if (t.tipo === 'renda') {
                totalRenda += t.valor;
                htmlRenda += item;
            } else {
                totalDespesa += t.valor;
                htmlDespesa += item;
            }
        });

        lista.innerHTML = htmlRenda + "<br>" + htmlDespesa;

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
                        labels: {
                            color: document.body.classList.contains('dark-mode')
                                ? '#ffffff'
                                : '#333333'
                        }
                    }
                }
            }
        });
    }

    window.zerarDados = function () {
        if (confirm("⚠️ Apagar todo o histórico do SALDEX?")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    };

    window.exportarPDF = async function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const agora = new Date();
        const timestamp = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("SALDEX — Relatório Financeiro Oficial", 105, 20, { align: "center" });

        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`ID DE AUTENTICIDADE: ${_LICENSE}`, 105, 26, { align: "center" });

        const rendaTotal = transacoes
            .filter(t => t.tipo === 'renda')
            .reduce((s, t) => s + t.valor, 0);

        const despesaTotal = transacoes
            .filter(t => t.tipo === 'despesa')
            .reduce((s, t) => s + t.valor, 0);

        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.text(`Gerado em: ${timestamp}`, 20, 40);
        doc.text(`Renda Total: R$ ${rendaTotal.toFixed(2)}`, 20, 48);
        doc.text(`Despesas Totais: R$ ${despesaTotal.toFixed(2)}`, 20, 56);
        doc.text(`Saldo Final: R$ ${(rendaTotal - despesaTotal).toFixed(2)}`, 20, 64);

        const canvas = document.getElementById('graficoFinanceiro');
        if (canvas && (rendaTotal > 0 || despesaTotal > 0)) {
            const img = canvas.toDataURL('image/png');
            doc.addImage(img, 'PNG', 65, 75, 80, 80);
        }

        let y = 170;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Histórico de Movimentações:", 20, y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        transacoes.forEach(t => {
            y += 7;
            if (y > 275) {
                doc.addPage();
                y = 20;
            }
            doc.text(
                `${t.data} - ${t.nome}: R$ ${t.valor.toFixed(2)} (${t.tipo.toUpperCase()})`,
                20,
                y
            );
        });

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            "© 2026 SALDEX — Propriedade Intelectual Exclusiva de C. Silva.",
            105,
            285,
            { align: "center" }
        );

        doc.save("SALDEX_Relatorio_Oficial.pdf");
    };

})();