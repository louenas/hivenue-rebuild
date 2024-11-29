// frontend/rental-app/src/pages/BookingRequests.js

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/bookings`, {
          headers: { 'Authorization': `Bearer ${authData.token}` }
        });
        setBookings(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch bookings.');
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [authData.token]);
  
  // Handle Approve Booking
  const handleApprove = async (bookingId) => {
    if (window.confirm('Are you sure you want to approve this booking?')) {
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/bookings/${bookingId}/approve`, {}, {
          headers: { 'Authorization': `Bearer ${authData.token}` }
        });
        // Update booking status locally
        setBookings(bookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: 'approved' } : booking
        ));
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to approve booking.');
      }
    }
  };
  
  // Handle Deny Booking
  const handleDeny = async (bookingId) => {
    if (window.confirm('Are you sure you want to deny this booking?')) {
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/bookings/${bookingId}/deny`, {}, {
          headers: { 'Authorization': `Bearer ${authData.token}` }
        });
        // Update booking status locally
        setBookings(bookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: 'denied' } : booking
        ));
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to deny booking.');
      }
    }
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
              <tr key={booking._id}>
                <td>{booking.tenant.name}</td>
                <td>{booking.apartment.title}</td>
                <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                <td>
                  {booking.documentation ? (
                    <a href={booking.documentation} target="_blank" rel="noopener noreferrer">
                      View Docs
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{booking.status}</td>
                <td>
                  {booking.status === 'pending' && (
                    <>
                      <button 
                        className="approve-button" 
                        onClick={() => handleApprove(booking._id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="deny-button" 
                        onClick={() => handleDeny(booking._id)}
                      >
                        Deny
                      </button>
                    </>
                  )}
                  {booking.status !== 'pending' && (
                    <span>--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingRequests;