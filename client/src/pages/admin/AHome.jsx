import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ANav from '../../components/ANav';
import API from '../../api';

const statusClass = (s) => ({ 'Pending':'badge-pending','Confirmed':'badge-confirmed','In Progress':'badge-inprogress','Completed':'badge-completed','Cancelled':'badge-cancelled' }[s]||'badge-pending');

export default function AHome() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/admin/stats'), API.get('/admin/bookings')])
      .then(([s, b]) => { setStats(s.data.stats); setRecentBookings((b.data.bookings||[]).slice(0,6)); })
      .catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const statCards = stats ? [
    { label:'Total Users',    value:stats.totalUsers,       icon:'👥', bg:'linear-gradient(135deg,#dbeafe,#eff6ff)', color:'var(--blue-dark)' },
    { label:'Total Cabs',     value:stats.totalCars,        icon:'🚗', bg:'linear-gradient(135deg,#d1fae5,#ecfdf5)', color:'#065f46' },
    { label:'Bookings',       value:stats.totalBookings,    icon:'📋', bg:'linear-gradient(135deg,#fef9ec,#fef3c7)', color:'#b45309' },
    { label:'Pending Rides',  value:stats.pendingBookings,  icon:'⏳', bg:'linear-gradient(135deg,#fee2e2,#fef2f2)', color:'#991b1b' },
    { label:'Completed',      value:stats.completedBookings,icon:'✅', bg:'linear-gradient(135deg,#d1fae5,#ecfdf5)', color:'#065f46' },
    { label:'Revenue',        value:`₹${stats.totalRevenue}`,icon:'💰',bg:'linear-gradient(135deg,#ede9fe,#f5f3ff)', color:'#5b21b6' },
  ] : [];

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }}>
      <ANav />
      <main style={{ maxWidth:1200, margin:'0 auto', padding:'36px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom:28, animation:'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <p style={{ fontSize:'0.76rem', fontWeight:700, color:'var(--amber-dark)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Overview</p>
          <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em' }}>Dashboard</h1>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="page-loader" style={{ minHeight:180 }}><div className="spinner" /></div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
            {statCards.map((s,i) => (
              <div key={i} className="stat-card" style={{ animationDelay:`${i*0.07}s` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                  <div className="stat-icon" style={{ background:s.bg }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:20 }}>
          {/* Recent bookings table */}
          <div className="card" style={{ animation:'fadeUp 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--n-100)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:'0.92rem', fontWeight:700 }}>Recent Bookings</h2>
              <Link to="/admin/bookings" style={{ fontSize:'0.8rem', color:'var(--amber-dark)', fontWeight:600 }}>View all →</Link>
            </div>
            <div className="table-wrap">
              {recentBookings.length===0 ? (
                <div className="empty-state"><div className="empty-state-icon">📋</div><p>No bookings yet.</p></div>
              ) : (
                <table>
                  <thead><tr>
                    <th>User</th><th>Cab</th><th>Date</th><th>Fare</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {recentBookings.map(b => (
                      <tr key={b._id} style={{ animation:'slideRight 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                        <td style={{ fontWeight:500 }}>{b.user?.name||'—'}</td>
                        <td style={{ color:'var(--n-600)' }}>{b.car?.name} {b.car?.model}</td>
                        <td style={{ color:'var(--n-500)', fontSize:'0.82rem' }}>{new Date(b.bookingDate).toLocaleDateString('en-IN')}</td>
                        <td style={{ fontWeight:600 }}>₹{b.totalFare||'—'}</td>
                        <td><span className={`badge ${statusClass(b.status)}`}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display:'flex', flexDirection:'column', gap:12, animation:'fadeUp 0.5s 0.25s cubic-bezier(0.16,1,0.3,1) both' }}>
            {[
              { to:'/admin/users',    emoji:'👥', label:'Manage Users',    desc:'View & edit all users' },
              { to:'/admin/cabs',     emoji:'🚗', label:'Manage Cabs',     desc:'Fleet management' },
              { to:'/admin/bookings', emoji:'📋', label:'All Bookings',    desc:'Monitor bookings' },
              { to:'/admin/cabs/add', emoji:'➕', label:'Add New Cab',     desc:'Register a vehicle', highlight:true },
            ].map(({ to, emoji, label, desc, highlight }) => (
              <Link key={to} to={to} className="card" style={{
                padding:'16px 18px', display:'block',
                background: highlight ? 'var(--ink)' : 'var(--surface)',
                border: highlight ? '1px solid rgba(255,255,255,0.05)' : '1px solid var(--n-100)',
                transition:'all var(--t)',
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:'1.2rem' }}>{emoji}</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:'0.86rem', color:highlight?'white':'var(--ink)', marginBottom:2 }}>{label}</p>
                    <p style={{ fontSize:'0.75rem', color:highlight?'rgba(255,255,255,0.45)':'var(--n-500)' }}>{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}