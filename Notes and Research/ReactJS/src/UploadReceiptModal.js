import React, { useRef, useState, useEffect } from 'react';
import './UploadModal.css';

function UploadReceiptModal({ isOpen, onClose }) {
    const fileInputRef = useRef(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [loadingDots, setLoadingDots] = useState('');
    const [ocrResult, setOcrResult] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);

    useEffect(() => {
        if (uploadStatus === 'Uploading') {
            const interval = setInterval(() => {
                setLoadingDots(prev => {
                    if (prev.length >= 3) return '';
                    return prev + '.';
                }, 200);
                return () => clearInterval(interval);
            });
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
                    });
                    setEditedData({
                        TotalAmount: data.TotalAmount || '',
                        VendorName: data.VendorName || '',
                        VendorAddress: data.VendorAddress || '',
                        TransactionDate: data.TransactionDate || '',
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
        setEditedData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleConfirm = async () => {
        console.log("Data being sent to database:", editedData);
        try {
            const response = await fetch('http://localhost:5000/confirm-receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedData),
            });

            if (response.ok) {
                alert('Receipt data saved successfully!');
                setOcrResult(null);
                setEditedData(null);
                setUploadStatus('');
                onClose();
            } else {
                alert('Failed to save receipt data.');
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Receipt Upload Instructions</h2>
                <ul style={{ textAlign: 'left' }}>
                    <li>Place the receipt on a dark, flat surface with the receipt centered in the frame.</li>
                    <li>Minimize any objects or clutter around the receipt to avoid interference.</li>
                </ul>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <button className="upload-button" onClick={handleUploadClick}>Upload Receipt</button>
                <button className="close-button" onClick={onClose}>Close</button>
                {uploadStatus && <p className="upload-status">{uploadStatus}{uploadStatus === 'Uploading' ? loadingDots : ''}</p>}
                {ocrResult && (
                    <div>
                        <h5>Please Confirm the following values:</h5>
                        <div style={{ textAlign: 'left', marginLeft: '20px' }}>
                            {Object.entries(editedData).map(([key, value]) => (
                                <div key={key}>
                                    <label><strong>{key}:</strong></label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name={key}
                                            value={value}
                                            onChange={handleEditChange}
                                            style={{ marginLeft: '10px' }}
                                        />
                                    ) : (
                                        <span style={{ marginLeft: '10px' }}> {value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        {!isEditing ? (
                            <div className="ocr-buttons">
                                <button onClick={() => setIsEditing(true)}>Edit</button>
                                <button onClick={handleConfirm}>Confirm</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(false)}>Done Editing</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UploadReceiptModal;
