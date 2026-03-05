import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UNav from '../../components/UNav';
import API, { getImageUrl } from '../../api';
import toast from 'react-hot-toast';

const catEmoji = { Mini:'🚗', Sedan:'🚕', SUV:'🚙', Luxury:'🏎️', Auto:'🛺' };

const PROMO_CODES = {
  'UCAB10':  { discount: 10, label: '10% off your ride' },
  'FIRST20': { discount: 20, label: '20% off — first ride' },
  'SAVE50':  { discount: 50, label: '₹50 flat discount', flat: true },
};

const PAYMENT_METHODS = [
  { id:'upi',    icon:'📱', label:'UPI',         desc:'Pay via any UPI app' },
  { id:'card',   icon:'💳', label:'Saved Card',  desc:'•••• •••• •••• 4242' },
  { id:'wallet', icon:'👛', label:'UCab Wallet', desc:'Balance: ₹340' },
  { id:'cash',   icon:'💵', label:'Cash',        desc:'Pay driver directly' },
];

const REFRESHMENTS = [
  { id:'water',   icon:'💧', label:'Water Bottle',  price:20 },
  { id:'chips',   icon:'🍟', label:'Chips Pack',    price:35 },
  { id:'coffee',  icon:'☕', label:'Hot Coffee',    price:60 },
  { id:'juice',   icon:'🥤', label:'Fresh Juice',   price:50 },
  { id:'granola', icon:'🍫', label:'Granola Bar',   price:40 },
];

const DONATION_OPTIONS = [
  { amount:5,   label:'₹5',  desc:'Plant a tree' },
  { amount:10,  label:'₹10', desc:'Feed a child' },
  { amount:20,  label:'₹20', desc:'Education fund' },
  { amount:0,   label:'Skip', desc:'No donation' },
];

function getETA(carId) {
  const seed = carId ? carId.charCodeAt(carId.length - 1) : 5;
  return Math.round(((0.5 + (seed % 8)) / 30) * 60);
}

