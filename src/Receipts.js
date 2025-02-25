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
    const [filteredReceipts, setFilteredReceipts] = useState([]);

    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatCurrency = (value) => {
        let num = parseFloat(value.toString().replace(/[^0-9.]/g, "")) || 0; // Remove non-numeric characters
        return `${num.toFixed(2)}`; // Ensure two decimal places
    };

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/get-receipts'); 
            if (!response.ok) throw new Error('Failed to fetch receipts');

            let receipts = await response.json();

            // Apply currency formatting
            receipts = receipts.map(receipt => ({
                ...receipt,
                TotalAmount: formatCurrency(receipt.TotalAmount) // Ensure formatting is maintained
            }));

            setData(receipts);
            setFilteredReceipts(receipts);
        } catch (error) {
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
        fetchReceipts();
    };
  
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
                {/* NEW TABLE */}
                <Table data={data} openModal={openModal}/>

                {isModalOpen && selectedReceipt && (
                    <ReceiptDetailsModal
                        receipt={selectedReceipt}
                        onClose={closeModal}
                        refreshReceipts={fetchReceipts}
                    />
                )}
            </div>
        </div>
    );
};

export default Receipts;
