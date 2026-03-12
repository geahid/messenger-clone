// src/components/Sidebar.jsx
import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

function Avatar({ src, name, size = 10, online }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-rose-400 to-pink-500', 'from-amber-400 to-orange-500', 'from-violet-400 to-purple-500'];
  const colorIdx = name?.charCodeAt(0) % colors.length || 0;

  return (
    <div className={`relative flex-shrink-0 w-${size} h-${size}`}>
      {src ? (
        <img src={src} alt={name} className={`w-${size} h-${size} rounded-full object-cover`} />
      ) : (
        <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white text-xs font-bold`}>
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${online ? 'bg-emerald-400' : 'bg-slate-400'}`} />
      )}
    </div>
  );
}

export default function Sidebar({ conversations, users, activeConversation, onSelectConversation, onSelectUser }) {
  const { currentUser, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('chats'); // 'chats' | 'people'

  const filteredConvs = useMemo(() => {
    if (!search) return conversations;
    return conversations.filter(c => {
      const other = Object.entries(c.participantData || {}).find(([uid]) => uid !== currentUser?.uid);
      return other?.[1]?.displayName?.toLowerCase().includes(search.toLowerCase());
    });
  }, [conversations, search, currentUser]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    return users.filter(u => u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  const getOtherParticipant = (conv) => {
    const entry = Object.entries(conv.participantData || {}).find(([uid]) => uid !== currentUser?.uid);
    return entry ? { uid: entry[0], ...entry[1] } : null;
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return '';
    try { return formatDistanceToNow(ts.toDate(), { addSuffix: false }); } catch { return ''; }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread?.[currentUser?.uid] || 0), 0);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.792 1.31 5.29 3.38 6.983V21l3.086-1.695A10.596 10.596 0 0012 19.486c5.523 0 10-4.145 10-9.243S17.523 2 12 2z"/>
              </svg>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg" style={{fontFamily:'Sora,sans-serif'}}>
              Chats
              {totalUnread > 0 && (
                <span className="ml-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">{totalUnread}</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggle} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {dark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
              )}
            </button>
            <button onClick={logout} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {['chats', 'people'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${tab === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === 'chats' ? (
          filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm gap-2">
              <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              <span>No conversations yet</span>
              <span className="text-xs opacity-60">Switch to People to start chatting</span>
            </div>
          ) : (
            <div className="px-2 space-y-0.5 pb-2">
              {filteredConvs.map(conv => {
                const other = getOtherParticipant(conv);
                const unread = conv.unread?.[currentUser?.uid] || 0;
                const isActive = activeConversation?.id === conv.id;
                const otherUser = users.find(u => u.uid === other?.uid);
                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${isActive ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <Avatar src={other?.photoURL} name={other?.displayName} size={10} online={otherUser?.online} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                          {other?.displayName}
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-1">{formatTime(conv.lastMessageTime)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className={`text-xs truncate ${unread > 0 ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                          {conv.lastMessage || 'Start a conversation'}
                        </span>
                        {unread > 0 && (
                          <span className="ml-1 flex-shrink-0 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="px-2 space-y-0.5 pb-2">
            {filteredUsers.map(user => (
              <button
                key={user.uid}
                onClick={() => onSelectUser(user)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left"
              >
                <Avatar src={user.photoURL} name={user.displayName} size={10} online={user.online} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.displayName}</div>
                  <div className="text-xs text-slate-400 truncate">{user.online ? '🟢 Online' : user.email}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current user footer */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <Avatar src={currentUser?.photoURL} name={currentUser?.displayName} size={9} online={true} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentUser?.displayName}</div>
          <div className="text-xs text-emerald-500 font-medium">● Active now</div>
        </div>
      </div>
    </div>
  );
}
