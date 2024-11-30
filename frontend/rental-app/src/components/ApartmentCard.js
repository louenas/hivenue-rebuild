import React from 'react';
import { Link } from 'react-router-dom';
import './ApartmentCard.css';

const ApartmentCard = ({ apartment }) => {
  return (
    <div className="apartment-card">
      <img
        src={apartment.images[0]}
        alt={apartment.title}
        className="apartment-card-image"
      />
      <div className="apartment-card-details">
        <h3>{apartment.title}</h3>
        <p className="location">{apartment.city} - ${apartment.pricePerMonth}/month</p>
        <Link to={`/apartments/${apartment._id}`} className="view-details">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ApartmentCard;