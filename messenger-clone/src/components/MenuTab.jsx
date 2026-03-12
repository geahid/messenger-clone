// src/components/MenuTab.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MenuTab({ userProfile, currentUser }) {
  const { logout, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(userProfile?.nickname || currentUser?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateUserProfile({ nickname, bio });
    setSaving(false);
    setEditing(false);
  };

  const menuItems = [
    { icon: '🔒', label: 'Privacy', sub: 'Manage your privacy settings' },
    { icon: '🔔', label: 'Notifications', sub: 'Notification preferences' },
    { icon: '🎨', label: 'Appearance', sub: 'Dark mode, theme' },
    { icon: '❓', label: 'Help & Support', sub: 'Get help, report a problem' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-5 pb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-4">Menu</h1>
      </div>

      {/* Profile card */}
      <div className="mx-4 rounded-2xl p-4 mb-4 flex-shrink-0" style={{ background: '#1c1c1c' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden" style={{ border: '3px solid #0084ff' }}>
              {currentUser?.photoURL
                ? <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ background: 'linear-gradient(135deg, #0084ff, #a855f7)' }}>
                    {currentUser?.displayName?.charAt(0)}
                  </div>
              }
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 online-dot"
              style={{ background: '#31c45a', borderColor: '#1c1c1c' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate">{userProfile?.nickname || currentUser?.displayName}</p>
            <p className="text-sm" style={{ color: '#31c45a' }}>● Active now</p>
            {userProfile?.bio && <p className="text-xs mt-0.5 truncate" style={{ color: '#b0b3b8' }}>{userProfile.bio}</p>}
          </div>
          <button onClick={() => setEditing(!editing)}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#3a3b3c', color: '#e4e6eb' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="mt-4 space-y-2 slide-up">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: '#b0b3b8' }}>Nickname</label>
              <input value={nickname} onChange={e => setNickname(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: '#242526', border: '1px solid #3a3b3c', color: '#e4e6eb', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#0084ff'}
                onBlur={e => e.target.style.borderColor = '#3a3b3c'} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: '#b0b3b8' }}>Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
                className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                style={{ background: '#242526', border: '1px solid #3a3b3c', color: '#e4e6eb', outline: 'none' }}
                placeholder="Write something about yourself..."
                onFocus={e => e.target.style.borderColor = '#0084ff'}
                onBlur={e => e.target.style.borderColor = '#3a3b3c'} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#0084ff', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#3a3b3c', color: '#e4e6eb' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Menu items */}
      <div className="mx-4 rounded-2xl overflow-hidden mb-4 flex-shrink-0" style={{ background: '#1c1c1c' }}>
        {menuItems.map((item, i) => (
          <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left"
            style={{ borderTop: i > 0 ? '1px solid #2a2a2a' : 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#242526'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: '#3a3b3c' }}>{item.icon}</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#e4e6eb' }}>{item.label}</p>
              <p className="text-xs" style={{ color: '#b0b3b8' }}>{item.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="mx-4 mb-6 flex-shrink-0">
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
          style={{ background: '#1c1c1c' }}
          onMouseEnter={e => e.currentTarget.style.background = '#2a1010'}
          onMouseLeave={e => e.currentTarget.style.background = '#1c1c1c'}>
          <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(240,40,73,0.15)' }}>
            <svg className="w-5 h-5" style={{ color: '#f02849' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </span>
          <p className="font-semibold text-sm" style={{ color: '#f02849' }}>Log Out</p>
        </button>
      </div>
    </div>
  );
}