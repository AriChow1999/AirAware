import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Activity, Wind, ShieldCheck, MapPin, Search, Loader2 } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import "./index.css"

export const Route = createFileRoute('/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [cityInput, setCityInput] = useState("");
    const [display, setDisplay] = useState({
        aqi: null as number | string | null,
        city: "your area"
    });

    const { data: geo } = useQuery({
        queryKey: ['ip-geo'],
        queryFn: async () => {
            const { data } = await axios.get('https://ipwho.is/');
            return data;
        },
        staleTime: Infinity,
    });


    useQuery({
        queryKey: ['aqi-auto', geo?.latitude],
        queryFn: async () => {
            try {
                const { data } = await axios.get(`http://localhost:3000/api/aqi`, {
                    params: { lat: geo.latitude, lon: geo.longitude }
                });
                setDisplay({ aqi: data.aqi, city: geo.city });
                return data;
            } catch (err) {
                toast.error("Could not sync real-time air quality.", { position: "top-right", autoClose: 1000 });
                setDisplay({ aqi: "Not available", city: geo.city });
                throw err;
            }
        },
        enabled: !!geo?.latitude,
        refetchOnWindowFocus: false,
    });


    const searchMutation = useMutation({
        mutationFn: async (name: string) => {
            const { data } = await axios.get(`http://localhost:3000/api/aqi/by-city`, {
                params: { city: name }
            });
            return data;
        },
        onSuccess: (data) => {
            setDisplay({ aqi: data.aqi, city: data.city });
            setCityInput("");
        },
        onError: () => {
            toast.error("City not found", { position: "top-right", autoClose: 1000 });
            setCityInput("");
        }
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (cityInput.trim()) searchMutation.mutate(cityInput);
    };

    const getAQIDetails = (aqi: number | string | null) => {
        if (aqi === null) return { class: '', status: 'Syncing...' };
        if (typeof aqi === 'string') return { class: 'aqi-unhealthy', status: 'N/A' };
        if (aqi <= 50) return { class: 'aqi-good', status: 'Excellent' };
        if (aqi <= 100) return { class: 'aqi-moderate', status: 'Moderate' };
        return { class: 'aqi-unhealthy', status: 'Hazardous' };
    };

    const { class: aqiClass, status: aqiStatus } = getAQIDetails(display.aqi);

    return (
        <div className="home-container">
            <ToastContainer />
            <section className="hero-section">
                <div className="inner-content">
                    <h1 className="hero-title">
                        Breathe <span className="text-gradient">Smarter.</span> <br />
                        Live Better.
                    </h1>

                    <p className="hero-subtext">
                        Live tracking for <strong>{display.city}</strong>. Real-time data designed to protect your health, wherever you are.
                    </p>

                    <div className="hero-actions">
                        <form onSubmit={handleSearch} className="search-bar-pro">
                            <div className="input-group">
                                <MapPin size={20} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Enter city or coordinates..."
                                    value={cityInput}
                                    onChange={(e) => setCityInput(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="cta-btn-pro" disabled={searchMutation.isPending}>
                                {searchMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                                <span>Analyze Air</span>
                            </button>
                        </form>
                    </div>

                    <div className="live-indicator-pro">
                        <div className="pulse-dot"></div>
                        <span>Live AQI: <strong className={aqiClass}>{display.aqi} ({aqiStatus})</strong></span>
                    </div>
                </div>
            </section>

            <section className="info-section">
                <div className="section-content">
                    <h2 className="section-title">Understanding the <span className="text-gradient">Atmosphere</span></h2>
                    <div className="aqi-grid-pro">
                        <div className="grid-item-pro glass-good">
                            <div className="item-header">
                                <div className="icon-label-group"><ShieldCheck size={20} /><span className="icon-text">Optimal</span></div>
                                <span className="range-pill">0-50</span>
                            </div>
                            <p>Air quality is satisfactory. No health risks identified for any groups.</p>
                        </div>
                        <div className="grid-item-pro glass-moderate">
                            <div className="item-header">
                                <div className="icon-label-group"><Wind size={20} /><span className="icon-text">Moderate</span></div>
                                <span className="range-pill">51-100</span>
                            </div>
                            <p>Acceptable quality, though sensitive groups should reduce exertion.</p>
                        </div>
                        <div className="grid-item-pro glass-unhealthy">
                            <div className="item-header">
                                <div className="icon-label-group"><Activity size={20} /><span className="icon-text">Hazardous</span></div>
                                <span className="range-pill">151+</span>
                            </div>
                            <p>Significant health risks. Outdoor activity is not recommended for anyone.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}