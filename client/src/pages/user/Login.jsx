import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser, accountDeleted } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/users/login', form);
      loginUser(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials.';
      const isDeleted = err.response?.data?.deleted;
      const isDeactivated = err.response?.data?.deactivated;

      if (isDeleted) {
        toast.error('Account not found. Please register again.', { duration: 5000 });
      } else if (isDeactivated) {
        toast.error('Your account has been deactivated. Contact support.', { duration: 5000 });
      } else {
        toast.error(msg);
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left dark panel */}
      <div className="bg-mesh-dark" style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(245,158,11,0.15) 0%,transparent 70%)', pointerEvents:'none' }} />
        <Link to="/" style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:800, color:'white', marginBottom:56, letterSpacing:'-0.02em' }}>
          U<span style={{ color:'var(--amber)' }}>cab</span>
        </Link>
        <div style={{ animation:'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
          <h2 style={{ fontSize:'2.6rem', fontWeight:800, lineHeight:1.1, marginBottom:16, letterSpacing:'-0.02em' }}>
            Your next ride<br />is one tap away.
          </h2>
          <p style={{ color:'rgba(255,255,255,0.55)', lineHeight:1.75, fontSize:'1rem', maxWidth:340 }}>
            Sign in to access your dashboard, book cabs, and track rides in real time.
          </p>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:56, flexWrap:'wrap' }}>
          {['🚗 Mini','🚙 Sedan','🚐 SUV','🏎️ Luxury'].map(c=>(
            <span key={c} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', padding:'7px 16px', borderRadius:99, fontSize:'0.82rem', color:'rgba(255,255,255,0.7)' }}>{c}</span>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:48, background:'var(--surface)' }}>
        <div style={{ width:'100%', maxWidth:380, animation:'scaleIn 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}>

          {/* Deleted account warning */}
          {accountDeleted && (
            <div style={{
              background:'var(--red-light)', border:'1.5px solid #fca5a5',
              borderRadius:'var(--r)', padding:'14px 18px', marginBottom:24,
              animation:'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
            }}>
              <p style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--red)', marginBottom:4 }}>⚠️ Account Removed</p>
              <p style={{ fontSize:'0.82rem', color:'#7f1d1d', lineHeight:1.6 }}>
                Your account was removed by an administrator. Please{' '}
                <Link to="/register" style={{ color:'var(--red)', fontWeight:700, textDecoration:'underline' }}>create a new account</Link>.
              </p>
            </div>
          )}

          <h1 style={{ fontSize:'1.9rem', fontWeight:800, marginBottom:6, letterSpacing:'-0.02em' }}>Sign In</h1>
          <p style={{ color:'var(--n-500)', marginBottom:36, fontSize:'0.9rem' }}>
            No account?{' '}
            <Link to="/register" style={{ color:'var(--amber-dark)', fontWeight:700 }}>Create one free →</Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:'100%', marginTop:8 }}>
              {loading ? <><span className="spinner spinner-sm" style={{ borderTopColor:'var(--ink)', borderColor:'rgba(0,0,0,0.15)' }} /> Signing in…</> : 'Sign In →'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:28, fontSize:'0.8rem', color:'var(--n-400)' }}>
            <Link to="/admin/login" style={{ color:'var(--n-400)' }}>Admin portal →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}