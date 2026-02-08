/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* Profile.tsx */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { Mail, User as UserIcon, MapPin, Building2 } from 'lucide-react';
import './Profile.css';
import { useAuthStore } from '../store/authStore';

const Profile: React.FC = () => {
  const { user, token, setUser, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    cityName: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        cityName: user.cityName || '',
        password: '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();


    const tokenInStorage = localStorage.getItem('token');

    if (!tokenInStorage) {
      logout(); 
      return;
    }

    if (formData.password.trim() !== "" && formData.password.length < 8) {
      return toast.warn("Password must be at least 8 characters long");
    }

    const updatePayload: any = {
      fullName: formData.fullName,
      cityName: formData.cityName,
    };

    if (formData.password.trim() !== "") {
      updatePayload.password = formData.password;
    }

    try {
      const res = await axios.put('http://localhost:3000/api/user/profile', updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data);
      toast.success("Profile updated!");
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error: any) {
      const message = error.response?.data?.error || "Update failed";
      toast.error(message);
    }
  };

  return (
    <div className="profile-root">
      {/* ToastContainer added here for immediate feedback */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        style={{ zIndex: 9999 }}
      />

      <main className="profile-container">
        <header className="profile-header">
          <h1>Account <span className="text-gradient">Settings</span></h1>
        </header>

        <div className="profile-content-layout">
          <aside className="profile-sidebar">
            <section className="glass-panel avatar-card">
              <div className="avatar-wrapper">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" alt="User" />
              </div>
              <div className="sidebar-meta">
                <h2>{user?.fullName}</h2>
                <div className="location-tag"><MapPin size={14} /> {user?.cityName || 'Not set'}</div>
              </div>
            </section>
          </aside>

          <div className="settings-main">
            <section className="glass-panel settings-card">
              <div className="card-top-nav">
                <h3>Profile Details</h3>
                {!isEditing && <button className="btn-edit-link" onClick={() => setIsEditing(true)}>Edit Profile</button>}
              </div>

              {isEditing ? (
                <form className="edit-form-snappy" onSubmit={handleUpdate}>
                  <div className="input-grid">
                    <div className="input-field">
                      <label>Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="input-field">
                      <label>Email Address (Disabled)</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        style={{ background: '#f0f0f0', cursor: 'not-allowed', color: '#888' }}
                      />
                    </div>
                    <div className="input-field">
                      <label>City</label>
                      <input
                        type="text"
                        name="cityName"
                        value={formData.cityName}
                        onChange={handleChange}
                        placeholder="Enter your city"
                      />
                    </div>
                  </div>
                  <div className="input-field full-width">
                    <label>New Password (Min 8 characters)</label>
                    <input type="password" name="password" value={formData.password} placeholder="••••••••" onChange={handleChange} />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-save">Apply Changes</button>
                    <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="data-display animate-snappy">
                  <div className="data-row">
                    <div className="data-label"><UserIcon size={16} /> Name</div>
                    <div className="data-value">{user?.fullName}</div>
                  </div>
                  <div className="data-row">
                    <div className="data-label"><Mail size={16} /> Email</div>
                    <div className="data-value">{user?.email}</div>
                  </div>
                  <div className="data-row">
                    <div className="data-label"><Building2 size={16} /> City</div>
                    <div className="data-value">{user?.cityName || 'Not set'}</div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;