// src/components/PeopleTab.jsx
import { useState, useMemo } from 'react';

function Avatar({ src, name, size = 52, online }) {
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
          style={{ width: 13, height: 13, borderColor: '#0a0a0a', background: online ? '#31c45a' : '#3a3b3c' }} />
      )}
    </div>
  );
}

export default function PeopleTab({ users, userProfile, onSelectUser, sendFriendRequest, acceptFriendRequest, declineFriendRequest }) {
  const [subTab, setSubTab] = useState('active');

  const friends = userProfile?.friends || [];
  const requests = userProfile?.friendRequests || [];
  const sent = userProfile?.sentRequests || [];

  const activeUsers = useMemo(() => users.filter(u => u.online), [users]);
  const allUsers = users;
  const requestUsers = useMemo(() => users.filter(u => requests.includes(u.uid)), [users, requests]);

  const subTabs = [
    { key: 'active', label: 'Active' },
    { key: 'all', label: 'All' },
    { key: 'requests', label: 'Friend requests', badge: requests.length },
  ];

  const listToShow = subTab === 'active' ? activeUsers : subTab === 'all' ? allUsers : requestUsers;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-4">People</h1>
        {/* Sub tabs */}
        <div className="flex gap-2">
          {subTabs.map(t => (
            <button key={t.key} onClick={() => setSubTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all relative"
              style={{
                background: subTab === t.key ? '#0084ff' : '#242526',
                color: subTab === t.key ? '#fff' : '#b0b3b8',
              }}>
              {t.key === 'active' && (
                <span className="w-2 h-2 rounded-full" style={{ background: subTab === t.key ? '#fff' : '#31c45a' }} />
              )}
              {t.label}
              {t.badge > 0 && (
                <span className="ml-1 min-w-4 h-4 rounded-full flex items-center justify-center text-white font-bold px-1"
                  style={{ background: subTab === t.key ? 'rgba(255,255,255,0.3)' : '#f02849', fontSize: 10 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {listToShow.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2" style={{ color: '#b0b3b8' }}>
            <p className="text-sm">{subTab === 'active' ? 'No one is active right now' : subTab === 'requests' ? 'No friend requests' : 'No users found'}</p>
          </div>
        ) : listToShow.map(user => {
          const isFriend = friends.includes(user.uid);
          const isRequested = sent.includes(user.uid);
          const hasRequest = requests.includes(user.uid);

          return (
            <div key={user.uid} className="flex items-center gap-3 py-3">
              <button onClick={() => onSelectUser(user)} className="flex-1 flex items-center gap-3 min-w-0 text-left">
                <Avatar src={user.photoURL} name={user.displayName} size={52} online={user.online} />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#e4e6eb' }}>{user.nickname || user.displayName}</p>
                  <p className="text-xs truncate" style={{ color: '#b0b3b8' }}>
                    {user.online ? '● Active now' : user.bio || user.email}
                  </p>
                </div>
              </button>

              {/* Action buttons */}
              {subTab === 'requests' ? (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => acceptFriendRequest(user.uid)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: '#0084ff' }}>Confirm</button>
                  <button onClick={() => declineFriendRequest(user.uid)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                    style={{ background: '#3a3b3c', color: '#e4e6eb' }}>Delete</button>
                </div>
              ) : !isFriend && !hasRequest ? (
                <button onClick={() => !isRequested && sendFriendRequest(user.uid)}
                  className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: isRequested ? '#3a3b3c' : '#e7f3ff', color: isRequested ? '#b0b3b8' : '#0084ff' }}>
                  {isRequested ? 'Sent' : 'Add friend'}
                </button>
              ) : isFriend ? (
                <button onClick={() => onSelectUser(user)}
                  className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: '#3a3b3c', color: '#e4e6eb' }}>Message</button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}