import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { DateRangePicker } from 'rsuite';
import './DashboardChart/Dashboard.css';
import './DashboardChart/expenseDonutChart.js';
import Dropdown from 'react-dropdown';


const Dashboard = () => {
    const chartRef = useRef(null);
    const myChartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');

            if (myChartRef.current) {
                myChartRef.current.destroy();
            }

            myChartRef.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Red', 'Blue', 'Yellow'],
                    datasets: [{
                        label: 'Dataset',
                        data: [300, 50, 100],
                        backgroundColor: [
                            'rgb(255, 99, 132)',
                            'rgb(54, 162, 235)',
                            'rgb(255, 205, 86)'
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'left'
                        }
                    }
                }
            });
        }

        return () => {
            if (myChartRef.current) {
                myChartRef.current.destroy();
            }
        };
    }, []);

    return (
        <div>
            <h1 className='Headings'>Dashboard</h1>
            <DateRangePicker className='Subheading' />
            <div className='flexContainer'>

                <div className='BodyContainer BodyContainer-first shadow roundBorder'>
                    Total Expenses
                    <div style={{ width: '300px' }}>
                        <canvas id='donutchart' ref={chartRef}></canvas>
                    </div>
                </div>
    
                <div className='BodyContainer BodyContainer-second shadow roundBorder'>
                    Placeholder
                </div>
            
            </div>
        </div>
    );
};
export default Dashboard;