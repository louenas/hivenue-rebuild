// src/components/BookingForm.js

import React, { useState, useContext, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../contexts/AuthContext';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './BookingForm.css'; // Optional: Create a CSS file for styling

const BookingForm = ({ apartmentId }) => {
  const { authData } = useContext(AuthContext);
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    documentation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const { startDate, endDate, documentation } = formData;

  useEffect(() => {
    // Create SetupIntent when the component mounts
    const createSetupIntent = async () => {
      try {
        const res = await axios.post('/payments/create-setup-intent', {}, {
          headers: {
            'Authorization': `Bearer ${authData.token}`
          }
        });
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error('Error creating SetupIntent:', err);
        setError('Failed to initialize payment method.');
      }
    };

    createSetupIntent();
  }, [authData.token]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again later.');
      return;
    }

    if (!clientSecret) {
      setError('Payment initialization failed. Please try again.');
      return;
    }

    try {
      // Confirm the SetupIntent to save the payment method
      const paymentResult = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message);
      } else {
        // Payment method successfully saved
        const paymentMethodId = paymentResult.setupIntent.payment_method;

        // Create booking request with saved payment method
        const bookingRes = await axios.post('/bookings', {
          apartmentId,
          startDate,
          endDate,
          documentation,
          paymentMethodId,
        }, {
          headers: {
            'Authorization': `Bearer ${authData.token}`
          }
        });

        setSuccess('Booking request submitted successfully. Awaiting approval.');
        setFormData({ startDate: '', endDate: '', documentation: '' });
        elements.getElement(CardElement).clear();
      }
    } catch (err) {
      console.error('Error in BookingForm:', err);
      setError(err.response?.data?.message || 'An error occurred during the booking process.');
    }
  };

  return (
    <div className="booking-form-container">
      <h3>Book This Apartment</h3>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Start Date:</label>
          <input type="date" name="startDate" value={startDate} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>End Date:</label>
          <input type="date" name="endDate" value={endDate} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Documentation:</label>
          <input type="text" name="documentation" value={documentation} onChange={onChange} placeholder="Upload docs or provide link" required />
        </div>
        <div className="form-group">
          <label>Payment Information:</label>
          <CardElement />
        </div>
        <button type="submit" disabled={!stripe || !clientSecret} className="submit-button">
          Submit Booking Request
        </button>
      </form>
    </div>
  );
};

export default BookingForm;