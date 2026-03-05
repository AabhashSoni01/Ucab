import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ANav from '../../components/ANav';
import API from '../../api';
import toast from 'react-hot-toast';

export default function ACabEdit() {
  const { id } = useParams(); const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get(`/cars/${id}`).then(({data})=>{
      const c=data.car;
      setForm({ name:c.name,model:c.model,category:c.category,plateNumber:c.plateNumber,seats:c.seats,pricePerKm:c.pricePerKm,driverName:c.driverName||'',driverPhone:c.driverPhone||'',rating:c.rating,isAvailable:c.isAvailable });
      if(c.image) setPreview(c.image);
    }).catch(()=>toast.error('Car not found.')).finally(()=>setLoading(false));
  },[id]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd=new FormData(); Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      if(image) fd.append('image',image);
      await API.put(`/admin/cars/${id}`,fd,{headers:{'Content-Type':'multipart/form-data'}});
      toast.success('Cab updated!'); navigate('/admin/cabs');
    } catch(err) { toast.error(err.response?.data?.message||'Failed.'); }
    finally { setSaving(false); }
  };

  if (loading||!form) return <div style={{ minHeight:'100vh' }}><ANav /><div className="page-loader"><div className="spinner" /></div></div>;
  const f=(key)=>({ value:form[key], onChange:e=>setForm({...form,[key]:e.target.value}) });

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }}>
      <ANav />
      <main style={{ maxWidth:720, margin:'0 auto', padding:'36px 24px' }}>
        <Link to="/admin/cabs" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.84rem', color:'var(--n-500)', marginBottom:24, fontWeight:500 }}>← Back to Cabs</Link>
        <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:28 }}>Edit Cab</h1>
        <div className="card" style={{ padding:36 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
              {[
                {key:'name',label:'Car Name',type:'text'},{key:'model',label:'Model',type:'text'},
                {key:'plateNumber',label:'Plate Number',type:'text'},{key:'seats',label:'Seats',type:'number'},
                {key:'pricePerKm',label:'Price/km (₹)',type:'number'},{key:'rating',label:'Rating',type:'number'},
                {key:'driverName',label:'Driver Name',type:'text'},{key:'driverPhone',label:'Driver Phone',type:'tel'},
              ].map(({ key, label, type })=>(
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} {...f(key)} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" {...f('category')}>
                  {['Mini','Sedan','SUV','Luxury','Auto'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Availability</label>
                <select className="form-input" value={form.isAvailable?'true':'false'} onChange={e=>setForm({...form,isAvailable:e.target.value==='true'})}>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Car Image</label>
              {preview && <img src={preview} alt="" style={{ maxHeight:140, borderRadius:10, marginBottom:10, width:'100%', objectFit:'cover' }} />}
              <input type="file" accept="image/*" className="form-input" style={{ padding:8 }}
                onChange={e=>{ const f=e.target.files[0]; if(f){setImage(f);setPreview(URL.createObjectURL(f));} }} />
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>{saving?'Saving…':'Save Changes'}</button>
              <Link to="/admin/cabs" className="btn btn-secondary btn-lg">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}