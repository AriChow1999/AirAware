import cors from '@fastify/cors';
import axios from 'axios';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from './models/User.js';
import jwt from '@fastify/jwt';

import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
const fastify = Fastify({ logger: true });


fastify.register(cors, {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] // Add "PUT" here
});

fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'secret'
});


mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));


// ----------------------------------------------AUTH ENDPOINTS--------------------------------------------------------
fastify.post('/api/auth/signup', async (request, reply) => {
    try {
        const { fullName, email, password, cityName } = request.body;

        // 1. Check if user already exists (schema uses lowercase for email)
        const normalizedEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return reply.status(400).send({ error: 'Email already registered' });
        }

        // 2. Hash Password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Create User according to your UserSchema
        const newUser = new User({
            fullName,
            email: normalizedEmail,
            password: hashedPassword,
            cityName: cityName || "",
            savedCities: []
        });

        await newUser.save();
        return reply.status(201).send({ message: 'User created successfully' });

    } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: 'Signup failed. Please check all fields.' });
    }
});

fastify.post('/api/auth/login', async (request, reply) => {
    try {
        const { email, password } = request.body;

        // 1. Find User
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return reply.status(401).send({ error: 'No such user exists' });
        }

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return reply.status(401).send({ error: 'Invalid email or password' });
        }

        const token = fastify.jwt.sign(
            { id: user._id },
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        // 3. Success - Return user data for frontend state
        return {
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                cityName: user.cityName,
                email: user.email
            }
        };

    } catch (err) {
        return reply.status(500).send({ error: 'Login failed' });
    }
});

fastify.get('/api/auth/me', async (request, reply) => {
    try {
        // Automatically checks Authorization header: "Bearer <token>"
        const decoded = await request.jwtVerify();

        // Find user by ID stored in token, exclude password for security
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        return {
            id: user._id,
            fullName: user.fullName,
            cityName: user.cityName,
            email: user.email
        };
    } catch (err) {
        return reply.status(401).send({ error: 'Unauthorized: Invalid or expired token' });
    }
});


// ----------------------------------------------PROTECTED (JWT)----------------------------------------------------

fastify.put('/api/user/profile', async (request, reply) => {
    try {
        const decoded = await request.jwtVerify();
        const { fullName, password, cityName } = request.body;

        const user = await User.findById(decoded.id);
        if (!user) return reply.status(404).send({ error: 'User not found' });

        if (fullName) user.fullName = fullName;
        if (cityName) user.cityName = cityName;

        if (password && password.trim() !== "") {
            if (password.length < 8) {
                return reply.status(400).send({ error: 'Password must be at least 8 characters' });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            user.password = hashedPassword;
        }

        await user.save();

        return {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            cityName: user.cityName
        };
    } catch (err) {
        return reply.status(500).send({ error: 'Update failed' });
    }
});

// ----------------------------------------------PUBLIC ENDPOINTS-----------------------------------------------------
const fetchAQI = async (lat, lon) => {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;
    const response = await axios.get(url);
    return response.data.current.us_aqi;
};

fastify.get('/api/aqi', async (request, reply) => {
    const { lat, lon } = request.query;
    if (!lat || lon === undefined) return reply.status(400).send({ error: 'Missing coords' });
    try {
        const aqi = await fetchAQI(lat, lon);
        return { aqi };
    } catch (err) {
        return reply.status(500).send({ error: 'AQI Service Down' });
    }
});

fastify.get('/api/aqi/by-city', async (request, reply) => {
    const { city } = request.query;
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
        const geoRes = await axios.get(geoUrl);
        if (!geoRes.data.results) return reply.status(404).send({ error: 'City not found' });
        const { latitude, longitude, name } = geoRes.data.results[0];
        const aqi = await fetchAQI(latitude, longitude);
        return { aqi, city: name };
    } catch (err) {
        return reply.status(500).send({ error: 'Search failed' });
    }
});


// ----------------------------------------------SAVED CITIES (CRUD)---------------------------------------------------

fastify.get('/api/user/cities', async (request, reply) => {
    try {
        const decoded = await request.jwtVerify();
        const user = await User.findById(decoded.id);
        if (!user) return reply.status(404).send({ error: 'User not found' });
        return user.savedCities || [];
    } catch (err) {
        return reply.status(401).send({ error: 'Unauthorized' });
    }
});


fastify.post('/api/user/cities', async (request, reply) => {
    try {
        const decoded = await request.jwtVerify();
        const { name } = request.body;

        const user = await User.findById(decoded.id);
        if (!user) return reply.status(404).send({ error: 'User not found' });

        // Enforce 3-city limit manually since arrayLimit was removed from schema
        if (user.savedCities.length >= 3) {
            return reply.status(403).send({
                error: 'Limit reached: You can only monitor up to 3 cities.'
            });
        }

        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
        const geoRes = await axios.get(geoUrl);

        if (!geoRes.data.results || geoRes.data.results.length === 0) {
            return reply.status(404).send({ error: 'City not found' });
        }

        const { latitude, longitude, name: officialName } = geoRes.data.results[0];
        const aqiValue = await fetchAQI(latitude, longitude);

        const newCity = {
            _id: new mongoose.Types.ObjectId(),
            name: officialName,
            aqi: aqiValue
        };

        user.savedCities.push(newCity);
        await user.save();

        return newCity;
    } catch (err) {
        return reply.status(500).send({ error: 'Failed to add city' });
    }
});

fastify.put('/api/user/cities/:cityId', async (request, reply) => {
    try {
        const decoded = await request.jwtVerify();
        const { cityId } = request.params;
        const { name } = request.body;

        if (!name) return reply.status(400).send({ error: 'City name is required' });

        // 1. Fetch new coordinates for the updated city name
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
        const geoRes = await axios.get(geoUrl);

        if (!geoRes.data.results || geoRes.data.results.length === 0) {
            return reply.status(404).send({ error: 'City not found in weather database' });
        }

        const { latitude, longitude, name: officialName } = geoRes.data.results[0];

        // 2. Fetch the fresh AQI for these coordinates
        const newAqiValue = await fetchAQI(latitude, longitude);

        // 3. Update the specific city object in the array
        const user = await User.findOneAndUpdate(
            { _id: decoded.id, "savedCities._id": cityId },
            {
                $set: {
                    "savedCities.$.name": officialName,
                    "savedCities.$.aqi": newAqiValue
                }
            },
            { new: true }
        );

        if (!user) return reply.status(404).send({ error: 'City not found' });

        // 4. Find and return the specific updated city object
        const updatedCity = user.savedCities.find(c => c._id.toString() === cityId);
        return updatedCity;

    } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: 'Update failed' });
    }
});

fastify.delete('/api/user/cities/:cityId', async (request, reply) => {
    try {
        const decoded = await request.jwtVerify();
        const { cityId } = request.params;

        const user = await User.findByIdAndUpdate(
            decoded.id,
            { $pull: { savedCities: { _id: cityId } } },
            { new: true }
        );

        if (!user) return reply.status(404).send({ error: 'User or city not found' });
        return { message: 'City removed successfully' };
    } catch (err) {
        return reply.status(500).send({ error: 'Delete failed' });
    }
});



fastify.listen({ port: 3000 });