export default function BookCab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1=details, 2=extras, 3=payment

  // Form state
  const [form, setForm] = useState({ pickupLocation:'', dropLocation:'', bookingDate:'', bookingTime:'', estimatedDistance:'', notes:'' });

  // Feature states
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [savePayment, setSavePayment] = useState(true);
  const [refreshments, setRefreshments] = useState({});
  const [donation, setDonation] = useState(10);

  useEffect(() => {
    API.get(`/cars/${id}`).then(({ data }) => setCar(data.car))
      .catch(() => toast.error('Car not found.')).finally(() => setLoading(false));
  }, [id]);

  // Fare calculations
  const baseFare = car && form.estimatedDistance ? parseFloat(form.estimatedDistance) * car.pricePerKm : 0;
  const refreshmentTotal = Object.entries(refreshments).reduce((sum, [rId, qty]) => {
    const item = REFRESHMENTS.find(r => r.id === rId);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const discount = appliedPromo
    ? appliedPromo.flat ? appliedPromo.discount : Math.round(baseFare * appliedPromo.discount / 100)
    : 0;
  const totalFare = Math.max(0, baseFare - discount) + refreshmentTotal + donation;
  const eta = car ? getETA(car._id) : 0;
  const today = new Date().toISOString().split('T')[0];

  const applyPromo = () => {
    const code = PROMO_CODES[promoCode.toUpperCase()];
    if (code) { setAppliedPromo(code); setPromoError(''); toast.success(`Promo applied: ${code.label}`); }
    else { setPromoError('Invalid promo code'); setAppliedPromo(null); }
  };

  const toggleRefreshment = (id) => {
    setRefreshments(prev => {
      const qty = prev[id] || 0;
      if (qty === 0) return { ...prev, [id]: 1 };
      if (qty >= 3)  return { ...prev, [id]: 0 };
      return { ...prev, [id]: qty + 1 };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await API.post('/rides/book', {
        carId: id, ...form,
        totalFare, paymentMethod,
        refreshments: Object.entries(refreshments).filter(([,q])=>q>0).map(([rId,qty])=>({ item:rId, qty })),
        donation,
        promoCode: appliedPromo ? promoCode : '',
      });
      toast.success('Ride booked! 🎉');
      navigate('/mybookings');
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ minHeight:'100vh' }}><UNav /><div className="page-loader"><div className="spinner" /></div></div>;
  if (!car) return <div style={{ minHeight:'100vh' }}><UNav /><div className="empty-state"><h3>Car not found</h3><Link to="/cabs" className="btn btn-primary" style={{ marginTop:16 }}>Back to Cabs</Link></div></div>;

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }} className="bg-mesh">
      <UNav />
      <main style={{ maxWidth:980, margin:'0 auto', padding:'36px 24px' }}>
        <Link to="/cabs" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.84rem', color:'var(--n-500)', marginBottom:24, fontWeight:500 }}>← Back to Cabs</Link>

        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Book Your Ride</h1>
          <p style={{ color:'var(--n-500)', fontSize:'0.88rem' }}>Complete the steps below to confirm your booking</p>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', gap:0, marginBottom:32, background:'var(--surface)', borderRadius:'var(--r-lg)', padding:6, border:'1px solid var(--n-100)', width:'fit-content' }}>
          {[['1','Trip Details'],['2','Extras'],['3','Payment']].map(([s, label]) => (
            <button key={s} onClick={()=>{ if(parseInt(s)<step || (s==='2' && form.pickupLocation && form.dropLocation && form.bookingDate)) setStep(parseInt(s)); }}
              style={{
                padding:'9px 24px', borderRadius:'var(--r)', fontSize:'0.85rem', fontWeight:600,
                background: step===parseInt(s) ? 'var(--ink)' : 'transparent',
                color: step===parseInt(s) ? 'white' : 'var(--n-400)',
                border:'none', cursor:'pointer', transition:'all var(--t)',
                display:'flex', alignItems:'center', gap:8,
              }}>
              <span style={{
                width:22, height:22, borderRadius:'50%', fontSize:'0.7rem', fontWeight:800,
                background: step===parseInt(s) ? 'rgba(255,255,255,0.2)' : step>parseInt(s) ? 'var(--green)' : 'var(--n-200)',
                color: step===parseInt(s) ? 'white' : step>parseInt(s) ? 'white' : 'var(--n-500)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{step>parseInt(s) ? '✓' : s}</span>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20, alignItems:'start' }}>

          {/* ── Left panel ── */}
          <div>

            {/* Step 1: Trip Details */}
            {step === 1 && (
              <div className="card" style={{ padding:32, animation:'scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
                <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:24, paddingBottom:16, borderBottom:'1px solid var(--n-100)' }}>📍 Trip Details</h2>
                <div className="form-group">
                  <label className="form-label">Pickup Location *</label>
                  <input className="form-input" placeholder="Enter pickup address"
                    value={form.pickupLocation} onChange={e=>setForm({...form,pickupLocation:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Drop Location *</label>
                  <input className="form-input" placeholder="Enter destination"
                    value={form.dropLocation} onChange={e=>setForm({...form,dropLocation:e.target.value})} required />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input className="form-input" type="date" min={today}
                      value={form.bookingDate} onChange={e=>setForm({...form,bookingDate:e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input className="form-input" type="time"
                      value={form.bookingTime} onChange={e=>setForm({...form,bookingTime:e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Distance (km)</label>
                  <input className="form-input" type="number" min="1" placeholder="e.g. 10"
                    value={form.estimatedDistance} onChange={e=>setForm({...form,estimatedDistance:e.target.value})} />
                  {baseFare > 0 && (
                    <div style={{ marginTop:10, background:'var(--green-light)', border:'1px solid #a7f3d0', padding:'10px 14px', borderRadius:'var(--r-sm)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'0.84rem', color:'#065f46', fontWeight:600 }}>✅ Estimated fare</span>
                      <span style={{ fontSize:'1rem', fontWeight:800, color:'#065f46', fontFamily:'var(--font-display)' }}>₹{baseFare.toFixed(0)}</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <textarea className="form-input" rows={2} placeholder="Any special instructions…" style={{ resize:'vertical' }}
                    value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
                </div>

                {/* Promo code */}
                <div style={{ marginTop:4, padding:'18px 0 0', borderTop:'1px solid var(--n-100)' }}>
                  <label className="form-label">🏷️ Promo Code</label>
                  <div style={{ display:'flex', gap:10, marginTop:8 }}>
                    <input className="form-input" placeholder="Enter code (e.g. UCAB10)"
                      value={promoCode} onChange={e=>{setPromoCode(e.target.value.toUpperCase());setPromoError('');setAppliedPromo(null);}}
                      style={{ flex:1, textTransform:'uppercase', fontWeight:600, letterSpacing:'0.05em' }} />
                    <button className="btn btn-secondary" onClick={applyPromo} type="button">Apply</button>
                  </div>
                  {promoError && <p style={{ fontSize:'0.78rem', color:'var(--red)', marginTop:6 }}>{promoError}</p>}
                  {appliedPromo && (
                    <div style={{ marginTop:8, background:'var(--green-light)', border:'1px solid #a7f3d0', padding:'8px 14px', borderRadius:'var(--r-sm)', fontSize:'0.82rem', color:'#065f46', fontWeight:600 }}>
                      🎉 {appliedPromo.label} applied! You save ₹{discount}
                    </div>
                  )}
                  <p style={{ fontSize:'0.75rem', color:'var(--n-400)', marginTop:8 }}>Try: UCAB10 · FIRST20 · SAVE50</p>
                </div>

                <button className="btn btn-primary btn-lg" style={{ width:'100%', marginTop:20 }}
                  onClick={()=>{ if(!form.pickupLocation||!form.dropLocation||!form.bookingDate||!form.bookingTime) { toast.error('Fill all required fields'); return; } setStep(2); }}>
                  Continue to Extras →
                </button>
              </div>
            )}

            {/* Step 2: Extras */}
            {step === 2 && (
              <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>

                {/* Refreshments */}
                <div className="card" style={{ padding:28 }}>
                  <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:6 }}>🍟 In-Ride Refreshments</h2>
                  <p style={{ fontSize:'0.82rem', color:'var(--n-500)', marginBottom:20 }}>Pre-order snacks & drinks delivered to your cab</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                    {REFRESHMENTS.map(item => {
                      const qty = refreshments[item.id] || 0;
                      return (
                        <div key={item.id} onClick={()=>toggleRefreshment(item.id)} style={{
                          border: qty > 0 ? '2px solid var(--amber)' : '1.5px solid var(--n-200)',
                          borderRadius:'var(--r)', padding:'14px 12px', textAlign:'center',
                          cursor:'pointer', transition:'all var(--t)',
                          background: qty > 0 ? 'var(--amber-light)' : 'var(--surface)',
                          position:'relative',
                        }}
                          onMouseEnter={e=>{if(!qty)e.currentTarget.style.borderColor='var(--n-300)';}}
                          onMouseLeave={e=>{if(!qty)e.currentTarget.style.borderColor='var(--n-200)';}}>
                          {qty > 0 && (
                            <div style={{ position:'absolute', top:-8, right:-8, width:22, height:22, borderRadius:'50%', background:'var(--amber)', color:'var(--ink)', fontSize:'0.7rem', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>
                              {qty}
                            </div>
                          )}
                          <div style={{ fontSize:'1.6rem', marginBottom:6 }}>{item.icon}</div>
                          <div style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--ink)', marginBottom:3 }}>{item.label}</div>
                          <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--amber-dark)' }}>₹{item.price}</div>
                        </div>
                      );
                    })}
                  </div>
                  {refreshmentTotal > 0 && (
                    <div style={{ marginTop:16, padding:'10px 16px', background:'var(--amber-light)', borderRadius:'var(--r-sm)', border:'1px solid rgba(245,158,11,0.25)', display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:'0.84rem', fontWeight:600, color:'var(--amber-dark)' }}>Refreshments total</span>
                      <span style={{ fontWeight:800, color:'var(--amber-dark)' }}>₹{refreshmentTotal}</span>
                    </div>
                  )}
                </div>

                {/* Donation */}
                <div className="card" style={{ padding:28 }}>
                  <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:6 }}>💚 Give Back</h2>
                  <p style={{ fontSize:'0.82rem', color:'var(--n-500)', marginBottom:20 }}>Add a small donation to your ride — 100% goes to the cause</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                    {DONATION_OPTIONS.map(opt => (
                      <div key={opt.amount} onClick={()=>setDonation(opt.amount)} style={{
                        border: donation===opt.amount ? '2px solid var(--green)' : '1.5px solid var(--n-200)',
                        borderRadius:'var(--r)', padding:'14px 10px', textAlign:'center',
                        cursor:'pointer', transition:'all var(--t)',
                        background: donation===opt.amount ? 'var(--green-light)' : 'var(--surface)',
                      }}>
                        <div style={{ fontSize:'1rem', fontWeight:800, color: donation===opt.amount ? '#065f46' : 'var(--ink)', marginBottom:4 }}>{opt.label}</div>
                        <div style={{ fontSize:'0.7rem', color:'var(--n-500)' }}>{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display:'flex', gap:12 }}>
                  <button className="btn btn-secondary btn-lg" onClick={()=>setStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-lg" style={{ flex:1 }} onClick={()=>setStep(3)}>Continue to Payment →</button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div className="card" style={{ padding:28 }}>
                  <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:20 }}>💳 Payment Method</h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {PAYMENT_METHODS.map(pm => (
                      <div key={pm.id} onClick={()=>setPaymentMethod(pm.id)} style={{
                        border: paymentMethod===pm.id ? '2px solid var(--amber)' : '1.5px solid var(--n-200)',
                        borderRadius:'var(--r)', padding:'16px 18px',
                        cursor:'pointer', transition:'all var(--t)',
                        background: paymentMethod===pm.id ? 'var(--amber-light)' : 'var(--surface)',
                        display:'flex', alignItems:'center', gap:14,
                      }}>
                        <div style={{ fontSize:'1.5rem' }}>{pm.icon}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--ink)' }}>{pm.label}</div>
                          <div style={{ fontSize:'0.78rem', color:'var(--n-500)', marginTop:2 }}>{pm.desc}</div>
                        </div>
                        <div style={{
                          width:20, height:20, borderRadius:'50%',
                          border: paymentMethod===pm.id ? '6px solid var(--amber)' : '2px solid var(--n-300)',
                          transition:'all var(--t)',
                        }} />
                      </div>
                    ))}
                  </div>

                  <label style={{ display:'flex', alignItems:'center', gap:10, marginTop:16, cursor:'pointer' }}>
                    <input type="checkbox" checked={savePayment} onChange={e=>setSavePayment(e.target.checked)}
                      style={{ width:16, height:16, accentColor:'var(--amber)' }} />
                    <span style={{ fontSize:'0.84rem', color:'var(--n-600)', fontWeight:500 }}>Save this payment method for future rides</span>
                  </label>
                </div>

                {/* Final fare breakdown */}
                <div className="card" style={{ padding:24 }}>
                  <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:16 }}>🧾 Fare Breakdown</h3>
                  {[
                    ['Base fare', `₹${baseFare.toFixed(0)}`],
                    ...(refreshmentTotal > 0 ? [['Refreshments', `₹${refreshmentTotal}`]] : []),
                    ...(discount > 0 ? [['Promo discount', `-₹${discount}`]] : []),
                    ...(donation > 0 ? [['Donation 💚', `₹${donation}`]] : []),
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:10 }}>
                      <span style={{ color:'var(--n-600)' }}>{k}</span>
                      <span style={{ fontWeight:600, color: k.includes('discount') ? 'var(--green)' : 'var(--ink)' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ borderTop:'2px solid var(--n-100)', paddingTop:12, marginTop:4, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:700, fontSize:'0.95rem' }}>Total</span>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.4rem', color:'var(--ink)' }}>₹{totalFare.toFixed(0)}</span>
                  </div>
                </div>

                <div style={{ display:'flex', gap:12 }}>
                  <button className="btn btn-secondary btn-lg" onClick={()=>setStep(2)}>← Back</button>
                  <button className="btn btn-primary btn-lg" style={{ flex:1 }} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <><span className="spinner spinner-sm" style={{ borderTopColor:'var(--ink)', borderColor:'rgba(0,0,0,0.15)' }} /> Confirming…</> : `Confirm & Pay ₹${totalFare.toFixed(0)} →`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Car summary + ETA ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:14, position:'sticky', top:84 }}>

            {/* Car card */}
            <div className="card" style={{ overflow:'hidden' }}>
              <div style={{
                height:140, background:`linear-gradient(135deg,var(--amber-light),rgba(245,158,11,0.05))`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3.5rem',
              }}>
                {car.image
                  ? <img src={getImageUrl(car.image)} alt={car.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ animation:'float 3s ease-in-out infinite' }}>{catEmoji[car.category]||'🚕'}</span>
                }
              </div>
              <div style={{ padding:18 }}>
                <h2 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:2 }}>{car.name}</h2>
                <p style={{ fontSize:'0.78rem', color:'var(--n-500)', marginBottom:14 }}>{car.model} · {car.category}</p>
                {[
                  ['⏱ ETA',   `${eta} min`],
                  ['💰 Rate',  `₹${car.pricePerKm}/km`],
                  ['⭐ Rating',`${car.rating}`],
                  ['👤 Seats', `${car.seats}`],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', marginBottom:8 }}>
                    <span style={{ color:'var(--n-500)' }}>{k}</span>
                    <span style={{ fontWeight:700, color:'var(--ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ETA live countdown */}
            <div style={{ background:'var(--ink)', borderRadius:'var(--r-lg)', padding:20, color:'white', textAlign:'center' }}>
              <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Driver arriving in</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'3rem', fontWeight:800, lineHeight:1, color:'var(--amber)', letterSpacing:'-0.02em' }}>{eta}</div>
              <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', marginTop:4 }}>minutes</div>
              <div style={{ marginTop:14, padding:'8px 14px', background:'rgba(255,255,255,0.06)', borderRadius:'var(--r-sm)', fontSize:'0.78rem', color:'rgba(255,255,255,0.5)' }}>
                📍 {car.driverName || 'Driver'} is nearby
              </div>
            </div>

            {/* Step summary */}
            <div className="card" style={{ padding:18 }}>
              <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--n-500)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>Order Summary</div>
              {[
                ['Ride fare',     baseFare > 0 ? `₹${baseFare.toFixed(0)}` : '—'],
                ['Refreshments',  refreshmentTotal > 0 ? `₹${refreshmentTotal}` : '—'],
                ['Discount',      discount > 0 ? `-₹${discount}` : '—'],
                ['Donation',      donation > 0 ? `₹${donation}` : '—'],
              ].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:7 }}>
                  <span style={{ color:'var(--n-500)' }}>{k}</span>
                  <span style={{ fontWeight:600, color: v.startsWith('-') ? 'var(--green)' : 'var(--ink)' }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop:'1px solid var(--n-100)', paddingTop:10, marginTop:4, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontWeight:700, fontSize:'0.88rem' }}>Total</span>
                <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem' }}>₹{totalFare > 0 ? totalFare.toFixed(0) : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}