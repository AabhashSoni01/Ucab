import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UNav from '../../components/UNav';
import API, { getImageUrl } from '../../api';
import toast from 'react-hot-toast';

const statusClass = (s) => ({ 'Pending':'badge-pending','Confirmed':'badge-confirmed','In Progress':'badge-inprogress','Completed':'badge-completed','Cancelled':'badge-cancelled' }[s]||'badge-pending');
const catEmoji = { Mini:'🚗', Sedan:'🚕', SUV:'🚙', Luxury:'🏎️', Auto:'🛺' };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState('All');

  const fetchBookings = () => {
    API.get('/rides/mybookings').then(({ data }) => setBookings(data.bookings||[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await API.put(`/rides/${id}/cancel`);
      toast.success('Booking cancelled.');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message||'Failed.'); }
    finally { setCancelling(null); }
  };

  const statuses = ['All','Pending','Confirmed','In Progress','Completed','Cancelled'];
  const filtered = filter==='All' ? bookings : bookings.filter(b=>b.status===filter);

  const stats = [
    { label:'Total',     value:bookings.length,                                       color:'var(--blue-dark)',  bg:'var(--blue-light)' },
    { label:'Active',    value:bookings.filter(b=>['Pending','Confirmed','In Progress'].includes(b.status)).length, color:'#b45309', bg:'#fef9ec' },
    { label:'Completed', value:bookings.filter(b=>b.status==='Completed').length,      color:'#065f46',           bg:'var(--green-light)' },
    { label:'Spent',     value:`₹${bookings.reduce((s,b)=>s+(b.totalFare||0),0)}`,    color:'#5b21b6',           bg:'var(--purple-light)' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }} className="bg-mesh">
      <UNav />
      <main style={{ maxWidth:960, margin:'0 auto', padding:'36px 24px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20, animation:'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <p style={{ fontSize:'0.76rem', fontWeight:700, color:'var(--amber-dark)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Your rides</p>
            <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em' }}>My Bookings</h1>
          </div>
          <Link to="/cabs" className="btn btn-primary btn-sm">+ New Booking</Link>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20, animation:'fadeUp 0.5s 0.05s cubic-bezier(0.16,1,0.3,1) both' }}>
          {stats.map((s,i) => (
            <div key={i} style={{ background:'var(--surface)', border:'1px solid var(--n-100)', borderRadius:'var(--r)', padding:'14px 16px', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:800, color:s.color }}>{loading?'—':s.value}</div>
              <div style={{ fontSize:'0.74rem', color:'var(--n-500)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div style={{ display:'flex', gap:7, marginBottom:20, flexWrap:'wrap', animation:'fadeUp 0.5s 0.08s cubic-bezier(0.16,1,0.3,1) both' }}>
          {statuses.map(s => (
            <button key={s} onClick={()=>setFilter(s)} className="btn btn-sm" style={{
              background: filter===s ? 'var(--ink)' : 'var(--surface)',
              color: filter===s ? 'white' : 'var(--n-600)',
              border: '1.5px solid '+(filter===s ? 'var(--ink)' : 'var(--n-200)'),
              transition:'all var(--t)',
            }}>{s}</button>
          ))}
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : filtered.length===0 ? (
          <div className="empty-state card" style={{ padding:64 }}>
            <div className="empty-state-icon">📋</div>
            <h3>No bookings found</h3>
            <p>You haven't made any bookings yet.</p>
            <Link to="/cabs" className="btn btn-primary btn-sm" style={{ marginTop:16 }}>Browse Cabs</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {filtered.map((b,i) => (
              <div key={b._id} className="card" style={{
                padding:24,
                animation:`fadeUp 0.45s ${0.04+i*0.05}s cubic-bezier(0.16,1,0.3,1) both`,
                transition:'all var(--t)',
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
                <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
                  <div style={{
                    width:56, height:56, borderRadius:14, flexShrink:0,
                    background:'linear-gradient(135deg,var(--amber-light),rgba(245,158,11,0.05))',
                    border:'1px solid rgba(245,158,11,0.2)',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem',
                    overflow:'hidden',
                  }}>
                    {b.car?.image
                      ? <img src={getImageUrl(b.car.image)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:12 }} />
                      : catEmoji[b.car?.category]||'🚕'
                    }
                  </div>

                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--ink)', marginBottom:2 }}>{b.car?.name} {b.car?.model}</h3>
                        <p style={{ fontSize:'0.78rem', color:'var(--n-500)' }}>{b.car?.category} · {b.car?.plateNumber}</p>
                      </div>
                      <span className={`badge ${statusClass(b.status)}`}>{b.status}</span>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:14 }}>
                      {[
                        ['📍 Pickup', b.pickupLocation],
                        ['🏁 Drop', b.dropLocation],
                        ['📅 Date', new Date(b.bookingDate).toLocaleDateString('en-IN')],
                        ['💰 Fare', b.totalFare ? `₹${b.totalFare}` : 'TBD'],
                      ].map(([k,v]) => (
                        <div key={k}>
                          <p style={{ fontSize:'0.7rem', color:'var(--n-400)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{k}</p>
                          <p style={{ fontSize:'0.84rem', fontWeight:500, color:'var(--n-800)' }}>{v}</p>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                      {['Confirmed','In Progress'].includes(b.status) && (
                        <Link to={`/track/${b._id}`} className="btn btn-dark btn-sm" style={{ display:'flex', alignItems:'center', gap:6 }}>
                          🗺 Track Ride
                        </Link>
                      )}
                      {b.status === 'Pending' && (
                        <Link to={`/track/${b._id}`} className="btn btn-secondary btn-sm">
                          ⏳ View Status
                        </Link>
                      )}
                      {['Pending','Confirmed'].includes(b.status) && (
                        <button className="btn btn-danger btn-sm" onClick={()=>handleCancel(b._id)} disabled={cancelling===b._id}>
                          {cancelling===b._id?'…':'Cancel'}
                        </button>
                      )}
                      {b.status === 'Completed' && (
                        <Link to="/cabs" className="btn btn-secondary btn-sm">Book Again</Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}