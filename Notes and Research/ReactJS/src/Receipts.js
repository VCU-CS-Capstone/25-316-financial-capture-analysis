import React, { useEffect, useState } from 'react';
import { DateRangePicker } from 'rsuite';
import './App.css';

import './DashboardChart/Dashboard.css';

const Receipts = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
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
  
    if (loading) return <p className='BodyContainer BodyContainer-first shadow roundBorder'>Loading...</p>;
    if (error) return <p className='BodyContainer BodyContainer-first shadow roundBorder'>Error: {error}</p>;

    return (
        <div>
            <h1 className='Headings'>Receipts</h1>
            <DateRangePicker className='Subheading' />
            <div className='BodyContainer BodyContainer-wide shadow roundBorder'>
                <table >
                    <tr className='roundBorder'>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Total Items</th>
                        <th>Vendor</th>
                        <th>Address</th>
                        <th>Image</th>
                        <th>Expense</th>
                    </tr>
                    <tbody>
                    {data.sort((a, b) => new Date(b.Date) - new Date(a.Date)).map((item, index) => (
                        <tr key={index}>
                            <td>{item.Date}</td>
                            <td>{item.TotalAmount}</td>
                            <td>{item.TotalItems}</td>
                            <td>{item.VendorName}</td>
                            <td>{item.VendorAddress}</td>
                            <td>{item.ImageURL}</td>
                            <td>{item.ExpenseType}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>


                {/* <ul>
                    {data.map((item, index) => (
                        <li key={index}>{item.SK}</li>
                    ))}
                </ul> */}
            </div>
        </div>
    );
};

export default Receipts;
