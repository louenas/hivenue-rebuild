// backend/routes/apartments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Apartment = require('../models/Apartment');
const multer = require('multer');

// Set up Multer for image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/apartments/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Create a new apartment
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  // Only property owners can create apartments
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied.' });
  }

  const { title, description, rooms, availabilityPeriods, amenities, price, city, address } = req.body;
  const images = req.files.map(file => file.path); // Adjust according to your storage strategy

  try {
    const newApartment = new Apartment({
      owner: req.user.id,
      title,
      description,
      rooms,
      availabilityPeriods: JSON.parse(availabilityPeriods),
      amenities: JSON.parse(amenities),
      images,
      pricePerMonth:price,
      city,
      address,
    });

    const savedApartment = await newApartment.save();
    res.status(201).json(savedApartment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all apartments
router.get('/', async (req, res) => {
    const { city, price, startDate, endDate } = req.query;
    let filter = {};
  
    if (city) filter.city = city;
    if (price) filter.price = { $lte: Number(price) };
    
    if (startDate && endDate) {
      filter.availabilityPeriods = {
        $elemMatch: {
          start: { $lte: new Date(endDate) },
          end: { $gte: new Date(startDate) },
        }
      };
    }
  
    try {
      const apartments = await Apartment.find(filter).populate('owner', 'name email');
      res.json(apartments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

// Get single apartment by ID
router.get('/:id', async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }
    res.json(apartment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;