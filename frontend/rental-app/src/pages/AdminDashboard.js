// frontend/rental-app/src/pages/AdminDashboard.js
import React, { useEffect, useState, useContext } from 'react';
import axios from '../utils/axiosConfig'; // Use the configured Axios instance
import { AuthContext } from '../contexts/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { authData, logout } = useContext(AuthContext);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookingRequests = async () => {
      try {
        const response = await axios.get('/bookings/pending');
        setBookingRequests(response.data.bookings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking requests:', err);
        if (err.response && err.response.status === 401) {
          logout(); // Automatically log out if unauthorized
        }
        setError('Failed to fetch booking requests.');
        setLoading(false);
      }
    };

    if (authData.token) {
      fetchBookingRequests();
    } else {
      setLoading(false);
      setError('No authentication token found.');
    }
  }, [authData.token, logout]);

  const handleApprove = async (id, role) => {
    try {
      const route = role === 'owner' ? 'owner-approve' : 'admin-approve';
      const status = role === 'owner' ? 'owner_approved' : 'admin_approved';
      await axios.post(`/bookings/${id}/${route}`);
      setBookingRequests(
        bookingRequests.map((booking) =>
          booking._id === id ? { ...booking, status: `${status}` } : booking
        )
      );
    } catch (err) {
      console.error('Error approving booking:', err);
      setError('Failed to approve booking.');
    }
  };

  const handleDeny = async (id) => {
    try {
      await axios.post(`/bookings/${id}/reject`);
      setBookingRequests(
        bookingRequests.map((booking) =>
          booking._id === id ? { ...booking, status: 'admin_denied' } : booking
        )
      );
    } catch (err) {
      console.error('Error denying booking:', err);
      setError('Failed to deny booking.');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <p>Loading booking requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      {bookingRequests.length === 0 ? (
        <p>No pending booking requests.</p>
      ) : (
        <ul className="booking-requests">
          
          {bookingRequests.map((booking) => (
            <li key={booking._id} className="booking-request">
              <h3>Booking ID: {booking._id}</h3>
              <p><strong>Apartment:</strong> {booking.apartment.name}</p>
              <p><strong>Tenant:</strong> {booking.tenant.name}</p>
              <p><strong>Start Date:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(booking.endDate).toLocaleDateString()}</p>
              <p><strong>Amount:</strong> ${booking.amount}</p>
              <p><strong>Status:</strong> {booking.status}</p>
              {/* Action Buttons */}
              {booking.status === 'Pending' && ( 
                <div className="actions">
                  <button onClick={() => handleApprove(booking._id, 'admin')}>Approve</button>
                  <button onClick={() => handleDeny(booking._id)}>Deny</button>
                </div>
              )}
              {booking.status === 'Admin Approved' && (
                <div className="actions">
                  <button onClick={() => handleApprove(booking._id, 'owner')}>Approve</button>
                  <button onClick={() => handleDeny(booking._id)}>Deny</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;