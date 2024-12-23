import React, { useEffect, useState } from 'react';
import { DateRangePicker } from 'rsuite';
import './App.css';
import './DashboardChart/Dashboard.css';
import 'rsuite/dist/rsuite.min.css';

const Receipts = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState([null, null]);
  
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
            <DateRangePicker showOneCalendar size="sm" format="yyyy/MM/dd" className='Subheading' onChange={handleDateChange}/>
            <div className='BodyContainer BodyContainer-wide shadow roundBorder'>
                <table >
                    <thead className='roundBorder'>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Total Items</th>
                        <th>Merchant</th>
                        <th>Address</th>
                        <th>Image</th>
                        <th>Category</th>
                    </thead>
                    <tbody>
                        {data.filter(
                            item => {
                                if (dateRange && dateRange.length === 2) {
                                    // Get the start and end date of the date-range-picker
                                    const [startDate, endDate] = dateRange;
                                    const isValidStart = startDate instanceof Date && !isNaN(startDate);
                                    const isValidEnd = endDate instanceof Date && !isNaN(endDate);

                                    // We only apply the range to the table if the user has a defined date range (start and end) set
                                    // As well as making sure it is a valid date (no empty values).
                                    if (isValidStart && isValidEnd) {
                                        const itemDate = new Date(item.Date);
                                        return itemDate >= startDate && itemDate <= endDate;
                                    }
                                }
                                return true;
                            }).sort((a, b) => new Date(b.Date) - new Date(a.Date))
                            .map((item, index) => (
                            <tr key={index}>
                                <td>{item.Date}</td>
                                <td>${item.TotalAmount}</td>
                                <td>{item.TotalItems}</td>
                                <td>{item.VendorName}</td>
                                <td>{item.VendorAddress}</td>
                                <td>{item.ImageURL}</td>
                                <td>{item.ExpenseType}</td>
                            </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Receipts;
