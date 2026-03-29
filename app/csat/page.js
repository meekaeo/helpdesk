// app/csat/page.js
'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const SCORES = [
  { val:5, emoji:'😍', label:'ดีมาก' },
  { val:4, emoji:'😊', label:'ดี' },
  { val:3, emoji:'😐', label:'พอใช้' },
  { val:2, emoji:'😕', label:'ไม่ค่อยดี' },
  { val:1, emoji:'😞', label:'แย่' },
];

function CSATForm() {
  const params   = useSearchParams();
  const ticketId = params.get('ticket') || '';
  const email    = params.get('email')  || '';

  const [score,   setScore]   = useState(null);
  const [comment, setComment] = useState('');
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!score) return;
    setLoading(true);
    try {
      await fetch('/api/csat', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ ticketId, email, score, comment }),
      });
      setDone(true);
    } catch { setDone(true); }
    setLoading(false);
  }

  if (done) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{fontSize:52, marginBottom:16}}>🙏</div>
        <h2 style={{fontSize:20, fontWeight:600, marginBottom:8, color:'#1a3d38'}}>ขอบคุณสำหรับ Feedback!</h2>
        <p style={{color:'#5a8c85', lineHeight:1.6}}>ความคิดเห็นของคุณช่วยให้เราพัฒนาบริการได้ดียิ่งขึ้น</p>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🛠</div>
        <h2 style={{fontSize:18, fontWeight:600, marginBottom:4, color:'#1a3d38'}}>ให้คะแนนความพึงพอใจ</h2>
        <p style={{fontSize:12, color:'#5a8c85', marginBottom:24}}>
          Ticket: <strong style={{fontFamily:'monospace', color:'#1a7f72'}}>{ticketId}</strong>
        </p>

        {/* Score buttons */}
        <div style={{display:'flex', gap:8, justifyContent:'center', marginBottom:24, flexWrap:'wrap'}}>
          {SCORES.map(sc => (
            <button key={sc.val}
              style={{...s.scoreBtn, ...(score===sc.val ? s.scoreBtnActive : {})}}
              onClick={() => setScore(sc.val)}>
              <div style={{fontSize:28}}>{sc.emoji}</div>
              <div style={{fontSize:11, marginTop:4}}>{sc.label}</div>
            </button>
          ))}
        </div>

        {/* Comment */}
        <div style={{marginBottom:20}}>
          <label style={{display:'block', fontSize:12, color:'#5a8c85', marginBottom:6}}>
            ความคิดเห็นเพิ่มเติม (ถ้ามี)
          </label>
          <textarea
            style={s.textarea}
            placeholder="บอกเราเพิ่มเติมได้เลยครับ..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <button
          style={{...s.btnSubmit, ...((!score || loading) ? {opacity:.5, cursor:'not-allowed'} : {})}}
          disabled={!score || loading}
          onClick={handleSubmit}>
          {loading ? '⏳ กำลังส่ง...' : '⭐ ส่งคะแนน'}
        </button>
      </div>
    </div>
  );
}

export default function CSATPage() {
  return (
    <Suspense fallback={<div style={{textAlign:'center',padding:40}}>กำลังโหลด...</div>}>
      <CSATForm />
    </Suspense>
  );
}

const s = {
  page    : { minHeight:'100vh', background:'#e8f4f2', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'sans-serif' },
  card    : { background:'#f0f9f7', border:'1.5px solid #b0d8d0', borderRadius:16, padding:36, maxWidth:460, width:'100%', textAlign:'center' },
  logo    : { width:48, height:48, background:'linear-gradient(135deg,#1a7f72,#0e9e8a)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, margin:'0 auto 16px' },
  scoreBtn: { padding:'12px 10px', borderRadius:10, border:'1.5px solid #b0d8d0', background:'#e8f4f2', cursor:'pointer', minWidth:72, color:'#1a3d38', transition:'all .15s' },
  scoreBtnActive: { background:'#d1f0ea', border:'1.5px solid #1a7f72' },
  textarea: { width:'100%', padding:'10px 13px', background:'#e8f4f2', border:'1.5px solid #b0d8d0', borderRadius:8, fontSize:13, color:'#1a3d38', fontFamily:'sans-serif', outline:'none', minHeight:80, resize:'vertical', boxSizing:'border-box' },
  btnSubmit: { width:'100%', padding:13, background:'linear-gradient(135deg,#1a7f72,#0e9e8a)', border:'none', borderRadius:10, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' },
};