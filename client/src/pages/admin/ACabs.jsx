import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ANav from '../../components/ANav';
import API, { getImageUrl } from '../../api';
import toast from 'react-hot-toast';

const catColors = { Mini:'#dbeafe', Sedan:'#d1fae5', SUV:'#fef3c7', Luxury:'#ede9fe', Auto:'#fee2e2' };
const catEmoji  = { Mini:'🚗', Sedan:'🚕', SUV:'🚙', Luxury:'🏎️', Auto:'🛺' };

export default function ACabs() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');

  const fetchCars = () => {
    API.get('/cars').then(({data})=>setCars(data.cars||[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(()=>{ fetchCars(); },[]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete cab "${name}"?`)) return;
    setDeleting(id);
    try { await API.delete(`/admin/cars/${id}`); toast.success('Cab deleted.'); fetchCars(); }
    catch { toast.error('Delete failed.'); }
    finally { setDeleting(null); }
  };

  const filtered = cars.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.model.toLowerCase().includes(search.toLowerCase()) ||
    c.plateNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }}>
      <ANav />
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'36px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, animation:'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <p style={{ fontSize:'0.76rem', fontWeight:700, color:'var(--amber-dark)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Fleet</p>
            <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Cab Management</h1>
            <p style={{ color:'var(--n-500)', fontSize:'0.85rem' }}>{cars.length} vehicles registered</p>
          </div>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--n-400)' }}>🔍</span>
              <input className="form-input" style={{ paddingLeft:36, maxWidth:240 }} placeholder="Search cabs…"
                value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <Link to="/admin/cabs/add" className="btn btn-primary">+ Add Cab</Link>
          </div>
        </div>

        <div className="card" style={{ animation:'fadeUp 0.5s 0.08s cubic-bezier(0.16,1,0.3,1) both' }}>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : filtered.length===0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚗</div>
              <h3>No cabs found</h3>
              <Link to="/admin/cabs/add" className="btn btn-primary btn-sm" style={{ marginTop:16 }}>Add First Cab</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Cab</th><th>Category</th><th>Plate</th><th>Seats</th><th>₹/km</th><th>Driver</th><th>Rating</th><th>Status</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map((car,i)=>(
                    <tr key={car._id} style={{ animation:`slideRight 0.35s ${i*0.04}s cubic-bezier(0.16,1,0.3,1) both` }}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{
                            width:42, height:42, borderRadius:10, flexShrink:0,
                            background:catColors[car.category]||'var(--n-100)',
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem',
                            overflow:'hidden',
                          }}>
                            {car.image
                              ? <img src={getImageUrl(car.image)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              : catEmoji[car.category]||'🚕'
                            }
                          </div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{car.name}</div>
                            <div style={{ fontSize:'0.76rem', color:'var(--n-400)' }}>{car.model}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ background:catColors[car.category]||'var(--n-100)', padding:'3px 10px', borderRadius:99, fontSize:'0.74rem', fontWeight:700, color:'var(--n-700)' }}>
                          {car.category}
                        </span>
                      </td>
                      <td><code style={{ background:'var(--n-100)', padding:'2px 8px', borderRadius:4, fontSize:'0.8rem', fontWeight:600 }}>{car.plateNumber}</code></td>
                      <td style={{ fontWeight:500 }}>{car.seats}</td>
                      <td style={{ fontWeight:700, color:'var(--ink)' }}>₹{car.pricePerKm}</td>
                      <td style={{ fontSize:'0.84rem', color:'var(--n-600)' }}>{car.driverName||'—'}</td>
                      <td>
                        <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.84rem', fontWeight:600 }}>
                          ⭐ {car.rating}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${car.isAvailable?'badge-completed':'badge-cancelled'}`}>
                          {car.isAvailable?'Available':'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:8 }}>
                          <Link to={`/admin/cabs/${car._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                          <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(car._id,car.name)} disabled={deleting===car._id}>
                            {deleting===car._id?'…':'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}