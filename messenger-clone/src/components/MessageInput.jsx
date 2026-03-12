// src/components/MessageInput.jsx
import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const fileRef = useRef();
  const inputRef = useRef();
  const typingTimer = useRef();
  const mediaRecorder = useRef();
  const audioChunks = useRef([]);
  const recInterval = useRef();

  const handleSend = () => {
    if (!text.trim() && !imageFile && !voiceBlob) return;
    onSend(text.trim(), imageFile, voiceBlob);
    setText(''); setImageFile(null); setImagePreview(null);
    setVoiceBlob(null); setShowEmoji(false);
    onTyping?.(false);
    if (inputRef.current) { inputRef.current.style.height = 'auto'; }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping?.(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => onTyping?.(false), 2000);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = e => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setVoiceBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.current.start();
      setRecording(true); setRecTime(0);
      recInterval.current = setInterval(() => setRecTime(t => t + 1), 1000);
    } catch { alert('Microphone permission denied.'); }
  };

  const stopRec = () => {
    if (mediaRecorder.current?.state === 'recording') mediaRecorder.current.stop();
    setRecording(false);
    clearInterval(recInterval.current);
  };

  const fmt = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const canSend = text.trim() || imageFile || voiceBlob;

  useEffect(() => () => { clearTimeout(typingTimer.current); clearInterval(recInterval.current); }, []);

  return (
    <div className="flex-shrink-0 pb-safe" style={{ background: '#0a0a0a', borderTop: '1px solid #1c1c1c' }}>
      {/* Emoji picker */}
      {showEmoji && (
        <div className="absolute bottom-20 right-2 z-50 rounded-2xl overflow-hidden shadow-2xl">
          <EmojiPicker onEmojiClick={e => { setText(p => p + e.emoji); inputRef.current?.focus(); }}
            theme="dark" height={320} width={300} />
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="px-3 py-2" style={{ borderBottom: '1px solid #1c1c1c' }}>
          <div className="relative inline-block">
            <img src={imagePreview} alt="preview" className="h-16 w-auto rounded-xl object-cover" />
            <button onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: '#f02849' }}>✕</button>
          </div>
        </div>
      )}

      {/* Voice preview */}
      {voiceBlob && !recording && (
        <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid #1c1c1c' }}>
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full"
            style={{ background: '#1c1c1c' }}>
            <div className="flex gap-0.5 items-center">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="wave-bar rounded-full" style={{ height: `${4 + Math.abs(Math.sin(i)) * 10}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <span className="text-xs" style={{ color: '#b0b3b8' }}>{fmt(recTime)}</span>
          </div>
          <button onClick={() => { setVoiceBlob(null); setRecTime(0); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#f02849', color: '#fff' }}>✕</button>
        </div>
      )}

      {/* Recording indicator */}
      {recording && (
        <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid #1c1c1c', background: 'rgba(240,40,73,0.05)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: '#f02849', animation: 'pulse 1s infinite' }} />
          <span className="text-sm font-semibold" style={{ color: '#f02849' }}>Recording {fmt(recTime)}</span>
          <div className="flex gap-0.5 items-center ml-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="wave-bar rounded-full" style={{ background: '#f02849', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-2 py-2">
        {/* Left buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => fileRef.current?.click()}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ color: '#0084ff' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1c1c1c'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>

        {/* Text area */}
        <div className="flex-1 flex items-end rounded-2xl px-4 py-2 gap-2"
          style={{ background: '#242526', border: '1px solid #3a3b3c', minHeight: 40 }}>
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Aa"
            className="flex-1 bg-transparent resize-none msg-input text-sm"
            style={{ color: '#e4e6eb', outline: 'none', border: 'none', maxHeight: 120, lineHeight: '20px', paddingTop: 2, paddingBottom: 2 }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
          />
          <button onClick={() => setShowEmoji(s => !s)}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-all"
            style={{ color: showEmoji ? '#0084ff' : '#b0b3b8', marginBottom: 1 }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>
        </div>

        {/* Right: voice or send */}
        {canSend ? (
          <button onClick={handleSend}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: '#0084ff', color: '#fff' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'translateX(1px)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        ) : (
          <button
            onMouseDown={startRec} onMouseUp={stopRec}
            onTouchStart={startRec} onTouchEnd={stopRec}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: recording ? '#f02849' : '#0084ff', color: '#fff' }}
            title="Hold to record">
            <svg className="w-5 h-5" fill={recording ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}