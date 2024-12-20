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
    const [dateRange, setDateRange] = useState([null, null]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const currentDate = new Date();
    const currentDay = currentDate.getDate();                                                       //Gets current date
    const currentYear = new Date().getFullYear();                                                   //Gets current year
    const currentMonthIndex = currentDate.getMonth();                                               //Gets current month
    const currentMonthName = new Intl.DateTimeFormat('en-US', {month: 'long'}).format(currentDate); //Gets current month name
    const daysInMonth = new Date(new Date().getFullYear(), currentMonthIndex, 0).getDate();         //Gets the number of days in current month
    // Generates x-axis labels 1 to n days in the current month
    const xlabels = [];
    for (let i =1; i <=daysInMonth; i++){
        xlabels.push(i);
    }
    // Filters the data to only incude items from the current year
    const filterYearData = data.filter(item => {
        const itemsYear = new Date(item.Date).getFullYear();                    //extracts the year
        return itemsYear === currentYear;                                       //only keeps items from the current year
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
        const transactionsPerDay = new Array(daysInMonth).fill(0);              //Array initialized with 0's for each day of the month

        filterMonthData.forEach(item => {
            const itemDate = new Date(item.Date);
            const dayOfMonth = itemDate.getDate();                              //Gets the day of the month
            if (dayOfMonth >= 1 && dayOfMonth <= daysInMonth){
                transactionsPerDay[dayOfMonth-1]++;                             //Increments the transaction count for that day
            }
        });
        return transactionsPerDay;                                              //Keeps the value as 0 if no transactions occurred
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
        if (data && donutChartRef.current) {
            // Filter data based on the date range, category, and validate the data
            const filteredData = data.filter(item => {
                // Only include items with valid values
                if (
                    !item.ExpenseType ||
                    typeof item.TotalAmount !== 'number' ||
                    isNaN(item.TotalAmount) ||
                    !item.Date ||
                    !item.VendorName
                ) {
                    console.warn("Invalid item encountered:", item);
                    return false;
                }

                // Validate the date range
                if (dateRange && dateRange.length === 2) {
                    const [startDate, endDate] = dateRange;
                    const isValidStart = startDate instanceof Date && !isNaN(startDate);
                    const isValidEnd = endDate instanceof Date && !isNaN(endDate);

                    if (isValidStart && isValidEnd) {
                        const itemDate = new Date(item.Date);
                        if (isNaN(itemDate)) {
                            console.warn("Invalid date in item:", item);
                            return false;
                        }
                        if (itemDate < startDate || itemDate > endDate) {
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

            // Aggregate data for chart labels and data
            const chartLabels = [...new Set(filteredData.map(item => item.ExpenseType))]; // Unique categories
            const chartData = chartLabels.map(
                label =>
                    filteredData
                        .filter(item => item.ExpenseType === label)
                        .reduce((sum, item) => sum + item.TotalAmount, 0)
            );

            // Debugging output
            console.log("Filtered Data:", filteredData);
            console.log("Chart Labels:", chartLabels);
            console.log("Chart Data:", chartData);

            // Ensure data is valid for charting
            if (!chartLabels.length || !chartData.length) {
                console.warn("No valid data for the chart.");
                return;
            }

            // Get the chart context
            const ctx = donutChartRef.current.getContext('2d');

            // Destroy existing chart instance to avoid duplication
            if (donutChartRef.current.chartInstance) {
                donutChartRef.current.chartInstance.destroy();
            }

            // Initialize new chart with filtered and aggregated data
            donutChartRef.current.chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            data: chartData,
                            backgroundColor: chartLabels.map(
                                () => `hsl(${Math.random() * 360}, 70%, 60%)` // Assign random colors
                            )
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
    }, [data, dateRange, selectedCategory]);


    const handleCategoryChange = (option) => {
        setSelectedCategory(option.value); // Update state with the selected category
    };

    // Initialize Line Chart
    // useEffect(() => {
        // if (data && chartRef.current) {
        //     const ctx = chartRef.current.getContext('2d');
        //     const transactionsPerDay = calculateDailyTransactions();    //Gets the transaction data per day
        //     const toCurrentDayData = transactionsPerDay.slice(0, currentDay);

        //     // Destroy previous instance if exists
        //     if (lineChartRef.current) {
        //         lineChartRef.current.destroy();
        //     }

        //     lineChartRef.current = new Chart(ctx, {
        //         type: 'line',
        //         data: {
        //             labels: xlabels,
        //             datasets: [{
        //                 label: data,
        //                 data: toCurrentDayData,
        //             }]
        //         },
        //         options: {
        //             plugins: {
        //                 legend: {
        //                     display: false
        //                 }
        //             },
        //             scales:{
        //                 x:{
        //                     title:{
        //                         display: true,
        //                         text: currentMonthName
        //                     }
        //                 }
        //             }
        //         }
        //     });
        // }
    // }, []);

    if (loading) return <p className='BodyContainer BodyContainer-first shadow roundBorder'>Loading...</p>;
    if (error) return <p className='BodyContainer BodyContainer-first shadow roundBorder'>Error: {error}</p>;

    return (
        <div>
            <h1 className='Headings'>Dashboard</h1>
            <DateRangePicker showOneCalendar size="sm" format="yyyy/MM/dd" className='Subheading' onChange={handleDateChange}/>
            <div className='Subheading-category'>
                <Dropdown
                    options={[...new Set(data.map(item => item.ExpenseType).filter(Boolean))]}
                    onChange={handleCategoryChange}
                    placeholder="Select a category"
                />
            </div>
            <div className='flexContainer'>
                <div className='BodyContainer BodyContainer-first shadow roundBorder'>
                    Total of Monthly Expenses
                    <div>
                        <canvas id='expenseChart' ref={chartRef}></canvas>
                    </div>
                </div>
    
                <div className='BodyContainer BodyContainer-second shadow roundBorder'>
                    <b>Top 15 Expenses this Year</b>
                <div>
                    <table>
                    <thead className='roundBorder'>
                        <tr>
                            <th>Date</th>
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
                                return true; // No date range filtering
                            })();

                            const isCategoryValid = selectedCategory
                                ? item.ExpenseType === selectedCategory
                                : true; // No category filtering if none selected

                            return isDateValid && isCategoryValid;
                        })
                        .sort((a, b) => new Date(b.Date) - new Date(a.Date)) // Sort by date
                        .map((item, index) => (
                            <tr key={index}>
                                <td>{item.Date}</td>
                                <td>{item.TotalAmount}</td>
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
                                        data.filter(item => {
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

                <div className='BodyContainer BodyContainer-fourth shadow roundBorder'>
                    Nearby Deals
                </div>

            </div>
        </div>
    );
};
export default Dashboard;