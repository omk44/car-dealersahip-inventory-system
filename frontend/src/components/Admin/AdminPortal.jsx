import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../common/Navbar';
import { AuthContext } from '../../context/AuthContext';

const Toast = ({ message, visible, type = 'success' }) => (
  <div style={{
    position: 'fixed',
    bottom: visible ? '30px' : '-100px',
    right: '30px',
    background: type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: `0 10px 25px ${type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
    transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    zIndex: 3000,
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }}>
    <span style={{ fontSize: '1.2rem' }}>{type === 'success' ? '✨' : '⚠️'}</span>
    {message}
  </div>
);

const AdminPortal = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ make: '', model: '', year: '', category: '', price: '', quantity: '' });
  const [editingId, setEditingId] = useState(null);
  const [restockModal, setRestockModal] = useState({ show: false, carId: null, carMake: '', carModel: '', qty: 5 });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ show: false, carId: null, carMake: '', carModel: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

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
        showToast('Vehicle updated beautifully!');
      } else {
        await api.post('/vehicles', payload);
        showToast('Vehicle added to the fleet!');
      }
      
      setFormData({ make: '', model: '', year: '', category: '', price: '', quantity: '' });
      setEditingId(null);
      fetchVehicles();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleEdit = (car) => {
    setFormData({
      make: car.make, model: car.model, year: car.year, 
      category: car.category, price: car.price, quantity: car.quantity
    });
    setEditingId(car._id || car.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (car) => {
    setDeleteModal({ show: true, carId: car._id || car.id, carMake: car.make, carModel: car.model });
  };

  const submitDelete = async () => {
    try {
      await api.delete(`/vehicles/${deleteModal.carId}`);
      setDeleteModal({ show: false, carId: null, carMake: '', carModel: '' });
      showToast('Vehicle permanently deleted', 'success');
      fetchVehicles();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleRestockClick = (car) => {
    setRestockModal({ show: true, carId: car._id || car.id, carMake: car.make, carModel: car.model, qty: 5 });
  };

  const submitRestock = async () => {
    if (restockModal.qty && !isNaN(restockModal.qty)) {
      try {
        await api.post(`/vehicles/${restockModal.carId}/restock`, { quantity: Number(restockModal.qty) });
        setRestockModal({ show: false, carId: null, carMake: '', carModel: '', qty: 5 });
        showToast('Inventory successfully restocked!');
        fetchVehicles();
      } catch (err) {
        showToast('Restock failed', 'error');
      }
    }
  };

  return (
    <div className="container">
      <Navbar />
      <Toast message={toast.message} visible={toast.show} type={toast.type} />
      
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
                <div key={car._id || car.id} className="admin-list-item" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{car.make} {car.model} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>({car.year})</span></h3>
                    <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>${car.price.toLocaleString()} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', marginLeft: '1rem' }}>Stock: {car.quantity}</span></p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" onClick={() => handleRestockClick(car)} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>Restock</button>
                    <button className="btn" onClick={() => handleEdit(car)} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)' }}>Edit</button>
                    <button className="btn" onClick={() => handleDeleteClick(car)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>Delete</button>
                  </div>
                </div>
              ))}
              {vehicles.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No vehicles in database. Add some!</p>}
            </div>
          )}
        </div>
      </div>

      {/* Custom Restock Modal */}
      {restockModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', transform: 'translateY(-20px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Restock Inventory</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Adding units to: <strong style={{ color: 'var(--accent-color)' }}>{restockModal.carMake} {restockModal.carModel}</strong></p>
            
            <div className="input-group" style={{ marginBottom: '2.5rem' }}>
              <input 
                type="number" 
                value={restockModal.qty} 
                onChange={(e) => setRestockModal({...restockModal, qty: e.target.value})} 
                min="1"
                autoFocus 
                required 
                style={{ fontSize: '1.2rem', padding: '12px 0' }}
              />
              <label>Quantity to add</label>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn" 
                onClick={() => setRestockModal({ show: false, carId: null, carMake: '', carModel: '', qty: 5 })} 
                style={{ flex: 1, border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={submitRestock} 
                style={{ flex: 1, background: 'var(--success)' }}
              >
                Confirm (+{restockModal.qty})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Modal */}
      {deleteModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', transform: 'translateY(-20px)', boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.3)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Confirm Deletion</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete the <strong style={{ color: 'white' }}>{deleteModal.carMake} {deleteModal.carModel}</strong>? This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn" 
                onClick={() => setDeleteModal({ show: false, carId: null, carMake: '', carModel: '' })} 
                style={{ flex: 1, border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={submitDelete} 
                style={{ flex: 1, background: 'var(--danger)', color: 'white' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
