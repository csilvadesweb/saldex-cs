const DB = JSON.parse(localStorage.getItem('mz_db')) || [];

function add(){
  const d = desc.value;
  const v = parseFloat(valor.value);
  const t = tipo.value;
  if(!d || !v) return;
  DB.push({d,v,t,date:new Date().toLocaleString()});
  localStorage.setItem('mz_db',JSON.stringify(DB));
  render();
}

let chart;
function render(){
  let r=0,d=0;
  historico.innerHTML='';
  DB.forEach(i=>{
    i.t==='renda'?r+=i.v:d+=i.v;
    historico.innerHTML+=`<li>${i.date} - ${i.d} - R$ ${i.v.toFixed(2)}</li>`;
  });
  renda.textContent=`R$ ${r.toFixed(2)}`;
  despesas.textContent=`R$ ${d.toFixed(2)}`;
  saldo.textContent=`R$ ${(r-d).toFixed(2)}`;

  if(chart) chart.destroy();
  chart=new Chart(grafico,{
    type:'pie',
    data:{
      labels:['Renda','Despesas'],
      datasets:[{data:[r,d],backgroundColor:['#22c55e','#ef4444']}]
    },
    options:{responsive:true,maintainAspectRatio:false}
  });
}

async function gerarPDF(){
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p','mm','a4');
  const canvas = await html2canvas(document.getElementById('pdfArea'));
  const img = canvas.toDataURL('image/png');
  pdf.text('MoneyZen CS - Relatório Financeiro',10,10);
  pdf.addImage(img,'PNG',10,15,190,0);
  pdf.save('moneyzen-relatorio.pdf');
}

function toggleTheme(){document.body.classList.toggle('light')}
render();