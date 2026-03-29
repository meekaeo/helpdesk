'use client';
import { useState, useEffect } from 'react';

const STATUS_OPTIONS = ['รับเรื่อง', 'กำลังดำเนินการ', 'เสร็จสิ้น'];

const statusStyle = {
  'รับเรื่อง'       : { background:'#dbeafe', color:'#1e40af', border:'1px solid #93c5fd' },
  'กำลังดำเนินการ' : { background:'#fef3c7', color:'#92400e', border:'1px solid #fcd34d' },
  'เสร็จสิ้น'      : { background:'#d1fae5', color:'#065f46', border:'1px solid #6ee7b7' },
};

export default function AdminPage() {
  const [tickets,   setTickets]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');
  const [selected,  setSelected]  = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note,      setNote]      = useState('');
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState('');

  // ดึงข้อมูลจาก Google Sheets จริง
  useEffect(() => {
    async function loadTickets() {
      try {
        const res  = await fetch('/api/tickets');
        const data = await res.json();
        if (data.success) setTickets(data.tickets);
      } catch (err) {
        console.error('โหลด ticket ไม่ได้:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  function openModal(t) {
    setSelected(t);
    setNewStatus(t.status);
    setNote('');
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch('/api/update-status', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ ticketId: selected.id, newStatus, note }),
      });
      setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: newStatus } : t));
      setToast(newStatus === 'เสร็จสิ้น' ? '✅ ปิดงานแล้ว — กำลังส่ง Email + CSAT...' : '✅ อัปเดตสถานะเรียบร้อย');
      setTimeout(() => setToast(''), 3000);
      setSelected(null);
    } catch {
      setToast('❌ เกิดข้อผิดพลาด');
    }
    setSaving(false);
  }

  const priLabel = { critical:'🔴 วิกฤต', medium:'🟡 เร่งด่วน', low:'🟢 ปกติ' };

  const filtered = tickets.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      String(t.id).toLowerCase().includes(q) ||
      String(t.name).toLowerCase().includes(q) ||
      String(t.subject).toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div style={s.page}>

      {/* Topbar */}
      <div style={s.topbar}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={s.logo}>🛠</div>
          <div>
            <div style={{fontSize:15,fontWeight:600}}>IT Help Desk — Admin</div>
            <div style={{fontSize:11,color:'#5a8c85'}}>จัดการ Ticket ทั้งหมด</div>
          </div>
        </div>
        <div style={s.badge}>👤 IT Admin</div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'20px 16px'}}>

        {/* KPI */}
        <div style={s.kpiRow}>
          {[
            { label:'🎫 ทั้งหมด',  val: tickets.length,                                       color:'#1565a0' },
            { label:'🔵 รับเรื่อง', val: tickets.filter(t=>t.status==='รับเรื่อง').length,      color:'#1a7f72' },
            { label:'🟡 ดำเนินการ', val: tickets.filter(t=>t.status==='กำลังดำเนินการ').length, color:'#c07a10' },
            { label:'✅ เสร็จสิ้น', val: tickets.filter(t=>t.status==='เสร็จสิ้น').length,      color:'#0f7a60' },
          ].map((k,i) => (
            <div key={i} style={s.kpiCard}>
              <div style={{fontSize:26,fontWeight:600,color:k.color}}>{k.val}</div>
              <div style={{fontSize:11,color:'#5a8c85'}}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div style={s.filterBar}>
          {[['all','ทั้งหมด'],['รับเรื่อง','รับเรื่อง'],['กำลังดำเนินการ','ดำเนินการ'],['เสร็จสิ้น','เสร็จสิ้น']].map(([val,label]) => (
            <div key={val}
              style={{...s.chip,...(filter===val?s.chipActive:{})}}
              onClick={()=>setFilter(val)}>{label}</div>
          ))}
          <input style={s.search} placeholder="🔍 ค้นหา Ticket, ชื่อ..."
            value={search} onChange={e=>setSearch(e.target.value)}/>
          <button style={s.btnRefresh} onClick={async()=>{
            setLoading(true);
            const res=await fetch('/api/tickets');
            const data=await res.json();
            if(data.success) setTickets(data.tickets);
            setLoading(false);
          }}>🔄 Refresh</button>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          {loading ? (
            <div style={{textAlign:'center',padding:40,color:'#5a8c85'}}>⏳ กำลังโหลด...</div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1.5px solid #b0d8d0'}}>
                  {['Ticket ID','วันที่','ผู้แจ้ง / แผนก','หมวดหมู่','หัวข้อ','ความเร่งด่วน','สถานะ','Action'].map(h=>(
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'#5a8c85'}}>
                    ไม่พบ Ticket
                  </td></tr>
                ) : filtered.map((t,i) => (
                  <tr key={i} style={s.tr} onClick={()=>openModal(t)}>
                    <td style={{...s.td,fontFamily:'monospace',color:'#1a7f72',fontWeight:500}}>{t.id}</td>
                    <td style={{...s.td,color:'#5a8c85',fontSize:12}}>{String(t.date)}</td>
                    <td style={s.td}>
                      <div style={{fontSize:13}}>{t.name}</div>
                      <div style={{fontSize:11,color:'#5a8c85'}}>{t.department}</div>
                    </td>
                    <td style={{...s.td,fontSize:12}}>{t.category}</td>
                    <td style={{...s.td,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.subject}</td>
                    <td style={s.td}><span style={{fontSize:12}}>{priLabel[t.priority] || t.priority}</span></td>
                    <td style={s.td}>
                      <span style={{...s.badge2,...(statusStyle[t.status]||{})}}>{t.status}</span>
                    </td>
                    <td style={s.td} onClick={e=>e.stopPropagation()}>
                      <button style={s.btnAction} onClick={()=>openModal(t)}>อัปเดต</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div style={s.overlay} onClick={()=>setSelected(null)}>
          <div style={s.modal} onClick={e=>e.stopPropagation()}>
            <h2 style={{fontSize:16,fontWeight:600,marginBottom:4,color:'#1a3d38'}}>อัปเดตสถานะ</h2>
            <div style={{fontSize:12,color:'#5a8c85',marginBottom:20}}>{selected.id} · {selected.subject}</div>
            <div style={s.mfield}>
              <label style={s.mlabel}>สถานะใหม่</label>
              <select style={s.select} value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
                {STATUS_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div style={s.mfield}>
              <label style={s.mlabel}>หมายเหตุ (ถ้ามี)</label>
              <textarea style={s.textarea} value={note} onChange={e=>setNote(e.target.value)}
                placeholder="เช่น เปลี่ยน RAM แล้ว ปัญหาหาย..."/>
            </div>
            {newStatus==='เสร็จสิ้น' && (
              <div style={s.warnBox}>⚠️ ระบบจะส่ง Email + ลิงก์ CSAT ให้ผู้แจ้งอัตโนมัติ</div>
            )}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
              <button style={s.btnCancel} onClick={()=>setSelected(null)}>ยกเลิก</button>
              <button style={s.btnSave} onClick={handleSave} disabled={saving}>
                {saving?'⏳ กำลังบันทึก...':'💾 บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}

const s = {
  page     : { minHeight:'100vh', background:'#e8f4f2', fontFamily:'sans-serif', color:'#1a3d38' },
  topbar   : { background:'#f0f9f7', borderBottom:'1.5px solid #b0d8d0', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo     : { width:36, height:36, background:'linear-gradient(135deg,#1a7f72,#0e9e8a)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  badge    : { background:'#d1f0ea', border:'1px solid #b0d8d0', borderRadius:20, padding:'4px 12px', fontSize:12, color:'#1a3d38' },
  kpiRow   : { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 },
  kpiCard  : { background:'#f0f9f7', border:'1.5px solid #b0d8d0', borderRadius:12, padding:16 },
  filterBar: { display:'flex', alignItems:'center', gap:8, marginBottom:14, flexWrap:'wrap' },
  chip     : { padding:'6px 14px', borderRadius:20, border:'1.5px solid #b0d8d0', fontSize:12, cursor:'pointer', color:'#5a8c85', background:'#f0f9f7' },
  chipActive:{ background:'#1a7f72', border:'1.5px solid #1a7f72', color:'#fff' },
  search   : { flex:1, background:'#f0f9f7', border:'1.5px solid #b0d8d0', borderRadius:8, padding:'6px 12px', fontSize:12, color:'#1a3d38', outline:'none', minWidth:160 },
  btnRefresh:{ padding:'6px 14px', borderRadius:8, border:'1.5px solid #b0d8d0', background:'#f0f9f7', color:'#5a8c85', fontSize:12, cursor:'pointer' },
  tableWrap: { background:'#f0f9f7', border:'1.5px solid #b0d8d0', borderRadius:14, overflow:'hidden' },
  th       : { padding:'10px 12px', fontSize:11, color:'#5a8c85', fontWeight:500, textAlign:'left', letterSpacing:.4 },
  tr       : { borderBottom:'1px solid #d6eee9', cursor:'pointer' },
  td       : { padding:'12px', fontSize:13, verticalAlign:'middle' },
  badge2   : { display:'inline-block', padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:500 },
  btnAction: { padding:'5px 12px', borderRadius:6, border:'1.5px solid #1a7f72', background:'transparent', color:'#1a7f72', fontSize:11, cursor:'pointer' },
  overlay  : { position:'fixed', inset:0, background:'rgba(0,0,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 },
  modal    : { background:'#f0f9f7', border:'1.5px solid #b0d8d0', borderRadius:16, padding:28, width:'100%', maxWidth:440 },
  mfield   : { marginBottom:16 },
  mlabel   : { display:'block', fontSize:12, color:'#5a8c85', marginBottom:6 },
  select   : { width:'100%', padding:'9px 12px', background:'#e8f4f2', border:'1.5px solid #b0d8d0', borderRadius:8, color:'#1a3d38', fontFamily:'sans-serif', fontSize:13, outline:'none' },
  textarea : { width:'100%', padding:'9px 12px', background:'#e8f4f2', border:'1.5px solid #b0d8d0', borderRadius:8, color:'#1a3d38', fontFamily:'sans-serif', fontSize:13, outline:'none', minHeight:80, resize:'vertical', boxSizing:'border-box' },
  warnBox  : { background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:8, padding:'10px 12px', fontSize:12, color:'#92400e' },
  btnCancel: { padding:'8px 16px', borderRadius:8, border:'1.5px solid #b0d8d0', background:'transparent', color:'#5a8c85', fontFamily:'sans-serif', fontSize:13, cursor:'pointer' },
  btnSave  : { padding:'8px 20px', borderRadius:8, border:'none', background:'#1a7f72', color:'#fff', fontFamily:'sans-serif', fontSize:13, fontWeight:500, cursor:'pointer' },
  toast    : { position:'fixed', bottom:24, right:24, background:'#1a7f72', color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:13, fontWeight:500, zIndex:200 },
};