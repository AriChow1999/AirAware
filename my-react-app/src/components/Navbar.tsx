/* Navbar.tsx */
import React, { useState } from 'react';
import { Gauge, Menu, X, User, LayoutDashboard, Home, Info, LogOut, Loader2 } from 'lucide-react';
import { Link } from '@tanstack/react-router'; 
import './Navbar.css';
import AuthModal from './AuthModal';
import { useAuthStore } from '../store/authStore';

const Navbar: React.FC = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


    const { user, logout, isLoading } = useAuthStore();

    const navItems = [
        { label: 'Home', path: '/', icon: <Home size={20} />, isPublic: true },
        { label: 'About', path: '/about', icon: <Info size={20} />, isPublic: true },
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, isPublic: false },
        { label: 'Profile', path: '/profile', icon: <User size={20} />, isPublic: false },
    ];


    const visibleNavItems = navItems.filter(item => item.isPublic || !!user);

    const handleAction = (type: 'join' | 'logout') => {
        if (type === 'join') {
            setShowAuthModal(true);
        } else {
            logout(); 
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-content">
                    <Link to="/" className="logo-link">
                        <div className="logo-section">
                            <div className="logo-icon-wrapper">
                                <Gauge size={28} className="brand-icon" strokeWidth={2.5} />
                            </div>
                            <span className="logo-text">
                                <span className="brand-accent">Air</span>
                                <span className="brand-main">Aware</span>
                            </span>
                        </div>
                    </Link>


                    <div className="nav-links-desktop">

                        {isLoading ? (
                            <div className="nav-item">
                                <Loader2 className="spinner animate-spin" size={20} />
                            </div>
                        ) : (
                            <>
                                {visibleNavItems.map((item) => (
                                    <Link 
                                        key={item.label} 
                                        to={item.path} 
                                        className="nav-item"
                                        activeProps={{ className: 'active-nav' }} 
                                    >
                                        {item.icon && <span className="nav-icon-inline">{item.icon}</span>}
                                        {item.label}
                                    </Link>
                                ))}

                                {!user ? (
                                    <button className="join-btn" onClick={() => handleAction('join')}>
                                        Join Now
                                    </button>
                                ) : (
                                    <button className="logout-btn" onClick={() => handleAction('logout')}>
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu size={32} color="#064e3b" />
                    </button>
                </div>

                {/* Mobile Drawer */}
                <div className={`mobile-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
                    <div className="drawer-header">
                        <span className="logo-text">Menu</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="close-drawer-btn">
                            <X size={32} />
                        </button>
                    </div>

                    <div className="mobile-nav-links">
                        {isLoading ? (
                            <div className="mobile-nav-item"><Loader2 className="spinner animate-spin" /></div>
                        ) : (
                            <>
                                {visibleNavItems.map((item) => (
                                    <Link 
                                        key={item.label} 
                                        to={item.path} 
                                        className="mobile-nav-item" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}

                                {!user ? (
                                    <button className="join-btn-mobile" onClick={() => handleAction('join')}>
                                        Join Now
                                    </button>
                                ) : (
                                    <button className="logout-btn-mobile" onClick={() => handleAction('logout')}>
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
};

export default Navbar;