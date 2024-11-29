// src/pages/ApartmentDetail.js

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import BookingForm from '../components/BookingForm';
import Modal from 'react-modal';
import './ApartmentDetail.css';

// Bind modal to the app element for accessibility
Modal.setAppElement('#root');

const ApartmentDetail = () => {
  const { id } = useParams();
  const { authData } = useContext(AuthContext);
  const [apartment, setApartment] = useState(null);
  const [error, setError] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Fetch apartment details from the backend
  const fetchApartment = async () => {
    try {
      const res = await axios.get(`/api/apartments/${id}`);
      console.log('Apartment data fetched:', res.data);
      setApartment(res.data);
    } catch (err) {
      console.error('Error fetching apartment:', err);
      setError(`Error fetching apartment: ${err.response?.data?.message || err.message}`);
    }
  };

  useEffect(() => {
    fetchApartment();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    console.log('Auth Data:', authData);
    if (authData.user) {
      console.log('User Role:', authData.user.role);
    }
  }, [authData]);

  // Handle opening the modal
  const openModal = () => {
    console.log('Opening Booking Form Modal');
    setModalIsOpen(true);
  };

  // Handle closing the modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  if (error) return <p>{error}</p>;
  if (!apartment) return <div>Loading...</div>;

  return (
    <div className="apartment-detail-container">
      <h2>{apartment.title}</h2>
      <div className="image-gallery">
        {apartment.images.map((img, index) => (
          <img key={index} src={img} alt={`${apartment.title} ${index + 1}`} className="apartment-image" />
        ))}
      </div>
      <p><strong>Price:</strong> ${apartment.price}/month</p>
      <p><strong>Location:</strong> {apartment.address}, {apartment.city}</p>
      <p><strong>Description:</strong> {apartment.description}</p>
      <p><strong>Amenities:</strong> {apartment.amenities.join(', ')}</p>
      
      {authData.user && authData.user.role === 'tenant' && (
        <>
          <button onClick={openModal} className="book-now-button">Book Now</button>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Booking Form"
            className="booking-modal"
            overlayClassName="booking-overlay"
          >
            <button onClick={closeModal} className="close-modal-button">X</button>
            <BookingForm apartmentId={apartment._id} />
          </Modal>
        </>
      )}
    </div>
  );
};

export default ApartmentDetail;