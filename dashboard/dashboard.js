async function fetchData() {
  const resp = await fetch('data.json');
  return await resp.json();
}

function makePieChart(ctx, labels, values, title) {
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: [
          '#8e44ad','#3498db','#f39c12','#27ae60','#e74c3c','#1abc9c',
          '#d35400','#2ecc71','#9b59b6','#34495e','#16a085','#c0392b'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {position: 'bottom'}
      }
    }
  });
}

function makeBarChart(ctx, labels, values, title) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: '#3498db'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {display: false},
        title: {display: false}
      },
      scales: {
        y: {beginAtZero: true}
      }
    }
  });
}

function makeLabels(labels, values, total, type) {
  let html = '';
  labels.forEach((l, i) => {
    const pct = ((values[i] / total) * 100).toFixed(2);
    html += `${l}: R$ ${values[i].toLocaleString('pt-BR')} (${pct}%)<br>`;
  });
  return html;
}

fetchData().then(data => {
  // Por Tipo
  const tipoLabels = data.porTipo.map(x => x.tipo);
  const tipoValues = data.porTipo.map(x => x.valor);
  makePieChart(document.getElementById('tipoPie'), tipoLabels, tipoValues, 'Distribuição por Tipo');
  makeBarChart(document.getElementById('tipoBar'), tipoLabels, tipoValues, 'Valores por Tipo');
  document.getElementById('tipoLabels').innerHTML = makeLabels(tipoLabels, tipoValues, data.total, 'Tipo');

  // Por Procedimento
  const procLabels = data.porProcedimento.map(x => x.procedimento);
  const procValues = data.porProcedimento.map(x => x.valor);
  makePieChart(document.getElementById('procPie'), procLabels, procValues, 'Distribuição por Procedimento');
  makeBarChart(document.getElementById('procBar'), procLabels, procValues, 'Valores por Procedimento');
  document.getElementById('procLabels').innerHTML = makeLabels(procLabels, procValues, data.total, 'Procedimento');
});