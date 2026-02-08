/* eslint-disable @typescript-eslint/no-unused-vars */
/* Dashboard.tsx */
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, X, Search, AlertCircle, Cigarette, ShieldAlert } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from '../store/authStore';
import './Dashboard.css';

interface ApiError { error: string; }
interface CityData { _id: string; name: string; aqi: number; }

const Dashboard: React.FC = () => {
  const { token, logout } = useAuthStore();
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [newCityName, setNewCityName] = useState('');
  const [updateCityName, setUpdateCityName] = useState('');
  const [activeCityId, setActiveCityId] = useState<string | null>(null);

  const isLimitReached = cities.length >= 3;

  // 1. Fetch Cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/user/cities', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCities(res.data);
      } catch (error) {
        const err = error as AxiosError<ApiError>;
        if (err.response?.status === 401) logout();
        else toast.error("Failed to load cities.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCities();
  }, [token, logout]);

  // 2. Add City - FIXED LOGIC
  const handleAddSubmit = async (e: React.FormEvent) => {


    const tokenInStorage = localStorage.getItem('token');

    if (!tokenInStorage) {
      logout();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (!newCityName.trim()) {
      toast.warn("Please enter a city name");
      return;
    }

    if (isLimitReached) {
      toast.error("Maximum limit of 3 cities reached");
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/user/cities',
        { name: newCityName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update state with the new city returned from server
      setCities(prev => [...prev, res.data]);

      // Reset UI
      setNewCityName('');
      setShowAddModal(false);
      toast.success(`${res.data.name} added successfully!`);
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      console.error("Add City Error:", err); // Log for debugging
      toast.error(err.response?.data?.error || "Could not find or add city");
    }
  };

  // 3. Update City
  const handleUpdateSubmit = async (e: React.FormEvent) => {


    const tokenInStorage = localStorage.getItem('token');

    if (!tokenInStorage) {
      logout();
      return;
    }


    e.preventDefault();
    if (!updateCityName.trim() || !activeCityId) {
      toast.warn("Please enter a city name");
      return
    }

    try {
      const res = await axios.put(`http://localhost:3000/api/user/cities/${activeCityId}`,
        { name: updateCityName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCities(prev => prev.map(c => c._id === activeCityId ? res.data : c));
      setShowUpdateModal(false);
      toast.success("Location updated!");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // 4. Delete City
  const deleteCity = async (e: React.MouseEvent, id: string) => {


    const tokenInStorage = localStorage.getItem('token');

    if (!tokenInStorage) {
      logout();
      return;
    }


    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:3000/api/user/cities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCities(prev => prev.filter(c => c._id !== id));
      toast.info("City removed");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const getHazardStatus = (aqi: number) => {
    if (aqi <= 50) return { label: 'Excellent', color: '#10b981', bg: 'rgba(16, 185, 129, 0.03)', note: 'Air quality is ideal.' };
    if (aqi <= 100) return { label: 'Moderate', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.03)', note: 'Sensitive groups should limit exertion.' };
    if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.03)', note: 'Wear a mask outdoors.' };
    return { label: 'Hazardous', color: '#782b2b', bg: 'rgba(127, 29, 29, 0.03)', note: 'Stay indoors immediately.' };
  };

  if (loading) return <div className="dashboard-root"><p style={{ textAlign: 'center', paddingTop: '100px', color: '#64748b' }}>Loading..</p></div>;

  return (
    <div className="dashboard-root">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" hideProgressBar={false} />

      <main className="dashboard-container">
        <header className="dashboard-welcome">
          <h1 className="main-title">My Saved <span className="text-gradient">Cities</span></h1>
          <button
            className="add-location-btn"
            onClick={() => setShowAddModal(true)}
            disabled={isLimitReached}
          >
            <Plus size={18} /> <span>{isLimitReached ? 'Limit Reached' : 'Add New City'}</span>
          </button>
        </header>

        <div className="city-grid">
          {cities.length === 0 ? (
            <div className="empty-state">No cities tracked. Click "Add New City" to begin.</div>
          ) : (
            cities.map((city) => {
              const hazard = getHazardStatus(city.aqi);
              return (
                <div key={city._id} className="city-card" style={{ borderTop: `4px solid ${hazard.color}` }}
                  onClick={() => { setActiveCityId(city._id); setUpdateCityName(city.name); setShowUpdateModal(true); }}>
                  <div className="card-header">
                    <div className="location-name"><MapPin size={16} className="pin-pro" /><span className="city-name-pro">{city.name}</span></div>
                    <button className="delete-icon" onClick={(e) => deleteCity(e, city._id)}><Trash2 size={16} /></button>
                  </div>
                  <div className="aqi-content">
                    <div className="aqi-number">{city.aqi}</div>
                    <div className="status-badge" style={{ color: hazard.color, background: hazard.bg }}>{hazard.label}</div>
                  </div>
                  <div className="card-bottom">
                    <div className="health-stat"><Cigarette size={14} /><span>Impact: {Math.round(city.aqi / 20)} cigarettes/day</span></div>
                    <div className="cautionary-note"><AlertCircle size={14} /><span>{hazard.note}</span></div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <footer className="dashboard-footer-warning">
          <ShieldAlert size={16} />
          <p>A maximum of 3 active cities is permitted.</p>
        </footer>
      </main>

      {/* MODAL: ADD CITY */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-glass-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Add New City</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  autoFocus
                  type="text"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="Enter city name (e.g. London)"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Track Location</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE CITY */}
      {showUpdateModal && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-glass-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Update Location</h2>
              <button className="close-btn" onClick={() => setShowUpdateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  autoFocus
                  type="text"
                  value={updateCityName}
                  onChange={(e) => setUpdateCityName(e.target.value)}
                  placeholder="New city name..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Apply Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;