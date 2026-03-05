import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ANav from '../../components/ANav';
import API from '../../api';
import toast from 'react-hot-toast';

export default function AddCar() {
  const [form, setForm] = useState({ name:'',model:'',category:'Sedan',plateNumber:'',seats:4,pricePerKm:'',driverName:'',driverPhone:'',rating:4.5,isAvailable:true });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      if (image) fd.append('image', image);
      await API.post('/admin/cars', fd, { headers:{'Content-Type':'multipart/form-data'} });
      toast.success('Cab added! 🚗');
      navigate('/admin/cabs');
    } catch(err) { toast.error(err.response?.data?.message||'Failed.'); }
    finally { setLoading(false); }
  };

  const f = (key) => ({ value:form[key], onChange:e=>setForm({...form,[key]:e.target.value}) });

  const fields = [
    [{ key:'name',       label:'Car Name *',       type:'text',   placeholder:'e.g. Maruti Swift' },
     { key:'model',      label:'Model *',           type:'text',   placeholder:'e.g. 2023 Petrol' }],
    [{ key:'plateNumber',label:'Plate Number *',    type:'text',   placeholder:'MH12AB1234' },
     { key:'seats',      label:'Seats *',           type:'number', placeholder:'4' }],
    [{ key:'pricePerKm', label:'Price / km (₹) *',  type:'number', placeholder:'e.g. 12' },
     { key:'rating',     label:'Rating',            type:'number', placeholder:'4.5' }],
    [{ key:'driverName', label:'Driver Name',       type:'text',   placeholder:'Ramesh Kumar' },
     { key:'driverPhone',label:'Driver Phone',      type:'tel',    placeholder:'+91 98765 43210' }],
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }}>
      <ANav />
      <main style={{ maxWidth:720, margin:'0 auto', padding:'36px 24px' }}>
        <Link to="/admin/cabs" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.84rem', color:'var(--n-500)', marginBottom:24, fontWeight:500 }}>
          ← Back to Cabs
        </Link>
        <div style={{ marginBottom:28, animation:'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em' }}>Add New Cab</h1>
          <p style={{ color:'var(--n-500)', fontSize:'0.88rem', marginTop:4 }}>Register a new vehicle to the fleet</p>
        </div>

        <div className="card" style={{ padding:36, animation:'fadeUp 0.5s 0.08s cubic-bezier(0.16,1,0.3,1) both' }}>
          <form onSubmit={handleSubmit}>
            {fields.map((row,ri)=>(
              <div key={ri} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
                {row.map(({ key, label, type, placeholder })=>(
                  <div key={key} className="form-group">
                    <label className="form-label">{label}</label>
                    <input className="form-input" type={type} placeholder={placeholder} {...f(key)}
                      required={label.includes('*')} />
                  </div>
                ))}
              </div>
            ))}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-input" {...f('category')}>
                  {['Mini','Sedan','SUV','Luxury','Auto'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Availability</label>
                <select className="form-input" value={form.isAvailable?'true':'false'}
                  onChange={e=>setForm({...form,isAvailable:e.target.value==='true'})}>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label className="form-label">Car Image</label>
              <label htmlFor="img" style={{
                display:'block', border:'2px dashed var(--n-200)', borderRadius:'var(--r)',
                padding:preview?0:32, textAlign:'center', cursor:'pointer',
                background:preview?'transparent':'var(--n-50)',
                transition:'all var(--t)', overflow:'hidden',
              }}
                onMouseEnter={e=>{ if(!preview) e.currentTarget.style.borderColor='var(--amber)'; }}
                onMouseLeave={e=>{ if(!preview) e.currentTarget.style.borderColor='var(--n-200)'; }}>
                {preview ? (
                  <div style={{ position:'relative' }}>
                    <img src={preview} alt="preview" style={{ width:'100%', height:160, objectFit:'cover' }} />
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity var(--t)' }}
                      onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}>
                      <span style={{ color:'white', fontWeight:600, fontSize:'0.88rem' }}>Change Image</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:'2rem', marginBottom:10 }}>📷</div>
                    <p style={{ fontSize:'0.88rem', color:'var(--n-600)', fontWeight:500 }}>Click to upload car image</p>
                    <p style={{ fontSize:'0.76rem', color:'var(--n-400)', marginTop:4 }}>JPEG, PNG, WebP · Max 5MB</p>
                  </>
                )}
                <input id="img" type="file" accept="image/*" style={{ display:'none' }} onChange={handleImage} />
              </label>
            </div>

            <div style={{ display:'flex', gap:12, marginTop:8 }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner spinner-sm" style={{ borderTopColor:'var(--ink)', borderColor:'rgba(0,0,0,0.15)' }} /> Adding…</> : 'Add Cab →'}
              </button>
              <Link to="/admin/cabs" className="btn btn-secondary btn-lg">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}