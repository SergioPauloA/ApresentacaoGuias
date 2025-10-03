async function fetchData() {
  const resp = await fetch('data.json');
  return await resp.json();
}

function makePieChart(ctx, labels, values, title, customColors = null) {
  const defaultColors = [
    '#8e44ad', '#3498db', '#f39c12', '#27ae60', '#e74c3c', '#1abc9c',
    '#d35400', '#2ecc71', '#9b59b6', '#34495e', '#16a085', '#c0392b'
  ];

  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: customColors || defaultColors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function makeMultiBarChart(ctx, labels, datasets, title) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title
        },
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.parsed.y;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.dataset.label}: ${value} (${percentage}%)`;
            }
          }
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

function makeBarChart(ctx, labels, values, title, backgroundColor = '#3498db') {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
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

function makeQuantityLabels(labels, values, total, type) {
  let html = '';
  labels.forEach((l, i) => {
    const pct = ((values[i] / total) * 100).toFixed(2);
    html += `${l}: ${values[i].toLocaleString('pt-BR')} (${pct}%)<br>`;
  });
  return html;
}

fetchData().then(data => {
  // Por Tipo
  const tipoLabels = data.porTipo.map(x => x.tipo);
  const tipoValues = data.porTipo.map(x => x.valor);
  makePieChart(document.getElementById('tipoPie'), tipoLabels, tipoValues, 'Distribuição por Tipo');
  document.getElementById('tipoLabels').innerHTML = makeLabels(tipoLabels, tipoValues, data.total, 'Tipo');

  // Produção Mensal
  const meses = data.producaoMensal.map(x => x.mes);
  const centroCirurgico = data.producaoMensal.map(x => x.centroCirurgico);
  const poltronaLeito = data.producaoMensal.map(x => x.poltronaLeito);
  const acupuntura = data.producaoMensal.map(x => x.acupuntura);

  const producaoDatasets = [
    {
      label: 'Centro Cirúrgico',
      data: centroCirurgico,
      backgroundColor: '#e74c3c',
      borderColor: '#c0392b',
      borderWidth: 1
    },
    {
      label: 'Poltrona/Leito',
      data: poltronaLeito,
      backgroundColor: '#3498db',
      borderColor: '#2980b9',
      borderWidth: 1
    },
    {
      label: 'Acupuntura',
      data: acupuntura,
      backgroundColor: '#27ae60',
      borderColor: '#229954',
      borderWidth: 1
    }
  ];

  makeMultiBarChart(document.getElementById('producaoLine'), meses, producaoDatasets, 'Produção Mensal por Setor');

  // Criar sistema de paginação para Produção Mensal
  let currentPage = 0;
  const itemsPerPage = 3;
  const totalPages = Math.ceil(data.producaoMensal.length / itemsPerPage);

  function createProducaoCards(pageIndex) {
    const startIndex = pageIndex * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.producaoMensal.length);

    let cardsHtml = '';

    for (let i = startIndex; i < endIndex; i++) {
      const mesData = data.producaoMensal[i];
      const totalMes = mesData.centroCirurgico + mesData.poltronaLeito + mesData.acupuntura;

      cardsHtml += '<div class="producao-card">';
      cardsHtml += `<strong>${mesData.mes}:</strong><br>`;
      cardsHtml += `Centro Cirúrgico: ${mesData.centroCirurgico} (${((mesData.centroCirurgico / totalMes) * 100).toFixed(1)}%)<br>`;
      cardsHtml += `Poltrona/Leito: ${mesData.poltronaLeito} (${((mesData.poltronaLeito / totalMes) * 100).toFixed(1)}%)<br>`;
      cardsHtml += `Acupuntura: ${mesData.acupuntura} (${((mesData.acupuntura / totalMes) * 100).toFixed(1)}%)<br>`;
      cardsHtml += `<em>Total: ${totalMes}</em>`;
      cardsHtml += '</div>';
    }

    return cardsHtml;
  }

  function updateProducaoDisplay() {
    const cardsContainer = document.getElementById('producaoCards');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');

    cardsContainer.innerHTML = createProducaoCards(currentPage);

    // Atualizar estado dos botões
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === totalPages - 1;

    // Atualizar informação da página
    const startMonth = currentPage * itemsPerPage + 1;
    const endMonth = Math.min((currentPage + 1) * itemsPerPage, data.producaoMensal.length);
    pageInfo.textContent = `Mostrando meses ${startMonth}-${endMonth} de ${data.producaoMensal.length}`;
  }

  function nextPage() {
    if (currentPage < totalPages - 1) {
      currentPage++;
      updateProducaoDisplay();
    }
  }

  function prevPage() {
    if (currentPage > 0) {
      currentPage--;
      updateProducaoDisplay();
    }
  }

  // Criar HTML da estrutura de navegação
  const producaoLegendaHtml = `
    <div class="producao-navigation">
      <div class="nav-controls">
        <button id="prevBtn" onclick="prevPage()" class="nav-btn">&lt;&lt;</button>
        <span id="pageInfo">Mostrando meses 1-3 de ${data.producaoMensal.length}</span>
        <button id="nextBtn" onclick="nextPage()" class="nav-btn">&gt;&gt;</button>
      </div>
      <div id="producaoCards" class="producao-cards-container"></div>
    </div>
  `;

  document.getElementById('producaoLabels').innerHTML = producaoLegendaHtml;

  // Tornar as funções globais para os botões
  window.nextPage = nextPage;
  window.prevPage = prevPage;

  // Inicializar display
  updateProducaoDisplay();

  // Sistema de alternância entre Centro Cirúrgico e Poltrona/Leito
  let currentView = 'centroCirurgico'; // 'centroCirurgico' ou 'poltronaLeito'
  let capacidadeCharts = []; // Array para armazenar instâncias dos gráficos

  function toggleView() {
    const toggleBtn = document.getElementById('toggleViewBtn');

    if (currentView === 'centroCirurgico') {
      currentView = 'poltronaLeito';
      toggleBtn.textContent = 'Alternar para Centro Cirúrgico';
    } else {
      currentView = 'centroCirurgico';
      toggleBtn.textContent = 'Alternar para Poltrona/Leito';
    }

    updateCapacidadeCharts();
  }

  function createCapacidadeLabels(usado, capacidade, tipo) {
    // Garantir que os valores são válidos
    const usadoNum = parseInt(usado) || 0;
    const capacidadeNum = parseInt(capacidade) || 1;
    const disponivelNum = Math.max(0, capacidadeNum - usadoNum);

    // Calcular percentuais baseados na capacidade total como 100%
    const percentualUsado = ((usadoNum / capacidadeNum) * 100).toFixed(1);
    const percentualDisponivel = ((disponivelNum / capacidadeNum) * 100).toFixed(1);

    return `
      <strong>Utilização da Capacidade:</strong><br>
      Utilizado: ${usadoNum.toLocaleString('pt-BR')} (${percentualUsado}%)<br>
      Disponível: ${disponivelNum.toLocaleString('pt-BR')} (${percentualDisponivel}%)<br>
      <br>
      <em><strong>Capacidade Total: ${capacidadeNum.toLocaleString('pt-BR')} (100%)</strong></em>
    `;
  }

  function updateCapacidadeCharts() {
    const capacidadesContainer = document.getElementById('capacidadesContainer');
    capacidadesContainer.innerHTML = '';

    // Destruir gráficos existentes
    capacidadeCharts.forEach(chart => {
      if (chart) chart.destroy();
    });
    capacidadeCharts = [];

    data.capacidades.forEach((capacidadeMes, index) => {
      // Encontrar dados de produção correspondentes ao mês
      const producaoMes = data.producaoMensal.find(p => p.mes === capacidadeMes.mes);
      if (!producaoMes) return;

      // Definir dados baseado na visualização atual
      let usado, capacidadeTotal, labels, colors, tipoLabel;

      if (currentView === 'centroCirurgico') {
        usado = producaoMes.centroCirurgico;
        capacidadeTotal = capacidadeMes.capacidadeCentroCirurgico;
        labels = ['Utilizado', 'Disponível'];
        colors = ['#e74c3c', '#95a5a6']; // Vermelho para usado, cinza para disponível
        tipoLabel = 'Centro Cirúrgico';
      } else {
        usado = producaoMes.poltronaLeito;
        capacidadeTotal = capacidadeMes.capacidadeLeito;
        labels = ['Utilizado', 'Disponível'];
        colors = ['#27ae60', '#95a5a6']; // Verde para usado, cinza para disponível
        tipoLabel = 'Poltrona/Leito';
      }

      const disponivel = Math.max(0, capacidadeTotal - usado); // Garantir que não seja negativo
      const values = [usado, disponivel]; // Apenas 2 fatias: usado e disponível

      // Debug: verificar se os dados estão corretos
      console.log(`${capacidadeMes.mes} - ${tipoLabel}:`, {
        usado: usado,
        disponivel: disponivel,
        capacidadeTotal: capacidadeTotal,
        values: values,
        percentualUsado: ((usado / capacidadeTotal) * 100).toFixed(1) + '%',
        percentualDisponivel: ((disponivel / capacidadeTotal) * 100).toFixed(1) + '%'
      });

      // Criar container para cada mês
      const mesContainer = document.createElement('div');
      mesContainer.style.cssText = 'text-align: center; margin-bottom: 15px; max-width: 280px;';

      // Título do mês
      const mesTitle = document.createElement('h3');
      mesTitle.textContent = `${capacidadeMes.mes} - ${tipoLabel}`;
      mesTitle.style.cssText = 'margin-bottom: 8px; font-size: 14px; margin-top: 0; color: #2c3e50;';

      // Canvas para o gráfico
      const canvas = document.createElement('canvas');
      canvas.id = `capacidade${index}`;
      canvas.style.cssText = 'width: 200px; height: 200px;';

      // Labels container
      const labelsDiv = document.createElement('div');
      labelsDiv.id = `capacidadeLabels${index}`;
      labelsDiv.style.cssText = 'font-size: 12px; margin-top: 8px; text-align: left; line-height: 1.4; background: #f8f9fa; padding: 10px; border-radius: 5px;';

      mesContainer.appendChild(mesTitle);
      mesContainer.appendChild(canvas);
      mesContainer.appendChild(labelsDiv);
      capacidadesContainer.appendChild(mesContainer);

      // Validar dados antes de criar o gráfico
      if (usado < 0 || capacidadeTotal <= 0) {
        console.error(`Dados inválidos para ${capacidadeMes.mes} - ${tipoLabel}:`, { usado, capacidadeTotal });
        mesContainer.innerHTML = `<p>Dados inválidos para ${capacidadeMes.mes}</p>`;
        return;
      }

      // Criar o gráfico
      const chart = makePieChart(canvas, labels, values, `${tipoLabel} ${capacidadeMes.mes}`, colors);
      capacidadeCharts.push(chart);

      // Criar labels personalizadas
      labelsDiv.innerHTML = createCapacidadeLabels(usado, capacidadeTotal, tipoLabel);
    });
  }

  // Configurar botão de alternância
  const capacidadesContainer = document.getElementById('capacidadesContainer');
  const toggleBtn = document.getElementById('toggleViewBtn');
  toggleBtn.addEventListener('click', toggleView);

  // Tornar função global
  window.toggleView = toggleView;

  // Inicializar visualização
  updateCapacidadeCharts();
});