import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { DateRangePicker } from 'rsuite';
import 'react-dropdown/style.css';
import Dropdown from 'react-dropdown';
import './DashboardChart/Dashboard.css';

const Dashboard = () => {
  const chartRef = useRef(null);
  const donutChartRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [dropDownCategories, setDropDownCategories] = useState([]);

  const handleDateChange = (range) => {
    setDateRange(range && range.length === 2 ? range : []);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://fryt5r9woh.execute-api.us-east-1.amazonaws.com/items');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const result = await response.json();
      setData(result);
      setDropDownCategories(["None", ...new Set(result.map(item => item.ExpenseType).filter(Boolean))]);
      setFilteredReceipts(filterReceipts(result, dateRange, selectedCategory, searchTerm));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterReceipts = (receipts, dateRange, selectedCategory, searchTerm) => {
    return receipts.filter(item => {
      const itemDate = new Date(item.Date);
      const isDateValid = !dateRange.length || (itemDate >= new Date(dateRange[0]) && itemDate <= new Date(dateRange[1]));
      const isCategoryValid = !selectedCategory || selectedCategory === "None" || item.ExpenseType === selectedCategory;
      const isSearchValid = !searchTerm || item.VendorName?.toLowerCase().includes(searchTerm.toLowerCase());
      return isDateValid && isCategoryValid && isSearchValid;
    });
  };

  const clearFilters = () => {
    setDateRange([]);
    setSelectedCategory(null);
    setSearchTerm("");
  };

  useEffect(() => {
    if (dateRange.length === 0 && !selectedCategory && searchTerm === "") {
      fetchData();
    }
  }, [dateRange, selectedCategory, searchTerm]);

  useEffect(() => {
    if (donutChartRef.current) {
      const filteredData = filteredReceipts.filter(item => item.ExpenseType && !isNaN(item.TotalAmount));
      const labels = [...new Set(filteredData.map(item => item.ExpenseType))];
      const dataValues = labels.map(label =>
        filteredData.filter(item => item.ExpenseType === label).reduce((sum, item) => sum + item.TotalAmount, 0)
      );
      const ctx = donutChartRef.current.getContext('2d');

      if (donutChartRef.current.chartInstance) {
        donutChartRef.current.chartInstance.destroy();
      }

      donutChartRef.current.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels.length ? labels : ['No Data'],
          datasets: [{
            data: labels.length ? dataValues : [1],
            backgroundColor: filteredData.length > 0 
                                ? ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9966FF']
                                : ['#E0E0E0'],
          }]
        },
        options: {
          plugins: { legend: { position: 'right' } }
        }
      });
    }
  }, [filteredReceipts]);

  const handleCategoryChange = (option) => setSelectedCategory(option.value);

  useEffect(() => {
    if (chartRef.current && data.length) {
      const ctx = chartRef.current.getContext('2d');
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const filtered = filteredReceipts.filter(item => {
        const d = new Date(item.Date);
        return d >= thirtyDaysAgo && d <= now;
      });

      const sorted = filtered.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      const labels = sorted.map(item => new Date(item.Date).toLocaleDateString());
      const amounts = sorted.map(item => item.TotalAmount);

      if (chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }

      chartRef.current.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{ label: 'Daily Expenses', data: amounts, borderColor: '#4CAF50', tension: 0.4 }]
        },
        options: {
          plugins: { legend: { display: true } },
          scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Amount ($)' } }
          }
        }
      });
    }
  }, [filteredReceipts]);

  return (
    <div className='dashboard-wrapper'>
      <h1 className='Headings'>Dashboard</h1>
      <div className='filter-row'>
        <DateRangePicker placeholder='Select Date Range' onChange={handleDateChange} value={dateRange} format='MM/dd/yyyy' showOneCalendar showTime={false} />
        <Dropdown options={dropDownCategories} onChange={handleCategoryChange} placeholder='Select a category' value={selectedCategory} />
        <button className='clear-button roundBorder' onClick={clearFilters}>Clear</button>
        <button className='filter-button roundBorder' onClick={fetchData}>Search</button>
        <input type='text' className='search-bar' placeholder='Search receipts...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchData()} />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
          <div className='dashboard-content'>
            <div className='flexContainer'>
              <div className='BodyContainer chart-line shadow roundBorder'>
                <strong>Total of Monthly Expenses</strong>
                <canvas ref={chartRef}></canvas>
              </div>

              <div className='BodyContainer chart-donut shadow roundBorder'>
                <strong>Expense Category Breakdown</strong>
                <canvas className='donutChart' ref={donutChartRef}></canvas>
                <p>
                  Amount: $
                  {filteredReceipts.reduce((total, item) => total + (item.TotalAmount || 0), 0).toFixed(2)}
                </p>
              </div>

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
                      {filteredReceipts.sort((a, b) => new Date(b.Date) - new Date(a.Date)).map((item, index) => (
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
