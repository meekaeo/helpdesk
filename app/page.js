'use client';
import { useState } from 'react';

const CATEGORIES = [
  { id: 'hardware', label: 'Hardware',  icon: '🖥', sub: 'คอมพิวเตอร์, เครื่องพิมพ์' },
  { id: 'software', label: 'Software',  icon: '💾', sub: 'โปรแกรม, แอปพลิเคชัน' },
  { id: 'network',  label: 'Network',   icon: '🌐', sub: 'อินเทอร์เน็ต, WiFi, VPN' },
  { id: 'account',  label: 'Account',   icon: '🔑', sub: 'รหัสผ่าน, สิทธิ์การเข้าถึง' },
  { id: 'other',    label: 'อื่นๆ',     icon: '📋', sub: 'ปัญหานอกเหนือจากหมวดหมู่ข้างต้น' },
];

const PRIORITIES = [
  { id: 'low',      label: '🟢 ปกติ / Normal',       sla: 'ภายใน 1-2 วันทำการ / 1-2 Business Days' },
  { id: 'medium',   label: '🟡 เร่งด่วน / Urgent',    sla: 'ภายใน 8 ชั่วโมง / 8 Hours' },
  { id: 'critical', label: '🔴 วิกฤต / Critical',     sla: 'ภายใน 4 ชั่วโมง / 4 Hours' },
];

