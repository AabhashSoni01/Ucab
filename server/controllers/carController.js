const Car = require('../models/car');

// @desc    Get all cars
// @route   GET /api/cars
const getAllCars = async (req, res) => {
  try {
    const { category, available } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (available === 'true') filter.isAvailable = true;

    const cars = await Car.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: cars.length, cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });
    res.status(200).json({ success: true, car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new car (Admin)
// @route   POST /api/admin/cars
const addCar = async (req, res) => {
  try {
    const { name, model, category, plateNumber, seats, pricePerKm, driverName, driverPhone, rating } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const car = await Car.create({
      name, model, category, plateNumber, seats, pricePerKm,
      driverName, driverPhone, rating, image,
    });

    res.status(201).json({ success: true, message: 'Car added successfully!', car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update car (Admin)
// @route   PUT /api/admin/cars/:id
const updateCar = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const car = await Car.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });
    res.status(200).json({ success: true, message: 'Car updated!', car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete car (Admin)
// @route   DELETE /api/admin/cars/:id
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });
    res.status(200).json({ success: true, message: 'Car deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllCars, getCarById, addCar, updateCar, deleteCar };