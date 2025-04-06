import TableBody from "./TableBody";
import TableHead from "./TableHead";
import { useSortableTable } from "./useSortableTable";

const Table = ({ data, lastUpdatedReceipt, onEdit, lastUpdatedFields, highlightRowKey }) => {
    const columns = [
        { label: "Transaction Date", accessor: "Date", sortable: true },
        { label: "Upload Date", accessor: "UploadDate", sortable: true },
        { label: "Total Amount", accessor: "TotalAmount", sortable: true },
        { label: "Merchant", accessor: "VendorName", sortable: true },
        { label: "Category", accessor: "ExpenseType", sortable: true },
        { label: "View Receipt", accessor: "Actions", sortable: false },
    ];

    const [sortedData, handleSorting] = useSortableTable(data, columns);

    return (
        <>
            <table className="table">
                <TableHead columns={columns} handleSorting={handleSorting} />
                <TableBody 
                    columns={columns} 
                    tableData={sortedData} 
                    onEdit={onEdit}
                    lastUpdatedReceipt={lastUpdatedReceipt}  // Pass highlight to individual cell
                    lastUpdatedFields={lastUpdatedFields}
                    highlightRowKey={highlightRowKey} // Pass highlight to an entire row when uploaded
                />
            </table>
        </>
    );
};

export default Table;
