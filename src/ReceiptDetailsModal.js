import React, { useState, useEffect } from 'react';
import './UploadModal.css'; 

const ReceiptDetailsModal = ({ receipt, onClose, onSave, refreshReceipts }) => {
    const [showFullImage, setShowFullImage] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [expenseCategory, setExpenseCategory] = useState(receipt.ExpenseType || '');
    const [editedData, setEditedData] = useState({
        PK: receipt.PK,
        SK: receipt.SK,
        TotalAmount: receipt.TotalAmount || 0,
        VendorName: receipt.VendorName || '',
        VendorAddress: receipt.VendorAddress || '',
        TransactionDate: receipt.TransactionDate || receipt.Date || '',
        ExpenseType: receipt.ExpenseType || '', 
    });

    useEffect(() => {
        setEditedData({
            PK: receipt.PK,
            SK: receipt.SK,
            TotalAmount: receipt.TotalAmount || 0,
            VendorName: receipt.VendorName || '',
            VendorAddress: receipt.VendorAddress || '',
            TransactionDate: receipt.TransactionDate || receipt.Date || '',
            ExpenseType: receipt.ExpenseType || '', 
        });
    }, [receipt]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        console.log("Save button clicked");
        console.log("Edited Data:", editedData);
        try {
            console.log('Before setting isEditing:', isEditing);
            const response = await fetch(`${config.API_URL}/update-receipt', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedData)
            });
    
            console.log("Response Status:", response.status);
            console.log("Response Headers:", response.headers);
            const responseBody = await response.json().catch(() => null);
            console.log("Response Body:", responseBody);
            
            if (response.ok) {
                setIsEditing(false);
                console.log('After setting isEditing:', isEditing);
                
                // Validate PK and SK
                if (!editedData.PK || !editedData.SK) {
                    console.error("Missing PK or SK in request - Cannot fetch updated receipt");
                    return;
                }
    
                console.log("Fetching updated receipt with PK:", editedData.PK, "SK:", editedData.SK);
    
                // Fetch updated data immediately from backend
                const updatedReceiptResponse = await fetch(`${config.API_URL}get-receipt?PK=${encodeURIComponent(editedData.PK)}&SK=${encodeURIComponent(editedData.SK)}`);
                const updatedReceipt = await updatedReceiptResponse.json();
    
                if (updatedReceipt.error) {
                    console.error("Error fetching updated receipt:", updatedReceipt.error);
                    return;
                }
    
                console.log("Updated Receipt from AWS:", updatedReceipt);
               // refreshReceipts(updatedReceipt); // Fetch updated data from AWS after saving
                // **Ensure state updates correctly**
                setEditedData(prev => ({ ...prev, ...updatedReceipt }));         
            } else {
                console.error('Failed to update receipt:', responseBody);
            }
        } catch (error) {
            console.error('Error updating receipt:', error);
        }
    };
    

    const handleDeleteReceipt = async () => {
        try {
            const response = await fetch(`${config.API_URL}/delete-receipt', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ PK: receipt.PK, SK: receipt.SK })
            });

            if (!response.ok) {
                throw new Error('Failed to delete receipt');
            }

            console.log("Receipt deleted successfully");
            setShowDeleteSuccess(true);
        }catch (error) {
            console.error("Error deleting receipt:", error);
        }
    };

    const handleClose = () => {
        let changedFields = {}; // Track only the edited fields
    
        Object.keys(editedData).forEach((key) => {
            let oldValue = receipt[key];
            let newValue = editedData[key];
    
            // Ensure TotalAmount is always compared as a number
            if (key === "TotalAmount") {
                oldValue = parseFloat(oldValue);
                newValue = parseFloat(newValue);
            }
    
            // Normalize strings to avoid false positives
            if (typeof oldValue === "string") oldValue = oldValue.trim();
            if (typeof newValue === "string") newValue = newValue.trim();
    
            if (oldValue !== newValue) {
                changedFields[key] = true; // Mark only if there's a true difference
            }
        });
    
        console.log("Changed fields: ", changedFields);
        if (Object.keys(changedFields).length > 0) {
            console.log("Changes detected before closing modal.");
            refreshReceipts(editedData, changedFields); // Pass only actual changes
        }
    
        onClose(); // Close the modal
    };
    
    
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={handleClose}>&times;</button>
                <h2>Receipt Details</h2>
                <div className="receipt-details" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div className="receipt-info" style={{ flex: 1, textAlign: 'left' }}>
                        {isEditing ? (
                            <>
                                <label>Vendor: <input type="text" name="VendorName" value={editedData.VendorName} onChange={handleChange} /></label>
                                <label>Address: <input type="text" name="VendorAddress" value={editedData.VendorAddress} onChange={handleChange} /></label>
                                <label>Date of Transaction: <input type="text" name="TransactionDate" value={editedData.TransactionDate} onChange={handleChange} placeholder="MM/DD/YYYY"maxLength="10" /></label>
                                <label>Expense Type:
                                    <select
                                        id="ExpenseCategory"
                                        value={expenseCategory}
                                        onChange={(e) => {
                                            setExpenseCategory(e.target.value);
                                            setEditedData((prevData) => ({ ...prevData, ExpenseType: e.target.value }));
                                        }}
                                        style={{ padding: '5px', width: '200px' }}
                                    >
                                        <option value="" disabled>Select Category</option>
                                        <option value="Restaurant">Restaurant</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Gas">Gas</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Grocery">Grocery</option>
                                        <option value="Other">Other</option>
                                        <option value="Housing">Housing</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Travel">Travel</option>
                                        <option value="Insurance">Insurance</option>
                                        <option value="Healthcare/Medical">Healthcare/Medical</option>
                                        <option value="Education">Education</option>
                                        <option value="Transportation">Transportation</option>
                                        <option value="Subscriptions">Subscriptions</option>
                                        <option value="Gifts/Donations">Gifts/Donations</option>
                                        <option value="Childcare">Childcare</option>
                                        <option value="Personal Care">Personal Care</option>
                                        <option value="Pets">Pets</option>
                                    </select>
                                </label>
                                <label>Total Amount: <input type="text" name="TotalAmount" value={editedData.TotalAmount} onChange={handleChange} /></label>
                                <div className="button-group">
                                    {isEditing ? (
                                        <>
                                            <button className="edit-save-button" onClick={handleSave}>Save Changes</button>
                                            <button className="edit-cancel-button" onClick={() => setIsEditing(false)}>Cancel Changes</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={handleEditClick} className="edit-button">Edit Receipt Details</button>
                                            <button onClick={() => setShowDeleteConfirmation(true)} className="delete-button">Delete Receipt</button>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <p><strong>Vendor:</strong> {editedData.VendorName || 'N/A'}</p>
                                <p><strong>Address:</strong> {editedData.VendorAddress || 'N/A'}</p>
                                <p><strong>Date of Transaction:</strong> {editedData.TransactionDate || 'N/A'}</p>
                                <p><strong>Upload Date:</strong> {editedData.UploadDate}</p>
                                <p><strong>Expense Type:</strong> {editedData.ExpenseType || 'N/A'}</p>
                                <p><strong>Total Spent:</strong> ${editedData.TotalAmount}</p>                              
                            </>
                        )}
                    </div>
                    <div className="receipt-image-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {receipt.ImageURL ? (
                            <>
                                <img 
                                    src={receipt.ImageURL} 
                                    alt="Receipt Preview" 
                                    className="receipt-thumbnail"
                                    style={{ maxWidth: '200px', height: 'auto', borderRadius: '5px' }} 
                                />
                                <button 
                                    className="view-full-image-button" 
                                    style={{ marginTop: '10px' }}
                                    onClick={() => setShowFullImage(true)}
                                >
                                    View Full Image
                                </button>
                            </>
                        ) : (
                            <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'gray' }}>No image available</p>
                        )}
                    </div>
                </div>
                <div className="edit-delete-buttons">
                    {!isEditing && (
                        <>
                            <button onClick={handleEditClick} className="edit-button">Edit Receipt Details</button>
                            <button onClick={() => setShowDeleteConfirmation(true)} className="delete-button">Delete Receipt</button>
                        </>
                    )}
                </div>
                
            </div>
            
            

            {/* Full Image Modal */}
            {showFullImage && (
                <div className="image-modal">
                <div className="image-modal-content">
                    <img 
                        src={receipt.ImageURL} 
                        alt="Full Receipt" 
                    />
                    <button className="close-button" onClick={() => setShowFullImage(false)}>×</button>
                </div>
            </div>
            )}
            {showDeleteConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this receipt?</p>
                        <div className="delete-button-group">
                            <button onClick={handleDeleteReceipt} className="delete-confirm-changes">Yes, Delete</button>
                            <button onClick={() => setShowDeleteConfirmation(false)} className="delete-confirm-changes">No, Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showDeleteSuccess && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Receipt Deleted</h2>
                        <p>The receipt has been successfully deleted.</p>
                        <button onClick={() => window.location.reload()} className="close-button">Close</button>
                    </div>
                </div>
            )}

            
        </div>
    );
};

export default ReceiptDetailsModal;