export default function Home() {
  const [category,    setCategory]    = useState('');
  const [priority,    setPriority]    = useState('low');
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [phone,       setPhone]       = useState('');
  const [department,  setDepartment]  = useState('');
  const [subject,     setSubject]     = useState('');
  const [description, setDescription] = useState('');
  const [file,        setFile]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [ticketId,    setTicketId]    = useState('');
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!category) { setError('กรุณาเลือกหมวดหมู่ปัญหา'); return; }
    setError('');
    setLoading(true);

    let filePayload = null;
    if (file) {
      const buffer = await file.arrayBuffer();
      const bytes  = new Uint8Array(buffer);
      let binary   = '';
      bytes.forEach(b => binary += String.fromCharCode(b));
      filePayload = { name: file.name, mimeType: file.type, data: btoa(binary) };
    }

    try {
      const res  = await fetch('/api/submit', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          name, email, phone, department,
          category, priority, subject, description,
          file: filePayload,
        }),
      });
      const data = await res.json();
      if (data.success) { setTicketId(data.ticketId); setDone(true); }
      else setError(data.error || 'เกิดข้อผิดพลาด');
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้');
    }
    setLoading(false);
  }

  function resetForm() {
    setDone(false); setCategory(''); setName(''); setEmail('');
    setPhone(''); setDepartment(''); setSubject(''); setDescription('');
    setFile(null); setTicketId(''); setError('');
  }

  if (done) return (
    <main style={s.page}>
      <div style={s.successCard}>
        <div style={{fontSize:56, marginBottom:16}}>✅</div>
        <h2 style={{fontSize:22, fontWeight:600, marginBottom:8}}>ส่งคำร้องเรียบร้อยแล้ว!</h2>
        <p style={{color:'#5a8c85', marginBottom:20}}>ทีมไอทีได้รับเรื่องแล้ว ระบบจะส่ง Email ยืนยันให้คุณในไม่ช้า</p>
        <div style={s.ticketBadge}>{ticketId}</div>
        <p style={{fontSize:12, color:'#5a8c85', marginTop:12}}>กรุณาเก็บ Ticket ID นี้ไว้อ้างอิง</p>
        <button style={s.btnOutline} onClick={resetForm}>แจ้งปัญหาเพิ่มเติม</button>
      </div>
    </main>
  );

  return (
    <main style={s.page}>
      <div style={s.container}>

        <div style={s.header}>
          <div style={s.logo}>🛠</div>
          <div>
            <h1 style={s.title}>IT Help Desk</h1>
            <p style={s.subtitle}>แจ้งปัญหา / Request Support</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <div style={s.card}>
            <div style={s.cardTitle}>หมวดหมู่ปัญหา <span style={{color:'#c0392b'}}>*</span></div>
            <div style={s.catGrid}>
              {CATEGORIES.map(c => (
                <div key={c.id}
                  style={{...s.catChip, ...(category===c.id ? s.catChipActive : {})}}
                  onClick={() => setCategory(c.id)}>
                  <span style={{fontSize:20}}>{c.icon}</span>
                  <div>
                    <div style={{fontWeight:500, fontSize:13}}>{c.label}</div>
                    <div style={{fontSize:11, color:'#5a8c85', marginTop:2}}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>ข้อมูลผู้แจ้ง</div>
            <div style={s.field}>
              <label style={s.label}>ชื่อ-นามสกุล <span style={{color:'#c0392b'}}>*</span></label>
              <input style={s.input} value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น สมชาย ใจดี" required/>
            </div>
            <div style={s.field}>
              <label style={s.label}>อีเมล <span style={{color:'#c0392b'}}>*</span></label>
              <input style={s.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="yourname@company.com" required/>
            </div>
            <div style={s.field}>
              <label style={s.label}>เบอร์โทรศัพท์</label>
              <input style={s.input} type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="เช่น 081-234-5678"/>
            </div>
            <div style={s.field}>
              <label style={s.label}>แผนก / ตำแหน่ง</label>
              <input style={s.input} value={department} onChange={e=>setDepartment(e.target.value)} placeholder="เช่น ฝ่ายบัญชี"/>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>รายละเอียดปัญหา</div>
            <div style={s.field}>
              <label style={s.label}>หัวข้อปัญหา <span style={{color:'#c0392b'}}>*</span></label>
              <input style={s.input} value={subject} onChange={e=>setSubject(e.target.value)} placeholder="สรุปปัญหาสั้นๆ" required/>
            </div>
            <div style={s.field}>
              <label style={s.label}>อธิบายอาการ <span style={{color:'#c0392b'}}>*</span></label>
              <textarea style={s.textarea} value={description} onChange={e=>setDescription(e.target.value)} placeholder="อธิบายรายละเอียดให้ครบถ้วน..." required/>
            </div>
            <div style={s.field}>
              <label style={s.label}>ความเร่งด่วน</label>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {PRIORITIES.map(p => (
                  <div key={p.id}
                    style={{...s.priChip, ...(priority===p.id ? s.priChipActive : {})}}
                    onClick={() => setPriority(p.id)}>
                    {p.label}
                    <span style={{fontSize:10, opacity:.7, marginLeft:4}}>({p.sla})</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>แนบไฟล์ (ถ้ามี)</label>
              <input type="file" accept="image/*,.pdf" onChange={e=>setFile(e.target.files[0])}
                style={{...s.input, padding:'8px 12px', cursor:'pointer'}}/>
              {file && <div style={{fontSize:12, color:'#0f7a60', marginTop:4}}>✓ {file.name}</div>}
            </div>
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          <button type="submit" style={s.btnSubmit} disabled={loading}>
            {loading ? '⏳ กำลังส่ง...' : '📨 ส่งคำร้อง — Submit Ticket'}
          </button>

        </form>
      </div>
    </main>
  );
}

const s = {
  page        : { minHeight:'100vh', background:'#e8f4f2', padding:'24px 16px', fontFamily:'sans-serif' },
  container   : { maxWidth:600, margin:'0 auto' },
  header      : { display:'flex', alignItems:'center', gap:12, marginBottom:28 },
  logo        : { width:44, height:44, background:'linear-gradient(135deg,#1a7f72,#0e9e8a)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 },
  title       : { fontSize:20, fontWeight:600, color:'#1a3d38', margin:0 },
  subtitle    : { fontSize:12, color:'#5a8c85', margin:0 },
  card        : { background:'#f0f9f7', border:'1.5px solid #b0d8d0', borderRadius:14, padding:20, marginBottom:14 },
  cardTitle   : { fontSize:12, fontWeight:600, color:'#5a8c85', textTransform:'uppercase', letterSpacing:.6, marginBottom:14 },
  catGrid     : { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 },
  catChip     : { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#e8f4f2', border:'1.5px solid #b0d8d0', borderRadius:10, cursor:'pointer' },
  catChipActive:{ background:'#d1f0ea', border:'1.5px solid #1a7f72' },
  field       : { marginBottom:14 },
  label       : { display:'block', fontSize:12, fontWeight:500, color:'#5a8c85', marginBottom:5 },
  input       : { width:'100%', padding:'10px 13px', background:'#e8f4f2', border:'1.5px solid #b0d8d0', borderRadius:8, fontSize:14, color:'#1a3d38', fontFamily:'sans-serif', outline:'none', boxSizing:'border-box' },
  textarea    : { width:'100%', padding:'10px 13px', background:'#e8f4f2', border:'1.5px solid #b0d8d0', borderRadius:8, fontSize:14, color:'#1a3d38', fontFamily:'sans-serif', outline:'none', minHeight:90, resize:'vertical', boxSizing:'border-box' },
  priChip     : { padding:'7px 14px', borderRadius:20, border:'1.5px solid #b0d8d0', fontSize:12, cursor:'pointer', color:'#5a8c85', background:'#e8f4f2' },
  priChipActive:{ background:'#d1f0ea', border:'1.5px solid #1a7f72', color:'#1a3d38' },
  btnSubmit   : { width:'100%', padding:14, background:'linear-gradient(135deg,#1a7f72,#0e9e8a)', border:'none', borderRadius:11, color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', marginTop:4 },
  btnOutline  : { marginTop:20, padding:'10px 24px', background:'transparent', border:'1.5px solid #1a7f72', borderRadius:8, color:'#1a7f72', fontSize:13, cursor:'pointer' },
  errorBox    : { background:'#fde8e8', border:'1px solid #f5c0c0', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#c0392b', marginBottom:12 },
  ticketBadge : { background:'#d1f0ea', border:'1.5px solid #1a7f72', borderRadius:10, padding:'10px 24px', fontSize:20, fontWeight:700, color:'#1a7f72', fontFamily:'monospace', letterSpacing:2 },
  successCard : { maxWidth:480, margin:'60px auto', background:'#f0f9f7', border:'1.5px solid #b0d8d0', borderRadius:16, padding:40, textAlign:'center', color:'#1a3d38' },
};