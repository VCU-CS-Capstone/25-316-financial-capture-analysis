import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { DateRangePicker } from 'rsuite';
import './DashboardChart/Dashboard.css';
import 'react-dropdown/style.css';
import Dropdown from 'react-dropdown';


const Dashboard = () => {
    const chartRef = useRef(null);
    const lineChartRef = useRef(null);
    const donutChartRef = useRef(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // FILTERING OPTIONS
    const [dateRange, setDateRange] = useState([null, null]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredReceipts, setFilteredReceipts] = useState([]);

    const currentDate = new Date();
    // const currentDay = currentDate.getDate();
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = currentDate.getMonth();
    // const currentMonthName = new Intl.DateTimeFormat('en-US', {month: 'long'}).format(currentDate); //Gets current month name
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
    // Calculates the number of transactions per day in the current month
    const calculateDailyTransactions = () => {
        const transactionsPerDay = new Array(daysInMonth).fill(0);

        filterMonthData.forEach(item => {
            const itemDate = new Date(item.Date);
            const dayOfMonth = itemDate.getDate();
            if (dayOfMonth >= 1 && dayOfMonth <= daysInMonth){
                transactionsPerDay[dayOfMonth-1]++;
            }
        });
        return transactionsPerDay;
    }

    const handleDateChange = (range) => {
        setDateRange(range);
    
        if (range && range.length === 2) {
            const [startDate, endDate] = range;

            const isValidStart = startDate instanceof Date && !isNaN(startDate);
            const isValidEnd = endDate instanceof Date && !isNaN(endDate);
    
            if (isValidStart && isValidEnd) {
                console.log("Start Date:", startDate, "End Date:", endDate);
            }
            else {
                console.log("Reset sorting back to default");
            }
        }
    };

    // LOAD DYNAMODB TABLE DATA
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://fryt5r9woh.execute-api.us-east-1.amazonaws.com/items');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
  
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
  
        fetchData();
    }, []);


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
                    const [startDate, endDate] = dateRange;
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
    
            // Debug messages
            // console.log("Filtered Data:", filteredData);
            // console.log("Chart Labels:", chartLabels);
            // console.log("Chart Data:", chartData);
    
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
                            // Select a random color if there's data
                            // Use a grey color if there's none
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
    }, [filteredReceipts, dateRange, selectedCategory, searchTerm]);
    
    // Update state with the selected category
    const handleCategoryChange = (option) => {
        setSelectedCategory(option.value); 
    };

    // Initialize Line Chart
    useEffect(() => {
        if (chartRef.current && data.length) {
            const ctx = chartRef.current.getContext('2d');
    
            // Extract start and end dates from dateRange
            const [startDate, endDate] = dateRange || [null, null];
    
            let filteredData;
    
            if (startDate && endDate) {
                // Filter data based on the provided date range
                filteredData = data.filter(item => {
                    const itemDate = new Date(item.Date);
                    return (
                        itemDate instanceof Date &&
                        !isNaN(itemDate) &&
                        itemDate >= startDate &&
                        itemDate <= endDate
                    );
                });
            } else {
                // Default to the last 30 days if no date range is selected
                const now = new Date(); // Current date and time
                const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // Date 30 days ago
            
                filteredData = data.filter(item => {
                    const itemDate = new Date(item.Date); // Parse the item's date
                    return (
                        itemDate instanceof Date &&
                        !isNaN(itemDate) &&             // Ensure the date is valid
                        itemDate >= thirtyDaysAgo &&    // Check if it's within the last 30 days
                        itemDate <= now                 // Only use present or past items
                    );
                });
            }
    
            // Sort data by date for proper ordering
            const sortedData = filteredData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
    
            // Create labels and data points
            const labels = sortedData.map(item => new Date(item.Date).toLocaleDateString('en-US', { day: 'numeric' }));
            const amounts = sortedData.map(item => item.TotalAmount);
    
            // Debugging logs
            console.log("Filtered Data:", sortedData);
            console.log("Labels:", labels);
            console.log("Amounts:", amounts);
    
            // Destroy existing chart instance to avoid duplication
            if (lineChartRef.current) {
                lineChartRef.current.destroy();
            }
    
            // Update chart title based on whether date range is set
            const chartTitle = startDate && endDate
                ? `Expenses from ${startDate.toLocaleDateString('en-US')} to ${endDate.toLocaleDateString('en-US')}`
                : `Expenses for ${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())}`;
    
            // Initialize the line chart
            lineChartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
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
    }, [data, dateRange]);
    
    // Search bar
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredReceipts(data); // Show all receipts when search term is empty
        } else {
            const lowercasedTerm = searchTerm.toLowerCase();
            const filtered = data.filter(receipt =>
                Object.values(receipt).some(value =>
                    String(value).toLowerCase().includes(lowercasedTerm)
                )
            );
            setFilteredReceipts(filtered); // Show receipts with search name
        }
    }, [searchTerm, data]);


    if (loading) return <p className='BodyContainer BodyContainer-first shadow roundBorder'>Loading...</p>;
    if (error) return <p className='BodyContainer BodyContainer-first shadow roundBorder'>Error: {error}</p>;

    return (
        <div>
            <h1 className='Headings'>Dashboard</h1>
            <DateRangePicker showOneCalendar size="sm" className='Subheading' placeholder="Select Date Range" onChange={handleDateChange}/>
            <div className='Subheading-category dropdown-menu'>
                <Dropdown
                    options={[...new Set(data.map(item => item.ExpenseType).filter(Boolean))]}
                    onChange={handleCategoryChange}
                    placeholder="Select a category"
                />
            </div>
            <input
                type="text"
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="Subheading-category search-bar"
            />

            <div className='flexContainer'>
                <div className='BodyContainer BodyContainer-first shadow roundBorder'>
                    Total of Monthly Expenses
                    <div>
                        <canvas id='expenseChart' ref={chartRef}></canvas>
                    </div>
                </div>
    
                <div className='BodyContainer BodyContainer-second shadow roundBorder'>
                <div>
                    <table>
                    <thead className='roundBorder'>
                        <tr>
                            <th>Transaction Date</th>
                            <th>Upload Date</th>
                            <th>Total Amount</th>
                            <th>Total Items</th>
                            <th>Merchant</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.filter(item => {
                            const isDateValid = (() => {
                                if (dateRange && dateRange.length === 2) {
                                    const [startDate, endDate] = dateRange;
                                    const isValidStart = startDate instanceof Date && !isNaN(startDate);
                                    const isValidEnd = endDate instanceof Date && !isNaN(endDate);
                                    if (isValidStart && isValidEnd) {
                                        const itemDate = new Date(item.Date);
                                        return itemDate >= startDate && itemDate <= endDate;
                                    }
                                }
                                return true;
                            })();

                            const isCategoryValid = selectedCategory
                                ? item.ExpenseType === selectedCategory     // Only display items with matching category
                                : true;                                     // No category filtering if none selected

                            return isDateValid && isCategoryValid;
                        })
                        .sort((a, b) => new Date(b.Date) - new Date(a.Date)) // Sort by date
                        .map((item, index) => (
                            <tr key={index}>
                                <td>{item.Date}</td>
                                <td>{item.UploadDate}</td>
                                <td>{(item.TotalAmount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td>{item.TotalItems}</td>
                                <td>{item.VendorName}</td>
                                <td>{item.ExpenseType}</td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>

                <div>
                    <div className='BodyContainer-third shadow roundBorder chart'>
                    <table>
                        <thead>
                            <tr>
                                <th>Expense Category Breakdown</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <canvas className='donutChart' ref={donutChartRef}></canvas>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Amount: $
                                    {
                                        filteredReceipts.filter(item => {
                                            // Validate item has required fields
                                            if (!item.TotalAmount || typeof item.TotalAmount !== 'number' || isNaN(item.TotalAmount)) {
                                                console.warn("Invalid TotalAmount in item:", item);
                                                return false;
                                            }

                                            if (!item.Date || isNaN(new Date(item.Date))) {
                                                console.warn("Invalid Date in item:", item);
                                                return false;
                                            }

                                            // Validate and filter based on date range
                                            if (dateRange && dateRange.length === 2) {
                                                const [startDate, endDate] = dateRange;
                                                const isValidStart = startDate instanceof Date && !isNaN(startDate);
                                                const isValidEnd = endDate instanceof Date && !isNaN(endDate);

                                                if (isValidStart && isValidEnd) {
                                                    const itemDate = new Date(item.Date);
                                                    if (itemDate < startDate || itemDate > endDate) {
                                                        return false;
                                                    }
                                                }
                                            }
                            
                                            // Validate and filter based on selected category
                                            if (selectedCategory && item.ExpenseType !== selectedCategory) {
                                                return false;
                                            }
                            
                                            return true; // Include item if it passes all checks
                                        })
                                        .reduce((total, item) => total + item.TotalAmount, 0)
                                        .toFixed(2)
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;
