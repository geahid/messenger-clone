// src/components/ChatWindow.jsx
import { useEffect, useRef, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Message from './Message';
import MessageInput from './MessageInput';
import { format, isToday, isYesterday } from 'date-fns';

function Avatar({ src, name, size = 36 }) {
  const colors = ['#0084ff','#a855f7','#ec4899','#f97316','#10b981'];
  const c = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?';
  return (
    <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: size, height: size }}>
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-white font-semibold"
            style={{ background: c, fontSize: size * 0.35 }}>{initials}</div>
      }
    </div>
  );
}

function DateDivider({ date }) {
  const label = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d, yyyy');
  return (
    <div className="flex items-center gap-3 my-3 px-4">
      <div className="flex-1 h-px" style={{ background: '#2a2a2a' }} />
      <span className="text-xs" style={{ color: '#b0b3b8' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: '#2a2a2a' }} />
    </div>
  );
}

function TypingIndicator({ photo, name }) {
  return (
    <div className="flex items-end gap-2 px-4 mb-2">
      <Avatar src={photo} name={name} size={28} />
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: '#3a3b3c' }}>
        <div className="flex gap-1.5 items-center">
          {[0,1,2].map(i => <span key={i} className="typing-dot" style={{ animationDelay: `${i*0.2}s` }} />)}
        </div>
      </div>
    </div>
  );
}

function UserInfoPanel({ user, liveUser, onClose, onSendFriendRequest, myProfile }) {
  const isFriend = myProfile?.friends?.includes(user.uid);
  const requested = myProfile?.sentRequests?.includes(user.uid);
  return (
    <div className="flex flex-col h-full flex-shrink-0 slide-up" style={{ width: 280, background: '#111', borderLeft: '1px solid #1c1c1c' }}>
      <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #1c1c1c' }}>
        <span className="font-semibold text-white">Profile</span>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: '#3a3b3c', color: '#e4e6eb' }}>✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden" style={{ border: '3px solid #0084ff' }}>
              {liveUser?.photoURL || user.photoURL
                ? <img src={liveUser?.photoURL || user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ background: 'linear-gradient(135deg, #0084ff, #a855f7)' }}>
                    {user.displayName?.charAt(0)}
                  </div>
              }
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2"
              style={{ background: liveUser?.online ? '#31c45a' : '#3a3b3c', borderColor: '#111' }} />
          </div>
          <p className="font-bold text-white text-lg">{liveUser?.nickname || user.displayName}</p>
          <p className="text-sm" style={{ color: liveUser?.online ? '#31c45a' : '#b0b3b8' }}>
            {liveUser?.online ? '● Active now' : '○ Offline'}
          </p>
          {liveUser?.bio && <p className="text-sm text-center" style={{ color: '#b0b3b8' }}>{liveUser.bio}</p>}
        </div>

        <div className="rounded-xl p-3 mb-4" style={{ background: '#1c1c1c' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#b0b3b8' }}>EMAIL</p>
          <p className="text-sm" style={{ color: '#e4e6eb' }}>{liveUser?.email || user.email}</p>
        </div>

        {!isFriend ? (
          <button onClick={() => !requested && onSendFriendRequest?.(user.uid)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: requested ? '#3a3b3c' : '#e7f3ff', color: requested ? '#b0b3b8' : '#0084ff', cursor: requested ? 'not-allowed' : 'pointer' }}>
            {requested ? 'Request Sent' : '+ Add Friend'}
          </button>
        ) : (
          <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center"
            style={{ background: '#1c1c1c', color: '#31c45a' }}>✓ Friends</div>
        )}
      </div>
    </div>
  );
}

export default function ChatWindow({ conversation, messages, loadingMessages, onSend, onTyping, users, onBack, sendFriendRequest, userProfile }) {
  const { currentUser } = useAuth();
  const bottomRef = useRef();
  const [showInfo, setShowInfo] = useState(false);

  const other = useMemo(() => {
    if (!conversation) return null;
    const e = Object.entries(conversation.participantData || {}).find(([uid]) => uid !== currentUser?.uid);
    return e ? { uid: e[0], ...e[1] } : null;
  }, [conversation, currentUser]);

  const otherLive = useMemo(() => users?.find(u => u.uid === other?.uid), [users, other]);
  const isTyping = conversation?.typing?.[other?.uid];

  const grouped = useMemo(() => {
    const items = [];
    let lastDate = null;
    messages.forEach((msg, i) => {
      const date = msg.createdAt?.toDate?.() || new Date();
      const ds = format(date, 'yyyy-MM-dd');
      if (ds !== lastDate) { items.push({ type: 'divider', date, key: `d-${ds}` }); lastDate = ds; }
      const prev = messages[i - 1];
      items.push({ type: 'message', msg, showAvatar: !prev || prev.senderId !== msg.senderId });
    });
    return items;
  }, [messages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-center px-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#1c1c1c' }}>
            <svg className="w-10 h-10" style={{ color: '#3a3b3c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <p className="font-semibold text-white text-lg mb-1">Your messages</p>
          <p className="text-sm" style={{ color: '#b0b3b8' }}>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0" style={{ background: '#0a0a0a' }}>
      <div className="flex flex-col flex-1 h-full min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-3 py-2.5 flex-shrink-0"
          style={{ background: '#0a0a0a', borderBottom: '1px solid #1c1c1c' }}>
          {onBack && (
            <button onClick={onBack} className="md:hidden p-2 rounded-full mr-1 transition-all"
              style={{ color: '#0084ff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1c1c1c'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
          )}

          <button onClick={() => setShowInfo(s => !s)} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
            <div className="relative flex-shrink-0">
              <Avatar src={other?.photoURL} name={other?.displayName} size={40} />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                style={{ background: otherLive?.online ? '#31c45a' : '#3a3b3c', borderColor: '#0a0a0a' }} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate">{otherLive?.nickname || other?.displayName}</p>
              <p className="text-xs" style={{ color: isTyping ? '#0084ff' : otherLive?.online ? '#31c45a' : '#b0b3b8' }}>
                {isTyping ? 'typing...' : otherLive?.online ? 'Active now' : 'Offline'}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ color: '#0084ff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1c1c1c'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ color: '#0084ff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1c1c1c'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.816v6.368a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
            <button onClick={() => setShowInfo(s => !s)} className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ color: showInfo ? '#fff' : '#0084ff', background: showInfo ? '#0084ff' : 'transparent' }}
              onMouseEnter={e => { if (!showInfo) e.currentTarget.style.background = '#1c1c1c'; }}
              onMouseLeave={e => { if (!showInfo) e.currentTarget.style.background = 'transparent'; }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-2" style={{ background: '#0a0a0a' }}>
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="typing-dot" style={{ animationDelay: `${i*0.2}s` }} />)}
              </div>
            </div>
          ) : (
            <>
              {grouped.map(item =>
                item.type === 'divider'
                  ? <DateDivider key={item.key} date={item.date} />
                  : <Message key={item.msg.id} msg={item.msg} isMine={item.msg.senderId === currentUser?.uid} showAvatar={item.showAvatar} />
              )}
              {isTyping && <TypingIndicator photo={other?.photoURL} name={other?.displayName} />}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        <MessageInput onSend={onSend} onTyping={onTyping} />
      </div>

      {showInfo && other && (
        <UserInfoPanel
          user={other} liveUser={otherLive}
          onClose={() => setShowInfo(false)}
          onSendFriendRequest={sendFriendRequest}
          myProfile={userProfile}
        />
      )}
    </div>
  );
}