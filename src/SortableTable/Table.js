// import React, { useEffect, useState } from 'react';
import TableBody from "./TableBody";
import TableHead from "./TableHead";
import { useSortableTable } from "./useSortableTable";
// NOTE: Table.js, TableBody.js, and TableHead.js was made following this tutorial
// https://blog.logrocket.com/creating-react-sortable-table/#creating-table-markup-react

const Table = ({ data, openModal, onEdit, lastUpdatedFields, lastUpdatedReceipt }) => {
    // const [data, setData] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);

    const columns = [
        { label: "Transaction Date", accessor: "Date", sortable: true },
        { label: "Upload Date", accessor: "UploadDate", sortable: true },
        { label: "Total Amount", accessor: "TotalAmount", sortable: true },
        { label: "Merchant", accessor: "VendorName", sortable: true },
        { label: "Category", accessor: "ExpenseType", sortable: true },
        { label: "View Receipt", accessor: "Actions", sortable: false },
    ];

    const [sortedData, handleSorting] = useSortableTable(data, columns);
    
    // if (loading) return <p className='BodyContainer BodyContainer-first shadow roundBorder'>Loading...</p>;
    // if (error) return <p className='BodyContainer BodyContainer-first shadow roundBorder'>Error: {error}</p>;
    
    return (
        <>
            <table className="table">
                <TableHead columns={columns} handleSorting={handleSorting} />
                <TableBody 
                    columns={columns} 
                    tableData={sortedData} 
                    onEdit={onEdit}
                    lastUpdatedReceipt={lastUpdatedReceipt}  // Pass highlight 
                    lastUpdatedFields={lastUpdatedFields}
                />
            </table>
        </>
    );
};

export default Table;
