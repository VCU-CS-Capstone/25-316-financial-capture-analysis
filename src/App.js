import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard.js';
import Receipts from './Receipts.js';
import Navbar from './NavBar/Navbar.js';
import LoginSignup from './LoginSignup/LoginSignup.js';
import UploadReceiptModal from './UploadReceiptModal';

// === Sidebar Buttons ===
function DashButton() {
  const navigate = useNavigate();
  return (
    <button className='SideButtons' onClick={() => navigate('/DashBoard')}>Dashboard</button>
  );
}

function RecButton() {
  const navigate = useNavigate();
  return (
    <button className='SideButtons' onClick={() => navigate('/Receipts')}>My Receipts</button>
  );
}

function UploadButton({ onClick }) {
  return (
    <button className='RecButton' onClick={onClick}>Upload Receipt</button>
  );
}

// === Main App ===
function App() {
  const [newReceipt, setNewReceipt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadClick = () => {
    setIsModalOpen(true);
  };

  const handleUploadSuccess = (receipt) => {
    console.log('App: handleUploadSuccess called with', receipt);
    setNewReceipt(receipt);
    setIsModalOpen(false);
  };

  useEffect(() => {
    console.log('App.js: newReceipt state changed to:', newReceipt);
  }, [newReceipt]);

  return (
    <BrowserRouter>
      <div className="app-root">
        {/* Top Navbar */}
        <Navbar />

        {/* Main section under navbar */}
        <div className="app-layout">
          {/* Sidebar on the left */}
          <div className="sidebar">
            <div>
              <DashButton />
              <RecButton />
              <UploadButton onClick={handleUploadClick} />
            </div>
          </div>

          {/* Content on the right */}
          <div className="main-content" style={{ overflowY: 'auto', maxHeight: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/DashBoard" element={<Dashboard />} />
              <Route path="/Receipts" element={<Receipts newReceipt={newReceipt}/>} />
            </Routes>
          </div>
        </div>

        {/* Modal for Upload Receipt */}
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
