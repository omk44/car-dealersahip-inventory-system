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

  const [purchaseModal, setPurchaseModal] = useState({ show: false, car: null, qty: 1 });
  const [purchasing, setPurchasing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
      setCurrentPage(1); // Reset to page 1 on new search
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

  const handlePurchaseClick = (car) => {
    setPurchaseModal({ show: true, car, qty: 1 });
  };

  const submitPurchase = async () => {
    try {
      setPurchasing(true);
      // Send a single request with the requested quantity.
      // The backend uses atomic $inc operations to prevent race conditions during concurrent purchases.
      await api.post(`/vehicles/${purchaseModal.car._id || purchaseModal.car.id}/purchase`, {
        quantity: purchaseModal.qty
      });
      
      showToast(`Successfully purchased ${purchaseModal.qty}x ${purchaseModal.car.model}!`);
      setPurchaseModal({ show: false, car: null, qty: 1 });
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete full purchase');
    } finally {
      setPurchasing(false);
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehicles = vehicles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vehicles.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            placeholder="Max Price (₹)" 
            value={filters.maxPrice}
            onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '12px 20px', fontSize: '1rem', outline: 'none' }}
          />
        </div>
      </div>

      {/* Vehicle Grid Header */}
      {!loading && vehicles.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', margin: 0 }}>Available Inventory</h2>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, vehicles.length)} of {vehicles.length}
          </div>
        </div>
      )}

      {/* Vehicle Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {vehicles.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.5rem' }}>No vehicles matched your search.</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', opacity: 0.6 }}>Try adjusting your filters to find your dream car.</p>
              </div>
            ) : (
              currentVehicles.map((car) => (
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
                      <h3 style={{ color: 'var(--success)', margin: 0, fontSize: '1.4rem' }}>₹{car.price.toLocaleString()}</h3>
                    </div>

                    {car.quantity < 5 && car.quantity > 0 && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem', display: 'inline-block', width: 'fit-content' }}>
                        🔥 Low Stock: Only {car.quantity} left!
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: car.quantity > 0 ? 'var(--success)' : 'var(--danger)', boxShadow: `0 0 10px ${car.quantity > 0 ? 'var(--success)' : 'var(--danger)'}` }}></div>
                        <span style={{ color: car.quantity > 0 ? 'var(--text-secondary)' : 'var(--danger)', fontWeight: '500', fontSize: '0.9rem' }}>
                          {car.quantity > 0 ? `${car.quantity} Available` : 'Sold Out'}
                        </span>
                      </div>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handlePurchaseClick(car)}
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
          
          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '4rem' }}>
              <button 
                onClick={() => {
                  paginate(Math.max(1, currentPage - 1));
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: currentPage === 1 ? 'var(--text-secondary)' : 'white', width: '40px', height: '40px', borderRadius: '10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '1.1rem' }}
              >
                &lt;
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    paginate(i + 1);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  style={{ background: currentPage === i + 1 ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer', fontWeight: currentPage === i + 1 ? 'bold' : 'normal', fontSize: '1rem' }}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => {
                  paginate(Math.min(totalPages, currentPage + 1));
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: currentPage === totalPages ? 'var(--text-secondary)' : 'white', width: '40px', height: '40px', borderRadius: '10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '1.1rem' }}
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}

      {/* Advanced Purchase Modal (Template Match) */}
      {purchaseModal.show && purchaseModal.car && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '450px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', animation: 'slideUp 0.3s ease-out' }}>
            
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Purchase Vehicle</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.9rem' }}>Complete your transaction</p>
              </div>
              <button onClick={() => setPurchaseModal({show: false, car: null, qty: 1})} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'background 0.2s' }}>×</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem' }}>
              
              {/* Product Info Card */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>{purchaseModal.car.make} {purchaseModal.car.model}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '2px 8px', borderRadius: '6px' }}>{purchaseModal.car.category}</span>
                    <span>•</span>
                    <span>₹{purchaseModal.car.price.toLocaleString()} each</span>
                  </div>
                  <div style={{ marginTop: '0.8rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Stock: </span>
                    <strong style={{ color: purchaseModal.car.quantity < 5 ? 'var(--danger)' : 'var(--success)' }}>{purchaseModal.car.quantity} units</strong>
                  </div>
                </div>
                <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                  🚗
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>How many would you like to purchase?</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <button 
                    onClick={() => setPurchaseModal(p => ({...p, qty: Math.max(1, p.qty - 1)}))}
                    style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >-</button>
                  <input 
                    type="number" 
                    value={purchaseModal.qty}
                    onChange={(e) => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val)) val = 1;
                      if (val > purchaseModal.car.quantity) val = purchaseModal.car.quantity;
                      if (val < 1) val = 1;
                      setPurchaseModal(p => ({...p, qty: val}));
                    }}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', height: '50px', textAlign: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}
                  />
                  <button 
                    onClick={() => setPurchaseModal(p => ({...p, qty: Math.min(purchaseModal.car.quantity, p.qty + 1)}))}
                    style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[1, 2, 5].map(num => (
                    <button 
                      key={num}
                      onClick={() => setPurchaseModal(p => ({...p, qty: Math.min(purchaseModal.car.quantity, num)}))}
                      style={{ background: purchaseModal.qty === num ? '#8b5cf6' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', transition: 'background 0.2s' }}
                    >
                      {num}
                    </button>
                  ))}
                  <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.85rem', alignSelf: 'center' }}>Max available: {purchaseModal.car.quantity} units</span>
                </div>
              </div>

              {/* Total Cost & Action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Total Cost</div>
                  <div style={{ color: '#8b5cf6', fontSize: '1.8rem', fontWeight: 'bold' }}>₹{(purchaseModal.car.price * purchaseModal.qty).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <div>{purchaseModal.qty} × ₹{(purchaseModal.car.price).toLocaleString()}</div>
                  <div>Including all taxes</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setPurchaseModal({show: false, car: null, qty: 1})}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={submitPurchase}
                  disabled={purchasing}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', border: 'none', color: 'white', fontWeight: '600', cursor: purchasing ? 'not-allowed' : 'pointer', opacity: purchasing ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  {purchasing ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : 'Confirm Purchase'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}} />
    </div>
  );
};

export default Dashboard;
