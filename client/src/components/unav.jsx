import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function UNav() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    toast.success('See you soon!');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', height: 64,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226,232,240,0.7)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
    }}>
      <Link to="/home" style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
        U<span style={{ color: 'var(--amber)' }}>cab</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {[
          { to: '/home', label: 'Home' },
          { to: '/cabs', label: 'Cabs' },
          { to: '/mybookings', label: 'My Bookings' },
        ].map(({ to, label }) => (
          <Link key={to} to={to} style={{
            padding: '7px 16px', borderRadius: 'var(--r-sm)', fontSize: '0.88rem',
            fontWeight: isActive(to) ? 700 : 500,
            color: isActive(to) ? 'var(--amber-dark)' : 'var(--n-600)',
            background: isActive(to) ? 'var(--amber-glow)' : 'transparent',
            transition: 'all var(--t-fast)',
            position: 'relative',
          }}>
            {label}
            {isActive(to) && (
              <span style={{
                position: 'absolute', bottom: 2, left: '50%',
                transform: 'translateX(-50%)',
                width: 18, height: 2,
                background: 'var(--amber)',
                borderRadius: 2, display: 'block',
              }} />
            )}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--n-100)', padding: '6px 14px 6px 10px',
          borderRadius: 99, fontSize: '0.83rem', color: 'var(--n-700)', fontWeight: 500,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--amber),var(--amber-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 800, color: 'var(--ink)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {user?.name?.split(' ')[0]}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
      </div>
    </nav>
  );
}
