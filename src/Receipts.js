import React, { useEffect, useState } from 'react';
import { DateRangePicker } from 'rsuite';
import './App.css';
import './DashboardChart/Dashboard.css';
import 'rsuite/dist/rsuite.min.css';
import Dropdown from 'react-dropdown';
import ReceiptDetailsModal from './ReceiptDetailsModal';
import Table from "./SortableTable/Table";

const Receipts = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState([null, null]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState("");
    // const [filteredReceipts, setFilteredReceipts] = useState([]);

    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // const formatCurrency = (value) => {
    //     let num = parseFloat(value.toString().replace(/[^0-9.]/g, "")) || 0; // Remove non-numeric characters
    //     return `${num.toFixed(2)}`; // Ensure two decimal places
    // };

    // Function for retrieving data from the DynamoDB table
    const fetchData = async () => {
        console.log("FETCHING DATA: \nDate: %s\nCategory: %s\nFiltered Receipts: %s", dateRange, selectedCategory, searchTerm);
        try {
            setLoading(true);
            const response = await fetch('https://fryt5r9woh.execute-api.us-east-1.amazonaws.com/items');
            
            if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const openModal = (receiptData) => {
        setSelectedReceipt(receiptData);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedReceipt(null);
        setIsModalOpen(false);
        fetchData();
    };
  
    const handleDateChange = (range) => {
        setDateRange(range);
    
        if (range && range.length === 2) {
            const [startDate, endDate] = range;
        }
    };

    // Get the data as soon as the page loads up
    useEffect(() => {
        fetchData();
    }, []);
    
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
            <button className='Subheading-category roundBorder filter-button' onClick={fetchData}>Search</button>
            <input
                type="text"
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="Subheading-category search-bar"
            />
            <div className='BodyContainer BodyContainer-wide shadow roundBorder'>
                <Table data={data} openModal={openModal}/>

                {isModalOpen && selectedReceipt && (
                    <ReceiptDetailsModal
                        receipt={selectedReceipt}
                        onClose={closeModal}
                    />
                )}
            </div>
        </div>
    );
};

export default Receipts;