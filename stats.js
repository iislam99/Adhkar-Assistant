export function renderStatsView() {
  const dhikrSelect = document.getElementById('dhikr-select');
  const timeframeSelect = document.getElementById('timeframe-select');
  const chartCanvas = document.getElementById('stats-chart');

  chrome.storage.sync.get(['ADHKAR_LIST'], ({ ADHKAR_LIST = [] }) => {
    if (ADHKAR_LIST.length === 0) {
      dhikrSelect.innerHTML = `<option disabled>No dhikr available</option>`;
      return;
    }

    // Populate dhikr select options
    dhikrSelect.innerHTML = ADHKAR_LIST.map(d =>
      `<option value="${d.arabic}" ${d.enabled ? 'selected' : ''}>${d.transliteration}</option>`
    ).join('');

    // Render chart when timeframe or selection changes
    timeframeSelect.addEventListener('change', () => {
      const selectedDhikrs = Array.from(dhikrSelect.selectedOptions).map(opt => opt.value);
      renderChart(chartCanvas, selectedDhikrs, timeframeSelect.value);
    });

    dhikrSelect.addEventListener('change', () => {
      const selectedDhikrs = Array.from(dhikrSelect.selectedOptions).map(opt => opt.value);
      renderChart(chartCanvas, selectedDhikrs, timeframeSelect.value);
    });

    // Initial render with all enabled selected
    const initiallySelected = Array.from(dhikrSelect.selectedOptions).map(opt => opt.value);
    renderChart(chartCanvas, initiallySelected, timeframeSelect.value);
  });
}

function renderChart(canvas, selectedDhikrs, timeframe) {
  const ctx = canvas.getContext('2d');
  if (window.currentChart) {
    window.currentChart.destroy();
  }

  if (!selectedDhikrs || selectedDhikrs.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return; // No dhikr selected, clear chart
  }

  chrome.storage.sync.get(['stats'], ({ stats = {} }) => {
    // Gather all labels (dates/timeframes) across all selected dhikrs
    const allLabelsSet = new Set();

    // Data per dhikr: { dhikr: { label: count } }
    const processedData = {};

    selectedDhikrs.forEach(dhikr => {
      const raw = stats[dhikr] || {};
      const dataByTimeframe = {};

      for (const dateStr in raw) {
        const date = new Date(dateStr);
        let label;
        if (timeframe === 'daily') {
          label = dateStr;
        } else if (timeframe === 'monthly') {
          label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else if (timeframe === 'yearly') {
          label = `${date.getFullYear()}`;
        }
        dataByTimeframe[label] = (dataByTimeframe[label] || 0) + raw[dateStr];
        allLabelsSet.add(label);
      }

      processedData[dhikr] = dataByTimeframe;
    });

    // Sort labels
    const labels = Array.from(allLabelsSet).sort();

    // Prepare datasets for Chart.js
    const colors = [
      'blue', 'red', 'green', 'orange', 'purple', 'cyan', 'magenta', 'lime', 'brown', 'pink'
    ];

    const datasets = selectedDhikrs.map((dhikr, idx) => {
      const dataMap = processedData[dhikr];
      const data = labels.map(label => dataMap[label] || 0);

      return {
        label: dhikr,
        data,
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length],
        fill: false,
        tension: 0.2,
      };
    });

    window.currentChart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
        },
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return Number.isInteger(value) ? value : null;
              },
              stepSize: 1,
            },
          },
        },
      },
    });
  });
}
