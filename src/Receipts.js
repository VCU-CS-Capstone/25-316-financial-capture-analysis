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

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://fryt5r9woh.execute-api.us-east-1.amazonaws.com/items');
            if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }

            const result = await response.json();
            setData(result);

            setTableKeys(result.map(item => item.PK + item.SK));
            const uniqueCategories = [...new Set(result.map(item => item.ExpenseType).filter(Boolean))];
            setDropDownCategories(uniqueCategories);

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
        if (!updatedReceipt || !updatedReceipt.PK || !updatedReceipt.SK) return;
        const updatedKey = updatedReceipt.PK + updatedReceipt.SK;

        const filteredChangedFields = Object.keys(changedFields).reduce((acc, key) => {
            if (changedFields[key]) acc[key] = true;
            return acc;
        }, {});

        if (Object.keys(filteredChangedFields).length === 0) return;

        setLastUpdatedFields({ key: updatedKey, fields: filteredChangedFields });
        setTimeout(() => setLastUpdatedFields(null), 3000);
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

    useEffect(() => { fetchData(); }, []);

    const handleCategoryChange = (option) => {
        setSelectedCategory(option.value);
    };

    const handleEdit = (receipt) => {
        setSelectedReceipt(receipt);
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (newReceipt) closeUploadModal(newReceipt);
    }, [newReceipt]);

    const closeUploadModal = (newReceipt) => {
        console.log("Receipts.js: closeUploadModal triggered", newReceipt);
        setIsUploadModalOpen(false);
    
        if (newReceipt && newReceipt.PK && newReceipt.SK) {
            const newKey = newReceipt.PK + newReceipt.SK;
            console.log("New receipt key:", newKey);
    
            // Set highlight state BEFORE fetch
            if (!tableKeys.includes(newKey)) {
                console.log("New receipt detected – highlighting row:", newKey);
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
            }
    
            // Refresh data after highlighting state is set
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
                    <div className='table-wrapper' style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                        <Table 
                            data={filteredReceipts} 
                            onEdit={handleEdit} 
                            lastUpdatedReceipt={lastUpdatedReceipt}
                            lastUpdatedFields={lastUpdatedFields}
                            highlightRowKey={highlightRowKey}
                        />
                    </div>
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
