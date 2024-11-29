// frontend/rental-app/src/pages/AddApartment.js

import React, { useState, useContext } from 'react';
import axiosInstance from '../utils/axiosConfig'; // Use the configured Axios instance
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './AddApartment.css'; // Optional for styling

const AddApartment = () => {
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rooms: 1,
    availabilityPeriods: [{ start: '', end: '' }],
    amenities: '',
    price: 0,
    city: '',
    address: '',
  });

  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    title,
    description,
    rooms,
    availabilityPeriods,
    amenities,
    price,
    city,
    address,
  } = formData;

  // Handle input changes
  const onChange = (e) => {
    const { name, value } = e.target;

    // Handle availability periods dynamically
    if (name.startsWith('availabilityPeriods')) {
      const index = parseInt(name.split('.')[1], 10);
      const field = name.split('.')[2];
      const updatedPeriods = [...availabilityPeriods];
      updatedPeriods[index][field] = value;
      setFormData({ ...formData, availabilityPeriods: updatedPeriods });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle adding a new availability period
  const addAvailabilityPeriod = () => {
    setFormData({
      ...formData,
      availabilityPeriods: [...availabilityPeriods, { start: '', end: '' }],
    });
  };

  // Handle image file selection
  const onImageChange = (e) => {
    setImages([...e.target.files]);
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!title || !description || !city || !address || !price) {
      setError('Please fill in all required fields.');
      return;
    }

    // Prepare form data for submission
    const submissionData = new FormData();
    submissionData.append('title', title);
    submissionData.append('description', description);
    submissionData.append('rooms', rooms);
    submissionData.append(
      'availabilityPeriods',
      JSON.stringify(availabilityPeriods)
    );
    submissionData.append(
      'amenities',
      JSON.stringify(amenities.split(',').map((amenity) => amenity.trim()))
    );
    submissionData.append('price', price);
    submissionData.append('city', city);
    submissionData.append('address', address);

    // Append images
    images.forEach((image) => {
      submissionData.append('images', image);
    });

    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/apartments`,
        submissionData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );
      setSuccess('Apartment listed successfully!');
      // Redirect to dashboard or apartment detail page
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err.response);
      setError(
        err.response?.data?.message || 'Failed to list apartment. Please try again.'
      );
    }
  };

  return (
    <div className="add-apartment-container">
      <h2>Add New Apartment</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={onSubmit} encType="multipart/form-data">
        <div>
          <label htmlFor="title">Title<span className="required">*</span>:</label><br/>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            required
            placeholder="Enter apartment title"
          />
        </div>
        <div>
          <label htmlFor="description">Description<span className="required">*</span>:</label><br/>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            required
            placeholder="Enter apartment description"
          ></textarea>
        </div>
        <div>
          <label htmlFor="rooms">Number of Rooms<span className="required">*</span>:</label><br/>
          <input
            type="number"
            id="rooms"
            name="rooms"
            value={rooms}
            onChange={onChange}
            min="1"
            required
          />
        </div>
        <div>
          <label>Availability Periods<span className="required">*</span>:</label><br/>
          {availabilityPeriods.map((period, index) => (
            <div key={index} className="availability-period">
              <input
                type="date"
                name={`availabilityPeriods.${index}.start`}
                value={period.start}
                onChange={onChange}
                required
              />
              <span> to </span>
              <input
                type="date"
                name={`availabilityPeriods.${index}.end`}
                value={period.end}
                onChange={onChange}
                required
              />
            </div>
          ))}
          <button type="button" onClick={addAvailabilityPeriod}>
            Add Another Period
          </button>
        </div>
        <div>
          <label htmlFor="amenities">Amenities (comma separated):</label><br/>
          <input
            type="text"
            id="amenities"
            name="amenities"
            value={amenities}
            onChange={onChange}
            placeholder="e.g., WiFi, Air Conditioning, Pool"
          />
        </div>
        <div>
          <label htmlFor="price">Price (USD)<span className="required">*</span>:</label><br/>
          <input
            type="number"
            id="price"
            name="price"
            value={price}
            onChange={onChange}
            min="0"
            required
            placeholder="Enter monthly price"
          />
        </div>
        <div>
          <label htmlFor="city">City<span className="required">*</span>:</label><br/>
          <input
            type="text"
            id="city"
            name="city"
            value={city}
            onChange={onChange}
            required
            placeholder="Enter city"
          />
        </div>
        <div>
          <label htmlFor="address">Address<span className="required">*</span>:</label><br/>
          <input
            type="text"
            id="address"
            name="address"
            value={address}
            onChange={onChange}
            required
            placeholder="Enter address"
          />
        </div>
        <div>
          <label htmlFor="images">Upload Images:</label><br/>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={onImageChange}
          />
        </div>
        <button type="submit">List Apartment</button>
      </form>
    </div>
  );
};

export default AddApartment;