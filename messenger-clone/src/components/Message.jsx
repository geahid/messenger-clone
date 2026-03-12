// src/components/Message.jsx
import { useState, useRef } from 'react';
import { format } from 'date-fns';

function VoiceMessage({ url, isMine }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio(url));

  const togglePlay = () => {
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
      audio.ontimeupdate = () => {
        setProgress((audio.currentTime / (audio.duration || 1)) * 100);
        setDuration(audio.duration || 0);
      };
      audio.onended = () => { setPlaying(false); setProgress(0); };
    }
  };

  const formatDur = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl" style={{
      background: isMine ? 'rgba(0,70,200,0.3)' : 'rgba(0,245,255,0.05)',
      border: isMine ? '1px solid rgba(100,150,255,0.3)' : '1px solid rgba(0,245,255,0.15)',
      minWidth: 180,
    }}>
      <button onClick={togglePlay}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style={{ background: isMine ? 'rgba(0,100,255,0.4)' : 'rgba(0,245,255,0.1)', border: isMine ? '1px solid rgba(100,200,255,0.4)' : '1px solid rgba(0,245,255,0.3)', color: isMine ? '#99ccff' : '#00f5ff' }}>
        {playing ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        {/* Waveform bars */}
        <div className="flex gap-0.5 items-center mb-1">
          {[...Array(16)].map((_, i) => {
            const h = 3 + Math.abs(Math.sin(i * 0.7 + 1) * 10);
            const filled = (i / 16) * 100 <= progress;
            return (
              <div key={i} className="rounded-full flex-shrink-0"
                style={{ width: 2, height: h, background: filled ? (isMine ? '#99ccff' : '#00f5ff') : (isMine ? 'rgba(100,150,255,0.3)' : 'rgba(0,245,255,0.2)'), transition: 'background 0.1s' }} />
            );
          })}
        </div>
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: isMine ? 'rgba(150,200,255,0.7)' : 'rgba(0,245,255,0.6)' }}>
          {playing ? formatDur(audioRef.current.currentTime) : formatDur(duration || 0)}
        </span>
      </div>

      <svg className="w-4 h-4 flex-shrink-0" style={{ color: isMine ? 'rgba(150,200,255,0.5)' : 'rgba(0,245,255,0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
      </svg>
    </div>
  );
}

export default function Message({ msg, isMine, showAvatar }) {
  const time = msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'h:mm a') : '';

  return (
    <div className={`flex items-end gap-2 mb-1 animate-fade-up ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="w-7 flex-shrink-0">
        {!isMine && showAvatar && (
          <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center"
            style={{ border: '1px solid rgba(0,245,255,0.3)', background: '#0d1528', boxShadow: '0 0 8px rgba(0,245,255,0.15)' }}>
            {msg.senderPhoto ? (
              <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" />
            ) : (
              <span style={{ fontSize: 11, color: '#00f5ff', fontWeight: 700 }}>{msg.senderName?.charAt(0).toUpperCase()}</span>
            )}
          </div>
        )}
      </div>

      <div className={`max-w-xs flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`} style={{ maxWidth: '70%' }}>
        {/* Sender name */}
        {!isMine && showAvatar && (
          <span style={{ fontSize: 10, color: 'rgba(0,245,255,0.5)', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, letterSpacing: 1, paddingLeft: 4 }}>{msg.senderName}</span>
        )}

        {/* Image */}
        {msg.imageUrl && (
          <div className="rounded-2xl overflow-hidden" style={{
            border: isMine ? '1px solid rgba(100,150,255,0.3)' : '1px solid rgba(0,245,255,0.2)',
            boxShadow: isMine ? '0 4px 15px rgba(0,100,255,0.2)' : '0 4px 15px rgba(0,0,0,0.3)',
            animation: isMine ? 'messageInRight 0.25s cubic-bezier(0.34,1.56,0.64,1)' : 'messageInLeft 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <img src={msg.imageUrl} alt="Shared" className="max-w-full object-cover" style={{ maxHeight: 240 }} />
          </div>
        )}

        {/* Voice message */}
        {msg.voiceUrl && (
          <div style={{ animation: isMine ? 'messageInRight 0.25s cubic-bezier(0.34,1.56,0.64,1)' : 'messageInLeft 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <VoiceMessage url={msg.voiceUrl} isMine={isMine} />
          </div>
        )}

        {/* Text bubble */}
        {msg.text && (
          <div style={{
            animation: isMine ? 'messageInRight 0.25s cubic-bezier(0.34,1.56,0.64,1)' : 'messageInLeft 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            padding: '10px 16px',
            borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            fontSize: 14,
            lineHeight: 1.5,
            background: isMine
              ? 'linear-gradient(135deg, #0055cc 0%, #3300aa 100%)'
              : 'linear-gradient(135deg, #0d1528 0%, #111a30 100%)',
            border: isMine ? '1px solid rgba(100,150,255,0.35)' : '1px solid rgba(0,245,255,0.12)',
            boxShadow: isMine ? '0 4px 15px rgba(0,100,255,0.2), inset 0 1px 0 rgba(255,255,255,0.08)' : '0 4px 15px rgba(0,0,0,0.3)',
            color: '#e8f4ff',
            wordBreak: 'break-word',
          }}>
            {msg.text}
          </div>
        )}

        {/* Timestamp */}
        <div className={`flex items-center gap-1 ${isMine ? 'flex-row-reverse' : ''}`} style={{ paddingLeft: 4, paddingRight: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(90,120,160,0.6)', fontFamily: 'Share Tech Mono,monospace' }}>{time}</span>
          {isMine && (
            <svg className="w-3 h-3" style={{ color: 'rgba(0,245,255,0.5)' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}