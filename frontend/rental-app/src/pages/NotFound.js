// frontend/rental-app/src/pages/NotFound.js

import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; // Optional: For custom styles

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="home-link">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;