import React, { useRef, useState, useEffect } from 'react';
import './UploadModal.css';
import config from './config'

function UploadReceiptModal({ isOpen, onClose, onUploadSuccess }) {
    const fileInputRef = useRef(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [loadingDots, setLoadingDots] = useState('');
    const [ocrResult, setOcrResult] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [expenseCategory, setExpenseCategory] = useState('');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    //animation for image/receipt uploading message
    useEffect(() => {
        if (uploadStatus === 'Uploading') {
            const interval = setInterval(() => {
                setLoadingDots(prev => (prev.length >= 3 ? '' : prev + '.'));
            }, 400); // Adjust this value to slow down the animation
    
            return () => clearInterval(interval); 
        }
    }, [uploadStatus]);
    
    if (!isOpen) return null;

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                setUploadStatus('Uploading');
                const response = await fetch('http://localhost:5000/upload-receipt', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Backend Response:", data);
                    setOcrResult({
                        TotalAmount: data.TotalAmount || '',
                        VendorName: data.VendorName || '',
                        VendorAddress: data.VendorAddress || '',
                        TransactionDate: data.TransactionDate || '',
                        ImageURL: data.ImageURL || data.mageURL || '',
                    });
                    setEditedData({
                        TotalAmount: data.TotalAmount || '',
                        VendorName: data.VendorName || '',
                        VendorAddress: data.VendorAddress || '',
                        TransactionDate: data.TransactionDate || '',
                        ImageURL: data.ImageURL || '',
                        ExpenseCategory: '', 
                    });
                    setUploadStatus('Upload successful!');
                } else {
                    const errorData = await response.json();
                    console.log("Error Response:", errorData);
                    setUploadStatus(`Error: ${errorData.error}`);
                }
            } catch (error) {
                console.log("Upload Failed Error:", error);
                setUploadStatus(`Upload failed: ${error.message}`);
            }
        }
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        
        if (name === "transactionDate") {
            // Validate that the input is a valid date
            const isValidDate = !isNaN(new Date(value).getTime());
            if (!isValidDate) return; // Ignore invalid entries
        }
        
        setEditedData(prev => ({
            ...prev,
            [name]: value.trim() === "" ? "Not detected" : value, // Restore 'Not detected' if empty
        }));
    };
    

    const handleCategoryConfirm = (category) => {
        setExpenseCategory(category);
        setEditedData(prev => ({
            ...prev,
            ExpenseCategory: category,
        }));
    };

    const handleConfirm = async () => {
        if (!expenseCategory) {
            alert("Please select an expense category before confirming!");
            return;
        }
        
        const payload = {
            ...editedData,
            ExpenseType: expenseCategory,
        };

        console.log("Data being sent to database:", payload);

        try {
            const response = await fetch(`${config.API_URL}/confirm-receipt` , {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Backend error response:", errorText);
                throw new Error(`Failed to save receipt data: ${errorText}`);
            }

            const responseData = await response.json();
            console.log("Response from backend:", responseData);
            alert('Receipt data saved successfully!');
            setOcrResult(null);
            setEditedData(null);
            setUploadStatus('');
            setExpenseCategory('');
            onUploadSuccess(responseData);
            onClose();
        } catch (error) {
            console.error("Fetch error:", error);
            alert(`Error: ${error.message}`);
        }
    };

    const toggleZoom = () => { setIsZoomed((prevZoom) => !prevZoom);}; //used for zooming in on images.  note this currently isn't working
    /*
    gotta make this work somehow, the inputs of the function should take in ImageURL but the imagemodal takes in editedData.ImageURL
    editedData.ImageURL won't work, it just needs to take in a independent variable or something idk I'll figure it out
    */

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                {!ocrResult && (
                    <>
                        <h2 style={{ fontSize: '25px', textAlign: 'left' }}>Photo Tips</h2>
                        <h2 style={{ fontSize: '17px', textAlign: 'left' }}>For best results-</h2>
                        <ul style={{ textAlign: 'left' }}>
                        <li>Place the receipt on a dark, flat surface with the receipt centered in the frame.</li>
                        <li>Minimize any objects or clutter around the receipt to avoid interference.</li>
                        <li>Position the camera directly over your receipt, not at an angle</li>
                        </ul>
                        <button className="upload-button" onClick={handleUploadClick}>Upload Receipt</button>
                    </>
                )}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                {uploadStatus && <p className="upload-status">{uploadStatus}{uploadStatus === 'Uploading' ? loadingDots : ''}</p>}
                {ocrResult && (
                    <div>
                        <h5>Please confirm the following values and select an expense category:</h5>
                        <div style={{ textAlign: 'left', marginLeft: '20px', marginBottom: '20px' }}>
                            {/*Displays receipt values extracted on the URM for the user to review*/}
                            {Object.entries(editedData).map(([key, value]) => (
                                key !== 'ExpenseCategory' && key !== 'ImageURL' && ( // Exclude ExpenseCategory since it has its own dropdown, and image URL cause that is irrelevant to the user
                                    <div key={key} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                        <label style={{ fontWeight: 'bold', minWidth: '150px' }}>{key === "ImageURL" ? "Image URL" : key.replace(/([A-Z])/g, ' $1').trim()}:</label> {/* fix for 'Image URL being displayed as Image U R L, probably safe to delete but idk */}
                                        {isEditing ? (
                                            key === "transactionDate" ? (
                                                <input
                                                    type="date"
                                                    name={key}
                                                    value={value || ""}
                                                    max={new Date().toISOString().split("T")[0]} // Prevents future dates
                                                    onChange={handleEditChange}
                                                    style={{ padding: '5px', width: '200px' }}
                                                    />
                                                ) : (
                                                    // Regular text input for all other fields
                                                    <input
                                                        type="text"
                                                        name={key}
                                                        value={value === "Not detected" ? "" : value} // Handles missing values
                                                        placeholder="Not detected"
                                                        onChange={handleEditChange}
                                                        style={{ padding: '5px', width: '200px' }}
                                                    />
                                                )
                                            ) : (
                                                <span style={{ marginLeft: '10px' }}>
                                                    {value && value.trim() ? value : <i style={{ color: 'gray' }}>Not detected</i>}
                                                </span>
                                            )}
                                    </div>
                                )
                            ))}

                            {/* Image pop up window */}
                            {editedData.ImageURL && (
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ fontWeight: 'bold', minWidth: '150px' }}>Receipt Image: </label>
                                    <button
                                        className="view-image-button"
                                        onClick={() => setIsImageModalOpen(true)}
                                        style={{ marginLeft: '50px' }}
                                    >
                                     View Image
                                    </button>
                                </div>
                            )}

                            {/* Expense Category Dropdown  */}
                            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                <label htmlFor="expenseCategory" style={{ fontWeight: 'bold', minWidth: '150px' }}>Expense Category:</label>
                                <select
                                    id="expenseCategory"
                                    value={expenseCategory}
                                    onChange={(e) => {
                                        setExpenseCategory(e.target.value);
                                        setEditedData((prev) => ({
                                            ...prev,
                                            ExpenseCategory: e.target.value,
                                        }));
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
                                    <option value="Subscriptions">Subscriptions</option>
                                    <option value="Transportation">Transportation</option>
                                    <option value="Gifts/Donations">Gifts/Donations</option>
                                    <option value="Childcare">Childcare</option>
                                    <option value="Personal Care">Personal Care</option>
                                    <option value="Pets">Pets</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Cleaning Supplies">Cleaning Supplies</option>
                                </select>
                            </div>
                        </div>

                        {!isEditing ? (
                            <div className="ocr-buttons" style={{ marginTop: '10px' }}>
                                <button className="upload-button" onClick={() => setIsEditing(true)}>Edit</button>
                                <button className="upload-button" onClick={handleConfirm} disabled={!expenseCategory} title={!expenseCategory ? "Please Select an expense category" : ""}>
                                    Confirm
                                </button>
                            </div>
                        ) : (
                            <button className="upload-button" onClick={() => setIsEditing(false)}>Done Editing</button>
                        )}
                    </div>
                    
                )}
                {/* Image Modal */}
                {isImageModalOpen && (
                    <div className="image-modal">
                        <div className="image-modal-content">
                            <button className="close-button" style={{ position: 'absolute', top: '-7px', right: '2px' }} onClick={() => setIsImageModalOpen(false)}>&times;</button>
                            <img src={editedData.ImageURL} 
                            alt="Receipt"
                            className={`receipt-image ${isZoomed ? "zoomed" : ""}`}
                            onClick={toggleZoom}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UploadReceiptModal;
