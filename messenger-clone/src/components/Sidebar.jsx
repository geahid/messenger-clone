// src/components/Sidebar.jsx
import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

function Avatar({ src, name, size = 40, online }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#0066cc', '#6600cc', '#cc0066', '#cc6600', '#00cc66'];
  const colorIdx = name?.charCodeAt(0) % colors.length || 0;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />
      ) : (
        <div className="rounded-full flex items-center justify-center text-white font-bold"
          style={{ width: size, height: size, background: `linear-gradient(135deg, ${colors[colorIdx]}, #000033)`, fontSize: size * 0.3, border: '1px solid rgba(0,245,255,0.2)' }}>
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span className="absolute bottom-0 right-0 rounded-full border-2"
          style={{ width: 10, height: 10, borderColor: '#050810', background: online ? '#39ff14' : '#334466', boxShadow: online ? '0 0 6px #39ff14' : 'none' }} />
      )}
    </div>
  );
}

export default function Sidebar({ conversations, users, activeConversation, onSelectConversation, onSelectUser, userProfile }) {
  const { currentUser, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('chats');
  const [rightPanel, setRightPanel] = useState(null); // 'requests' | 'settings' | 'profile' | null
  const [editProfile, setEditProfile] = useState(false);
  const [nickname, setNickname] = useState(userProfile?.nickname || currentUser?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const { updateUserProfile } = useAuth();

  const myProfile = userProfile || {};
  const friendRequests = myProfile.friendRequests || [];
  const friends = myProfile.friends || [];

  const requesterUsers = useMemo(() => users.filter(u => friendRequests.includes(u.uid)), [users, friendRequests]);
  const onlineUsers = useMemo(() => users.filter(u => u.online), [users]);

  const filteredConvs = useMemo(() => {
    if (!search) return conversations;
    return conversations.filter(c => {
      const other = Object.entries(c.participantData || {}).find(([uid]) => uid !== currentUser?.uid);
      return other?.[1]?.displayName?.toLowerCase().includes(search.toLowerCase());
    });
  }, [conversations, search, currentUser]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    return users.filter(u =>
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );
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

  const tabs = [
    { key: 'chats', label: 'CHATS' },
    { key: 'people', label: 'PEOPLE' },
    { key: 'online', label: 'ONLINE' },
  ];

  async function saveProfile() {
    await updateUserProfile({ nickname, bio });
    setEditProfile(false);
  }

  return (
    <div className="flex h-full" style={{ width: '100%' }}>
      {/* Icon rail */}
      <div className="flex flex-col items-center gap-2 py-4 flex-shrink-0" style={{ width: 52, background: '#030610', borderRight: '1px solid rgba(0,245,255,0.08)' }}>
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: 'linear-gradient(135deg, #0044aa, #3300cc)', border: '1px solid rgba(0,245,255,0.4)', boxShadow: '0 0 15px rgba(0,245,255,0.2)' }}>
          <svg className="w-4 h-4" style={{ color: '#00f5ff' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.792 1.31 5.29 3.38 6.983V21l3.086-1.695A10.596 10.596 0 0012 19.486c5.523 0 10-4.145 10-9.243S17.523 2 12 2z"/>
          </svg>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          {[
            { key: 'requests', icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            ), badge: friendRequests.length },
            { key: 'settings', icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            )},
            { key: 'profile', icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            )},
          ].map(({ key, icon, badge }) => (
            <button key={key} onClick={() => setRightPanel(rightPanel === key ? null : key)}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: rightPanel === key ? 'rgba(0,245,255,0.1)' : 'transparent',
                color: rightPanel === key ? '#00f5ff' : 'rgba(90,120,160,0.7)',
                border: rightPanel === key ? '1px solid rgba(0,245,255,0.3)' : '1px solid transparent',
              }}>
              {icon}
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white notif-badge" style={{ fontSize: 9 }}>{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Logout */}
        <button onClick={logout} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ color: 'rgba(90,120,160,0.7)', border: '1px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ff006e'; e.currentTarget.style.background = 'rgba(255,0,110,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(90,120,160,0.7)'; e.currentTarget.style.background = 'transparent'; }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>

        {/* My avatar */}
        <button onClick={() => setRightPanel(rightPanel === 'profile' ? null : 'profile')} className="mt-1">
          <Avatar src={currentUser?.photoURL} name={currentUser?.displayName} size={32} online={true} />
        </button>
      </div>

      {/* Main sidebar panel */}
      <div className="flex flex-col flex-1 overflow-hidden" style={{ background: '#0a0f1e' }}>
        {/* Header */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 18, color: '#00f5ff', textShadow: '0 0 10px rgba(0,245,255,0.4)', letterSpacing: 2 }}>
              NEXUS
              {totalUnread > 0 && (
                <span className="ml-2 rounded-full px-1.5 py-0.5 notif-badge" style={{ fontSize: 10 }}>{totalUnread}</span>
              )}
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(0,245,255,0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="gaming-input w-full pl-9 pr-3 py-2 rounded-lg text-xs" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,245,255,0.08)' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex-1 py-1.5 rounded-md transition-all"
                style={{
                  fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 1,
                  background: tab === t.key ? 'rgba(0,245,255,0.1)' : 'transparent',
                  color: tab === t.key ? '#00f5ff' : 'rgba(90,120,160,0.7)',
                  border: tab === t.key ? '1px solid rgba(0,245,255,0.25)' : '1px solid transparent',
                  textShadow: tab === t.key ? '0 0 8px rgba(0,245,255,0.4)' : 'none',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {tab === 'chats' && (
            filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2" style={{ color: 'rgba(90,120,160,0.5)' }}>
                <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 11 }}>NO CHATS YET</span>
              </div>
            ) : filteredConvs.map(conv => {
              const other = getOtherParticipant(conv);
              const unread = conv.unread?.[currentUser?.uid] || 0;
              const isActive = activeConversation?.id === conv.id;
              const otherUser = users.find(u => u.uid === other?.uid);
              return (
                <button key={conv.id} onClick={() => onSelectConversation(conv)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all text-left"
                  style={{
                    background: isActive ? 'rgba(0,245,255,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(0,245,255,0.2)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                  <Avatar src={other?.photoURL} name={other?.displayName} size={38} online={otherUser?.online} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold truncate" style={{ fontFamily: 'Rajdhani,sans-serif', color: isActive ? '#00f5ff' : '#e8f4ff', letterSpacing: 0.5 }}>
                        {other?.nickname || other?.displayName}
                      </span>
                      <span style={{ fontSize: 10, color: 'rgba(90,120,160,0.6)', fontFamily: 'Share Tech Mono,monospace', flexShrink: 0 }}>{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="truncate" style={{ fontSize: 11, color: unread > 0 ? '#e8f4ff' : 'rgba(90,120,160,0.6)', fontWeight: unread > 0 ? 600 : 400 }}>
                        {conv.lastMessage || 'Start chatting'}
                      </span>
                      {unread > 0 && (
                        <span className="ml-1 flex-shrink-0 rounded-full flex items-center justify-center notif-badge" style={{ width: 16, height: 16, fontSize: 9 }}>
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}

          {tab === 'people' && (
            filteredUsers.map(user => {
              const isFriend = friends.includes(user.uid);
              const requested = (myProfile.sentRequests || []).includes(user.uid);
              const incomingReq = friendRequests.includes(user.uid);
              return (
                <div key={user.uid} className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl" style={{ border: '1px solid rgba(0,245,255,0.05)' }}>
                  <button onClick={() => onSelectUser(user)} className="flex-1 flex items-center gap-2.5 text-left min-w-0">
                    <Avatar src={user.photoURL} name={user.displayName} size={38} online={user.online} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ fontFamily: 'Rajdhani,sans-serif', color: '#e8f4ff', letterSpacing: 0.5 }}>{user.nickname || user.displayName}</div>
                      <div className="truncate" style={{ fontSize: 10, color: user.online ? '#39ff14' : 'rgba(90,120,160,0.6)', fontFamily: 'Share Tech Mono,monospace' }}>
                        {user.online ? '● ONLINE' : user.email}
                      </div>
                    </div>
                  </button>
                  {isFriend ? (
                    <span style={{ fontSize: 9, color: '#39ff14', fontFamily: 'Share Tech Mono,monospace', border: '1px solid rgba(57,255,20,0.3)', padding: '2px 6px', borderRadius: 4 }}>FRIEND</span>
                  ) : incomingReq ? (
                    <span style={{ fontSize: 9, color: '#00f5ff', fontFamily: 'Share Tech Mono,monospace', border: '1px solid rgba(0,245,255,0.3)', padding: '2px 6px', borderRadius: 4 }}>REQ</span>
                  ) : requested ? (
                    <span style={{ fontSize: 9, color: 'rgba(90,120,160,0.6)', fontFamily: 'Share Tech Mono,monospace', border: '1px solid rgba(90,120,160,0.2)', padding: '2px 6px', borderRadius: 4 }}>SENT</span>
                  ) : null}
                </div>
              );
            })
          )}

          {tab === 'online' && (
            onlineUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2" style={{ color: 'rgba(90,120,160,0.5)' }}>
                <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 11 }}>NO PLAYERS ONLINE</span>
              </div>
            ) : onlineUsers.map(user => (
              <button key={user.uid} onClick={() => onSelectUser(user)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all text-left"
                style={{ border: '1px solid transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(57,255,20,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar src={user.photoURL} name={user.displayName} size={38} online={true} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ fontFamily: 'Rajdhani,sans-serif', color: '#e8f4ff', letterSpacing: 0.5 }}>{user.nickname || user.displayName}</div>
                  <div style={{ fontSize: 10, color: '#39ff14', fontFamily: 'Share Tech Mono,monospace', textShadow: '0 0 6px #39ff14' }}>● ACTIVE NOW</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel overlay */}
      {rightPanel && (
        <div className="flex flex-col" style={{ width: 220, background: '#080d1a', borderLeft: '1px solid rgba(0,245,255,0.1)', flexShrink: 0 }}>
          <div className="px-3 pt-4 pb-2 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
            <span className="section-header">{rightPanel === 'requests' ? 'FRIEND REQUESTS' : rightPanel === 'settings' ? 'SETTINGS' : 'MY PROFILE'}</span>
            <button onClick={() => setRightPanel(null)} style={{ color: 'rgba(90,120,160,0.6)', fontSize: 16 }}>✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {rightPanel === 'requests' && (
              <div className="space-y-2">
                {requesterUsers.length === 0 ? (
                  <p style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 10, color: 'rgba(90,120,160,0.5)', textAlign: 'center', marginTop: 20 }}>NO PENDING REQUESTS</p>
                ) : requesterUsers.map(u => (
                  <div key={u.uid} className="rounded-lg p-2.5" style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.1)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar src={u.photoURL} name={u.displayName} size={32} />
                      <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 13, color: '#e8f4ff' }}>{u.displayName}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => { /* acceptFriendRequest via prop */ }}
                        className="flex-1 py-1 rounded-md text-white transition-all"
                        style={{ background: 'rgba(57,255,20,0.15)', border: '1px solid rgba(57,255,20,0.3)', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1, color: '#39ff14' }}>
                        ACCEPT
                      </button>
                      <button onClick={() => { /* declineFriendRequest via prop */ }}
                        className="flex-1 py-1 rounded-md transition-all"
                        style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1, color: '#ff006e' }}>
                        DECLINE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rightPanel === 'profile' && (
              <div className="space-y-3">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="relative">
                    <Avatar src={currentUser?.photoURL} name={currentUser?.displayName} size={64} online={true} />
                    <div className="absolute inset-0 rounded-full" style={{ border: '2px solid rgba(0,245,255,0.5)', boxShadow: '0 0 15px rgba(0,245,255,0.2)' }} />
                  </div>
                  <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15, color: '#00f5ff', letterSpacing: 1 }}>{myProfile.nickname || currentUser?.displayName}</span>
                  <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 10, color: '#39ff14', textShadow: '0 0 6px #39ff14' }}>● ONLINE</span>
                </div>

                {!editProfile ? (
                  <>
                    <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.08)' }}>
                      <p className="section-header mb-1">BIO</p>
                      <p style={{ fontSize: 12, color: myProfile.bio ? '#e8f4ff' : 'rgba(90,120,160,0.5)' }}>{myProfile.bio || 'No bio set.'}</p>
                    </div>
                    <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.08)' }}>
                      <p className="section-header mb-1">EMAIL</p>
                      <p style={{ fontSize: 11, color: 'rgba(90,120,160,0.8)', fontFamily: 'Share Tech Mono,monospace' }}>{currentUser?.email}</p>
                    </div>
                    <button onClick={() => setEditProfile(true)} className="w-full py-2 rounded-lg transition-all"
                      style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, color: '#00f5ff' }}>
                      EDIT PROFILE
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="section-header block mb-1">NICKNAME</label>
                      <input value={nickname} onChange={e => setNickname(e.target.value)} className="gaming-input w-full px-3 py-2 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="section-header block mb-1">BIO</label>
                      <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                        className="gaming-input w-full px-3 py-2 rounded-lg text-sm resize-none" placeholder="Tell your story..." />
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={saveProfile} className="flex-1 py-1.5 rounded-lg" style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1, color: '#00f5ff' }}>SAVE</button>
                      <button onClick={() => setEditProfile(false)} className="flex-1 py-1.5 rounded-lg" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.2)', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1, color: '#ff006e' }}>CANCEL</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {rightPanel === 'settings' && (
              <div className="space-y-3">
                <p className="section-header">APPEARANCE</p>
                <div className="rounded-lg p-3" style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.08)' }}>
                  <p style={{ fontSize: 12, color: 'rgba(90,120,160,0.8)', marginBottom: 8 }}>Profile Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {['#00f5ff', '#bf00ff', '#39ff14', '#ff006e', '#ff6600'].map(c => (
                      <button key={c} onClick={async () => { await updateUserProfile({ profileColor: c }); }}
                        className="w-7 h-7 rounded-full transition-all"
                        style={{ background: c, boxShadow: `0 0 8px ${c}`, border: myProfile.profileColor === c ? `2px solid white` : '2px solid transparent' }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.08)' }}>
                  <p style={{ fontSize: 12, color: 'rgba(90,120,160,0.8)' }}>Version</p>
                  <p style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 11, color: '#00f5ff', marginTop: 4 }}>NEXUS v2.0.0</p>
                </div>
                <button onClick={logout} className="w-full py-2 rounded-lg transition-all"
                  style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, color: '#ff006e' }}>
                  ⏏ LOGOUT
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}