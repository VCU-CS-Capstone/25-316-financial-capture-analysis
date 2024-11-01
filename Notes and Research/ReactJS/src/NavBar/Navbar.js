import React, { Component } from 'react';
import { MenuItems } from './MenuItems';
import './NavBar.css';
import logo from './Capital_One_logo.png'
import { FiHelpCircle } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import { FiMapPin } from "react-icons/fi";
import { FiUser } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import LoginSignup from '../LoginSignup/LoginSignup';

const SignButton = () => {
        const navigate = useNavigate();
      
        const handleClick = () => {
          navigate('../LoginSignup/LoginSignup')
        }
      
        return(
          <>
            <div>
              <button className='SignButton' onClick={handleClick}>Sign in</button>
            </div>
          </>
        )
    
}

class NavBar extends Component{

    render(){
        return(
            <nav className='NavBarItems'>
                <img className='logo' src={logo} alt="Logo" width='120' height='49' />
                <ul className='nav-menu'>
                    {MenuItems.map((item, index) => {
                        return (
                            <li key={index}>
                                <a className={item.cName} href={item.url} style={{ textDecoration: 'none', color: 'black' }}>
                                {item.title}
                                </a>
                            </li>
                        )
                    })}
                </ul>
                <div className='nav-icons'>
                    <FiSearch />
                    <FiHelpCircle />
                    <FiMapPin />
                    <FiUser/>
                    <SignButton />
                </div>
            </nav>
        )
    }
}

export default NavBar