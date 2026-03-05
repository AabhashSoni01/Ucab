import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ANav from '../../components/ANav';
import API from '../../api';
import toast from 'react-hot-toast';

const avatarColors = ['#dbeafe','#d1fae5','#fef3c7','#ede9fe','#fee2e2','#e0f2fe'];

export default function AUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    API.get('/admin/users').then(({data})=>setUsers(data.users||[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(()=>{ fetchUsers(); },[]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    setDeleting(id);
    try { await API.delete(`/admin/users/${id}`); toast.success('User deleted.'); fetchUsers(); }
    catch { toast.error('Delete failed.'); }
    finally { setDeleting(null); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)' }}>
      <ANav />
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'36px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, animation:'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <p style={{ fontSize:'0.76rem', fontWeight:700, color:'var(--amber-dark)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>People</p>
            <h1 style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>Users</h1>
            <p style={{ color:'var(--n-500)', fontSize:'0.85rem' }}>{users.length} registered users</p>
          </div>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--n-400)' }}>🔍</span>
            <input className="form-input" style={{ paddingLeft:36, maxWidth:260 }} placeholder="Search users…"
              value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>

        <div className="card" style={{ animation:'fadeUp 0.5s 0.08s cubic-bezier(0.16,1,0.3,1) both' }}>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : filtered.length===0 ? (
            <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No users found</h3></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>#</th><th>User</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map((u,i)=>(
                    <tr key={u._id} style={{ animation:`slideRight 0.35s ${i*0.04}s cubic-bezier(0.16,1,0.3,1) both` }}>
                      <td style={{ color:'var(--n-400)', fontWeight:500 }}>{i+1}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                          <div style={{
                            width:36, height:36, borderRadius:'50%', flexShrink:0,
                            background:avatarColors[i%avatarColors.length],
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontFamily:'var(--font-display)', fontWeight:800, fontSize:'0.9rem', color:'var(--n-700)',
                          }}>{u.name.charAt(0).toUpperCase()}</div>
                          <span style={{ fontWeight:600, fontSize:'0.88rem' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color:'var(--n-600)', fontSize:'0.85rem' }}>{u.email}</td>
                      <td style={{ color:'var(--n-600)', fontSize:'0.85rem' }}>{u.phone||'—'}</td>
                      <td>
                        <span className={`badge ${u.isActive?'badge-completed':'badge-cancelled'}`}>
                          {u.isActive?'Active':'Inactive'}
                        </span>
                      </td>
                      <td style={{ color:'var(--n-500)', fontSize:'0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div style={{ display:'flex', gap:8 }}>
                          <Link to={`/admin/users/${u._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                          <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(u._id,u.name)} disabled={deleting===u._id}>
                            {deleting===u._id?'…':'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
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