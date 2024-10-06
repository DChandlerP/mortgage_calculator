// script.js

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const form = document.getElementById('mortgage-form');
  
    // Get result elements
    const monthlyPaymentEl = document.getElementById('monthly-payment');
    const totalInterestEl = document.getElementById('total-interest');
    const totalPaymentEl = document.getElementById('total-payment');
  
    // Get input values
    const inputs = {
      homePrice: document.getElementById('home-price'),
      downPayment: document.getElementById('down-payment'),
      loanTerm: document.getElementById('loan-term'),
      interestRate: document.getElementById('interest-rate'),
      interestType: document.getElementById('interest-type'),
      propertyTax: document.getElementById('property-tax'),
      homeInsurance: document.getElementById('home-insurance'),
      pmi: document.getElementById('pmi'),
      currency: document.getElementById('currency')
    };
  
    // Currency symbols mapping
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥'
      // Add more currencies as needed
    };
  
    // Initialize charts
    let paymentChart, balanceChart;
  
    // Event listener for form submission
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent form from submitting normally
      updateCalculator();
    });
  
    // Function to reset the form (formerly resetForm)
    // Now, no reset functionality as per user request
  
    // Function to format currency based on selection
    function formatCurrency(amount) {
      const currency = inputs.currency.value;
      const symbol = currencySymbols[currency] || '$';
      return `${symbol}${Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
  
    // Function to update the calculator
    function updateCalculator() {
      // Parse input values
      const homePrice = parseFloat(inputs.homePrice.value) || 0;
      const downPayment = parseFloat(inputs.downPayment.value) || 0;
      const loanTermYears = parseInt(inputs.loanTerm.value) || 0;
      const interestRate = parseFloat(inputs.interestRate.value) || 0;
      const interestType = inputs.interestType.value;
      const propertyTax = parseFloat(inputs.propertyTax.value) || 0;
      const homeInsurance = parseFloat(inputs.homeInsurance.value) || 0;
      const pmi = parseFloat(inputs.pmi.value) || 0;
      const currency = inputs.currency.value;
  
      // Calculate principal
      const principal = homePrice - downPayment;
  
      if (principal <= 0) {
        // Invalid principal
        monthlyPaymentEl.innerText = formatCurrency(0);
        totalInterestEl.innerText = formatCurrency(0);
        totalPaymentEl.innerText = formatCurrency(0);
        if (paymentChart) paymentChart.destroy();
        if (balanceChart) balanceChart.destroy();
        return;
      }
  
      // Determine if it's fixed or adjustable rate
      let monthlyInterestRate = interestRate / 100 / 12;
      if (interestType === 'adjustable') {
        // For simplicity, treat adjustable rate as fixed in this implementation
        // You can enhance this by implementing rate adjustments over time
        // Alternatively, prompt user for rate changes
      }
  
      // Calculate number of payments
      let numberOfPayments = loanTermYears * 12;
  
      // Calculate monthly payment using the formula:
      // M = P * r * (1 + r)^n / [(1 + r)^n – 1]
      let monthlyPayment = 0;
      if (monthlyInterestRate === 0) {
        monthlyPayment = principal / numberOfPayments;
      } else {
        monthlyPayment = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
                         (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
      }
  
      // Calculate monthly additional costs
      const monthlyPropertyTax = propertyTax / 12;
      const monthlyHomeInsurance = homeInsurance / 12;
      const monthlyPMI = pmi / 12;
  
      // Total monthly payment
      const totalMonthlyPayment = monthlyPayment + monthlyPropertyTax + monthlyHomeInsurance + monthlyPMI;
  
      // Calculate total payment and total interest
      const totalPayment = totalMonthlyPayment * numberOfPayments;
      const totalInterest = (monthlyPayment * numberOfPayments) - principal;
  
      // Display results
      monthlyPaymentEl.innerText = formatCurrency(totalMonthlyPayment);
      totalInterestEl.innerText = formatCurrency(totalInterest + propertyTax + homeInsurance + pmi);
      totalPaymentEl.innerText = formatCurrency(totalPayment + propertyTax + homeInsurance + pmi);
  
      // Generate Amortization Data
      const amortizationData = [];
      let balance = principal;
      let totalInterestPaid = 0;
  
      for (let i = 1; i <= numberOfPayments; i++) {
        const interest = balance * monthlyInterestRate;
        const principalPayment = monthlyPayment - interest;
        balance -= principalPayment;
        totalInterestPaid += interest;
  
        amortizationData.push({
          month: i,
          principal: principalPayment,
          interest: interest,
          balance: balance < 0 ? 0 : balance
        });
      }
  
      // Update charts
      updateCharts(amortizationData, monthlyInterestRate, principal, numberOfPayments);
    }
  
    // Function to update charts
    function updateCharts(data, monthlyInterestRate, principal, numberOfPayments) {
      const labels = data.map(entry => `Month ${entry.month}`);
      const principalData = data.map(entry => entry.principal.toFixed(2));
      const interestData = data.map(entry => entry.interest.toFixed(2));
      const balanceData = data.map(entry => entry.balance.toFixed(2));
  
      // Payment Chart (Principal vs Interest)
      if (paymentChart) {
        paymentChart.destroy();
      }
      paymentChart = new Chart(document.getElementById('payment-chart').getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Principal',
              data: principalData,
              borderColor: 'green',
              fill: false
            },
            {
              label: 'Interest',
              data: interestData,
              borderColor: 'red',
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Principal and Interest Over Time'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            },
            legend: {
              position: 'top'
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Month'
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Amount'
              },
              beginAtZero: true
            }
          }
        }
      });
  
      // Balance Chart
      if (balanceChart) {
        balanceChart.destroy();
      }
      balanceChart = new Chart(document.getElementById('balance-chart').getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Remaining Balance',
              data: balanceData,
              borderColor: 'blue',
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Remaining Loan Balance Over Time'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            },
            legend: {
              position: 'top'
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Month'
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Balance'
              },
              beginAtZero: false
            }
          }
        }
      });
    }
  
    // Initial calculation on page load
    updateCalculator();
  });
  