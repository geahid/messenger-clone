// src/components/ChatWindow.jsx
import { useEffect, useRef, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Message from './Message';
import MessageInput from './MessageInput';
import { format, isToday, isYesterday } from 'date-fns';

function DateDivider({ date }) {
  const label = isToday(date) ? 'TODAY' : isYesterday(date) ? 'YESTERDAY' : format(date, 'MMM d, yyyy').toUpperCase();
  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 h-px" style={{ background: 'rgba(0,245,255,0.1)' }} />
      <span style={{ fontSize: 10, color: 'rgba(0,245,255,0.4)', fontFamily: 'Share Tech Mono,monospace', letterSpacing: 2 }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(0,245,255,0.1)' }} />
    </div>
  );
}

function TypingIndicator({ name }) {
  return (
    <div className="flex items-end gap-2 mb-2 px-4">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#0d1528', border: '1px solid rgba(0,245,255,0.2)' }}>
        <span style={{ fontSize: 11, color: '#00f5ff', fontWeight: 700 }}>{name?.charAt(0)}</span>
      </div>
      <div className="px-4 py-3 rounded-2xl" style={{ background: '#0d1528', border: '1px solid rgba(0,245,255,0.1)', borderBottomLeftRadius: 4 }}>
        <div className="flex gap-1.5 items-center" style={{ height: 14 }}>
          {[0,1,2].map(i => (
            <span key={i} className="typing-dot" style={{ animationDelay: `${i*0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function UserProfilePanel({ user, liveUser, onClose, onSendFriendRequest, myProfile }) {
  const isFriend = myProfile?.friends?.includes(user.uid);
  const requested = myProfile?.sentRequests?.includes(user.uid);

  return (
    <div className="flex flex-col h-full" style={{ width: 240, background: '#080d1a', borderLeft: '1px solid rgba(0,245,255,0.1)', flexShrink: 0 }}>
      {/* Close */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
        <span className="section-header">PLAYER INFO</span>
        <button onClick={onClose} style={{ color: 'rgba(90,120,160,0.6)', fontSize: 16 }}>✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden" style={{ border: '2px solid rgba(0,245,255,0.5)', boxShadow: '0 0 20px rgba(0,245,255,0.2)' }}>
              {liveUser?.photoURL || user.photoURL ? (
                <img src={liveUser?.photoURL || user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0044aa, #3300cc)' }}>
                  <span style={{ fontSize: 28, color: '#00f5ff', fontWeight: 700 }}>{user.displayName?.charAt(0)}</span>
                </div>
              )}
            </div>
            <span className="absolute bottom-0 right-0 rounded-full border-2"
              style={{ width: 14, height: 14, borderColor: '#080d1a', background: liveUser?.online ? '#39ff14' : '#334466', boxShadow: liveUser?.online ? '0 0 8px #39ff14' : 'none' }} />
          </div>
          <div className="text-center">
            <p style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 16, color: '#e8f4ff', letterSpacing: 1 }}>{liveUser?.nickname || user.displayName}</p>
            <p style={{ fontSize: 10, color: liveUser?.online ? '#39ff14' : 'rgba(90,120,160,0.6)', fontFamily: 'Share Tech Mono,monospace', textShadow: liveUser?.online ? '0 0 6px #39ff14' : 'none' }}>
              {liveUser?.online ? '● ONLINE' : '○ OFFLINE'}
            </p>
          </div>
        </div>

        {/* Bio */}
        {liveUser?.bio && (
          <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.08)' }}>
            <p className="section-header mb-1">BIO</p>
            <p style={{ fontSize: 12, color: 'rgba(200,220,255,0.7)', lineHeight: 1.5 }}>{liveUser.bio}</p>
          </div>
        )}

        {/* Email */}
        <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.08)' }}>
          <p className="section-header mb-1">EMAIL</p>
          <p style={{ fontSize: 11, color: 'rgba(90,120,160,0.8)', fontFamily: 'Share Tech Mono,monospace' }}>{liveUser?.email || user.email}</p>
        </div>

        {/* Friend action */}
        {!isFriend ? (
          <button onClick={() => !requested && onSendFriendRequest?.(user.uid)}
            className="w-full py-2.5 rounded-lg transition-all"
            style={{
              background: requested ? 'rgba(90,120,160,0.08)' : 'rgba(0,245,255,0.08)',
              border: requested ? '1px solid rgba(90,120,160,0.2)' : '1px solid rgba(0,245,255,0.25)',
              fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
              color: requested ? 'rgba(90,120,160,0.6)' : '#00f5ff',
              cursor: requested ? 'not-allowed' : 'pointer',
            }}>
            {requested ? 'REQUEST SENT' : '+ ADD FRIEND'}
          </button>
        ) : (
          <div className="w-full py-2 rounded-lg text-center" style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.2)', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, color: '#39ff14' }}>
            ✓ FRIENDS
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatWindow({ conversation, messages, loadingMessages, onSend, onTyping, users, onBack, sendFriendRequest, userProfile }) {
  const { currentUser } = useAuth();
  const bottomRef = useRef();
  const [showProfile, setShowProfile] = useState(false);

  const other = useMemo(() => {
    if (!conversation) return null;
    const entry = Object.entries(conversation.participantData || {}).find(([uid]) => uid !== currentUser?.uid);
    return entry ? { uid: entry[0], ...entry[1] } : null;
  }, [conversation, currentUser]);

  const otherUserLive = useMemo(() => users?.find(u => u.uid === other?.uid), [users, other]);
  const isOtherTyping = conversation?.typing?.[other?.uid];

  const grouped = useMemo(() => {
    const items = [];
    let lastDate = null;
    messages.forEach((msg, i) => {
      const date = msg.createdAt?.toDate?.() || new Date();
      const dateStr = format(date, 'yyyy-MM-dd');
      if (dateStr !== lastDate) {
        items.push({ type: 'divider', date, key: `d-${dateStr}` });
        lastDate = dateStr;
      }
      const prev = messages[i - 1];
      const showAvatar = !prev || prev.senderId !== msg.senderId;
      items.push({ type: 'message', msg, showAvatar });
    });
    return items;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center hex-bg select-none" style={{ background: '#050810' }}>
        <div className="text-center px-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(0,245,255,0.05)', border: '2px solid rgba(0,245,255,0.15)', boxShadow: '0 0 40px rgba(0,245,255,0.08)' }}>
            <svg className="w-12 h-12" style={{ color: 'rgba(0,245,255,0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 22, color: '#00f5ff', letterSpacing: 3, textShadow: '0 0 20px rgba(0,245,255,0.3)', marginBottom: 8 }}>READY TO CHAT</h3>
          <p style={{ fontSize: 12, color: 'rgba(90,120,160,0.6)', fontFamily: 'Share Tech Mono,monospace', letterSpacing: 1 }}>Select a conversation to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0" style={{ background: '#050810' }}>
      {/* Main chat */}
      <div className="flex flex-1 flex-col h-full min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0" style={{ background: '#080d1a', borderBottom: '1px solid rgba(0,245,255,0.1)', boxShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
          {onBack && (
            <button onClick={onBack} className="md:hidden p-1.5 rounded-lg transition-all" style={{ color: 'rgba(0,245,255,0.5)', border: '1px solid rgba(0,245,255,0.2)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
          )}

          <div className="relative cursor-pointer" onClick={() => setShowProfile(s => !s)}>
            <div className="w-9 h-9 rounded-full overflow-hidden" style={{ border: '2px solid rgba(0,245,255,0.4)', boxShadow: '0 0 12px rgba(0,245,255,0.2)' }}>
              {other?.photoURL ? (
                <img src={other.photoURL} alt={other.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0044aa, #3300cc)' }}>
                  <span style={{ fontSize: 14, color: '#00f5ff', fontWeight: 700 }}>{other?.displayName?.charAt(0)}</span>
                </div>
              )}
            </div>
            <span className="absolute bottom-0 right-0 rounded-full border"
              style={{ width: 10, height: 10, borderColor: '#080d1a', background: otherUserLive?.online ? '#39ff14' : '#334466', boxShadow: otherUserLive?.online ? '0 0 6px #39ff14' : 'none' }} />
          </div>

          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowProfile(s => !s)}>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15, color: '#e8f4ff', letterSpacing: 1, lineHeight: 1.2 }}>
              {otherUserLive?.nickname || other?.displayName}
            </div>
            <div style={{ fontSize: 10, fontFamily: 'Share Tech Mono,monospace' }}>
              {isOtherTyping ? (
                <span style={{ color: '#00f5ff', animation: 'pulse 1s infinite' }}>typing...</span>
              ) : otherUserLive?.online ? (
                <span style={{ color: '#39ff14', textShadow: '0 0 6px #39ff14' }}>● ONLINE</span>
              ) : (
                <span style={{ color: 'rgba(90,120,160,0.5)' }}>○ OFFLINE</span>
              )}
            </div>
          </div>

          <button onClick={() => setShowProfile(s => !s)}
            className="p-2 rounded-lg transition-all"
            style={{ color: showProfile ? '#00f5ff' : 'rgba(0,245,255,0.4)', background: showProfile ? 'rgba(0,245,255,0.08)' : 'transparent', border: showProfile ? '1px solid rgba(0,245,255,0.2)' : '1px solid transparent' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 hex-bg" style={{ background: '#050810' }}>
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: '#00f5ff', animation: `pulse ${0.6 + i * 0.2}s infinite`, boxShadow: '0 0 6px #00f5ff' }} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {grouped.map(item => {
                if (item.type === 'divider') return <DateDivider key={item.key} date={item.date} />;
                const isMine = item.msg.senderId === currentUser?.uid;
                return <Message key={item.msg.id} msg={item.msg} isMine={isMine} showAvatar={item.showAvatar} />;
              })}
              {isOtherTyping && <TypingIndicator name={other?.displayName} />}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        <MessageInput onSend={onSend} onTyping={onTyping} />
      </div>

      {/* User profile side panel */}
      {showProfile && other && (
        <UserProfilePanel
          user={other}
          liveUser={otherUserLive}
          onClose={() => setShowProfile(false)}
          onSendFriendRequest={sendFriendRequest}
          myProfile={userProfile}
        />
      )}
    </div>
  );
}