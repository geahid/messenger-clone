// src/components/ChatsTab.jsx
import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

function Avatar({ src, name, size = 48, online }) {
  const colors = ['#0084ff','#a855f7','#ec4899','#f97316','#10b981'];
  const c = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?';
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {src
        ? <img src={src} alt={name} className="rounded-full object-cover w-full h-full" />
        : <div className="rounded-full flex items-center justify-center w-full h-full text-white font-semibold"
            style={{ background: c, fontSize: size * 0.35 }}>{initials}</div>
      }
      {online !== undefined && (
        <span className="absolute bottom-0 right-0 rounded-full border-2"
          style={{ width: 12, height: 12, borderColor: '#0a0a0a', background: online ? '#31c45a' : '#3a3b3c' }} />
      )}
    </div>
  );
}

export default function ChatsTab({ conversations, users, activeConversation, onSelect, currentUser }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return conversations;
    return conversations.filter(c => {
      const other = Object.entries(c.participantData || {}).find(([uid]) => uid !== currentUser?.uid);
      return other?.[1]?.displayName?.toLowerCase().includes(search.toLowerCase());
    });
  }, [conversations, search, currentUser]);

  const getOther = (conv) => {
    const e = Object.entries(conv.participantData || {}).find(([uid]) => uid !== currentUser?.uid);
    return e ? { uid: e[0], ...e[1] } : null;
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return '';
    try { return formatDistanceToNow(ts.toDate(), { addSuffix: false }); } catch { return ''; }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-3">Chats</h1>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#b0b3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Search Messenger" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full text-sm"
            style={{ background: '#242526', color: '#e4e6eb', outline: 'none', border: 'none' }}
            onFocus={e => e.target.style.background = '#3a3b3c'}
            onBlur={e => e.target.style.background = '#242526'} />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2" style={{ color: '#b0b3b8' }}>
            <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : filtered.map(conv => {
          const other = getOther(conv);
          const otherLive = users.find(u => u.uid === other?.uid);
          const unread = conv.unread?.[currentUser?.uid] || 0;
          const isActive = activeConversation?.id === conv.id;
          return (
            <button key={conv.id} onClick={() => onSelect(conv)}
              className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
              style={{ background: isActive ? '#1c1c1c' : 'transparent' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#111'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <Avatar src={other?.photoURL} name={other?.displayName} size={52} online={otherLive?.online} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-sm truncate" style={{ color: '#e4e6eb' }}>{otherLive?.nickname || other?.displayName}</span>
                  <span className="text-xs flex-shrink-0 ml-2" style={{ color: '#b0b3b8' }}>{formatTime(conv.lastMessageTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate" style={{ color: unread > 0 ? '#e4e6eb' : '#b0b3b8', fontWeight: unread > 0 ? 600 : 400 }}>
                    {conv.lastMessage || 'Start a conversation'}
                  </span>
                  {unread > 0 && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ background: '#0084ff' }}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}