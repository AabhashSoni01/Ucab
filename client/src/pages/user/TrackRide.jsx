import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import UNav from '../../components/UNav';
import API from '../../api';

const STATUS_STEPS = [
  { key:'Pending',     icon:'🔍', label:'Finding Driver',   desc:'Searching for the nearest driver…' },
  { key:'Confirmed',   icon:'✅', label:'Driver Confirmed', desc:'Your driver has accepted the ride.' },
  { key:'In Progress', icon:'🚗', label:'On the Way',       desc:'Your driver is heading to you now.' },
  { key:'Completed',   icon:'🏁', label:'Arrived',          desc:'You have reached your destination!' },
];

// Fixed landmark positions on our SVG canvas (percentage based)
const DRIVER_START  = { x: 12, y: 78 };  // driver starts far bottom-left
const USER_POS      = { x: 42, y: 58 };  // pickup point (user)
const DEST_POS      = { x: 74, y: 24 };  // destination top-right

// Road waypoints: driver → user (curved path through streets)
const DRIVER_TO_USER_PATH = [
  { x: 12, y: 78 },
  { x: 20, y: 72 },
  { x: 20, y: 58 },
  { x: 30, y: 58 },
  { x: 42, y: 58 },
];

// Road waypoints: user → destination
const USER_TO_DEST_PATH = [
  { x: 42, y: 58 },
  { x: 42, y: 42 },
  { x: 56, y: 42 },
  { x: 56, y: 24 },
  { x: 74, y: 24 },
];

function lerp(a, b, t) { return a + (b - a) * t; }

function interpolatePath(path, progress) {
  if (progress <= 0) return path[0];
  if (progress >= 1) return path[path.length - 1];
  const totalSegments = path.length - 1;
  const scaled = progress * totalSegments;
  const seg = Math.floor(scaled);
  const t = scaled - seg;
  const p1 = path[Math.min(seg, path.length - 1)];
  const p2 = path[Math.min(seg + 1, path.length - 1)];
  return { x: lerp(p1.x, p2.x, t), y: lerp(p1.y, p2.y, t) };
}

function pathToSVGPoints(path) {
  return path.map(p => `${p.x},${p.y}`).join(' ');
}

