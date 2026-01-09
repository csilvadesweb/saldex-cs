"use strict";

// Inicialização de dados
let transacoes = JSON.parse(localStorage.getItem('moneyzen_data')) || [];
let meuGrafico = null;

// Função principal que roda quando a página carrega
window.onload = function() {
    atualizarInterface();
};

function adicionar(tipo) {
    const nomeInput = document.getElementById('nomeDesc');
    const valorInput = document.getElementById('valorMontante');
    
    const nome = nomeInput.value.trim();
    const valor = parseFloat(valorInput.value);

    if (nome === "" || isNaN(valor) || valor <= 0) {
        alert("Por favor, insira um nome válido e um valor maior que zero.");
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
    
    // Limpar campos
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
    if(!lista) return; // Proteção caso o HTML não tenha o ID

    lista.innerHTML = '';
    let totalRenda = 0;
    let totalDespesa = 0;

    // Criar listas separadas para o histórico (igual à sua imagem)
    let htmlRendas = "<h3>Histórico de Rendas</h3>";
    let htmlDespesas = "<h3>Histórico de Despesas</h3>";

    transacoes.forEach(t => {
        const itemHtml = `<div class="historico-item">
            <span>${t.data} - ${t.nome}:</span> 
            <b class="${t.tipo}">R$ ${t.valor.toFixed(2)}</b>
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

    // Atualizar Resumo
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

    // Se não houver dados, o gráfico não aparece
    if (renda === 0 && despesa === 0) return;

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Renda', 'Despesas'],
            datasets: [{
                data: [renda, despesa],
                backgroundColor: ['#1b465a', '#d14d4d'], // Cores da sua imagem
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// A função exportarPDF (aquela que te mandei antes) deve vir aqui embaixo...
