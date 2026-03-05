import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UNav from '../../components/UNav';
import API, { getImageUrl } from '../../api';

const categories = ['All','Mini','Sedan','SUV','Luxury','Auto'];
const catColors  = { Mini:'#dbeafe', Sedan:'#d1fae5', SUV:'#fef3c7', Luxury:'#ede9fe', Auto:'#fee2e2' };
const catEmoji   = { Mini:'🚗', Sedan:'🚕', SUV:'🚙', Luxury:'🏎️', Auto:'🛺' };
const avgSpeedKmh = 30; // city average

// Calculate ETA in minutes based on a simulated distance (1–8 km radius)
function getETA(carId) {
  const seed = carId ? carId.charCodeAt(carId.length - 1) : 5;
  const distKm = 0.5 + (seed % 8);
  const mins = Math.round((distKm / avgSpeedKmh) * 60);
  return { mins, distKm: distKm.toFixed(1) };
}

export default function Cabs() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('eta'); // eta | price | rating

  useEffect(() => {
    API.get('/cars').then(({ data }) => { setCars(data.cars||[]); })
      .catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = (() => {
    let r = [...cars];
    if (activeCategory !== 'All') r = r.filter(c => c.category === activeCategory);
    if (search) r = r.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.model.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'eta')    r.sort((a,b) => getETA(a._id).mins - getETA(b._id).mins);
    if (sortBy === 'price')  r.sort((a,b) => a.pricePerKm - b.pricePerKm);
    if (sortBy === 'rating') r.sort((a,b) => b.rating - a.rating);
    return r;
  })();

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }} className="bg-mesh">
      <UNav />
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'36px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom:28, animation:'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <p style={{ fontSize:'0.76rem', fontWeight:700, color:'var(--amber-dark)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Fleet</p>
          <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Available Cabs</h1>
          <p style={{ color:'var(--n-500)', fontSize:'0.88rem' }}>{filtered.length} vehicle{filtered.length!==1?'s':''} nearby · updated just now</p>
        </div>

        {/* Filters + Sort */}
        <div style={{ display:'flex', gap:12, marginBottom:28, alignItems:'center', flexWrap:'wrap', animation:'fadeUp 0.5s 0.06s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div style={{ position:'relative', flex:'0 0 260px' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--n-400)' }}>🔍</span>
            <input className="form-input" style={{ paddingLeft:36 }} placeholder="Search name or model…"
              value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={()=>setActiveCategory(cat)} className="btn btn-sm" style={{
                background: activeCategory===cat ? 'var(--ink)' : 'var(--surface)',
                color: activeCategory===cat ? 'white' : 'var(--n-600)',
                border: '1.5px solid '+(activeCategory===cat ? 'var(--ink)' : 'var(--n-200)'),
                transition:'all var(--t)',
              }}>
                {cat !== 'All' && <span style={{marginRight:4}}>{catEmoji[cat]}</span>}{cat}
              </button>
            ))}
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:'0.78rem', color:'var(--n-500)', fontWeight:600 }}>Sort:</span>
            {[['eta','⏱ ETA'],['price','💰 Price'],['rating','⭐ Rating']].map(([val,label])=>(
              <button key={val} onClick={()=>setSortBy(val)} className="btn btn-sm" style={{
                background: sortBy===val ? 'var(--amber-light)' : 'var(--surface)',
                color: sortBy===val ? 'var(--amber-dark)' : 'var(--n-600)',
                border: '1.5px solid '+(sortBy===val ? 'rgba(245,158,11,0.3)' : 'var(--n-200)'),
                fontWeight: sortBy===val ? 700 : 400,
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state card" style={{ padding:64 }}>
            <div className="empty-state-icon">🔍</div>
            <h3>No cabs found</h3>
            <p>Try a different category or clear your search.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {filtered.map((car,i) => <CarCard key={car._id} car={car} index={i} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function CarCard({ car, index }) {
  const { mins, distKm } = getETA(car._id);
  const isVeryFast = mins <= 3;
  const isFast = mins <= 6;

  return (
    <div className="card" style={{
      overflow:'hidden', transition:'all var(--t)',
      animation:`fadeUp 0.5s ${0.05+index*0.05}s cubic-bezier(0.16,1,0.3,1) both`,
    }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>

      {/* Image */}
      <div style={{
        height:160, position:'relative', overflow:'hidden',
        background:`linear-gradient(135deg,${catColors[car.category]||'#f1f5f9'},white)`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'4.5rem',
      }}>
        {car.image
          ? <img src={getImageUrl(car.image)} alt={car.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span style={{ animation:'float 3s ease-in-out infinite' }}>{catEmoji[car.category]||'🚕'}</span>
        }

        {/* ETA badge — top left */}
        <div style={{
          position:'absolute', top:12, left:12,
          background: isVeryFast ? '#10b981' : isFast ? 'var(--amber)' : 'var(--ink)',
          color:'white', fontSize:'0.72rem', fontWeight:800,
          padding:'5px 12px', borderRadius:99,
          display:'flex', alignItems:'center', gap:5,
          boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
          animation: isVeryFast ? 'glow-pulse 2s infinite' : 'none',
        }}>
          ⏱ {mins} min away
        </div>

        {/* Availability — top right */}
        <div style={{
          position:'absolute', top:12, right:12,
          background: car.isAvailable ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
          color:'white', fontSize:'0.68rem', fontWeight:700,
          padding:'3px 10px', borderRadius:99, backdropFilter:'blur(4px)',
        }}>
          {car.isAvailable ? '● Available' : '● Unavailable'}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding:'18px 20px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div>
            <h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:2 }}>{car.name}</h3>
            <p style={{ fontSize:'0.78rem', color:'var(--n-500)' }}>{car.model} · {car.category}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.2rem', color:'var(--ink)' }}>₹{car.pricePerKm}</div>
            <div style={{ fontSize:'0.7rem', color:'var(--n-400)' }}>/km</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14, padding:'12px 0', borderTop:'1px solid var(--n-100)', borderBottom:'1px solid var(--n-100)' }}>
          {[
            { icon:'👤', label:'Seats',    val:`${car.seats}` },
            { icon:'⭐', label:'Rating',   val:`${car.rating}` },
            { icon:'📍', label:'Distance', val:`${distKm} km` },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1rem', marginBottom:2 }}>{icon}</div>
              <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--ink)' }}>{val}</div>
              <div style={{ fontSize:'0.68rem', color:'var(--n-400)', fontWeight:500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Arrival time strip */}
        <div style={{
          background: isVeryFast ? 'var(--green-light)' : 'var(--amber-light)',
          border:`1px solid ${isVeryFast ? '#a7f3d0' : 'rgba(245,158,11,0.25)'}`,
          borderRadius:'var(--r-sm)', padding:'8px 12px', marginBottom:14,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <span style={{ fontSize:'0.78rem', color: isVeryFast ? '#065f46' : 'var(--amber-dark)', fontWeight:600 }}>
            {isVeryFast ? '🔥 Arriving very soon!' : isFast ? '⚡ Fast pickup' : '🕐 Scheduled pickup'}
          </span>
          <span style={{ fontSize:'0.78rem', color:'var(--n-700)', fontWeight:700 }}>
            ETA {mins} min
          </span>
        </div>

        {car.isAvailable
          ? <Link to={`/bookcab/${car._id}`} className="btn btn-primary btn-sm" style={{ width:'100%', justifyContent:'center' }}>Book Now →</Link>
          : <button className="btn btn-sm" disabled style={{ width:'100%', background:'var(--n-100)', color:'var(--n-400)' }}>Unavailable</button>
        }
      </div>
    </div>
  );
}