function MapView({ driverPos, progress, bookingStatus, travelMinutes }) {
  const isLive = bookingStatus === 'In Progress' || bookingStatus === 'Confirmed';
  const arrived = bookingStatus === 'Completed';

  return (
    <div style={{
      width: '100%', height: 340, borderRadius: 'var(--r-lg)', overflow: 'hidden',
      position: 'relative', border: '1px solid rgba(255,255,255,0.06)',
      background: '#1a2035',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0 }}>

        {/* ── Base map bg ── */}
        <rect width="100" height="100" fill="#1a2035"/>

        {/* City blocks */}
        {[
          [0,0,18,35],[0,40,18,18],[0,62,18,38],
          [22,0,16,50],[22,54,16,46],
          [44,0,10,34],[44,48,10,52],
          [58,0,14,36],[58,44,14,56],
          [76,0,24,18],[76,28,24,20],[76,52,24,48],
        ].map(([x,y,w,h],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h}
            fill="#232d4a" rx="0.8" opacity="0.9"/>
        ))}

        {/* ── Roads (vertical) ── */}
        {[20,42,56,76].map(x=>(
          <rect key={x} x={x-1} y={0} width={2} height={100} fill="#2d3a5c" opacity="0.9"/>
        ))}
        {/* Road center dashes */}
        {[20,42,56,76].map(x=>(
          Array.from({length:10}).map((_,i)=>(
            <rect key={`${x}-${i}`} x={x-0.15} y={i*10+1} width={0.3} height={5}
              fill="#3d4f7a" opacity="0.6"/>
          ))
        ))}

        {/* ── Roads (horizontal) ── */}
        {[40,58,72].map(y=>(
          <rect key={y} x={0} y={y-1} width={100} height={2} fill="#2d3a5c" opacity="0.9"/>
        ))}
        {[40,58,72].map(y=>(
          Array.from({length:10}).map((_,i)=>(
            <rect key={`${y}-${i}`} x={i*10+1} y={y-0.15} width={5} height={0.3}
              fill="#3d4f7a" opacity="0.6"/>
          ))
        ))}

        {/* ── Remaining travel path: user → destination (dim) ── */}
        <polyline
          points={pathToSVGPoints(USER_TO_DEST_PATH)}
          fill="none" stroke="#3b82f6" strokeWidth="1.2"
          strokeDasharray="2,1.5" opacity="0.4"
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* ── Driver → user path (full route, dimmed) ── */}
        <polyline
          points={pathToSVGPoints(DRIVER_TO_USER_PATH)}
          fill="none" stroke="#f59e0b" strokeWidth="1.2"
          strokeDasharray="2,1.5" opacity="0.25"
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* ── Traveled portion of driver path (bright) ── */}
        <polyline
          points={pathToSVGPoints(DRIVER_TO_USER_PATH.slice(0, Math.ceil(progress * (DRIVER_TO_USER_PATH.length - 1)) + 1).concat([driverPos]))}
          fill="none" stroke="#f59e0b" strokeWidth="1.6"
          opacity="0.85" strokeLinecap="round" strokeLinejoin="round"
        />

        {/* ── Destination marker ── */}
        <circle cx={DEST_POS.x} cy={DEST_POS.y} r="2.5" fill="#ef4444" opacity="0.3"/>
        <circle cx={DEST_POS.x} cy={DEST_POS.y} r="1.5" fill="#ef4444"/>
        {/* Destination flag pole */}
        <line x1={DEST_POS.x} y1={DEST_POS.y} x2={DEST_POS.x} y2={DEST_POS.y - 5}
          stroke="#ef4444" strokeWidth="0.4"/>
        <rect x={DEST_POS.x} y={DEST_POS.y - 5} width={3} height={2} fill="#ef4444" rx="0.3"/>

        {/* ── User / pickup marker ── */}
        <circle cx={USER_POS.x} cy={USER_POS.y} r="3" fill="#10b981" opacity="0.2"/>
        <circle cx={USER_POS.x} cy={USER_POS.y} r="1.8" fill="#10b981"/>
        <circle cx={USER_POS.x} cy={USER_POS.y} r="0.8" fill="white"/>

        {/* ── Driver marker (animated) ── */}
        {!arrived && (
          <>
            {/* Pulse ring */}
            <circle cx={driverPos.x} cy={driverPos.y} r="4" fill="#f59e0b" opacity="0.15">
              <animate attributeName="r" values="3;5;3" dur="1.8s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.2;0;0.2" dur="1.8s" repeatCount="indefinite"/>
            </circle>
            {/* Driver circle */}
            <circle cx={driverPos.x} cy={driverPos.y} r="2.5" fill="#f59e0b"/>
            <circle cx={driverPos.x} cy={driverPos.y} r="2.5" fill="none" stroke="white" strokeWidth="0.5"/>
            {/* Car icon text */}
            <text x={driverPos.x} y={driverPos.y + 0.7} textAnchor="middle"
              fontSize="2" fill="white" fontWeight="bold">🚕</text>
          </>
        )}
      </svg>

      {/* ── Legend labels (HTML overlaid) ── */}
      {/* User label */}
      <div style={{
        position:'absolute',
        left:`${USER_POS.x}%`, top:`${USER_POS.y - 10}%`,
        transform:'translateX(-50%)',
        background:'#10b981', color:'white',
        padding:'3px 10px', borderRadius:99, fontSize:'0.66rem', fontWeight:700,
        whiteSpace:'nowrap', boxShadow:'0 2px 8px rgba(16,185,129,0.4)',
        pointerEvents:'none',
      }}>📍 You (Pickup)</div>

      {/* Destination label */}
      <div style={{
        position:'absolute',
        left:`${DEST_POS.x}%`, top:`${DEST_POS.y - 12}%`,
        transform:'translateX(-50%)',
        background:'#ef4444', color:'white',
        padding:'3px 10px', borderRadius:99, fontSize:'0.66rem', fontWeight:700,
        whiteSpace:'nowrap', boxShadow:'0 2px 8px rgba(239,68,68,0.4)',
        pointerEvents:'none',
      }}>🏁 Destination</div>

      {/* Driver label */}
      {!arrived && (
        <div style={{
          position:'absolute',
          left:`${Math.min(90, Math.max(10, driverPos.x))}%`,
          top:`${Math.min(85, Math.max(5, driverPos.y + 7))}%`,
          transform:'translateX(-50%)',
          background:'var(--amber)', color:'var(--ink)',
          padding:'3px 10px', borderRadius:99, fontSize:'0.66rem', fontWeight:800,
          whiteSpace:'nowrap', boxShadow:'0 2px 8px rgba(245,158,11,0.4)',
          pointerEvents:'none', transition:'left 1.5s ease, top 1.5s ease',
        }}>🚕 Driver</div>
      )}

      {/* ── Travel time badge (pickup → destination) ── */}
      <div style={{
        position:'absolute', top:12, left:12,
        background:'rgba(11,15,26,0.88)', backdropFilter:'blur(12px)',
        border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:12, padding:'10px 16px', color:'white',
      }}>
        <div style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>
          Pickup → Destination
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:800, color:'var(--amber)' }}>{travelMinutes}</span>
          <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)' }}>min travel</span>
        </div>
      </div>

      {/* ── Live status pill ── */}
      <div style={{
        position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)',
        background:'rgba(11,15,26,0.88)', backdropFilter:'blur(12px)',
        border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:99, padding:'7px 18px',
        color:'white', fontSize:'0.75rem', fontWeight:600,
        whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:8,
      }}>
        <span style={{
          width:7, height:7, borderRadius:'50%',
          background: isLive ? '#10b981' : '#f59e0b',
          display:'inline-block',
          boxShadow: isLive ? '0 0 0 3px rgba(16,185,129,0.2)' : 'none',
        }}/>
        {isLive ? 'Live tracking active' : arrived ? 'Ride completed' : 'Waiting for driver…'}
      </div>
    </div>
  );
}

