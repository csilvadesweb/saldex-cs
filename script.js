async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // --- CONFIGURAÇÃO DE CORES ---
    const azulEscuro = [11, 44, 61]; // #0b2c3d
    const cinzaTexto = [80, 80, 80];

    // --- CABEÇALHO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("MoneyZen CS", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório Financeiro Completo", 105, 27, { align: "center" });

    // --- RESUMO FINANCEIRO ---
    const rendas = transacoes.filter(t => t.tipo === 'renda').reduce((a, b) => a + b.valor, 0);
    const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((a, b) => a + b.valor, 0);
    const saldo = rendas - despesas;

    doc.setFontSize(11);
    doc.text(`Renda Total: R$ ${rendas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 20, 45);
    doc.text(`Despesas Totais: R$ ${despesas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 20, 52);
    doc.text(`Saldo Final: R$ ${saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 20, 59);

    // --- GRÁFICO (Captura o elemento Canvas) ---
    const canvas = document.getElementById('graficoFinanceiro');
    const imgData = canvas.toDataURL('image/png');
    // doc.addImage(imagem, tipo, x, y, largura, altura)
    doc.addImage(imgData, 'PNG', 55, 65, 100, 100); 

    // --- HISTÓRICO DE RENDAS ---
    let currentY = 175;
    doc.setFont("helvetica", "bold");
    doc.text("Histórico de Rendas", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    transacoes.filter(t => t.tipo === 'renda').forEach(t => {
        currentY += 6;
        doc.text(`${t.data} - ${t.nome}: R$ ${t.valor.toFixed(2)}`, 20, currentY);
    });

    // --- HISTÓRICO DE DESPESAS ---
    currentY += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Histórico de Despesas", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    transacoes.filter(t => t.tipo === 'despesa').forEach(t => {
        currentY += 6;
        // Verifica se precisa de nova página se o histórico for muito longo
        if (currentY > 270) { 
            doc.addPage();
            currentY = 20;
        }
        doc.text(`${t.data} - ${t.nome}: R$ ${t.valor.toFixed(2)}`, 20, currentY);
    });

    // --- RODAPÉ ---
    doc.setFontSize(8);
    doc.setTextColor(150);
    const rodapeTexto = `MoneyZen CS © C.Silva — Relatório gerado automaticamente`;
    doc.text(rodapeTexto, 105, 285, { align: "center" });

    // --- DOWNLOAD ---
    doc.save(`Relatorio_MoneyZen_${dataAtual}.pdf`);
}
