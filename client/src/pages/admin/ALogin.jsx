import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api';
import toast from 'react-hot-toast';

export default function ALogin() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/admin/login', form);
      loginAdmin(data.admin, data.token);
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } catch (err) { toast.error(err.response?.data?.message||'Login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-mesh-dark" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400, animation:'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <Link to="/" style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800, color:'white', letterSpacing:'-0.02em', display:'inline-block' }}>
            U<span style={{ color:'var(--amber)' }}>cab</span>
          </Link>
          <div style={{ marginTop:10, display:'inline-flex', gap:0, flexDirection:'column', alignItems:'center' }}>
            <span style={{
              background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)',
              color:'var(--amber)', padding:'4px 14px', borderRadius:99, fontSize:'0.72rem',
              fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
            }}>Admin Portal</span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)',
          border:'1px solid rgba(255,255,255,0.1)', borderRadius:24, padding:36,
        }}>
          <h2 style={{ fontSize:'1.4rem', fontWeight:800, color:'white', marginBottom:4, letterSpacing:'-0.01em' }}>Sign In</h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem', marginBottom:28 }}>
            New here?{' '}
            <Link to="/admin/register" style={{ color:'var(--amber)', fontWeight:600 }}>Create admin account</Link>
          </p>

          <form onSubmit={handleSubmit}>
            {[
              { key:'email',    label:'Email',    type:'email',    placeholder:'admin@ucab.com' },
              { key:'password', label:'Password', type:'password', placeholder:'••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className="form-group">
                <label className="form-label" style={{ color:'rgba(255,255,255,0.4)' }}>{label}</label>
                <input className="form-input" type={type} placeholder={placeholder}
                  style={{ background:'rgba(255,255,255,0.06)', borderColor:'rgba(255,255,255,0.1)', color:'white' }}
                  value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg"
              style={{ width:'100%', marginTop:8 }}>
              {loading ? (
                <><span className="spinner spinner-sm" style={{ borderTopColor:'var(--ink)', borderColor:'rgba(0,0,0,0.15)' }} /> Signing in…</>
              ) : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:'0.8rem', color:'rgba(255,255,255,0.25)' }}>
          <Link to="/" style={{ color:'rgba(255,255,255,0.25)' }}>← Back to site</Link>
        </p>
      </div>
    </div>
  );
}