import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ApartmentCard from '../components/ApartmentCard';
import Navbar from '../components/Navbar';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const [apartments, setApartments] = useState([]);
  const [search, setSearch] = useState({
    city: '',
    price: '',
    startDate: '',
    endDate: '',
  });
  
  const { authData } = useContext(AuthContext);
  const user = authData.user;
  const role = authData.role;

  const fetchApartments = async () => {
    try {
      const params = {};
      if (search.city) params.city = search.city;
      if (search.price) params.price = search.price;
      if (search.startDate && search.endDate) {
        params.startDate = search.startDate;
        params.endDate = search.endDate;
      }
      const res = await axios.get('/api/apartments', { params });
      setApartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApartments();
    // eslint-disable-next-line
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchApartments();
  };

  return (
    <div>
      <h1>Apartment Listings</h1>
      <Link to="/add-apartment">
        <button>Create Apartment</button>
      </Link>
      <form onSubmit={handleSearch}>
        <input type="text" name="city" placeholder="City" value={search.city} onChange={e => setSearch({ ...search, city: e.target.value })} />
        <input type="number" name="price" placeholder="Max Price" value={search.price} onChange={e => setSearch({ ...search, price: e.target.value })} />
        <input type="date" name="startDate" value={search.startDate} onChange={e => setSearch({ ...search, startDate: e.target.value })} />
        <input type="date" name="endDate" value={search.endDate} onChange={e => setSearch({ ...search, endDate: e.target.value })} />
        <button type="submit">Search</button>
      </form>
      <div>
        {apartments.length > 0 ? (
          apartments.map(apartment => (
            <ApartmentCard key={apartment._id} apartment={apartment} />
          ))
        ) : (
          <p>No apartments found.</p>
        )}
      </div>
      <Navbar />
    </div>
  );
};

export default Home;