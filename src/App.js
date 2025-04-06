import React, { useState, useEffect } from 'react';
import './App.css';
import './Dashboard.js';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard.js';
import Receipts from './Receipts.js';
import Navbar from './NavBar/Navbar.js';
import LoginSignup from './LoginSignup/LoginSignup.js';
import UploadReceiptModal from './UploadReceiptModal';

function DashButton(){
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('./DashBoard');
  };

  return (
    <div>
      <button className='SideButtons' onClick={handleClick}>Dashboard</button>
    </div>
  );
}

function RecButton(){
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('./Receipts');
  };

  return (
    <div>
      <button className='SideButtons' onClick={handleClick}>My Receipts</button>
    </div>
  );
}

function UploadButton({ onClick }) {
  return (
    <div>
      <button className='RecButton' onClick={onClick}>Upload Receipt</button>
    </div>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReceipt, setNewReceipt] = useState(null);
  
  // When the upload modal calls onUploadSuccess, store the new receipt.
  const handleUploadSuccess = (receipt) => {
    console.log("App: handleUploadSuccess called with", receipt);
    setNewReceipt(receipt);
    setIsModalOpen(false);
  };

  useEffect(() => {
    console.log("App.js: newReceipt state changed to:", newReceipt);
  }, [newReceipt]);

  return (
    <BrowserRouter>
      <div style={{
        backgroundColor: '#f5f5f5',
        height: '989px',
      }}>
        <Navbar />
        <Routes>
          {/* Add a default route for "/" */}
          <Route path="/" element={<Dashboard />} />

          {/* Existing routes */}
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Receipts" element={<Receipts newReceipt={newReceipt} />} />

          {/* Fallback route for undefined paths */}
          <Route path="*" element={<Dashboard />} />
        </Routes>

        <DashButton />
        <RecButton />
        <UploadButton onClick={() => setIsModalOpen(true)} />
        
        {isModalOpen && (
          <UploadReceiptModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </div>

    </BrowserRouter>
  );
}

export default App;
