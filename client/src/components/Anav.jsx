import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/admin',         label: 'Dashboard' },
  { to: '/admin/users',   label: 'Users' },
  { to: '/admin/bookings',label: 'Bookings' },
  { to: '/admin/cabs',    label: 'Cabs' },
  { to: '/admin/cabs/add',label: '+ Add Cab' },
];

export default function ANav() {
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutAdmin();
    toast.success('Logged out!');
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', height: 64,
      background: 'var(--ink)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
    }}>
      <Link to="/admin" style={{
        fontFamily: 'var(--font-display)', fontSize: '1.4rem',
        fontWeight: 800, color: 'white', letterSpacing: '-0.02em',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        U<span style={{ color: 'var(--amber)' }}>cab</span>
        <span style={{
          fontSize: '0.62rem', background: 'rgba(245,158,11,0.15)',
          color: 'var(--amber)', padding: '3px 8px', borderRadius: 4,
          fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', border: '1px solid rgba(245,158,11,0.25)',
        }}>ADMIN</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to} style={{
            padding: '7px 14px', borderRadius: 'var(--r-sm)', fontSize: '0.86rem',
            color: isActive(to) ? 'var(--amber)' : 'rgba(255,255,255,0.55)',
            background: isActive(to) ? 'rgba(245,158,11,0.1)' : 'transparent',
            fontWeight: isActive(to) ? 700 : 400,
            transition: 'all var(--t-fast)',
            border: isActive(to) ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
          }}
            onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}>
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
          {admin?.name}
        </div>
        <button onClick={handleLogout} style={{
          padding: '7px 16px', borderRadius: 'var(--r-sm)', fontSize: '0.82rem',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
          transition: 'all var(--t-fast)', fontFamily: 'var(--font-body)',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
          Logout
        </button>
      </div>
    </nav>
  );
}