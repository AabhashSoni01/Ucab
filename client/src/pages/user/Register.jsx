import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/users/register', form);
      loginUser(data.user, data.token);
      toast.success('Welcome to UCab! 🎉');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left */}
      <div style={{
        background: 'linear-gradient(160deg, #0b0f1a 0%, #1a2540 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,158,11,0.18) 0%,transparent 70%)', pointerEvents:'none' }} />
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: 56, letterSpacing: '-0.02em' }}>
          U<span style={{ color: 'var(--amber)' }}>cab</span>
        </Link>
        <div style={{ animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Join thousands<br />of happy riders.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontSize: '0.95rem', maxWidth: 320 }}>
            Create your free account in seconds. No credit card, no commitments.
          </p>
          <ul style={{ marginTop: 40, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['✓  Free account forever', '✓  Book & track rides instantly', '✓  View full ride history'].map(item => (
              <li key={item} style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 8 }}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, background: 'var(--surface)' }}>
        <div style={{ width: '100%', maxWidth: 380, animation: 'scaleIn 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Create Account</h1>
          <p style={{ color: 'var(--n-500)', marginBottom: 32, fontSize: '0.9rem' }}>
            Already a member?{' '}
            <Link to="/login" style={{ color: 'var(--amber-dark)', fontWeight: 700 }}>Sign in →</Link>
          </p>
          <form onSubmit={handleSubmit}>
            {[
              { key: 'name',     label: 'Full Name',        type: 'text',     placeholder: 'John Doe' },
              { key: 'email',    label: 'Email Address',    type: 'email',    placeholder: 'you@example.com' },
              { key: 'phone',    label: 'Phone (optional)', type: 'tel',      placeholder: '+91 98765 43210' },
              { key: 'password', label: 'Password',         type: 'password', placeholder: 'Min 6 characters' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type={type} placeholder={placeholder}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  required={key !== 'phone'} />
              </div>
            ))}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ width: '100%', marginTop: 8 }}>
              {loading ? (
                <><span className="spinner spinner-sm" style={{ borderTopColor: 'var(--ink)', borderColor: 'rgba(0,0,0,0.15)' }} /> Creating account…</>
              ) : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}