// src/components/Message.jsx
import { useState, useRef } from 'react';
import { format } from 'date-fns';

function VoiceMessage({ url, isMine }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  if (!audioRef.current) audioRef.current = new Audio(url);

  const toggle = () => {
    const a = audioRef.current;
    if (playing) { a.pause(); setPlaying(false); }
    else {
      a.play();
      setPlaying(true);
      a.onloadedmetadata = () => setDuration(a.duration);
      a.ontimeupdate = () => { setCurrentTime(a.currentTime); setProgress((a.currentTime / (a.duration || 1)) * 100); };
      a.onended = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };
    }
  };

  const fmt = s => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl" style={{
      minWidth: 200,
      background: isMine ? 'rgba(0,132,255,0.9)' : '#3a3b3c',
      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    }}>
      <button onClick={toggle} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isMine ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', color: '#fff' }}>
        {playing
          ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
          : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
        }
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex gap-0.5 items-center mb-1.5">
          {[...Array(20)].map((_, i) => {
            const h = 3 + Math.abs(Math.sin(i * 0.6) * 10);
            const filled = (i / 20) * 100 <= progress;
            return <div key={i} className="rounded-full flex-shrink-0"
              style={{ width: 2, height: h, background: filled ? '#fff' : 'rgba(255,255,255,0.35)', transition: 'background 0.1s' }} />;
          })}
        </div>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
          {playing ? fmt(currentTime) : fmt(duration)}
        </span>
      </div>
    </div>
  );
}

export default function Message({ msg, isMine, showAvatar }) {
  const time = msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'h:mm a') : '';

  const Avatar = () => (
    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
      style={{ background: '#3a3b3c' }}>
      {msg.senderPhoto
        ? <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
            style={{ background: '#0084ff' }}>{msg.senderName?.charAt(0)}</div>
      }
    </div>
  );

  return (
    <div className={`flex items-end gap-2 px-3 mb-1 msg-animate ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar space */}
      <div className="w-7 flex-shrink-0">
        {!isMine && showAvatar && <Avatar />}
      </div>

      <div className={`flex flex-col gap-1 max-w-xs ${isMine ? 'items-end' : 'items-start'}`} style={{ maxWidth: '72%' }}>
        {/* Image */}
        {msg.imageUrl && (
          <div className="overflow-hidden" style={{
            borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <img src={msg.imageUrl} alt="Shared" style={{ maxWidth: 240, maxHeight: 240, display: 'block', objectFit: 'cover' }} />
          </div>
        )}

        {/* Voice */}
        {msg.voiceUrl && <VoiceMessage url={msg.voiceUrl} isMine={isMine} />}

        {/* Text */}
        {msg.text && (
          <div className={isMine ? 'bubble-mine' : 'bubble-other'}
            style={{ padding: '10px 14px', fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word', display: 'inline-block' }}>
            {msg.text}
          </div>
        )}

        {/* Time + read */}
        <div className={`flex items-center gap-1 ${isMine ? 'flex-row-reverse' : ''}`}>
          <span style={{ fontSize: 10, color: '#b0b3b8' }}>{time}</span>
          {isMine && (
            <svg className="w-3 h-3" style={{ color: '#b0b3b8' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}