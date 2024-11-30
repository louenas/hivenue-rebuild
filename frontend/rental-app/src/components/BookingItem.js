// frontend/rental-app/src/components/BookingItem.js

import React from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const BookingItem = ({ booking, authData, onUpdate }) => {
  // Handle Approve Booking
  const handleApprove = async () => {
    if (window.confirm('Are you sure you want to approve this booking?')) {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/bookings/${booking._id}/approve`, {}, {
          headers: { 'Authorization': `Bearer ${authData.token}` }
        });
        onUpdate(booking._id, 'approved');
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to approve booking.');
      }
    }
  };

  // Handle Deny Booking
  const handleDeny = async () => {
    if (window.confirm('Are you sure you want to deny this booking?')) {
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/bookings/${booking._id}/reject`, {}, {
          headers: { 'Authorization': `Bearer ${authData.token}` }
        });
        onUpdate(booking._id, 'denied');
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to deny booking.');
      }
    }
  };

  return (
    <tr>
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
            <button className="approve-button" onClick={handleApprove}>Approve</button>
            <button className="deny-button" onClick={handleDeny}>Deny</button>
          </>
        )}
        {booking.status !== 'pending' && <span>--</span>}
      </td>
    </tr>
  );
};

export default BookingItem;