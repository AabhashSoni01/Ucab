import { useState, useEffect } from 'react';
import ANav from '../../components/ANav';
import API from '../../api';
import toast from 'react-hot-toast';

const statusOptions  = ['Pending','Confirmed','In Progress','Completed','Cancelled'];
const statusClass    = (s) => ({ 'Pending':'badge-pending','Confirmed':'badge-confirmed','In Progress':'badge-inprogress','Completed':'badge-completed','Cancelled':'badge-cancelled' }[s]||'badge-pending');

export default function ABookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');
  const [acting, setActing]     = useState(null); // bookingId currently being acted on

  const fetchBookings = () => {
    API.get('/admin/bookings')
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, status) => {
    setActing(id + status);
    try {
      await API.put(`/admin/bookings/${id}`, { status });
      toast.success(
        status === 'In Progress' ? '🚕 Ride started! User is being notified.' :
        status === 'Completed'   ? '✅ Ride completed!' :
        `Status updated to ${status}`
      );
      fetchBookings();
    } catch { toast.error('Update failed.'); }
    finally { setActing(null); }
  };

  const statuses = ['All', ...statusOptions];
  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  // Count per status for pills
  const countOf = (s) => bookings.filter(b => b.status === s).length;

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }}>
      <ANav />
      <main style={{ maxWidth:1260, margin:'0 auto', padding:'36px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom:28, animation:'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <p style={{ fontSize:'0.76rem', fontWeight:700, color:'var(--amber-dark)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Management</p>
          <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>All Bookings</h1>
          <p style={{ color:'var(--n-500)', fontSize:'0.85rem' }}>{bookings.length} total bookings</p>
        </div>

        {/* Filter pills */}
        <div style={{ display:'flex', gap:7, marginBottom:20, flexWrap:'wrap', animation:'fadeUp 0.5s 0.06s cubic-bezier(0.16,1,0.3,1) both' }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} className="btn btn-sm" style={{
              background: filter===s ? 'var(--ink)' : 'var(--surface)',
              color:      filter===s ? 'white' : 'var(--n-600)',
              border: '1.5px solid ' + (filter===s ? 'var(--ink)' : 'var(--n-200)'),
              transition:'all var(--t)',
              display:'flex', alignItems:'center', gap:6,
            }}>
              {s}
              {s !== 'All' && countOf(s) > 0 && (
                <span style={{
                  background: filter===s ? 'rgba(255,255,255,0.2)' : 'var(--n-200)',
                  color:      filter===s ? 'white' : 'var(--n-600)',
                  padding:'1px 7px', borderRadius:99, fontSize:'0.7rem', fontWeight:700,
                }}>{countOf(s)}</span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ animation:'fadeUp 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No bookings</h3></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Cab</th>
                    <th>Route</th>
                    <th>Date / Time</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => (
                    <BookingRow
                      key={b._id}
                      booking={b}
                      index={i}
                      acting={acting}
                      onUpdate={updateStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BookingRow({ booking: b, index, acting, onUpdate }) {
  const isActing = (suffix) => acting === b._id + suffix;
  const canStart    = b.status === 'Confirmed';
  const canComplete = b.status === 'In Progress';
  const canConfirm  = b.status === 'Pending';

  return (
    <tr style={{ animation:`slideRight 0.35s ${index*0.035}s cubic-bezier(0.16,1,0.3,1) both` }}>
      {/* User */}
      <td>
        <div style={{ fontWeight:600, fontSize:'0.87rem' }}>{b.user?.name || '—'}</div>
        <div style={{ fontSize:'0.75rem', color:'var(--n-400)' }}>{b.user?.email}</div>
      </td>

      {/* Cab */}
      <td>
        <div style={{ fontWeight:600, fontSize:'0.87rem' }}>{b.car?.name} {b.car?.model}</div>
        <div style={{ fontSize:'0.75rem', color:'var(--n-400)' }}>{b.car?.plateNumber}</div>
      </td>

      {/* Route */}
      <td>
        <div style={{ fontSize:'0.82rem', color:'var(--n-700)', fontWeight:500 }}>{b.pickupLocation}</div>
        <div style={{ fontSize:'0.75rem', color:'var(--n-400)', marginTop:2 }}>→ {b.dropLocation}</div>
      </td>

      {/* Date */}
      <td style={{ fontSize:'0.82rem', color:'var(--n-600)', whiteSpace:'nowrap' }}>
        {new Date(b.bookingDate).toLocaleDateString('en-IN')}
        <div style={{ fontSize:'0.74rem', color:'var(--n-400)', marginTop:2 }}>{b.bookingTime}</div>
      </td>

      {/* Fare */}
      <td style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--ink)' }}>
        ₹{b.totalFare || 0}
        {b.paymentMethod && (
          <div style={{ fontSize:'0.72rem', color:'var(--n-400)', fontWeight:400, marginTop:2 }}>{b.paymentMethod}</div>
        )}
      </td>

      {/* Status badge */}
      <td><span className={`badge ${statusClass(b.status)}`}>{b.status}</span></td>

      {/* Payment */}
      <td>
        <span className={`badge ${b.paymentStatus === 'Paid' ? 'badge-completed' : 'badge-pending'}`}>
          {b.paymentStatus}
        </span>
      </td>

      {/* Action buttons */}
      <td>
        <div style={{ display:'flex', flexDirection:'column', gap:6, minWidth:130 }}>

          {/* Confirm */}
          {canConfirm && (
            <button
              onClick={() => onUpdate(b._id, 'Confirmed')}
              disabled={!!acting}
              style={{
                padding:'5px 12px', borderRadius:'var(--r-xs)', fontSize:'0.75rem',
                fontWeight:700, border:'1px solid #bfdbfe', cursor:'pointer',
                background:'var(--blue-light)', color:'var(--blue-dark)',
                transition:'all var(--t-fast)', fontFamily:'var(--font-body)',
                opacity: acting ? 0.6 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.background='#dbeafe'}
              onMouseLeave={e => e.currentTarget.style.background='var(--blue-light)'}>
              {isActing('Confirmed') ? '…' : '✅ Confirm Booking'}
            </button>
          )}

          {/* Start Ride */}
          {canStart && (
            <button
              onClick={() => onUpdate(b._id, 'In Progress')}
              disabled={!!acting}
              style={{
                padding:'5px 12px', borderRadius:'var(--r-xs)', fontSize:'0.75rem',
                fontWeight:700, border:'1px solid rgba(245,158,11,0.35)', cursor:'pointer',
                background:'var(--amber-light)', color:'var(--amber-dark)',
                transition:'all var(--t-fast)', fontFamily:'var(--font-body)',
                opacity: acting ? 0.6 : 1,
                display:'flex', alignItems:'center', gap:5,
              }}
              onMouseEnter={e => e.currentTarget.style.background='#fde68a'}
              onMouseLeave={e => e.currentTarget.style.background='var(--amber-light)'}>
              {isActing('In Progress') ? '…' : <><span>🚕</span> Start Ride</>}
            </button>
          )}

          {/* Complete Ride */}
          {canComplete && (
            <button
              onClick={() => onUpdate(b._id, 'Completed')}
              disabled={!!acting}
              style={{
                padding:'5px 12px', borderRadius:'var(--r-xs)', fontSize:'0.75rem',
                fontWeight:700, border:'1px solid #a7f3d0', cursor:'pointer',
                background:'var(--green-light)', color:'#065f46',
                transition:'all var(--t-fast)', fontFamily:'var(--font-body)',
                opacity: acting ? 0.6 : 1,
                display:'flex', alignItems:'center', gap:5,
              }}
              onMouseEnter={e => e.currentTarget.style.background='#bbf7d0'}
              onMouseLeave={e => e.currentTarget.style.background='var(--green-light)'}>
              {isActing('Completed') ? '…' : <><span>🏁</span> Complete Ride</>}
            </button>
          )}

          {/* Cancel */}
          {!['Completed','Cancelled'].includes(b.status) && (
            <button
              onClick={() => { if (window.confirm('Cancel this booking?')) onUpdate(b._id, 'Cancelled'); }}
              disabled={!!acting}
              style={{
                padding:'5px 12px', borderRadius:'var(--r-xs)', fontSize:'0.75rem',
                fontWeight:600, border:'1px solid #fca5a5', cursor:'pointer',
                background:'var(--red-light)', color:'var(--red)',
                transition:'all var(--t-fast)', fontFamily:'var(--font-body)',
                opacity: acting ? 0.6 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.background='#fecaca'}
              onMouseLeave={e => e.currentTarget.style.background='var(--red-light)'}>
              {isActing('Cancelled') ? '…' : '✕ Cancel'}
            </button>
          )}

          {/* Completed / Cancelled label */}
          {b.status === 'Completed' && (
            <span style={{ fontSize:'0.74rem', color:'var(--n-400)', fontStyle:'italic' }}>Ride concluded</span>
          )}
          {b.status === 'Cancelled' && (
            <span style={{ fontSize:'0.74rem', color:'var(--n-400)', fontStyle:'italic' }}>Booking cancelled</span>
          )}
        </div>
      </td>
    </tr>
  );
}