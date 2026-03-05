import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import UNav from '../../components/UNav';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:8000';

export default function UHome() {
  const { user, forceLogoutDeleted } = useAuth();
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [accountGone, setAccountGone] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Verify account still exists
    API.get('/users/profile').then(() => {
      setAccountGone(false);
    }).catch((err) => {
      if (err.response?.status === 404 || err.response?.data?.deleted) {
        setAccountGone(true);
        forceLogoutDeleted();
      }
    });

    // Fetch bookings
    API.get('/rides/mybookings')
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Connect socket for real-time ride status updates
    const token = localStorage.getItem('ucab_token');
    if (token) {
      socketRef.current = io(BACKEND_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socketRef.current.on('ride:statusUpdate', ({ status, message }) => {
        // Refresh bookings list
        API.get('/rides/mybookings').then(({ data }) => setBookings(data.bookings || []));

        // Show toast based on status
        if (status === 'In Progress') {
          toast('🚕 ' + message, {
            duration: 6000,
            style: { background:'var(--ink)', color:'white', fontWeight:600 },
          });
        } else if (status === 'Completed') {
          toast.success('🏁 ' + message, { duration: 6000 });
        } else {
          toast(message, { duration: 4000 });
        }
      });
    }

    return () => { socketRef.current?.disconnect(); };
  }, [forceLogoutDeleted]);

  const stats = [
    { label:'Total Rides',  value: bookings.length,                                          icon:'🚕', color:'var(--blue-dark)',  bg:'var(--blue-light)' },
    { label:'Completed',    value: bookings.filter(b=>b.status==='Completed').length,         icon:'✅', color:'#065f46',           bg:'var(--green-light)' },
    { label:'Active',       value: bookings.filter(b=>['Pending','Confirmed','In Progress'].includes(b.status)).length, icon:'⏳', color:'#b45309', bg:'#fef9ec' },
    { label:'Cancelled',    value: bookings.filter(b=>b.status==='Cancelled').length,         icon:'❌', color:'var(--red)',        bg:'var(--red-light)' },
  ];

  // ── Deleted account screen ──
  if (accountGone) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--surface-2)' }} className="bg-mesh">
        <div style={{ maxWidth:480, margin:'0 auto', paddingTop:120, paddingInline:24, textAlign:'center', animation:'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div style={{ fontSize:'4rem', marginBottom:20 }}>🚫</div>
          <h1 style={{ fontSize:'1.7rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:12, color:'var(--ink)' }}>
            Account No Longer Exists
          </h1>
          <p style={{ color:'var(--n-500)', lineHeight:1.75, fontSize:'0.95rem', marginBottom:32 }}>
            Your account has been removed by an administrator and no longer exists in our system.
            To continue using UCab, please create a new account.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Create New Account →</Link>
            <Link to="/" className="btn btn-secondary btn-lg">Go Home</Link>
          </div>
          <p style={{ marginTop:24, fontSize:'0.8rem', color:'var(--n-400)' }}>
            If you believe this is a mistake, please contact support.
          </p>
        </div>
      </div>
    );
  }

  const recentBookings = bookings.slice(0, 5);
  const activeBooking  = bookings.find(b => ['Confirmed','In Progress'].includes(b.status));

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }} className="bg-mesh">
      <UNav />
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'36px 24px' }}>

        {/* Active ride alert */}
        {activeBooking && (
          <div style={{
            background:'linear-gradient(135deg,var(--ink),#1e2640)',
            borderRadius:'var(--r-lg)', padding:'20px 28px', marginBottom:24,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            animation:'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
            boxShadow:'0 8px 32px rgba(11,15,26,0.15)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{
                width:44, height:44, borderRadius:'50%',
                background:'linear-gradient(135deg,var(--amber),var(--amber-dark))',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem',
                animation:'float 2.5s ease-in-out infinite',
              }}>🚕</div>
              <div>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.74rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>
                  {activeBooking.status === 'In Progress' ? '🟢 Ride in progress' : '⏳ Upcoming ride'}
                </p>
                <p style={{ color:'white', fontWeight:700, fontSize:'0.95rem' }}>
                  {activeBooking.pickupLocation} → {activeBooking.dropLocation}
                </p>
              </div>
            </div>
            <Link to={`/track/${activeBooking._id}`} className="btn btn-primary btn-sm">
              Track Ride →
            </Link>
          </div>
        )}

        {/* Welcome */}
        <div style={{ marginBottom:28, animation:'fadeUp 0.5s 0.05s cubic-bezier(0.16,1,0.3,1) both' }}>
          <p style={{ fontSize:'0.76rem', fontWeight:700, color:'var(--amber-dark)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Dashboard</p>
          <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color:'var(--n-500)', fontSize:'0.88rem' }}>Here's your ride summary</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28, animation:'fadeUp 0.5s 0.08s cubic-bezier(0.16,1,0.3,1) both' }}>
          {stats.map((s, i) => (
            <div key={i} className="card" style={{ padding:'20px 22px', display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.7rem', fontWeight:800, color:s.color, lineHeight:1 }}>
                  {loading ? '—' : s.value}
                </div>
                <div style={{ fontSize:'0.74rem', color:'var(--n-500)', fontWeight:600, marginTop:4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }}>

          {/* Recent bookings */}
          <div className="card" style={{ animation:'fadeUp 0.5s 0.12s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{ padding:'22px 24px 0', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h2 style={{ fontSize:'0.95rem', fontWeight:700 }}>Recent Bookings</h2>
              <Link to="/mybookings" style={{ fontSize:'0.8rem', color:'var(--amber-dark)', fontWeight:700 }}>View all →</Link>
            </div>
            {loading ? (
              <div style={{ padding:32, textAlign:'center' }}><div className="spinner" /></div>
            ) : recentBookings.length === 0 ? (
              <div style={{ padding:'32px 24px', textAlign:'center' }}>
                <div style={{ fontSize:'2rem', marginBottom:10 }}>🚕</div>
                <p style={{ color:'var(--n-500)', fontSize:'0.88rem' }}>No bookings yet. Book your first ride!</p>
                <Link to="/cabs" className="btn btn-primary btn-sm" style={{ marginTop:14 }}>Browse Cabs →</Link>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Cab</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b, i) => {
                    const statusColors = {
                      'Pending':     { bg:'#fef9ec', color:'#b45309' },
                      'Confirmed':   { bg:'var(--blue-light)', color:'var(--blue-dark)' },
                      'In Progress': { bg:'var(--amber-light)', color:'var(--amber-dark)' },
                      'Completed':   { bg:'var(--green-light)', color:'#065f46' },
                      'Cancelled':   { bg:'var(--red-light)', color:'var(--red)' },
                    };
                    const sc = statusColors[b.status] || statusColors['Pending'];
                    return (
                      <tr key={b._id} style={{ animation:`slideRight 0.35s ${i*0.04}s cubic-bezier(0.16,1,0.3,1) both` }}>
                        <td style={{ fontWeight:600, fontSize:'0.87rem' }}>{b.car?.name} {b.car?.model}</td>
                        <td style={{ fontSize:'0.82rem', color:'var(--n-600)', maxWidth:160 }}>
                          <div>{b.pickupLocation}</div>
                          <div style={{ color:'var(--n-400)', fontSize:'0.76rem' }}>→ {b.dropLocation}</div>
                        </td>
                        <td style={{ fontSize:'0.82rem', color:'var(--n-500)', whiteSpace:'nowrap' }}>
                          {new Date(b.bookingDate).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ fontWeight:700, fontSize:'0.88rem' }}>₹{b.totalFare||0}</td>
                        <td>
                          <span style={{ background:sc.bg, color:sc.color, padding:'3px 10px', borderRadius:99, fontSize:'0.72rem', fontWeight:700, whiteSpace:'nowrap' }}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          {['Confirmed','In Progress'].includes(b.status) && (
                            <Link to={`/track/${b._id}`} style={{ fontSize:'0.76rem', color:'var(--amber-dark)', fontWeight:700 }}>Track →</Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick actions */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { to:'/cabs',       icon:'🚕', title:'Book a Ride',    desc:'Browse available cabs near you', bg:'linear-gradient(135deg,var(--ink),#1e2640)', color:'white', subColor:'rgba(255,255,255,0.5)' },
              { to:'/mybookings', icon:'📋', title:'My Bookings',    desc:'View all your past & upcoming rides', bg:'var(--surface)', color:'var(--ink)', subColor:'var(--n-500)' },
            ].map(({ to, icon, title, desc, bg, color, subColor }) => (
              <Link key={to} to={to} className="card" style={{
                padding:24, background:bg, textDecoration:'none',
                transition:'all var(--t)', display:'block',
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
                <div style={{ fontSize:'1.8rem', marginBottom:12 }}>{icon}</div>
                <p style={{ fontWeight:700, color, marginBottom:4 }}>{title}</p>
                <p style={{ fontSize:'0.8rem', color:subColor }}>{desc}</p>
              </Link>
            ))}

            {/* Pro tip */}
            <div style={{
              background:'linear-gradient(135deg,var(--amber-light),rgba(245,158,11,0.05))',
              border:'1px solid rgba(245,158,11,0.25)', borderRadius:'var(--r-lg)', padding:20,
            }}>
              <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--amber-dark)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>💡 Pro Tip</p>
              <p style={{ fontSize:'0.82rem', color:'var(--n-700)', lineHeight:1.7 }}>
                Use promo code <strong>UCAB10</strong> for 10% off your next ride!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}