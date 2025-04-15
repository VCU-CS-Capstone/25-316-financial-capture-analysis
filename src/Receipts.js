import React, { useEffect, useState } from 'react';
import { DateRangePicker } from 'rsuite';
import './App.css';
import './DashboardChart/Dashboard.css';
import 'rsuite/dist/rsuite.min.css';
import Dropdown from 'react-dropdown';
import ReceiptDetailsModal from './ReceiptDetailsModal';
import Table from "./SortableTable/Table";

const Receipts = ({ newReceipt }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [dateRange, setDateRange] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [dropDownCategories, setDropDownCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredReceipts, setFilteredReceipts] = useState();
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastUpdatedReceipt, setLastUpdatedReceipt] = useState(null);
    const [lastUpdatedFields, setLastUpdatedFields] = useState(null);
    const [tableKeys, setTableKeys] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [highlightRowKey, setHighlightRowKey] = useState(null);

    // Function for retrieving data from the DynamoDB table
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://fryt5r9woh.execute-api.us-east-1.amazonaws.com/items');
            // const response = await fetch('http://localhost:5000/get-all-receipts'); // New response using flask_app.py

            if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }

            const result = await response.json();
            setData(result);

            setTableKeys(result.map(item => item.PK + item.SK)); // Used for tracking new receipt uploads for highlighting
            console.log("Receipts, table keys are ", tableKeys);

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
                return true;
            })();

            const isCategoryValid = selectedCategory === "None" || selectedCategory == null || item.ExpenseType === selectedCategory;
            const isSearchValid = searchTerm ? item.VendorName?.toLowerCase().includes(searchTerm.toLowerCase()) : true;

            return isDateValid && isCategoryValid && isSearchValid;
        });
    };

    const clearFilters = () => {
        setDateRange([]);
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

    useEffect(() => {
        console.log("Receipts, New receipt value just passed in: ", newReceipt);
    }, [newReceipt]);

    // This useEffect is only activated when all filter options are cleared, which can only happen with `clearFilters()` above
    useEffect(() => {
        if (dateRange.length === 0 && selectedCategory === null && searchTerm === "") {
            fetchData();
        }
    }, [dateRange, selectedCategory, searchTerm]);

    const closeModal = () => {
        setSelectedReceipt(null);
        setIsModalOpen(false);
        fetchData();
    };
  
    const handleDateChange = (range) => {
        if (!range || range.length !== 2) {
            setDateRange([]);
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

    useEffect(() => {
        if (newReceipt) {
            console.log("Receipts.js: New receipt received via props:", newReceipt);
            closeUploadModal(newReceipt);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newReceipt]);

    const closeUploadModal = (newReceipt) => {
        console.log("Receipts.js: closeUploadModal triggered", newReceipt);
        // Optionally, if you're using a separate upload modal state, close it:
        setIsUploadModalOpen(false);
    
        if (newReceipt && newReceipt.PK && newReceipt.SK) {
            // Merge the new receipt into your existing data
            setData(prevData => {
                const updatedData = [...prevData, newReceipt];
                setFilteredReceipts(filterReceipts(updatedData, dateRange, selectedCategory, searchTerm));
                return updatedData;
            });
    
            // Build the key for the new receipt
            const newKey = newReceipt.PK + newReceipt.SK;
            console.log("Receipts.js: New receipt key:", newKey);
    
            // Check if this key already exists in the pre-upload snapshot
            if (!tableKeys.includes(newKey)) {
                console.log("Receipts.js: New receipt detected – highlighting row:", newKey);
                setLastUpdatedFields({
                    key: newKey,
                    fields: {
                        Date: true,
                        VendorName: true,
                        ExpenseType: true,
                        TotalAmount: true,
                        UploadDate: true,
                    },
                });
                setHighlightRowKey(newKey);
                setTimeout(() => {
                    console.log("Removing highlight for new upload:", newKey);
                    setHighlightRowKey(null);
                    setLastUpdatedFields(null);
                }, 3000); // Or whatever duration your highlight animation needs               
            }
    
            // Optionally, trigger a refresh of the data if needed:
            fetchData();
        }
    };

    return (
        <div className='dashboard-wrapper'>
            <h1 className='Headings'>Receipts</h1>
            
            <div className='filter-row'>
                <DateRangePicker placeholder='Select Date Range' onChange={handleDateChange} value={dateRange} format='MM/dd/yyyy' showOneCalendar showTime={false} />
                <Dropdown options={dropDownCategories} onChange={handleCategoryChange} placeholder='Select a category' value={selectedCategory} />
                <button className='clear-button roundBorder' onClick={clearFilters}>Clear</button>
                <button className='filter-button roundBorder' onClick={fetchData}>Search</button>
                <input type='text' className='search-bar' placeholder='Search receipts...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchData()} />
            </div>
    
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
                        highlightRowKey={highlightRowKey}
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
