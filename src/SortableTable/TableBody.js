const TableBody = ({ tableData, columns, openModal }) => {
    return (
        <tbody>
            {tableData.map((data, index) => {
                return (
                    <tr key={index}>
                        {columns.map(({ accessor }) => {
                            if (accessor === "TotalAmount") {
                                let tData = parseFloat(data[accessor]);
                            
                                // Non-numeric values will default to $0.00
                                if (isNaN(tData)) { tData = 0; }
                            
                                return (
                                    <td key={accessor}>
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
                                        <button onClick={() => openModal(data)} className="view-receipt-button">
                                            View Receipt Details
                                        </button>
                                    </td>
                                );
                            }

                            const tData = data[accessor] ? data[accessor] : "——";
                            return <td key={accessor}>{tData}</td>;
                        })}
                    </tr>
                );
            })}
        </tbody>
    );
};

export default TableBody;
