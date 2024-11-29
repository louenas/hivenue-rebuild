// frontend/rental-app/src/index.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { AuthProvider } from './contexts/AuthContext';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Router> {/* Wrap with Router */}
      <AuthProvider> {/* Single AuthProvider inside Router */}
        <Elements stripe={stripePromise}>
          <App />
        </Elements>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

// Optional: If you want to start measuring performance in your app
reportWebVitals(console.log);