export default function TrackRide() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [arrivalEta, setArrivalEta] = useState(8);   // driver → user ETA
  const [progress, setProgress] = useState(0);        // 0→1 along driver→user path
  const [driverPos, setDriverPos] = useState({ ...DRIVER_START });
  const intervalRef = useRef(null);

  // Simulate travel time from pickup to destination
  const travelMinutes = booking?.estimatedDistance
    ? Math.round((parseFloat(booking.estimatedDistance) / 30) * 60)
    : 18;

  useEffect(() => {
    const fetchBooking = () => {
      API.get(`/rides/${id}`)
        .then(({ data }) => setBooking(data.booking))
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    fetchBooking();

    // Move driver along DRIVER_TO_USER_PATH toward user every 2.5s
    let step = 0;
    const totalSteps = 40; // total animation steps
    intervalRef.current = setInterval(() => {
      step = Math.min(step + 1, totalSteps);
      const p = step / totalSteps;
      setProgress(p);
      const pos = interpolatePath(DRIVER_TO_USER_PATH, p);
      setDriverPos(pos);
      setArrivalEta(prev => Math.max(0, prev - (8 / totalSteps)));
    }, 2500);

    return () => clearInterval(intervalRef.current);
  }, [id]);

  const currentStatus = booking?.status || 'Pending';
  const currentStep   = STATUS_STEPS.findIndex(s => s.key === currentStatus);

  if (loading) return (
    <div style={{ minHeight:'100vh' }}>
      <UNav />
      <div className="page-loader"><div className="spinner" /></div>
    </div>
  );

  if (!booking) return (
    <div style={{ minHeight:'100vh' }}>
      <UNav />
      <div className="empty-state" style={{ paddingTop:80 }}>
        <div className="empty-state-icon">🚗</div>
        <h3>Booking not found</h3>
        <Link to="/mybookings" className="btn btn-primary" style={{ marginTop:16 }}>My Bookings</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }}>
      <UNav />
      <main style={{ maxWidth:900, margin:'0 auto', padding:'36px 24px' }}>

        <Link to="/mybookings" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.84rem', color:'var(--n-500)', marginBottom:24, fontWeight:500 }}>
          ← My Bookings
        </Link>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Track Your Ride</h1>
            <p style={{ color:'var(--n-500)', fontSize:'0.88rem' }}>
              {booking.car?.name} · {booking.pickupLocation} → {booking.dropLocation}
            </p>
          </div>
          <span className={`badge badge-${currentStatus.toLowerCase().replace(' ','-')}`}
            style={{ fontSize:'0.8rem', padding:'6px 16px' }}>
            {currentStatus}
          </span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }}>

          {/* ── Left: map + progress ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Map */}
            <div className="card" style={{ padding:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <h2 style={{ fontSize:'0.92rem', fontWeight:700 }}>Live Map</h2>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', color:'var(--green)', fontWeight:700 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', display:'inline-block', animation:'glow-pulse 1.5s infinite' }}/>
                  Live
                </div>
              </div>
              <MapView
                driverPos={driverPos}
                progress={progress}
                bookingStatus={currentStatus}
                travelMinutes={travelMinutes}
              />

              {/* Route legend */}
              <div style={{ display:'flex', gap:20, marginTop:14, paddingTop:14, borderTop:'1px solid var(--n-100)' }}>
                {[
                  { color:'#f59e0b', label:'Driver route to you' },
                  { color:'#3b82f6', label:'Your trip to destination' },
                  { color:'#10b981', label:'Pickup point' },
                  { color:'#ef4444', label:'Destination' },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.74rem', color:'var(--n-500)' }}>
                    <div style={{ width:24, height:3, background:color, borderRadius:2 }}/>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Journey time summary */}
            <div className="card" style={{ padding:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:0, textAlign:'center' }}>
                <div style={{ padding:'4px 0' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:800, color:'var(--amber)', letterSpacing:'-0.02em' }}>
                    {Math.max(0, Math.round(arrivalEta))}
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'var(--n-400)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginTop:4 }}>
                    Min to pickup
                  </div>
                </div>
                <div style={{ padding:'4px 0', borderLeft:'1px solid var(--n-100)', borderRight:'1px solid var(--n-100)' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:800, color:'var(--blue)', letterSpacing:'-0.02em' }}>
                    {travelMinutes}
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'var(--n-400)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginTop:4 }}>
                    Min to dest.
                  </div>
                </div>
                <div style={{ padding:'4px 0' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:800, color:'var(--ink)', letterSpacing:'-0.02em' }}>
                    {Math.max(0, Math.round(arrivalEta)) + travelMinutes}
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'var(--n-400)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginTop:4 }}>
                    Total mins
                  </div>
                </div>
              </div>
              <div style={{ marginTop:14, padding:'10px 14px', background:'var(--amber-light)', borderRadius:'var(--r-sm)', border:'1px solid rgba(245,158,11,0.2)', fontSize:'0.8rem', color:'var(--amber-dark)', fontWeight:600, textAlign:'center' }}>
                🕐 Estimated arrival at destination:{' '}
                {(() => {
                  const t = new Date();
                  t.setMinutes(t.getMinutes() + Math.round(arrivalEta) + travelMinutes);
                  return t.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
                })()}
              </div>
            </div>

            {/* Progress steps */}
            <div className="card" style={{ padding:24 }}>
              <h2 style={{ fontSize:'0.92rem', fontWeight:700, marginBottom:20 }}>Ride Progress</h2>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:19, top:20, bottom:20, width:2, background:'var(--n-100)', zIndex:0 }}/>
                <div style={{
                  position:'absolute', left:19, top:20, width:2,
                  height:`${Math.min(100,(currentStep/(STATUS_STEPS.length-1))*100)}%`,
                  background:'linear-gradient(to bottom,var(--amber),var(--green))',
                  transition:'height 0.8s var(--ease)', zIndex:1,
                }}/>
                {STATUS_STEPS.map((s, i) => {
                  const done   = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={s.key} style={{ display:'flex', gap:16, marginBottom:i<STATUS_STEPS.length-1?28:0, position:'relative', zIndex:2 }}>
                      <div style={{
                        width:40, height:40, borderRadius:'50%', flexShrink:0,
                        background: done?'var(--green)':active?'var(--amber)':'var(--n-100)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'1rem', transition:'all 0.4s var(--ease)',
                        boxShadow: active?'0 0 0 6px rgba(245,158,11,0.15)':'none',
                      }}>
                        {done ? '✓' : s.icon}
                      </div>
                      <div style={{ paddingTop:8 }}>
                        <p style={{ fontWeight:active?700:600, fontSize:'0.9rem', color:active?'var(--ink)':done?'var(--n-600)':'var(--n-400)', marginBottom:3 }}>{s.label}</p>
                        <p style={{ fontSize:'0.78rem', color:'var(--n-400)' }}>{active?s.desc:done?'Completed':'Upcoming'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right: ETA + driver + details ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Driver ETA card */}
            <div style={{
              background:'linear-gradient(135deg,var(--ink),var(--ink-soft))',
              borderRadius:'var(--r-lg)', padding:24, color:'white', textAlign:'center',
              boxShadow:'0 8px 32px rgba(11,15,26,0.2)',
            }}>
              <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
                Driver arrives in
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'3.5rem', fontWeight:800, lineHeight:1, color:'var(--amber)', letterSpacing:'-0.03em' }}>
                {Math.max(0, Math.round(arrivalEta))}
              </div>
              <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.4)', marginTop:4 }}>minutes</div>
              <div style={{ marginTop:14, background:'rgba(255,255,255,0.06)', borderRadius:'var(--r-sm)', height:5, overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:99,
                  background:'linear-gradient(90deg,var(--amber),var(--amber-dark))',
                  width:`${100 - (arrivalEta/8)*100}%`,
                  transition:'width 2s var(--ease)',
                }}/>
              </div>
              <div style={{ marginTop:12, fontSize:'0.75rem', color:'rgba(255,255,255,0.35)' }}>
                + {travelMinutes} min to reach destination
              </div>
            </div>

            {/* Driver info */}
            <div className="card" style={{ padding:20 }}>
              <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--n-400)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Your Driver</p>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                <div style={{
                  width:52, height:52, borderRadius:'50%',
                  background:'linear-gradient(135deg,var(--amber),var(--amber-dark))',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.3rem', fontFamily:'var(--font-display)', fontWeight:800, color:'var(--ink)',
                }}>
                  {(booking.car?.driverName || 'D').charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight:700, color:'var(--ink)', marginBottom:2 }}>{booking.car?.driverName || 'Assigned Driver'}</p>
                  <p style={{ fontSize:'0.78rem', color:'var(--n-500)' }}>{booking.car?.driverPhone || 'Contact on arrival'}</p>
                </div>
              </div>
              {[
                ['Vehicle', `${booking.car?.name||''} ${booking.car?.model||''}`],
                ['Plate',   booking.car?.plateNumber],
                ['Rating',  `⭐ ${booking.car?.rating}`],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', marginBottom:8 }}>
                  <span style={{ color:'var(--n-500)' }}>{k}</span>
                  <span style={{ fontWeight:600, color:'var(--ink)' }}>{v||'—'}</span>
                </div>
              ))}
              <a href={`tel:${booking.car?.driverPhone}`} className="btn btn-secondary btn-sm"
                style={{ width:'100%', marginTop:12, justifyContent:'center' }}>
                📞 Call Driver
              </a>
            </div>

            {/* Trip details */}
            <div className="card" style={{ padding:20 }}>
              <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--n-400)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Trip Details</p>
              {[
                ['📍 Pickup',  booking.pickupLocation],
                ['🏁 Drop',    booking.dropLocation],
                ['📅 Date',    new Date(booking.bookingDate).toLocaleDateString('en-IN')],
                ['🕐 Time',    booking.bookingTime],
                ['💰 Fare',    booking.totalFare ? `₹${booking.totalFare}` : 'TBD'],
              ].map(([k,v]) => (
                <div key={k} style={{ marginBottom:10 }}>
                  <p style={{ fontSize:'0.7rem', color:'var(--n-400)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:2 }}>{k}</p>
                  <p style={{ fontSize:'0.84rem', fontWeight:500, color:'var(--n-800)' }}>{v||'—'}</p>
                </div>
              ))}
            </div>

            {/* SOS */}
            <button style={{
              width:'100%', padding:12, borderRadius:'var(--r)',
              background:'var(--red-light)', color:'var(--red)',
              border:'1.5px solid #fca5a5', fontWeight:700, fontSize:'0.88rem',
              cursor:'pointer', fontFamily:'var(--font-body)', transition:'all var(--t)',
            }}
              onMouseEnter={e=>e.currentTarget.style.background='#fecaca'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--red-light)'}>
              🆘 Emergency SOS
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}