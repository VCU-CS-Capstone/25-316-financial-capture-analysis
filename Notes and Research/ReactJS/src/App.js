
import './App.css';
import './Dashboard.js';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard.js';
import Receipts from './Receipts.js';
import Navbar from './NavBar/Navbar.js'
import LoginSignup from './LoginSignup/LoginSignup.js';



function DashButton(){
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('./DashBoard')
  }

  return(
    <>
      <div>
        <button className='SideButtons' onClick={handleClick}>Dashboard</button>
      </div>
    </>
  )
}

function RecButton(){
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('./Receipts')
  }
  return(
    <>
      <div>
        <button className='SideButtons'onClick={handleClick}>Receipts</button>
      </div>
    </>
  )
}

function DealButton(){
  return(
    <>
      <div>
        <button className='SideButtons'>Nearby Deals</button>
      </div>
    </>
  )
}

function UploadButton(){
  return(
    <>
      <div>
        <button className='RecButton'>Upload Receipt</button>
      </div>
    </>
  )
}

const Line = ({ color }) => (
  <hr
    style={{
      color: "#f2f2f2",
      backgroundColor: "#f2f2f2",
      height: 3
    }}
  />
)

function App() {
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
        <UploadButton />

    </div>
    </BrowserRouter>
  );
}

export default App;
