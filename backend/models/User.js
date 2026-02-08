import mongoose from 'mongoose';

// Schema for the city objects stored inside the user document
const SavedCitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    aqi: {
        type: Number,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    cityName: {
        type: String,
        default: "",
        required: true
    },
    savedCities: {
        type: [SavedCitySchema],
        default: []
    }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);