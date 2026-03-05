import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ANav from '../../components/ANav';
import API from '../../api';
import toast from 'react-hot-toast';

export default function AUserEdit() {
  const { id } = useParams(); const navigate = useNavigate();
  const [form, setForm] = useState({ name:'',email:'',phone:'',isActive:true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get(`/admin/users/${id}`).then(({data})=>{
      const u=data.user; setForm({ name:u.name, email:u.email, phone:u.phone||'', isActive:u.isActive });
    }).catch(()=>toast.error('User not found.')).finally(()=>setLoading(false));
  },[id]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await API.put(`/admin/users/${id}`,form); toast.success('User updated!'); navigate('/admin/users'); }
    catch(err) { toast.error(err.response?.data?.message||'Update failed.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ minHeight:'100vh' }}><ANav /><div className="page-loader"><div className="spinner" /></div></div>;

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }}>
      <ANav />
      <main style={{ maxWidth:520, margin:'0 auto', padding:'36px 24px' }}>
        <Link to="/admin/users" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.84rem', color:'var(--n-500)', marginBottom:24, fontWeight:500 }}>← Back to Users</Link>
        <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:28 }}>Edit User</h1>
        <div className="card" style={{ padding:32 }}>
          <form onSubmit={handleSubmit}>
            {[
              { key:'name',  label:'Full Name', type:'text' },
              { key:'email', label:'Email',     type:'email' },
              { key:'phone', label:'Phone',     type:'tel' },
            ].map(({ key, label, type }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.isActive?'true':'false'} onChange={e=>setForm({...form,isActive:e.target.value==='true'})}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:8 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Save Changes'}</button>
              <Link to="/admin/users" className="btn btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}