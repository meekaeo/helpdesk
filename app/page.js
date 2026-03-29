'use client';
import { useState, useRef } from 'react';

const DEPARTMENTS = ['IT','HR','Finance','Marketing','Operations','Management','อื่นๆ'];
const CATEGORIES  = ['hardware','software','network','account','other'];
const PRIORITIES  = [{ val:'low', label:'🟢 ปกติ' },{ val:'medium', label:'🟡 เร่งด่วน' },{ val:'critical', label:'🔴 วิกฤต' }];

export default function HomePage() {
  const [form, setForm]       = useState({ name:'', email:'', phone:'', department:'IT', category:'hardware', priority:'low', subject:'', description:'' });
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const fileRef               = useRef();

  function onChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let fileData = null;
      if (file) {
        const buf  = await file.arrayBuffer();
        const b64  = btoa(String.fromCharCode(...new Uint8Array(buf)));
        fileData   = { name: file.name, mimeType: file.type, data: b64 };
      }
      const res  = await fetch('/api/submit', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ ...form, file: fileData }),
      });
      const data = await res.json();
      if (data.success) setResult(data.ticketId);
      else alert('เกิดข้อผิดพลาด: ' + data.error);
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
    setLoading(false);
  }

  if (result) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{textAlign:'center',padding:'32px 0'}}>
          <div style={{fontSize:56}}>✅</div>
          <h2 style={{color:'#1a7f72',margin:'16px 0 8px'}}>ส่งคำร้องเรียบร้อยแล้ว!</h2>
          <p style={{color:'#5a8c85',fontSize:14}}>ทีมไอทีได้รับเรื่องแล้ว ระบบจะส่ง Email ยืนยันให้คุณในไม่ช้า</p>
          <div style={s.ticketBox}><div style={{fontSize:11,color:'#6b7280',letterSpacing:1,marginBottom:4}}>Ticket ID</div>
            <div style={{fontSize:24,fontWeight:700,color:'#1a7f72',fontFamily:'monospace'}}>{result}</div>
          </div>
          <p style={{fontSize:12,color:'#9ca3af',marginBottom:20}}>กรุณาเก็บ Ticket ID นี้ไว้อ้างอิง</p>
          <button style={s.btnPrimary} onClick={()=>{ setResult(null); setForm({ name:'', email:'', phone:'', department:'IT', category:'hardware', priority:'low', subject:'', description:'' }); setFile(null); }}>
            แจ้งปัญหาเพิ่มเติม
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={s.logo}>🛠</div>
          <div>
            <div style={{fontSize:15,fontWeight:600}}>IT Help Desk</div>
            <div style={{fontSize:11,color:'#5a8c85'}}>แจ้งปัญหาและขอความช่วยเหลือ</div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:600,margin:'32px auto',padding:'0 16px'}}>
        <div style={s.card}>
          <h2 style={{fontSize:18,fontWeight:600,color:'#1a3d38',marginBottom:4}}>แจ้งปัญหา IT</h2>
          <p style={{fontSize:13,color:'#5a8c85',marginBottom:24}}>กรอกข้อมูลให้ครบถ้วน ทีมไอทีจะติดต่อกลับโดยเร็ว</p>

          <form onSubmit={handleSubmit}>
            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>ชื่อ-นามสกุล *</label>
                <input style={s.input} name="name" value={form.name} onChange={onChange} required placeholder="นายสมชาย ใจดี"/>
              </div>
              <div style={s.field}>
                <label style={s.label}>Email *</label>
                <input style={s.input} name="email" type="email" value={form.email} onChange={onChange} required placeholder="somchai@company.com"/>
              </div>
            </div>

            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>เบอร์โทร</label>
                <input style={s.input} name="phone" value={form.phone} onChange={onChange} placeholder="081-234-5678"/>
              </div>
              <div style={s.field}>
                <label style={s.label}>แผนก</label>
                <select style={s.input} name="department" value={form.department} onChange={onChange}>
                  {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>หมวดหมู่ *</label>
                <select style={s.input} name="category" value={form.category} onChange={onChange}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>ความเร่งด่วน *</label>
                <select style={s.input} name="priority" value={form.priority} onChange={onChange}>
                  {PRIORITIES.map(p=><option key={p.val} value={p.val}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>หัวข้อปัญหา *</label>
              <input style={s.input} name="subject" value={form.subject} onChange={onChange} required placeholder="เช่น คอมพิวเตอร์เปิดไม่ติด"/>
            </div>

            <div style={s.field}>
              <label style={s.label}>รายละเอียด *</label>
              <textarea style={{...s.input, minHeight:100, resize:'vertical'}} name="description" value={form.description} onChange={onChange} required placeholder="อธิบายปัญหาให้ละเอียด..."/>
            </div>

            <div style={s.field}>
              <label style={s.label}>ไฟล์แนบ (ถ้ามี)</label>
              <input ref={fileRef} type="file" style={{display:'none'}} onChange={e=>setFile(e.target.files[0])}/>
              <div style={s.fileBox} onClick={()=>fileRef.current.click()}>
                {file ? `📎 ${file.name}` : '📁 คลิกเพื่อแนบไฟล์'}
              </div>
            </div>

            <button style={{...s.btnPrimary, width:'100%', marginTop:8}} type="submit" disabled={loading}>
              {loading ? '⏳ กำลังส่ง...' : '📨 ส่งคำร้อง'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const s = {
  page     : { minHeight:'100vh', background:'#e8f4f2', fontFamily:'sans-serif', color:'#1a3d38' },
  topbar   : { background:'#f0f9f7', borderBottom:'1.5px solid #b0d8d0', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo     : { width:36, height:36, background:'linear-gradient(135deg,#1a7f72,#0e9e8a)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  card     : { background:'#f0f9f7', border:'1.5px solid #b0d8d0', borderRadius:16, padding:28 },
  ticketBox: { display:'inline-block', background:'#f0fdf4', border:'1.5px solid #86efac', borderRadius:10, padding:'12px 28px', margin:'16px 0' },
  grid2    : { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  field    : { marginBottom:16 },
  label    : { display:'block', fontSize:12, color:'#5a8c85', marginBottom:6, fontWeight:500 },
  input    : { width:'100%', padding:'9px 12px', background:'#e8f4f2', border:'1.5px solid #b0d8d0', borderRadius:8, color:'#1a3d38', fontFamily:'sans-serif', fontSize:13, outline:'none', boxSizing:'border-box' },
  fileBox  : { padding:'10px 12px', background:'#e8f4f2', border:'1.5px dashed #b0d8d0', borderRadius:8, fontSize:13, color:'#5a8c85', cursor:'pointer', textAlign:'center' },
  btnPrimary:{ padding:'12px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#1a7f72,#0e9e8a)', color:'#fff', fontFamily:'sans-serif', fontSize:14, fontWeight:600, cursor:'pointer' },
};