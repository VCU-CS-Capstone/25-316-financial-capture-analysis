const TableBody = ({ tableData, columns, openModal }) => {
    return (
        <tbody>
            {tableData.map((data, index) => {
                return (
                    <tr key={index}>
                        {columns.map(({ accessor }) => {
                            if (accessor === "TotalAmount") {
                                const tData = data[accessor] ? data[accessor] : "——";
                                return (
                                    <td key={accessor}>
                                        {(tData || 0).toLocaleString("en-US", {
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
