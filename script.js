let transacoes = JSON.parse(localStorage.getItem('moneyzen_data')) || [];
let meuGrafico = null;

function adicionar(tipo) {
    const nome = document.getElementById('nomeDesc').value;
    const valor = parseFloat(document.getElementById('valorMontante').value);

    if (!nome || isNaN(valor)) return alert("Preencha os campos!");

    const item = {
        id: Date.now(),
        nome,
        valor,
        tipo,
        data: new Date().toLocaleDateString('pt-BR')
    };

    transacoes.push(item);
    salvarEAtualizar();
    
    // Limpar campos
    document.getElementById('nomeDesc').value = '';
    document.getElementById('valorMontante').value = '';
}

function salvarEAtualizar() {
    localStorage.setItem('moneyzen_data', JSON.stringify(transacoes));
    atualizarInterface();
}

function atualizarInterface() {
    const lista = document.getElementById('listaHistorico');
    lista.innerHTML = '';

    let totalRenda = 0;
    let totalDespesa = 0;

    transacoes.forEach(t => {
        if (t.tipo === 'renda') totalRenda += t.valor;
        else totalDespesa += t.valor;

        const div = document.createElement('div');
        div.className = `historico-item ${t.tipo}`;
        div.innerHTML = `<span>${t.nome} (${t.data})</span> <b>R$ ${t.valor.toFixed(2)}</b>`;
        lista.appendChild(div);
    });

    document.getElementById('resumoRenda').innerText = `R$ ${totalRenda.toFixed(2)}`;
    document.getElementById('resumoDespesa').innerText = `R$ ${totalDespesa.toFixed(2)}`;
    document.getElementById('resumoSaldo').innerText = `R$ ${(totalRenda - totalDespesa).toFixed(2)}`;

    atualizarGrafico(totalRenda, totalDespesa);
}

function atualizarGrafico(renda, despesa) {
    const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Renda', 'Despesas'],
            datasets: [{
                data: [renda, despesa],
                backgroundColor: ['#2ecc71', '#e74c3c']
            }]
        }
    });
}

async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Relatório Financeiro MoneyZen CS", 15, 20);
    
    const colunas = ["Data", "Descrição", "Tipo", "Valor"];
    const linhas = transacoes.map(t => [t.data, t.nome, t.tipo.toUpperCase(), `R$ ${t.valor.toFixed(2)}`]);

    doc.autoTable({
        startY: 30,
        head: [colunas],
        body: linhas,
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.text("__________________________", 15, finalY);
    doc.setFontSize(10);
    doc.text("Assinatura do Responsável", 15, finalY + 7);

    doc.save("Relatorio_MoneyZen.pdf");
}

// Iniciar ao carregar
atualizarInterface();
