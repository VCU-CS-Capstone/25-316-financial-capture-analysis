import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { DateRangePicker } from 'rsuite';
import './DashboardChart/Dashboard.css';
import './DashboardChart/expenseDonutChart.js';
// import Dropdown from 'react-dropdown';


const Dashboard = () => {
    const chartRef = useRef(null);
    const lineChartRef = useRef(null);
    const donutChartRef = useRef(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentDate = new Date();
    const currentDay = currentDate.getDate();                                                                //Gets current date
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
        
        //Initialize Line Chart
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            const transactionsPerDay = calculateDailyTransactions();    //Gets the transaction data per day
            const toCurrentDayData = transactionsPerDay.slice(0, currentDay);

             // Destroy previous instance if exists
             if (lineChartRef.current) {
                lineChartRef.current.destroy();
            }
            lineChartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: xlabels,
                    datasets: [{
                        label: data,
                        data: toCurrentDayData,
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales:{
                        x:{
                            title:{
                                display: true,
                                text: currentMonthName
                            }
                        }
                    }
                }
            });
        }
        
        // Initialize Donut Chart
        if (donutChartRef.current) {
            const ctx = donutChartRef.current.getContext('2d');

            
            donutChartRef.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['red','yellow','blue'],
                    datasets: [{
                        data: ['1','2','3'],
                        backgroundColor: ['#FF5733', '#33FF57', '#3357FF'], // Custom colors
                    }]
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

        return () => {
            if (lineChartRef.current) {
                lineChartRef.current.destroy();
            }
            
        };

    }, []);

    return (
        <div>
            <h1 className='Headings'>Dashboard</h1>
            <DateRangePicker className='Subheading' />
            <div className='flexContainer'>
                <div className='BodyContainer BodyContainer-first shadow roundBorder'>
                    Total of Monthly Expenses
                    <div>
                        <canvas id='expenseChart' ref={chartRef}></canvas>
                    </div>
                </div>
    
                <div className='BodyContainer BodyContainer-second shadow roundBorder'>
                    Top 15 Expenses this Year
                    <div>
                        <table >
                            <tr className='roundBorder'>
                                <th>Date</th>
                                <th>Total Amount</th>
                                <th>Total Items</th>
                                <th>Vendor</th>
                                <th>Expense</th>
                            </tr>
                            <tbody>
                                {filterYearData.sort((a, b) => b.TotalAmount - a.TotalAmount).slice(0,15).map((item, index) => (    //Sorts the filtered data by total amount (decending)
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
                    Expense Category Breakdown
                    <div className='BodyContainer-third shadow roundBorder chart'>
                        <canvas className='donutChart' ref={donutChartRef}></canvas>
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