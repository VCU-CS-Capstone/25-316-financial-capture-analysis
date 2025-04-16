import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { DateRangePicker } from 'rsuite';
import 'react-dropdown/style.css';
import Dropdown from 'react-dropdown';
import './DashboardChart/Dashboard.css';

const Dashboard = () => {
  const chartRef = useRef(null);
  const lineChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // FILTERING OPTIONS
  const [dateRange, setDateRange] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [dropDownCategories, setDropDownCategories] = useState([]);

  const currentDate = new Date();
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  const daysInMonth = new Date(new Date().getFullYear(), currentMonthIndex, 0).getDate();

  // Generates x-axis labels 1 to n days in the current month
  const xlabels = [];
  for (let i =1; i <=daysInMonth; i++){
      xlabels.push(i);
  }

  // Filters the data to only incude items from the current year
  const filterYearData = data.filter(item => {
      const itemsYear = new Date(item.Date).getFullYear();
      return itemsYear === currentYear;
  });

  // Filters the data to only include items from the current year and month
  const filterMonthData = data.filter(item => {
      const itemDate = new Date(item.Date);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth();
      return itemYear === currentYear && itemMonth === currentMonthIndex;
  });
 
  const handleDateChange = (range) => {
    if (!range || range.length !== 2) {
        setDateRange([null, null]);
    } else {
        setDateRange(range);
    }
};

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await fetch('https://fryt5r9woh.execute-api.us-east-1.amazonaws.com/items');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    setData(result);

    const uniqueCategories = [...new Set(result.map(item => item.ExpenseType).filter(Boolean))];
    setDropDownCategories(["None", ...uniqueCategories]); // Prepend "None" to the dropdown

    const applySearchFilters = filterReceipts(result, dateRange, selectedCategory, searchTerm);
    setFilteredReceipts(applySearchFilters);
  } catch (error) {
    console.error('Error fetching data:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

//Load DynamoDB table data as soon as the page loads

  useEffect(() => {
    fetchData();
  }, []);

    // Filter receipts function
    const filterReceipts = (receipts, dateRange, selectedCategory, searchTerm) => {
      return receipts.filter(item => {
          const isDateValid = (() => {
            if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
              const [startDate, endDate] = dateRange.map(date => new Date(date));
              if (!isNaN(startDate) && !isNaN(endDate)) {
                const itemDate = new Date(item.Date);
                return itemDate >= startDate && itemDate <= endDate;
              }
            }
            
              return true; // If no valid date range, do not filter by date
          })();
  
          const isCategoryValid = selectedCategory === "None" || selectedCategory == null || item.ExpenseType === selectedCategory;
  
          const isSearchValid = searchTerm
              ? item.VendorName?.toLowerCase().includes(searchTerm.toLowerCase()) // Apply search filter
              : true;  // No filter applied if empty
  
          return isDateValid && isCategoryValid && isSearchValid;
      });
  };

  const clearFilters = () => {
    setDateRange(null);
    setSelectedCategory(null);
    setSearchTerm("");
    fetchData();
  };

    // This useEffect is only activated when all filter options are cleared, which can only happen with `clearFilters()` above
    useEffect(() => {
      if ((!dateRange || dateRange[0] === null) && selectedCategory === null && searchTerm === "") {
          fetchData();
      }
  }, [dateRange, selectedCategory, searchTerm]);

// Donut Chart
useEffect(() => {
  if (donutChartRef.current) {
      // Filter data based on search, date range, category, and validation
      const filteredData = filteredReceipts.filter(item => {
          if (
              !item.ExpenseType ||
              typeof item.TotalAmount !== 'number' ||
              isNaN(item.TotalAmount) ||
              !item.Date ||
              !item.VendorName
          ) {
              return false;
          }

          // Validate the date range
          if (dateRange && dateRange.length === 2) {
              const [startDate, endDate] = dateRange || [null, null];
              const isValidStart = startDate instanceof Date && !isNaN(startDate);
              const isValidEnd = endDate instanceof Date && !isNaN(endDate);

              if (isValidStart && isValidEnd) {
                  const itemDate = new Date(item.Date);
                  if (isNaN(itemDate) || itemDate < startDate || itemDate > endDate) {
                      return false;
                  }
              }
          }

          // Filter by selected category
          if (selectedCategory && item.ExpenseType !== selectedCategory) {
              return false;
          }
          return true;
      });

      // Aggregate data for chart
      let chartLabels = [...new Set(filteredData.map(item => item.ExpenseType))];
      let chartData = chartLabels.map(label =>
          filteredData
              .filter(item => item.ExpenseType === label)
              .reduce((sum, item) => sum + item.TotalAmount, 0)
      );

      // If no matching data, show an empty chart
      if (filteredData.length === 0) {
          console.warn("No data matches the current filters.");
          chartLabels = ["No Data"];
          chartData = [1]; 
      }

      // Get the chart context
      const ctx = donutChartRef.current.getContext('2d');

      // Destroy existing chart instance if it exists
      if (donutChartRef.current.chartInstance) {
          donutChartRef.current.chartInstance.destroy();
      }

      // Create chart instance
      donutChartRef.current.chartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
              labels: chartLabels,
              datasets: [
                  {
                      data: chartData,
                      // Select a random color if there's data; default to grey if there is none
                      backgroundColor: filteredData.length > 0 
                          ? ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9966FF']
                          : ['#E0E0E0'],
                  }
              ]
          },
          options: {
              plugins: {
                  legend: {
                      position: 'right'
                  }
              }
          }
      });
  }
