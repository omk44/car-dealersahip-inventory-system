import { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import Navbar from '../common/Navbar';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ make: '', category: '', maxPrice: '' });
  const { user } = useContext(AuthContext);

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
    fetchVehicles();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handlePurchase = async (id) => {
    try {
      await api.post(`/vehicles/${id}/purchase`);
      // Refresh the list to show updated quantity
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to purchase');
    }
  };

  return (
    <div className="container">
      <Navbar />
      
      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Make</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Toyota" 
              value={filters.make}
              onChange={(e) => setFilters({...filters, make: e.target.value})}
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Sedan" 
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Max Price ($)</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="e.g. 30000" 
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '45px', padding: '0 2rem' }}>
            Search
          </button>
        </form>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <h2 style={{ textAlign: 'center', marginTop: '3rem' }}>Loading vehicles...</h2>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {vehicles.length === 0 ? (
            <h3 style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>No vehicles found.</h3>
          ) : (
            vehicles.map((car) => (
              <div key={car._id} className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Custom Gradient "Image" Area */}
                <div style={{ height: '150px', background: 'linear-gradient(135deg, var(--bg-secondary), var(--accent-color))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <h2 style={{ color: 'white', opacity: 0.8, letterSpacing: '2px', textTransform: 'uppercase' }}>{car.make}</h2>
                </div>
                
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{car.model}</h3>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{car.year} • {car.category}</span>
                    </div>
                    <h3 style={{ color: 'var(--success)' }}>${car.price.toLocaleString()}</h3>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                    <span style={{ color: car.quantity > 0 ? 'var(--text-secondary)' : 'var(--danger)', fontWeight: '600' }}>
                      {car.quantity > 0 ? `${car.quantity} in stock` : 'Out of Stock'}
                    </span>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handlePurchase(car._id)}
                      disabled={car.quantity === 0}
                    >
                      {car.quantity > 0 ? 'Purchase' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
