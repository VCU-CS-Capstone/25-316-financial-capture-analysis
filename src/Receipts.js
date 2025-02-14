import React, { useEffect, useState } from 'react';
import { DateRangePicker } from 'rsuite';
import './App.css';
import './DashboardChart/Dashboard.css';
import 'rsuite/dist/rsuite.min.css';
import Dropdown from 'react-dropdown';

const Receipts = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState([null, null]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredReceipts, setFilteredReceipts] = useState([]);
  
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
    
    const handleCategoryChange = (option) => {
        setSelectedCategory(option.value); // Update state with the selected category
    };
  
    if (loading) return <p className='BodyContainer BodyContainer-first shadow roundBorder'>Loading...</p>;
    if (error) return <p className='BodyContainer BodyContainer-first shadow roundBorder'>Error: {error}</p>;

    return (
        <div>
            <h1 className='Headings'>Receipts</h1>
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
            <div className='BodyContainer BodyContainer-wide shadow roundBorder'>
                <table >
                    <thead className='roundBorder'>
                        <th>Transaction Date</th>
                        <th>Upload Date</th>
                        <th>Total Amount</th>
                        <th>Total Items</th>
                        <th>Merchant</th>
                        <th>Address</th>
                        <th>Image</th>
                        <th>Category</th>
                    </thead>
                    <tbody>
                    {data
                        .filter(item => {
                            // Date filtering
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

                            // Category filtering
                            const isCategoryValid = selectedCategory
                                ? item.ExpenseType === selectedCategory
                                : true; // No category filtering if none selected

                            // Search term filtering
                            const isSearchTermValid = (() => {
                                if (!searchTerm.trim()) return true; // No search term filtering
                                const lowercasedTerm = searchTerm.toLowerCase();
                                return (
                                    item.VendorName?.toLowerCase().includes(lowercasedTerm) ||
                                    item.VendorAddress?.toLowerCase().includes(lowercasedTerm) ||
                                    String(item.TotalAmount).toLowerCase().includes(lowercasedTerm) ||
                                    item.ExpenseType?.toLowerCase().includes(lowercasedTerm)
                                );
                            })();

                            return isDateValid && isCategoryValid && isSearchTermValid;
                        })
                        .sort((a, b) => new Date(b.Date) - new Date(a.Date)) // Sort by date
                        .map((item, index) => (
                            <tr key={index}>
                                <td>{item.Date}</td>
                                <td>{item.UploadDate}</td>
                                <td>{(item.TotalAmount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                <td>{item.TotalItems}</td>
                                <td>{item.VendorName}</td>
                                <td>{item.VendorAddress}</td>
                                <td>
                                {item.ImageURL ? (
                                    <a
                                    href={item.ImageURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    >
                                    View Receipt
                                    </a>
                                ) : (
                                    'No Image'
                                )}
                                </td>
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