// }, [filteredReceipts, dateRange, selectedCategory, searchTerm]);
}, [filteredReceipts]);
  
  // Update state with the selected category
  const handleCategoryChange = (option) => setSelectedCategory(option.value);

  useEffect(() => {
    // Only run if chartRef exists and there's receipt data to work with
    if (chartRef.current && filteredReceipts.length) {
      const ctx = chartRef.current.getContext('2d');
  
      // Extract start and end from dateRange; fallback to nulls
      const [startDate, endDate] = dateRange || [null, null];
  
      let filteredData;
  
      // Use selected date range if valid, otherwise default to last 30 days
      if (startDate && endDate) {
        filteredData = filteredReceipts.filter(item => {
          const itemDate = new Date(item.Date);
          return (
            itemDate instanceof Date &&
            !isNaN(itemDate) &&
            itemDate >= startDate &&
            itemDate <= endDate
          );
        });
      } else {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
        filteredData = filteredReceipts.filter(item => {
          const itemDate = new Date(item.Date);
          return (
            itemDate instanceof Date &&
            !isNaN(itemDate) &&
            itemDate >= thirtyDaysAgo &&
            itemDate <= now
          );
        });
      }
  
      // Sort by date ascending
      const sortedData = filteredData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
  
      // Extract labels (date) and data points (amounts)
      const labels = sortedData.map(item =>
        new Date(item.Date).toLocaleDateString('en-US', { day: 'numeric' })
      );
      const amounts = sortedData.map(item => item.TotalAmount);
  
      // Destroy existing chart instance before re-rendering
      if (chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }
  
      // Set dynamic chart title based on whether a range is selected
      const chartTitle =
        startDate && endDate
          ? `Expenses from ${startDate.toLocaleDateString('en-US')} to ${endDate.toLocaleDateString('en-US')}`
          : `Expenses for ${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())}`;
  
      // Create new chart instance
      chartRef.current.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: "Daily Expenses",
            data: amounts,
            borderColor: '#4CAF50',
            tension: 0.4,
          }]
        },
        options: {
          plugins: {
            legend: {
              display: true,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: chartTitle,
              },
            },
            y: {
              title: {
                display: true,
                text: "Amount ($)",
              },
            },
          },
        },
      });
    }
  }, [filteredReceipts, dateRange]);
  

  return (
    <div className='dashboard-wrapper'>
      <h1 className='Headings'>Dashboard</h1>
  
      {/* Filter Row: Date, Category, Search, Buttons */}
      <div className='filter-row'>
        <DateRangePicker
          placeholder='Select Date Range'
          onChange={handleDateChange}
          value={dateRange}
          format='MM/dd/yyyy'
          showOneCalendar
          showTime={false}
        />
        <Dropdown
          options={dropDownCategories}
          onChange={handleCategoryChange}
          placeholder='Select a category'
          value={selectedCategory}
        />
        <button className='clear-button roundBorder' onClick={clearFilters}>Clear</button>
        <button className='filter-button roundBorder' onClick={fetchData}>Search</button>
        <input
          type='text'
          className='search-bar'
          placeholder='Search receipts...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData()}
        />
      </div>
  
      {/* Main Dashboard Content */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className='dashboard-content'>
          <div className='flexContainer'>
  
            {/* Line Chart */}
            <div className='BodyContainer chart-line shadow roundBorder'>
              <strong>Total of Monthly Expenses</strong>
              <canvas ref={chartRef}></canvas>
            </div>
  
            {/* Donut Chart */}
            <div className='BodyContainer chart-donut shadow roundBorder'>
              <strong>Expense Category Breakdown</strong>
              <canvas className='donutChart' ref={donutChartRef}></canvas>
              <p>
                Amount: $
                {filteredReceipts
                  .reduce((total, item) => total + (item.TotalAmount || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
  
            {/* Receipts Table */}
            <div className='BodyContainer table-wrapper shadow roundBorder'>
              <div style={{ overflowY: 'auto', maxHeight: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Transaction Date</th>
                      <th>Upload Date</th>
                      <th>Total Amount</th>
                      <th>Merchant</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceipts
                      .sort((a, b) => new Date(b.Date) - new Date(a.Date))
                      .map((item, index) => (
                        <tr key={index}>
                          <td>{item.Date}</td>
                          <td>{item.UploadDate}</td>
                          <td>{(item.TotalAmount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                          <td>{item.VendorName}</td>
                          <td>{item.ExpenseType}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
  
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;