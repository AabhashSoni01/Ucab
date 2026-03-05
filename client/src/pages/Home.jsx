import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🚗', title: 'Wide Selection',    desc: 'Mini, Sedan, SUV, Luxury — pick exactly what your journey needs.' },
  { icon: '⚡', title: 'Instant Booking',   desc: 'Go from search to confirmed ride in under 30 seconds.' },
  { icon: '📍', title: 'Live Tracking',     desc: 'Watch your driver approach in real-time on the map.' },
  { icon: '🔒', title: 'Safe & Verified',   desc: 'Every driver is background-checked and rated by riders.' },
];

const stats = [
  { value: '100+', label: 'Rides completed' },
  { value: '98%',  label: 'On-time arrivals' },
  { value: '4.6★', label: 'Average rating' },
  { value: '20+', label: 'Verified drivers' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', overflow: 'hidden' }}>

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 52px', height: 68,
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(239, 235, 235, 0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226,232,240,0.6)',
        
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          U<span style={{ color: 'var(--amber)' }}>cab</span>
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user ? (
            <Link to="/home" className="btn btn-primary">Dashboard →</Link>
          ) : (
            <>
              <Link to="/login"    className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
          <Link to="/admin/login" className="btn btn-secondary btn-sm" style={{ color: 'var(--n-500)' }}>Admin</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        maxWidth: 1180, margin: '0 auto', padding: '96px 52px 80px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
      }}>
        <div style={{ animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--amber-light)', color: 'var(--amber-dark)',
            padding: '6px 16px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700,
            marginBottom: 28, border: '1px solid rgba(245,158,11,0.25)',
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            🚖 &nbsp;Now available in your city
          </div>
          <h1 style={{
            fontSize: '4rem', fontWeight: 800, lineHeight: 1.05,
            marginBottom: 22, letterSpacing: '-0.03em',
          }}>
            Your ride,<br />
            <span className="text-gradient">on demand.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--n-500)', marginBottom: 40, lineHeight: 1.75, maxWidth: 460 }}>
            Book reliable cabs instantly. Choose from a range of verified vehicles and reach your destination safely, every time.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-xl">Book a Ride →</Link>
            <Link to="/login"    className="btn btn-secondary btn-xl">Sign In</Link>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: 32, marginTop: 52,
            paddingTop: 32, borderTop: '1px solid var(--n-100)',
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{ animation: `fadeUp 0.6s ${0.15 + i * 0.07}s cubic-bezier(0.16,1,0.3,1) both` }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--n-500)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero card */}
        <div style={{
          background: 'linear-gradient(145deg, var(--ink) 0%, var(--ink-soft) 100%)',
          borderRadius: 32, padding: '52px 40px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(11,15,26,0.25)',
          animation: 'scaleIn 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          {/* bg glow */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ fontSize: '7rem', marginBottom: 8, animation: 'float 3.5s ease-in-out infinite' }}>🚕</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>
            Ride in comfort
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 32 }}>
            Premium vehicles, professional drivers
          </p>

          {/* Mini booking preview */}
          <div style={{
            background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 20,
            border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
          }}>
            {[
              { icon: '📍', label: 'Pickup', value: 'Your location' },
              { icon: '🏁', label: 'Drop',   value: 'Destination' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                  <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{item.value}</div>
                </div>
              </div>
            ))}
            <Link to="/register" className="btn btn-primary" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>
              Find a Cab →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 52px', background: 'var(--n-50)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--amber-dark)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Why UCab</p>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Everything you need,<br />nothing you don't.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="card card-hover"
                style={{ padding: '28px 24px', animation: `fadeUp 0.55s ${0.1 + i * 0.08}s cubic-bezier(0.16,1,0.3,1) both` }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'linear-gradient(135deg,var(--amber-light),rgba(245,158,11,0.08))',
                  border: '1px solid rgba(245,158,11,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: 18,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--n-500)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 52px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--amber-light)', color: 'var(--amber-dark)',
            padding: '6px 16px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700,
            marginBottom: 24, border: '1px solid rgba(245,158,11,0.25)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>✨ Free to join</div>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>Ready to ride smarter?</h2>
          <p style={{ color: 'var(--n-500)', marginBottom: 36, fontSize: '1rem', lineHeight: 1.75 }}>
            Create your free account in under a minute. No credit card required.
          </p>
          <Link to="/register" className="btn btn-primary btn-xl">Get Started — It's Free →</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        background: 'var(--ink)', color: 'rgba(255,255,255,0.4)',
        textAlign: 'center', padding: '28px 52px', fontSize: '0.83rem',
      }}>
        © {new Date().getFullYear()} UCab · All rights reserved
      </footer>
    </div>
  );
}
