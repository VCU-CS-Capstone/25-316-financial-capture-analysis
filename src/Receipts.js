import React, { useEffect, useState } from 'react';
import { DateRangePicker } from 'rsuite';
import './App.css';
import './DashboardChart/Dashboard.css';
import 'rsuite/dist/rsuite.min.css';
import Dropdown from 'react-dropdown';
import ReceiptDetailsModal from './ReceiptDetailsModal';
import Table from "./SortableTable/Table";

const Receipts = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [dropDownCategories, setDropDownCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredReceipts, setFilteredReceipts] = useState();
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastUpdatedReceipt, setLastUpdatedReceipt] = useState(null);
    const [lastUpdatedFields, setLastUpdatedFields] = useState(null);

    // Function for retrieving data from the DynamoDB table
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://fryt5r9woh.execute-api.us-east-1.amazonaws.com/items');  // Old response using AWS API
            // const response = await fetch('http://localhost:5000/get-all-receipts'); // New response using flask_app.py
            
            if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }
    
            const result = await response.json();
            setData(result);
    
            const uniqueCategories = [...new Set(result.map(item => item.ExpenseType).filter(Boolean))];
            setDropDownCategories(uniqueCategories); // Store unique categories before applying search filters
    
            const applySearchFilters = filterReceipts(result, dateRange, selectedCategory, searchTerm);
            setFilteredReceipts(applySearchFilters);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

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
    
            const isCategoryValid = selectedCategory
                ? item.ExpenseType === selectedCategory  // Apply category filter
                : true;  // No filter applied if null
    
            const isSearchValid = searchTerm
                ? item.VendorName?.toLowerCase().includes(searchTerm.toLowerCase()) // Apply search filter
                : true;  // No filter applied if empty
    
            return isDateValid && isCategoryValid && isSearchValid;
        });
    };

    const clearFilters = () => {
        setDateRange([null, null]);
        setSelectedCategory(null);
        setSearchTerm(""); 
    };

    const refreshReceipts = async (updatedReceipt, changedFields) => {
        if (!updatedReceipt || !updatedReceipt.PK || !updatedReceipt.SK) {
            console.warn("refreshReceipts called without an updated receipt");
            return;
        }
    
        const updatedKey = updatedReceipt.PK + updatedReceipt.SK;
    
        // Filter out only the fields that actually changed
        const filteredChangedFields = Object.keys(changedFields).reduce((acc, key) => {
            if (changedFields[key]) acc[key] = true; // Only keep fields explicitly marked as changed
            return acc;
        }, {});
    
        console.log("Highlighting updated fields:", filteredChangedFields);

        // If no fields were actually changed, do nothing
        if (Object.keys(filteredChangedFields).length === 0) {
            console.log("No valid changes detected. Skipping highlight.");
            return;
        }
    
        // Ensure only modified fields are tracked
        setLastUpdatedFields({ key: updatedKey, fields: filteredChangedFields });
    
        // Delay fetching new data so the highlight is applied first
        setTimeout(async () => {
            console.log("Removing highlight for:", updatedKey);
            setLastUpdatedFields(null); // Only clear after new data loads
        }, 3000);
    };
    

    // This useEffect is only activated when all filter options are cleared, which can only happen with `clearFilters()` above
    useEffect(() => {
        if (dateRange[0] === null && selectedCategory === null && searchTerm === "") {
            fetchData();
        }
    }, [dateRange, selectedCategory, searchTerm]);

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
        if (!range || range.length !== 2) {
            setDateRange([null, null]);
        } else {
            setDateRange(range);
        }
    };
    

    // Get the data as soon as the page loads up
    useEffect(() => {
        fetchData();
    }, []);
    
    const handleCategoryChange = (option) => {
        setSelectedCategory(option.value); // Update state with the selected category
    };

    const handleEdit = (receipt) => {
        setSelectedReceipt(receipt);
        setIsModalOpen(true);
    };
    

    return (
        <div>
            <h1 className='Headings'>Receipts</h1>
            <DateRangePicker showOneCalendar size="sm" className='Subheading' placeholder="Select Date Range" onChange={handleDateChange}/>
            <div className='Subheading-category dropdown-menu'>
                <Dropdown
                    options={dropDownCategories}
                    onChange={handleCategoryChange}
                    placeholder="Select a category"
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
    
            {/* Conditional Rendering for Loading/Error */}
            {loading ? (
                <p className='BodyContainer BodyContainer-first shadow roundBorder'>Loading...</p>
            ) : error ? (
                <p className='BodyContainer BodyContainer-first shadow roundBorder'>Error: {error}</p>
            ) : (
                <div className='BodyContainer BodyContainer-wide shadow roundBorder'>
                    <Table 
                        data={filteredReceipts} 
                        onEdit={handleEdit} 
                        lastUpdatedReceipt={lastUpdatedReceipt}
                        lastUpdatedFields={lastUpdatedFields}
                    />

    
                    {isModalOpen && selectedReceipt && (
                        <ReceiptDetailsModal
                            receipt={selectedReceipt}
                            onClose={closeModal}
                            refreshReceipts={refreshReceipts}
                        />
                    )}
                </div>
            )}
        </div>
    );
    
};

export default Receipts;
