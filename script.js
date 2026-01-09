'use strict';

/* =========================================================
   SALDEX CS – SCRIPT PRINCIPAL
   Release Enterprise Base
   Autor: C.Silva
   ========================================================= */

console.log('SALDEX CS carregado com sucesso');

/* =======================
   STORAGE SEGURO
======================= */
const STORAGE_KEY = 'saldex_cs_dados_v1';

const defaultData = {
  rendas: [],
  despesas: []
};

function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { ...defaultData };
  } catch (e) {
    console.error('Erro ao carregar dados', e);
    return { ...defaultData };
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    alert('Erro ao salvar dados no dispositivo.');
  }
}

/* =======================
   ESTADO GLOBAL
======================= */
let appData = loadData();

/* =======================
   UTILIDADES
======================= */
function formatMoney(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function getTotal(lista) {
  return lista.reduce((sum, item) => sum + item.valor, 0);
}

/* =======================
   ADICIONAR RENDA
======================= */
function adicionarRenda(nome, valor) {
  if (!nome || valor <= 0) return;

  appData.rendas.push({
    nome,
    valor,
    data: new Date().toISOString()
  });

  saveData(appData);
  render();
}

/* =======================
   ADICIONAR DESPESA
======================= */
function adicionarDespesa(nome, valor) {
  if (!nome || valor <= 0) return;

  appData.despesas.push({
    nome,
    valor,
    data: new Date().toISOString()
  });

  saveData(appData);
  render();
}

/* =======================
   RENDERIZAÇÃO
======================= */
function render() {
  renderTotais();
  renderHistorico();
}

function renderTotais() {
  const totalRendas = getTotal(appData.rendas);
  const totalDespesas = getTotal(appData.despesas);
  const saldo = totalRendas - totalDespesas;

  const rendaEl = document.getElementById('totalRenda');
  const despesaEl = document.getElementById('totalDespesa');
  const saldoEl = document.getElementById('saldoFinal');

  if (rendaEl) rendaEl.textContent = formatMoney(totalRendas);
  if (despesaEl) despesaEl.textContent = formatMoney(totalDespesas);

  if (saldoEl) {
    saldoEl.textContent = formatMoney(saldo);
    saldoEl.style.color = saldo >= 0 ? '#0f9d58' : '#d93025';
  }
}

function renderHistorico() {
  const lista = document.getElementById('historicoLista');
  if (!lista) return;

  lista.innerHTML = '';

  const historico = [
    ...appData.rendas.map(r => ({ ...r, tipo: 'Renda' })),
    ...appData.despesas.map(d => ({ ...d, tipo: 'Despesa' }))
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  historico.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.tipo}</strong> - ${item.nome}
      <span>${formatMoney(item.valor)}</span>
    `;
    li.className = item.tipo === 'Renda' ? 'renda' : 'despesa';
    lista.appendChild(li);
  });
}

/* =======================
   LIMPAR DADOS
======================= */
function limparTudo() {
  if (!confirm('Deseja apagar todos os dados?')) return;

  appData = { ...defaultData };
  saveData(appData);
  render();
}

/* =======================
   SUPORTE PWA (ANDROID / IOS)
======================= */
window.addEventListener('load', () => {
  render();
});

/* =======================
   PROTEÇÃO ANTI-ERRO
======================= */
window.onerror = function () {
  return true; // evita quebra do app
};