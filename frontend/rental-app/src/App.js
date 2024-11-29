// frontend/rental-app/src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AddApartment from './pages/AddApartment';
import ApartmentDetail from './pages/ApartmentDetail';
import BookingRequests from './pages/BookingRequests';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-apartment" 
            element={
              <ProtectedRoute>
                <AddApartment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/apartments/:id" 
            element={<ApartmentDetail />} 
          />
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute>
                <BookingRequests />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;