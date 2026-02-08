# AirAware

AirAware is a high-performance Air Quality Index (AQI) tracking application built with React, TypeScript, and Zustand. It provides users with instant access to real-time air quality data for their current location while offering a global search feature to monitor environmental conditions in cities worldwide. Designed with a modern glass-morphism UI, the app prioritizes data clarity and responsive performance across all devices.

## ✨ Features

- **Modern UI:** Frosted glass effect using custom CSS `backdrop-filter`.
- **Fully Responsive:** Smooth transitions between Desktop, Tablet, and Mobile views.
- **Profile Editing:** Real-time state management for updating user details.
- **Secure Integration:** Built to work with a backend API using Axios.
- **Dashboard Integration:** Users can manage personalized air quality cards and monitor real-time AQI data for multiple locations.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Routing:** Tanstack Router
- **State Management:** Zustand
- **API Client:** Axios
- **Backend:** Fastify, MongoDB

## 📦 Getting Started

Clone the repository

```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd YOUR_REPO_NAME

### 1. Install dependencies
cd backend
npm install
cd my-react-app
npm install

### 2. Run the App
cd my-react-app
npm run dev

### 3. .env
Create a .env file in backend directory.
Then add the following variables: MONGO_URL,JWT_SECRET,JWT_EXPIRES_IN.
```

## Endpoint list

Public endpoints

- **GET** /api/aqi
- **GET** /api/aqi/by-city

Auth endpoints

- **POST** /api/auth/signup
- **POST** /api/auth/login
- **GET** /api/auth/me

### Protected (JWT required)

- **PUT** /api/user/profile

Saved cities CRUD:

- **GET** /api/user/cities
- **POST** /api/user/cities
- **PUT** /api/user/cities/:cityId
- **DELETE** /api/user/cities/:cityId

### Why ipwho.is and Open-Meteo?

With the help of ipwho.is, the user's latitude and longitude is extracted and the AQI data is fetched from Open-Meteo AQI API and to fetch other cities data, Open-Meteo Geocoding API is used to fetch the latitude and longitude first and then that data is send to Open-Meteo AQI API and the AQI is fetched accordingly.

### JWT security approach

It is implemented in such a way, that any logged in user will get logged out immediately after the token is expired.
