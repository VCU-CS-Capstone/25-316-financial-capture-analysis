import { useState, useEffect } from "react";

// Sorting Function
function sortData(data, sortField, sortOrder, columns) {
    const sorted = [...data].sort((a, b) => {
        if (a[sortField] === null) return 1;
        if (b[sortField] === null) return -1;
        if (a[sortField] === null && b[sortField] === null) return 0;

        // Custom sorting for date
        if (sortField === "Date" || sortField === "UploadDate") {
            return (new Date(a[sortField]) - new Date(b[sortField])) * (sortOrder === "asc" ? 1 : -1);
        }

        // Normal sorting for other fields
        return a[sortField].toString().localeCompare(b[sortField].toString(), "en", {
            numeric: true,
        }) * (sortOrder === "asc" ? 1 : -1);
    });

    return sorted;
}

export const useSortableTable = (data, columns) => {
    const [tableData, setTableData] = useState([]);
    const [initialSortDone, setInitialSortDone] = useState(false);
    
    // A one-time useEffect to sort the table by date in descending order
    useEffect(() => {
        if (data.length > 0 && !initialSortDone) {
            const { accessor = "Date", sortbyOrder = "desc" } = columns.find(
                (column) => column.sortbyOrder
            ) || {};

            const sorted = sortData(data, accessor, sortbyOrder, columns);
            setTableData(sorted);
            setInitialSortDone(true);
        }
    }, [data, columns, initialSortDone]);

    const handleSorting = (sortField, sortOrder) => {
        if (sortField) {
            const sorted = sortData(data, sortField, sortOrder, columns);
            setTableData(sorted);
        }
    };

    return [tableData, handleSorting];
};
