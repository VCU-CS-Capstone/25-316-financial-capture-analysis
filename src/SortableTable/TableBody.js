import { useEffect, useState } from "react";

const TableBody = ({ tableData, columns, onEdit, lastUpdatedFields, highlightRowKey }) => { 
    const [fadingFields, setFadingFields] = useState({});

    useEffect(() => {
        if (lastUpdatedFields) {
            const fadeTimeout = setTimeout(() => {
                setFadingFields(lastUpdatedFields.fields);
            }, 2000); // Apply fade effect after 2 seconds
            return () => clearTimeout(fadeTimeout);
        } else {
            setFadingFields({});
        }
    }, [lastUpdatedFields]);

    return (
        
        <tbody>
            {tableData.map((data, index) => {
                const rowKey = data.PK + data.SK;
                const isEditedRow = lastUpdatedFields && lastUpdatedFields.key === rowKey;
                const isNewRow = highlightRowKey && highlightRowKey === rowKey;
                
                return (
                    <tr key={index}>
                        {columns.map(({ accessor }) => {
                            let isHighlighted = false;
                            // For edited receipts, highlight only if the field was changed.
                            if (isEditedRow) {
                                isHighlighted = lastUpdatedFields.fields[accessor];
                            } 
                            // For new receipts, highlight all cells in the row.
                            else if (isNewRow) {
                                isHighlighted = true;
                            }
                            
                            // Determine fade-out only for edited receipts (or optionally for new rows)
                            let isFading = false;
                            if (isEditedRow) {
                                isFading = fadingFields[accessor];
                            } 
                            // Optionally, you could also apply fade-out for new rows
                            // else if (isNewRow) {
                            //     isFading = fadingFields[accessor];
                            // }

                            // Log for debugging when a cell is highlighted
                            if (isHighlighted) {
                                console.log("Highlighted Row Key:", rowKey, "Field:", accessor, "isHighlighted:", isHighlighted);
                            }
                            
                            if (accessor === "TotalAmount") {
                                let tData = parseFloat(data[accessor]);
                                if (isNaN(tData)) { tData = 0; }
                                return (
                                    <td key={accessor} className={`${isHighlighted ? "highlight-cell" : ""} ${isFading ? "fade-out" : ""}`}>
                                        {tData.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                                    </td>
                                );
                            }
    
                            if (accessor === "Actions") {
                                return (
                                    <td key={accessor}>
                                        <button onClick={() => onEdit(data)} className="view-receipt-button">
                                            View Receipt Details
                                        </button>
                                    </td>
                                );
                            }
    
                            return (
                                <td 
                                    key={accessor}
                                    className={`${isHighlighted ? "highlight-cell" : ""} ${isFading ? "fade-out" : ""}`}
                                >
                                    {data[accessor]}
                                </td>
                            );
                        })}
                    </tr>
                );
            })}
        </tbody>
    );
};

export default TableBody;
