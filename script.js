/* =====================================================
   MoneyZen-CS | Controle Financeiro Profissional
   © 2026 Claudio Silva - Todos os direitos reservados
   USO NÃO AUTORIZADO É PROIBIDO
===================================================== */

let registros = JSON.parse(localStorage.getItem("moneyzen_registros")) || [];
let grafico = null;

/* ======================
   ELEMENTOS
====================== */
const descricaoEl = document.getElementById("descricao");
const valorEl = document.getElementById("valor");
const tipoEl = document.getElementById("tipo");
const categoriaEl = document.getElementById("categoria");
const dataEl = document.getElementById("data");

const totalRendaEl = document.getElementById("totalRenda");
const totalDespesaEl = document.getElementById("totalDespesa");
const saldoEl = document.getElementById("saldo");

const tabelaBody = document.querySelector("#tabelaHistorico tbody");

/* ======================
   INICIALIZAÇÃO
====================== */
document.addEventListener("DOMContentLoaded", () => {
    atualizarTudo();
});

/* ======================
   ADICIONAR REGISTRO
====================== */
document.getElementById("adicionar").addEventListener("click", () => {
    if (!descricaoEl.value || !valorEl.value || !dataEl.value) {
        alert("Preencha todos os campos!");
        return;
    }

    const registro = {
        id: Date.now(),
        descricao: descricaoEl.value,
        valor: parseFloat(valorEl.value),
        tipo: tipoEl.value,
        categoria: categoriaEl.value,
        data: dataEl.value
    };

    registros.push(registro);
    salvar();
    limparCampos();
    atualizarTudo();
});

/* ======================
   SALVAR LOCAL
====================== */
function salvar() {
    localStorage.setItem("moneyzen_registros", JSON.stringify(registros));
}

/* ======================
   LIMPAR CAMPOS
====================== */
function limparCampos() {
    descricaoEl.value = "";
    valorEl.value = "";
    dataEl.value = "";
}

/* ======================
   ATUALIZAR DASHBOARD
====================== */
function atualizarTudo(lista = registros) {
    atualizarResumo(lista);
    atualizarTabela(lista);
    atualizarGrafico(lista);
}

/* ======================
   RESUMO FINANCEIRO
====================== */
function atualizarResumo(lista) {
    let renda = 0;
    let despesa = 0;

    lista.forEach(r => {
        if (r.tipo === "renda") renda += r.valor;
        else despesa += r.valor;
    });

    totalRendaEl.textContent = renda.toFixed(2);
    totalDespesaEl.textContent = despesa.toFixed(2);
    saldoEl.textContent = (renda - despesa).toFixed(2);
}

/* ======================
   TABELA HISTÓRICO
====================== */
function atualizarTabela(lista) {
    tabelaBody.innerHTML = "";

    lista
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .forEach(r => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${r.data}</td>
                <td>${r.descricao}</td>
                <td>${r.categoria}</td>
                <td>${r.tipo}</td>
                <td>R$ ${r.valor.toFixed(2)}</td>
            `;
            tabelaBody.appendChild(tr);
        });
}

/* ======================
   GRÁFICO
====================== */
function atualizarGrafico(lista) {
    const ctx = document.getElementById("graficoFluxo").getContext("2d");

    let renda = 0;
    let despesa = 0;

    lista.forEach(r => {
        if (r.tipo === "renda") renda += r.valor;
        else despesa += r.valor;
    });

    if (grafico) grafico.destroy();

    grafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Renda", "Despesa"],
            datasets: [{
                label: "Fluxo Financeiro",
                data: [renda, despesa],
                backgroundColor: ["#2ecc71", "#e74c3c"]
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

/* ======================
   FILTRO POR DATA
====================== */
document.getElementById("aplicarFiltro").addEventListener("click", () => {
    const inicio = document.getElementById("filtroInicio").value;
    const fim = document.getElementById("filtroFim").value;

    if (!inicio || !fim) {
        alert("Selecione o período");
        return;
    }

    const filtrado = registros.filter(r =>
        r.data >= inicio && r.data <= fim
    );

    atualizarTudo(filtrado);
});

document.getElementById("limparFiltro").addEventListener("click", () => {
    atualizarTudo(registros);
});

/* ======================
   EXPORTAR CSV
====================== */
document.getElementById("exportarCSV").addEventListener("click", () => {
    let csv = "Data,Descrição,Categoria,Tipo,Valor\n";

    registros.forEach(r => {
        csv += `${r.data},${r.descricao},${r.categoria},${r.tipo},${r.valor}\n`;
    });

    csv += "\nAssinado digitalmente por MoneyZen-CS © Claudio Silva";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "MoneyZen-CS.csv";
    link.click();
});

/* ======================
   EXPORTAR PDF PROFISSIONAL
====================== */
document.getElementById("exportarPDF").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("MoneyZen-CS - Relatório Financeiro", 14, 15);

    doc.setFontSize(10);
    doc.text("Assinatura digital: Claudio Silva | © 2026 MoneyZen-CS", 14, 22);

    doc.autoTable({
        startY: 30,
        head: [["Data", "Descrição", "Categoria", "Tipo", "Valor"]],
        body: registros.map(r => [
            r.data,
            r.descricao,
            r.categoria,
            r.tipo,
            `R$ ${r.valor.toFixed(2)}`
        ])
    });

    const canvas = document.getElementById("graficoFluxo");
    const imgData = canvas.toDataURL("image/png");

    doc.addPage();
    doc.text("Gráfico de Fluxo de Caixa", 14, 15);
    doc.addImage(imgData, "PNG", 15, 25, 180, 90);

    doc.save("MoneyZen-CS.pdf");
});

/* ======================
   IMPORTAR CSV
====================== */
document.getElementById("importarCSV").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const linhas = event.target.result.split("\n").slice(1);

        linhas.forEach(l => {
            const [data, descricao, categoria, tipo, valor] = l.split(",");
            if (data && valor) {
                registros.push({
                    id: Date.now() + Math.random(),
                    data,
                    descricao,
                    categoria,
                    tipo,
                    valor: parseFloat(valor)
                });
            }
        });

        salvar();
        atualizarTudo();
    };
    reader.readAsText(file);
});