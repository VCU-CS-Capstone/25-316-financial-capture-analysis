import logo from './logo.svg';
import './App.css';
import './Dashboard.js';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard.js';
import Receipts from './Receipts.js';


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
      color: "#D3D3D3",
      backgroundColor: "#D3D3D3",
      height: 3
    }}
  />
)

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/DashBoard" element={<Dashboard />} />
          <Route path="/Receipts" element={<Receipts />} />
        </Routes>
        <h1>Capital One</h1>
        <Line/>
        <DashButton />
        <RecButton />
        <DealButton />
        <UploadButton />
    </div>
    </BrowserRouter>
  );
}

export default App;
