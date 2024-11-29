// frontend/rental-app/src/components/Navbar.js

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Navbar.css'; // Ensure this path is correct

const Navbar = () => {
  const { authData, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <h2 className="navbar-logo"><Link to="/">RentalApp</Link></h2>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        {!authData.token && <li><Link to="/login">Login</Link></li>}
        {!authData.token && <li><Link to="/register/tenant">Register</Link></li>}
        {authData.token && <li><Link to="/admin">Dashboard</Link></li>}
        {authData.token && <li><Link to="/bookings">Bookings</Link></li>}
        {authData.token && <li><button onClick={logout} className="logout-button">Logout</button></li>}
      </ul>
    </nav>
  );
};

export default Navbar;