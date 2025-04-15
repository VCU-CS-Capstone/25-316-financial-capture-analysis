import React, { Component } from 'react';
import { MenuItems } from './MenuItems';
import './NavBar.css';
import logo from './Capital_One_logo.png';
import { FiHelpCircle, FiSearch, FiMapPin, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const SignButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('../LoginSignup/LoginSignup');
  };

  return (
    <button className='SignButton' onClick={handleClick}>
      Sign in
    </button>
  );
};

class NavBar extends Component {
  render() {
    return (
      <nav className='NavBarItems'>
        <div className='navbar-left'>
          <img className='logo' src={logo} alt='Capital One Logo' />
        </div>

        <ul className='nav-menu'>
          {MenuItems.map((item, index) => (
            <li key={index}>
              <a
                className={item.cName}
                href={item.url}
                style={{ textDecoration: 'none', color: 'black' }}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>

        <div className='nav-right'>
          <div className='nav-icons'>
            <FiSearch />
            <FiHelpCircle />
            <FiMapPin />
            <FiUser />
          </div>
          <SignButton />
        </div>
      </nav>
    );
  }
}

export default NavBar;
