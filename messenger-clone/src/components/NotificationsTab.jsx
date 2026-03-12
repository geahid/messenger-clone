// src/components/NotificationsTab.jsx
import { useMemo } from 'react';

function Avatar({ src, name, size = 52 }) {
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

export default function NotificationsTab({ users, userProfile, acceptFriendRequest, declineFriendRequest }) {
  const requests = userProfile?.friendRequests || [];
  const requestUsers = useMemo(() => users.filter(u => requests.includes(u.uid)), [users, requests]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4">
        {requestUsers.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold mb-3" style={{ color: '#b0b3b8' }}>FRIEND REQUESTS</p>
            {requestUsers.map(user => (
              <div key={user.uid} className="flex items-center gap-3 py-3">
                <Avatar src={user.photoURL} name={user.displayName} size={52} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: '#e4e6eb' }}>{user.displayName}</p>
                  <p className="text-xs" style={{ color: '#b0b3b8' }}>Sent you a friend request</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => acceptFriendRequest(user.uid)}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
                      style={{ background: '#0084ff' }}>Confirm</button>
                    <button onClick={() => declineFriendRequest(user.uid)}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold"
                      style={{ background: '#3a3b3c', color: '#e4e6eb' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {requestUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2" style={{ color: '#b0b3b8' }}>
            <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}