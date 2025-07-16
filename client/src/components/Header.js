import React, {useState, useEffect} from 'react';

import {Link} from 'react-router';
import Auth from '../utils/auth';
import LoginPopup from '../pages/LoginPopup';

const Header = ({ username }) => {

    const logout = (event) => {
        event.preventDefault();
        Auth.logout();
        window.location.assign('/');
    };

    const routechangerules = () => {
        window.location.assign("/rules")
    };
    const routechangelogin = () => {
        window.location.assign("/login")
    };
    const routechangesignup = () => {
        window.location.assign("/signup")
    };

    return (
    
        
    <header className="app-header">
      <h1 className="logo">
        <Link to="/">TradingAlgae</Link>
      </h1>

      <nav className="nav">
        <Link to="/">Dashboard</Link>
        <Link to="/">Settings</Link>
        <LoginPopup></LoginPopup>
      </nav>

    </header>
    );
};

export default Header;