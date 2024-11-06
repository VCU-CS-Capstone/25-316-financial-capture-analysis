import './App.css';
import './Dashboard.js';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard.js';
import Receipts from './Receipts.js';
import Navbar from './NavBar/Navbar.js';
import LoginSignup from './LoginSignup/LoginSignup.js';
import UploadReceiptModal from './UploadReceiptModal';
import React, { useState } from 'react';

function DashButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('./DashBoard');
  };

  return (
    <>
      <div>
        <button className='SideButtons' onClick={handleClick}>Dashboard</button>
      </div>
    </>
  );
}

function RecButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('./Receipts');
  };
  return (
    <>
      <div>
        <button className='SideButtons' onClick={handleClick}>My Receipts</button>
      </div>
    </>
  );
}

function DealButton() {
  return (
    <>
      <div>
        <button className='SideButtons'>Nearby Deals</button>
      </div>
    </>
  );
}

function UploadButton({ openModal }) {
  return (
    <>
      <div>
        <button className='RecButton' onClick={openModal}>Upload New Receipt</button>
      </div>
    </>
  );
}

const Line = ({ color }) => (
  <hr
    style={{
      color: "#f2f2f2",
      backgroundColor: "#f2f2f2",
      height: 3
    }}
  />
);

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <BrowserRouter>
      <div style={{
        backgroundColor: '#f5f5f5',
        height: '989px'
      }}>
        <Navbar />
        <Routes>
          <Route path="/DashBoard" element={<Dashboard />} />
          <Route path="/Receipts" element={<Receipts />} />
        </Routes>
        <DashButton />
        <RecButton />
        <DealButton />
        <UploadButton openModal={openModal} />
        <UploadReceiptModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </BrowserRouter>
  );
}

export default App;
