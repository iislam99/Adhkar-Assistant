export function renderStatsView() {
  const dhikrSelect = document.getElementById('dhikr-select');
  const chartCanvas = document.getElementById('stats-chart');
  chartCanvas.height = 200;
  const MAX_SELECTION = 3;

  chrome.storage.sync.get(['ADHKAR_LIST'], ({ ADHKAR_LIST = [] }) => {
    const enabledDhikr = ADHKAR_LIST.filter(d => d.enabled);

    if (enabledDhikr.length === 0) {
      dhikrSelect.innerHTML = `<p style="color:#ccc;">No dhikr available</p>`;
      return;
    }

    dhikrSelect.innerHTML = `
      <div id="stats-dhikr-select-container" style="max-height: 200px; overflow-y: auto;">
        ${enabledDhikr.map((d, idx) => `
          <label>
            <input type="checkbox" value="${d.arabic}" ${idx < MAX_SELECTION ? 'checked' : ''} />
            <span>${d.arabic}</span>
          </label>
        `).join('')}
      </div>
    `;

    function getCheckedValues() {
      return Array.from(dhikrSelect.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    }

    function enforceMaxSelection() {
      const checkedCount = getCheckedValues().length;
      dhikrSelect.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.disabled = !cb.checked && checkedCount >= MAX_SELECTION;
      });
    }

    function onCheckboxChange() {
      enforceMaxSelection();
      renderChart(chartCanvas, getCheckedValues());
    }

    dhikrSelect.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', onCheckboxChange);
    });

    enforceMaxSelection();
    renderChart(chartCanvas, getCheckedValues());
  });
}


function renderChart(canvas, selectedDhikrs) {
  const ctx = canvas.getContext('2d');
  if (window.currentChart) window.currentChart.destroy();

  chrome.storage.sync.get(['stats'], ({ stats = {} }) => {
    const today = new Date();
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const day = d.toLocaleDateString(undefined, { weekday: 'short' }) + '.'; // Mon, Tue, etc.
      const dateNum = d.getDate(); // 1–31
      labels.push(`${day} ${dateNum}`);
    }

    const pastelColors = [
      'rgba(173, 216, 230, 0.6)',
      'rgba(255, 182, 193, 0.6)',
      'rgba(144, 238, 144, 0.6)',
    ];
    const borderColors = pastelColors.map(c => c.replace('0.6', '1'));

    const dateKeys = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dateKeys.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
    }

    const datasets = selectedDhikrs.map((dhikr, idx) => {
      const raw = stats[dhikr] || {};
      const data = dateKeys.map(dateStr => raw[dateStr] || 0);
      return {
        label: dhikr,
        data,
        borderColor: borderColors[idx % borderColors.length],
        backgroundColor: pastelColors[idx % pastelColors.length],
        fill: false,
        tension: 0.2,
      };
    });

    // Ensure empty chart still renders when nothing is selected
    const chartData = {
      labels,
      datasets: datasets.length > 0 ? datasets : [{
        label: 'No data selected',
        data: new Array(labels.length).fill(null),
        borderColor: 'rgba(200,200,200,0.3)',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }]
    };

    window.currentChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              color: '#ffffff'
            },
            display: true
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#ffffff'
            }
          },
          y: {
            min: 0,
            ticks: {
              callback: value => Number.isInteger(value) ? value : null,
              stepSize: 1,
              color: '#ffffff'
            }
          }
        }
      },
      plugins: [{
        id: 'custom_legend',
        afterUpdate(chart) {
          const legendContainer = document.getElementById('chart-legend');
          legendContainer.innerHTML = chart.data.datasets
            .filter(ds => ds.label !== 'No data selected')
            .map((ds, idx) => `
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 12px; height: 12px; background:${ds.borderColor}; margin-right: 8px;"></div>
                <span style="font-size: 12px; color: #fff;">${ds.label}</span>
              </div>
            `).join('');
        }
      }]
    });
  });
}
