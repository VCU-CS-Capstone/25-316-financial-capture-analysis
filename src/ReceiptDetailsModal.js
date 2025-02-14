import React, { useState } from 'react';
import './UploadModal.css'; 

const ReceiptDetailsModal = ({ receipt, onClose }) => {
    const [showFullImage, setShowFullImage] = useState(false);

    //HANDLE EDIT AND HANDLE DELETE NEED TO BE IMPLEMENTED! PLACEHOLDERS FOR NOW
    const handleEdit = () => {
        alert("Edit functionality COMING SOON");
    };
    const handleDelete = () => {
        if (window.confirm("Are you sure you would like to delete this receipt?")) {
            alert("DELETE FUNCTIONALITY COMING SOON :) ");
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Receipt Details</h2>
                <div className="receipt-details" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div className="receipt-info">
                        <p><strong>Vendor Name:</strong> {receipt.VendorName || 'N/A'}</p>
                        <p><strong>Address:</strong> {receipt.VendorAddress || 'N/A'}</p>
                        <p><strong>Date of Transaction:</strong> {receipt.Date || 'N/A'}</p>
                        <p><strong>Upload Date:</strong> {receipt.UploadDate}</p>
                        <p><strong>Expense Category:</strong> {receipt.ExpenseType || 'N/A'}</p>
                        <p><strong>Total Spent:</strong> ${receipt.TotalAmount}</p>
                    </div>
                    <div className="receipt-image-container" style={{ flexShrink: 0, textAlign: 'right' }}>
                        {receipt.ImageURL ? (
                            <img 
                                src={receipt.ImageURL} 
                                alt="Receipt" 
                                className="receipt-thumbnail" 
                                style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'contain', marginLeft: '20px' }}
                                onClick={() => setShowFullImage(true)}
                            />
                        ) : (
                            <p>No Image Available</p>
                        )}
                        <p>
                            <button className="view-image-button" onClick={() => setShowFullImage(true)}>
                                View Full Image
                            </button>
                        </p>
                    </div>
                </div>
                <div className="modal-buttons">
                    <button onClick={handleEdit} className="edit-button">Edit Receipt Details</button>
                    <button onClick={handleDelete} className="delete-button">Delete Receipt</button>
                </div>
            </div>
            
            {showFullImage && (
                <div className="image-modal" onClick={() => setShowFullImage(false)}>
                    <div className="image-modal-content">
                        <button className="close-button" onClick={() => setShowFullImage(false)}>&times;</button>
                        <img src={receipt.imageURL} alt="Full Receipt" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceiptDetailsModal;