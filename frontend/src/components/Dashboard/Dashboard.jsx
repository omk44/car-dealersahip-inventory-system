import { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import Navbar from '../common/Navbar';
import { AuthContext } from '../../context/AuthContext';

const Toast = ({ message, visible }) => (
  <div style={{
    position: 'fixed',
    bottom: visible ? '30px' : '-100px',
    right: '30px',
    background: 'rgba(16, 185, 129, 0.9)',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    zIndex: 1000,
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }}>
    <span style={{ fontSize: '1.2rem' }}>✨</span>
    {message}
  </div>
);

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ make: '', category: '', maxPrice: '' });
  const { user } = useContext(AuthContext);
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filters.make) query.append('make', filters.make);
      if (filters.category) query.append('category', filters.category);
      if (filters.maxPrice) query.append('maxPrice', filters.maxPrice);

      const endpoint = query.toString() ? `/vehicles/search?${query.toString()}` : '/vehicles';
      const response = await api.get(endpoint);
      setVehicles(response.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVehicles();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const handlePurchase = async (id, model) => {
    try {
      await api.post(`/vehicles/${id}/purchase`);
      showToast(`Successfully purchased 1x ${model}!`);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to purchase');
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <Navbar />
      <Toast message={toast.message} visible={toast.show} />

      {/* Hero Section */}
      <div style={{ textAlign: 'center', margin: '4rem 0', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--accent-color)', opacity: '0.1', filter: 'blur(100px)', zIndex: -1 }}></div>
        
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome back, {user?.name}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Explore the next generation of our intelligent vehicle inventory system.
        </p>
        
        {/* User Identity Pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '8px 20px', borderRadius: '30px', border: '1px solid var(--glass-border)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Logged in as:</span>
          <strong style={{ color: 'var(--accent-color)' }}>{user?.email}</strong>
          <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.8rem', marginLeft: '10px' }}>{user?.role?.toUpperCase()}</span>
        </div>
      </div>

      {/* Unified Search Pill */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '4rem', borderRadius: '50px', maxWidth: '900px', margin: '0 auto 4rem auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search by Make (e.g. Tesla)" 
            value={filters.make}
            onChange={(e) => setFilters({...filters, make: e.target.value})}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '12px 20px', fontSize: '1rem', outline: 'none' }}
          />
          <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }}></div>
          <input 
            type="text" 
            placeholder="Category (e.g. SUV)" 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '12px 20px', fontSize: '1rem', outline: 'none' }}
          />
          <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }}></div>
          <input 
            type="number" 
            placeholder="Max Price ($)" 
            value={filters.maxPrice}
            onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '12px 20px', fontSize: '1rem', outline: 'none' }}
          />
        </div>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {vehicles.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.5rem' }}>No vehicles matched your search.</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', opacity: 0.6 }}>Try adjusting your filters to find your dream car.</p>
            </div>
          ) : (
            vehicles.map((car) => (
              <div key={car._id || car.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                {/* Custom Gradient "Image" Area */}
                <div style={{ height: '180px', background: 'linear-gradient(135deg, rgba(26, 29, 45, 1) 0%, rgba(99, 102, 241, 0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', backdropFilter: 'blur(5px)' }}>
                    {car.year} • {car.category}
                  </div>
                  <h2 style={{ color: 'white', opacity: 0.9, letterSpacing: '4px', textTransform: 'uppercase', fontSize: '2rem', fontWeight: '300' }}>{car.make}</h2>
                </div>
                
                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: '500' }}>{car.model}</h3>
                    <h3 style={{ color: 'var(--success)', margin: 0, fontSize: '1.4rem' }}>${car.price.toLocaleString()}</h3>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: car.quantity > 0 ? 'var(--success)' : 'var(--danger)', boxShadow: `0 0 10px ${car.quantity > 0 ? 'var(--success)' : 'var(--danger)'}` }}></div>
                      <span style={{ color: car.quantity > 0 ? 'var(--text-secondary)' : 'var(--danger)', fontWeight: '500', fontSize: '0.9rem' }}>
                        {car.quantity > 0 ? `${car.quantity} Available` : 'Sold Out'}
                      </span>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handlePurchase(car._id || car.id, car.model)}
                      disabled={car.quantity === 0}
                      style={{ padding: '10px 24px', borderRadius: '25px' }}
                    >
                      {car.quantity > 0 ? 'Purchase' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default Dashboard;
