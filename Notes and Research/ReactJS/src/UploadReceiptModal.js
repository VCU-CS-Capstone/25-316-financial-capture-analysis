import React, { useRef, useState, useEffect } from 'react';
import './UploadModal.css'; // CSS file for styling

function UploadReceiptModal({ isOpen, onClose }) {
    const fileInputRef = useRef(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [loadingDots, setLoadingDots] = useState('');
    const [ocrResult, setOcrResult] = useState(null);

    useEffect(() => {
        if (uploadStatus === 'Uploading') {
            const interval = setInterval(() => {
                setLoadingDots(prev => {
                    if (prev.length >= 3) return ''; // Reset after '...'
                    return prev + '.';
                });
            }, 200); // Adjust the speed as necessary
            return () => clearInterval(interval);
        }
    }, [uploadStatus]);

    if (!isOpen) return null;

    const handleUploadClick = () => {
        fileInputRef.current.click(); // Programmatically triggers the file input click
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
                    setOcrResult({
                        TotalSpent: data.TotalSpent || 'N/A',
                        VendorName: data.VendorName || 'N/A',
                        VendorAddress: data.VendorAddress || 'N/A',
                        TransactionDate: data.TransactionDate || 'N/A',
                    });
                    setUploadStatus('Upload successful!');
                } else {
                    const errorData = await response.json();
                    setUploadStatus(`Error: ${errorData.error}`);
                }
            } catch (error) {
                setUploadStatus(`Upload failed: ${error.message}`);
            }
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
                {uploadStatus && <p>{uploadStatus}{uploadStatus === 'Uploading' ? loadingDots : ''}</p>}
                {ocrResult && (
                    <div>
                        <h3>OCR Result:</h3>
                        <p><strong>Total Spent:</strong> {ocrResult.TotalSpent}</p>
                        <p><strong>Vendor Name:</strong> {ocrResult.VendorName}</p>
                        <p><strong>Vendor Address:</strong> {ocrResult.VendorAddress}</p>
                        <p><strong>Date:</strong> {ocrResult.TransactionDate}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UploadReceiptModal;
