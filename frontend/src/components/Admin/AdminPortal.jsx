import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../common/Navbar';
import { AuthContext } from '../../context/AuthContext';

const AdminPortal = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ make: '', model: '', year: '', category: '', price: '', quantity: '' });
  const [editingId, setEditingId] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        year: Number(formData.year),
        price: Number(formData.price),
        quantity: Number(formData.quantity)
      };

      if (editingId) {
        await api.put(`/vehicles/${editingId}`, payload);
        alert('Vehicle updated beautifully!');
      } else {
        await api.post('/vehicles', payload);
        alert('Vehicle added to the fleet!');
      }
      
      setFormData({ make: '', model: '', year: '', category: '', price: '', quantity: '' });
      setEditingId(null);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (car) => {
    setFormData({
      make: car.make, model: car.model, year: car.year, 
      category: car.category, price: car.price, quantity: car.quantity
    });
    setEditingId(car._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this vehicle?")) {
      try {
        await api.delete(`/vehicles/${id}`);
        fetchVehicles();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleRestock = async (id) => {
    const qty = prompt("How many vehicles are you adding to stock?", "5");
    if (qty && !isNaN(qty)) {
      try {
        await api.post(`/vehicles/${id}/restock`, { quantity: Number(qty) });
        fetchVehicles();
      } catch (err) {
        alert('Restock failed');
      }
    }
  };

  return (
    <div className="container">
      <Navbar />
      
      <div className="admin-grid">
        {/* Magic Form Area */}
        <div className="glass-panel magic-form-container" style={{ padding: '2.5rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h2 className="glow-text">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
            {editingId && (
              <button className="btn" onClick={() => { setEditingId(null); setFormData({ make: '', model: '', year: '', category: '', price: '', quantity: '' }); }} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>Cancel Edit</button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="magic-form">
            <div className="input-group">
              <input type="text" name="make" value={formData.make} onChange={handleInputChange} required />
              <label>Vehicle Make (e.g. Tesla)</label>
            </div>
            <div className="input-group">
              <input type="text" name="model" value={formData.model} onChange={handleInputChange} required />
              <label>Vehicle Model (e.g. Model S)</label>
            </div>
            <div className="input-group">
              <input type="number" name="year" value={formData.year} onChange={handleInputChange} required />
              <label>Year (e.g. 2024)</label>
            </div>
            <div className="input-group">
              <input type="text" name="category" value={formData.category} onChange={handleInputChange} required />
              <label>Category (e.g. Sedan)</label>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                <label>Price ($)</label>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required />
                <label>Quantity</label>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '14px', fontSize: '1.1rem', letterSpacing: '1px' }}>
              {editingId ? 'Save Changes' : 'Initialize Vehicle 🚀'}
            </button>
          </form>
        </div>

        {/* Inventory List Area */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Inventory Management</h2>
          
          {loading ? <p>Loading fleet...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {vehicles.map((car) => (
                <div key={car._id} className="admin-list-item" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{car.make} {car.model} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>({car.year})</span></h3>
                    <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>${car.price.toLocaleString()} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', marginLeft: '1rem' }}>Stock: {car.quantity}</span></p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" onClick={() => handleRestock(car._id)} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>Restock</button>
                    <button className="btn" onClick={() => handleEdit(car)} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)' }}>Edit</button>
                    <button className="btn" onClick={() => handleDelete(car._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>Delete</button>
                  </div>
                </div>
              ))}
              {vehicles.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No vehicles in database. Add some!</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
