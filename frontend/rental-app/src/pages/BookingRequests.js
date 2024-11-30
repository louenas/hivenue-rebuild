// frontend/rental-app/src/pages/BookingRequests.js

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import BookingItem from '../components/BookingItem';
import './BookingRequests.css'; // Optional: For custom styles

const BookingRequests = () => {
  const { authData } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/bookings/pending`, {
          headers: { 'Authorization': `Bearer ${authData.token}` }
        });
        setBookings(res.data.bookings);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch bookings.');
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [authData.token]);
  
  // Update booking status locally after approve/deny
  const handleUpdate = (bookingId, newStatus) => {
    setBookings(bookings.map(booking => 
      booking._id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  // Render loading, error, or bookings table
  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  
  return (
    <div className="booking-requests-container">
      <h2>Booking Requests</h2>
      {bookings.length === 0 ? (
        <p>No booking requests found.</p>
      ) : (
        <table className="booking-requests-table">
          <thead>
            <tr>
              <th>Tenant Name</th>
              <th>Apartment</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Documentation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <BookingItem 
                key={booking._id} 
                booking={booking} 
                authData={authData} 
                onUpdate={handleUpdate} 
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingRequests;