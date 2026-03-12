// src/components/MessageInput.jsx
import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voicePreview, setVoicePreview] = useState(false);
  const fileRef = useRef();
  const inputRef = useRef();
  const typingTimer = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const recordingInterval = useRef(null);

  const handleSend = () => {
    if (!text.trim() && !imageFile && !voiceBlob) return;
    onSend(text.trim(), imageFile, voiceBlob);
    setText('');
    setImageFile(null);
    setImagePreview(null);
    setShowEmoji(false);
    setVoiceBlob(null);
    setVoicePreview(false);
    onTyping?.(false);
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

  const handleEmoji = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = e => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setVoiceBlob(blob);
        setVoicePreview(true);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.current.start();
      setRecording(true);
      setRecordingTime(0);
      recordingInterval.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch { alert('Microphone access denied.'); }
  };

  const stopRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
    }
    setRecording(false);
    clearInterval(recordingInterval.current);
  };

  const cancelVoice = () => {
    setVoiceBlob(null);
    setVoicePreview(false);
    setRecordingTime(0);
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  const canSend = text.trim() || imageFile || voiceBlob;

  return (
    <div className="relative" style={{ borderTop: '1px solid rgba(0,245,255,0.1)', background: '#080d1a' }}>
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-full right-2 mb-2 z-50 rounded-xl overflow-hidden shadow-2xl">
          <EmojiPicker onEmojiClick={handleEmoji} theme="dark" height={320} width={280} />
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-16 w-auto rounded-lg object-cover" style={{ border: '1px solid rgba(0,245,255,0.2)' }} />
            <button onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs transition-all"
              style={{ background: '#ff006e', boxShadow: '0 0 8px rgba(255,0,110,0.5)' }}>✕</button>
          </div>
        </div>
      )}

      {/* Voice preview */}
      {voicePreview && voiceBlob && (
        <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)' }}>
            <div className="flex gap-0.5 items-center">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="wave-bar" style={{ height: `${4 + Math.sin(i * 0.8) * 8 + 4}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 11, color: '#00f5ff' }}>{formatTime(recordingTime)}</span>
          </div>
          <button onClick={cancelVoice} className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
            style={{ background: 'rgba(255,0,110,0.15)', border: '1px solid rgba(255,0,110,0.3)', color: '#ff006e' }}>✕</button>
        </div>
      )}

      {/* Recording indicator */}
      {recording && (
        <div className="px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(255,0,110,0.05)', borderBottom: '1px solid rgba(255,0,110,0.1)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: '#ff006e', boxShadow: '0 0 6px #ff006e', animation: 'pulse 1s infinite' }} />
          <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 11, color: '#ff006e' }}>REC {formatTime(recordingTime)}</span>
          <div className="flex gap-0.5 items-center ml-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.15}s`, background: '#ff006e', boxShadow: '0 0 4px #ff006e' }} />
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-1.5 p-2.5">
        {/* Image upload */}
        <button onClick={() => fileRef.current?.click()}
          className="p-2 rounded-lg flex-shrink-0 transition-all"
          style={{ color: 'rgba(0,245,255,0.5)', border: '1px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#00f5ff'; e.currentTarget.style.background = 'rgba(0,245,255,0.08)'; e.currentTarget.style.border = '1px solid rgba(0,245,255,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,245,255,0.5)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.border = '1px solid transparent'; }}
          title="Send image">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKey}
            rows={1}
            placeholder="TYPE MESSAGE..."
            className="w-full resize-none px-4 py-2.5 rounded-xl text-sm transition-all leading-relaxed max-h-32 overflow-y-auto"
            style={{
              background: 'rgba(5,10,25,0.8)',
              border: '1px solid rgba(0,245,255,0.15)',
              color: '#e8f4ff',
              fontFamily: 'Exo 2,sans-serif',
              outline: 'none',
              minHeight: '40px',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(0,245,255,0.5)'; e.target.style.boxShadow = '0 0 15px rgba(0,245,255,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(0,245,255,0.15)'; e.target.style.boxShadow = 'none'; }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'; }}
          />
        </div>

        {/* Voice button */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className="p-2 rounded-lg flex-shrink-0 transition-all"
          style={{
            color: recording ? '#ff006e' : 'rgba(0,245,255,0.5)',
            background: recording ? 'rgba(255,0,110,0.15)' : 'transparent',
            border: recording ? '1px solid rgba(255,0,110,0.4)' : '1px solid transparent',
          }}
          title="Hold to record voice">
          <svg className="w-5 h-5" fill={recording ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
        </button>

        {/* Emoji */}
        <button onClick={() => setShowEmoji(s => !s)}
          className="p-2 rounded-lg flex-shrink-0 transition-all"
          style={{ color: showEmoji ? '#00f5ff' : 'rgba(0,245,255,0.5)', background: showEmoji ? 'rgba(0,245,255,0.08)' : 'transparent', border: showEmoji ? '1px solid rgba(0,245,255,0.25)' : '1px solid transparent' }}
          title="Emoji">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>

        {/* Send */}
        <button onClick={handleSend} disabled={!canSend}
          className="p-2.5 rounded-xl flex-shrink-0 transition-all"
          style={{
            background: canSend ? 'linear-gradient(135deg, #0044aa, #3300cc)' : 'rgba(20,30,50,0.5)',
            border: canSend ? '1px solid rgba(0,245,255,0.4)' : '1px solid rgba(0,245,255,0.08)',
            boxShadow: canSend ? '0 4px 15px rgba(0,100,255,0.25)' : 'none',
            color: canSend ? '#00f5ff' : 'rgba(90,120,160,0.3)',
            cursor: canSend ? 'pointer' : 'not-allowed',
          }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'translateX(1px)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
    </div>
  );
}