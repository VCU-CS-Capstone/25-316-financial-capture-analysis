import { useEffect, useState } from "react";

const TableBody = ({ tableData, columns, onEdit, lastUpdatedFields }) => { 
    const [fadingFields, setFadingFields] = useState({});

    useEffect(() => {
        if (lastUpdatedFields) {
            // Delay the fade-out effect
            const fadeTimeout = setTimeout(() => {
                setFadingFields(lastUpdatedFields.fields);
            }, 2000); // Apply fade effect after 2 seconds

            return () => clearTimeout(fadeTimeout);
        } else {
            // Reset fading fields when update is cleared
            setFadingFields({});
        }
    }, [lastUpdatedFields]);

    return (
        <tbody>
            {tableData.map((data, index) => {
                const rowKey = data.PK + data.SK;
                const isUpdatedRow = lastUpdatedFields?.key === rowKey;
                
                return (
                    <tr key={index}>
                        {columns.map(({ accessor }) => {
                            const isHighlighted = isUpdatedRow && lastUpdatedFields.fields[accessor];
                            const isFading = isUpdatedRow && fadingFields[accessor];
                            
                            if(isHighlighted) {
                                console.log("Highlighted Row Key:", rowKey, "Field:", accessor, "isHighlighted:", isHighlighted);
                            }
                            if (accessor === "TotalAmount") {
                                let tData = parseFloat(data[accessor]);

                                if (isNaN(tData)) { tData = 0; }

                                return (
                                    <td key={accessor} className={`${isHighlighted ? "highlight-cell" : ""} 
                                                ${isFading ? "fade-out" : ""}`}>
                                        {tData.toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                        })}
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
                                <td key={accessor} className={`${isHighlighted ? "highlight-cell" : ""} 
                                                ${isFading ? "fade-out" : ""}`}>
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
