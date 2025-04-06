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
    
    // Calculates the number of transactions per day in the current month
    // COMMENTED OUT BUT IT'S POSSIBLE THIS MAY BE USED IN THE FUTURE
    // const calculateDailyTransactions = () => {
    //     const transactionsPerDay = new Array(daysInMonth).fill(0);

    //     filterMonthData.forEach(item => {
    //         const itemDate = new Date(item.Date);
    //         const dayOfMonth = itemDate.getDate();
    //         if (dayOfMonth >= 1 && dayOfMonth <= daysInMonth){
    //             transactionsPerDay[dayOfMonth-1]++;
    //         }
    //     });
    //     return transactionsPerDay;
    // }

    const handleDateChange = (range) => {
        console.log("Update date");
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
            
            if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }
    
            const result = await response.json();
            setData(result);
    
            const uniqueCategories = ["None", ...new Set(result.map(item => item.ExpenseType).filter(Boolean))];
            setDropDownCategories(uniqueCategories); // Store unique categories before applying search filters
    
            const applySearchFilters = filterReceipts(result, dateRange, selectedCategory, searchTerm);
            setFilteredReceipts(applySearchFilters);
            console.log("Search filtered results");
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // LOAD DYNAMODB TABLE DATA
    // Get the data as soon as the page loads up
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

    // Clear filters function to reset options
    const clearFilters = () => {
        setDateRange([null, null]);
        setSelectedCategory(null);
        setSearchTerm(""); 
    };

    // This useEffect is only activated when all filter options are cleared, which can only happen with `clearFilters()` above
    useEffect(() => {
        if (dateRange[0] === null && selectedCategory === null && searchTerm === "") {
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
                if (selectedCategory && selectedCategory !== "None" && item.ExpenseType !== selectedCategory) {
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
    const handleCategoryChange = (option) => {
        console.log("Update category");
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
                // Default to the last 30 days if no date range is selected
                const now = new Date(); // Current date and time
                const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // Date 30 days ago
            
                filteredData = filteredReceipts.filter(item => {
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
    }, [filteredReceipts]);

    // useEffect(() => {
    //     const searchBar = document.getElementById("search-bar");
        
    //     if (searchBar) {
    //         const handleKeyDown = (event) => {
    //             if (event.key === "Enter") {
    //                 event.preventDefault();
    //                 fetchData();
    //             }
    //         };
    
    //         searchBar.addEventListener("keydown", handleKeyDown);
    
    //         // Cleanup function to remove event listener when component unmounts
    //         return () => {
    //             searchBar.removeEventListener("keydown", handleKeyDown);
    //         };
    //     }
    // }, []);


    return (
        <div>
            <h1 className='Headings'>Dashboard</h1>

            <DateRangePicker 
                showOneCalendar 
                size="sm" 
                className='Subheading' 
                placeholder="Select Date Range" 
                onChange={handleDateChange}
                value={dateRange}
            />
            <div className='Subheading-category dropdown-menu'>
                <Dropdown
                    options={dropDownCategories}
                    onChange={handleCategoryChange}
                    placeholder="Select a category"
                    value={selectedCategory}
                />
            </div>
            <button className='Subheading-category roundBorder clear-button' onClick={clearFilters}>Clear</button>
            <button className='Subheading-category roundBorder filter-button' onClick={fetchData}>Search</button>
            <input
                type="text"
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="Subheading-category search-bar"
                onKeyDown={(e) => {
                    if(e.key === 'Enter') { fetchData(); } 
                }}
            />

            {loading ? (
                <p className='BodyContainer BodyContainer-first shadow roundBorder'>Loading...</p>
            ) : error ? (
                <p className='BodyContainer BodyContainer-first shadow roundBorder'>Error: {error}</p>
            ) : (
                <div className="dashboard-content">
                    {/* Line Chart */}
                    <div className='BodyContainer BodyContainer-first shadow roundBorder'>
                        Total of Monthly Expenses
                        <div>
                            <canvas id='expenseChart' ref={chartRef}></canvas>
                        </div>
                    </div>

                    {/* Receipts widget */}
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
                            {filteredReceipts
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
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                    {/* Donut Chart */}
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
                                            { filteredReceipts.reduce((total, item) => total + item.TotalAmount, 0).toFixed(2) }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                
                </div>
            )}
        </div>
    );
};
export default Dashboard;
