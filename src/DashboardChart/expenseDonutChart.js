import Chart from 'chart.js/auto';

(async function() {
  const data = {
    labels: [
      'Red',
      'Blue',
      'Yellow'
    ],
    datasets: [{
      label: 'Expense',
      data: [300, 50, 100],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)'
      ],
      hoverOffset: 4
    }]
  };

  new Chart(
    document.getElementById('donutchart'),
    {
      type: 'doughnut',
      data: data, 
      options: {
        cutout: '90%'
      }
    }
  );
})();
