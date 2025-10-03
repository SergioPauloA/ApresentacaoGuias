// Dados dos equipamentos de reabilitação
let reabilitarData = {};

// Função para carregar dados
async function loadReabilitarData() {
  try {
    const response = await fetch('reabilitar-data.json');
    reabilitarData = await response.json();
    createCharts();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

// Função para criar todos os gráficos
function createCharts() {
  createTotalEquipamentosChart();
  createTopEquipamentosChart();
  createConveniosChart();
  createEvolutionChart();
  createAllEquipmentEvolutionChart();
}

// Gráfico 1: Total por Equipamento (Pizza)
function createTotalEquipamentosChart() {
  const ctx = document.getElementById('totalEquipamentos').getContext('2d');
  
  const equipamentosNomes = [];
  const equipamentosTotais = [];
  const cores = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6384', '#36A2EB',
    '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
  ];

  let totalGeral = 0;

  Object.keys(reabilitarData.equipamentos).forEach(key => {
    const equipamento = reabilitarData.equipamentos[key];
    equipamentosNomes.push(equipamento.nome);
    
    let total = 0;
    reabilitarData.meses.forEach(mes => {
      total += equipamento.dados[mes].total;
    });
    equipamentosTotais.push(total);
    totalGeral += total;
  });

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: equipamentosNomes,
      datasets: [{
        data: equipamentosTotais,
        backgroundColor: cores
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Distribuição Total por Equipamento (2025)'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const percentage = ((value / totalGeral) * 100).toFixed(2);
              return `${label}: ${value.toLocaleString('pt-BR')} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  // Criar labels com porcentagens
  createEquipamentosLabels(equipamentosNomes, equipamentosTotais, totalGeral);
}

// Gráfico 2: Top 5 Equipamentos (Barras)
function createTopEquipamentosChart() {
  const ctx = document.getElementById('topEquipamentos').getContext('2d');
  
  const equipamentosData = [];
  
  Object.keys(reabilitarData.equipamentos).forEach(key => {
    const equipamento = reabilitarData.equipamentos[key];
    let total = 0;
    reabilitarData.meses.forEach(mes => {
      total += equipamento.dados[mes].total;
    });
    equipamentosData.push({
      nome: equipamento.nome,
      total: total
    });
  });

  // Ordenar e pegar top 5
  equipamentosData.sort((a, b) => b.total - a.total);
  const top5 = equipamentosData.slice(0, 5);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top5.map(item => item.nome),
      datasets: [{
        label: 'Total de Procedimentos',
        data: top5.map(item => item.total),
        backgroundColor: '#36A2EB',
        borderColor: '#2E8BC0',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Top 5 Equipamentos Mais Utilizados'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Gráfico 3: Distribuição por Convênios (Pizza)
function createConveniosChart() {
  const ctx = document.getElementById('conveniosChart').getContext('2d');
  
  const conveniosTotais = {};
  const conveniosNomes = {
    'cortesia': 'Cortesia',
    'particular': 'Particular',
    'bradesco': 'Bradesco',
    'saude_caixa': 'Saúde Caixa',
    'geap': 'GEAP',
    'sulamerica': 'Sulamérica',
    'medservice': 'Medservice'
  };

  // Inicializar totais
  reabilitarData.convenios.forEach(convenio => {
    conveniosTotais[convenio] = 0;
  });

  // Somar todos os convênios de todos os equipamentos
  Object.keys(reabilitarData.equipamentos).forEach(equipKey => {
    const equipamento = reabilitarData.equipamentos[equipKey];
    reabilitarData.meses.forEach(mes => {
      reabilitarData.convenios.forEach(convenio => {
        conveniosTotais[convenio] += equipamento.dados[mes][convenio];
      });
    });
  });

  const labels = [];
  const data = [];
  const cores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384'];
  let totalGeral = 0;

  reabilitarData.convenios.forEach((convenio, index) => {
    if (conveniosTotais[convenio] > 0) {
      labels.push(conveniosNomes[convenio]);
      data.push(conveniosTotais[convenio]);
      totalGeral += conveniosTotais[convenio];
    }
  });

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: cores
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Distribuição por Convênios'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const percentage = ((value / totalGeral) * 100).toFixed(2);
              return `${label}: ${value.toLocaleString('pt-BR')} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  // Criar labels com porcentagens
  createConveniosLabels(labels, data, totalGeral);
}

// Gráfico 4: Evolução Mensal (Linha)
function createEvolutionChart() {
  const ctx = document.getElementById('evolutionChart').getContext('2d');
  
  const mesesLabels = {
    'janeiro': 'Jan', 'fevereiro': 'Fev', 'marco': 'Mar', 
    'abril': 'Abr', 'maio': 'Mai', 'junho': 'Jun',
    'julho': 'Jul', 'agosto': 'Ago', 'setembro': 'Set'
  };

  const datasets = [];
  const cores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
  
  // Pegar os 5 equipamentos principais
  const equipamentosData = [];
  Object.keys(reabilitarData.equipamentos).forEach(key => {
    const equipamento = reabilitarData.equipamentos[key];
    let total = 0;
    reabilitarData.meses.forEach(mes => {
      total += equipamento.dados[mes].total;
    });
    equipamentosData.push({
      key: key,
      nome: equipamento.nome,
      total: total
    });
  });

  equipamentosData.sort((a, b) => b.total - a.total);
  const top5Equipment = equipamentosData.slice(0, 5);

  top5Equipment.forEach((equip, index) => {
    const equipamento = reabilitarData.equipamentos[equip.key];
    const monthlyData = [];
    
    reabilitarData.meses.forEach(mes => {
      monthlyData.push(equipamento.dados[mes].total);
    });

    datasets.push({
      label: equip.nome,
      data: monthlyData,
      borderColor: cores[index],
      backgroundColor: cores[index] + '20',
      tension: 0.1,
      fill: false
    });
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: reabilitarData.meses.map(mes => mesesLabels[mes]),
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Evolução Mensal - Top 5 Equipamentos'
        },
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Gráfico 5: Evolução Mensal - Todos os Equipamentos (Linha)
function createAllEquipmentEvolutionChart() {
  const ctx = document.getElementById('allEquipmentEvolution').getContext('2d');
  
  const mesesLabels = {
    'janeiro': 'Jan', 'fevereiro': 'Fev', 'marco': 'Mar', 
    'abril': 'Abr', 'maio': 'Mai', 'junho': 'Jun',
    'julho': 'Jul', 'agosto': 'Ago', 'setembro': 'Set'
  };

  const datasets = [];
  const cores = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
    '#FF9F40', '#FF6B9D', '#C9CBCF', '#4BC0C0', '#36A2EB',
    '#FFCE56', '#FF6384'
  ];
  
  // Criar dataset para cada equipamento
  Object.keys(reabilitarData.equipamentos).forEach((key, index) => {
    const equipamento = reabilitarData.equipamentos[key];
    const monthlyData = [];
    
    reabilitarData.meses.forEach(mes => {
      monthlyData.push(equipamento.dados[mes].total);
    });

    datasets.push({
      label: equipamento.nome,
      data: monthlyData,
      borderColor: cores[index % cores.length],
      backgroundColor: cores[index % cores.length] + '20',
      tension: 0.1,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6
    });
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: reabilitarData.meses.map(mes => mesesLabels[mes]),
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 0
      },
      plugins: {
        title: {
          display: true,
          text: 'Evolução Mensal Completa - Todos os Equipamentos',
          font: {
            size: 16
          }
        },
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 11
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0,0,0,0.1)'
          }
        },
        x: {
          grid: {
            display: true,
            color: 'rgba(0,0,0,0.1)'
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

// Função para criar labels com porcentagens para equipamentos
function createEquipamentosLabels(labels, values, total) {
  let html = '';
  labels.forEach((label, i) => {
    const pct = ((values[i] / total) * 100).toFixed(2);
    html += `${label}: ${values[i].toLocaleString('pt-BR')} (${pct}%)<br>`;
  });
  document.getElementById('equipamentosLabels').innerHTML = html;
}

// Função para criar labels com porcentagens para convênios
function createConveniosLabels(labels, values, total) {
  let html = '';
  labels.forEach((label, i) => {
    const pct = ((values[i] / total) * 100).toFixed(2);
    html += `${label}: ${values[i].toLocaleString('pt-BR')} (${pct}%)<br>`;
  });
  document.getElementById('conveniosLabels').innerHTML = html;
}

// Carregar dados quando a página carregar
document.addEventListener('DOMContentLoaded', loadReabilitarData);
