// src/components/Message.jsx
import { format } from 'date-fns';

export default function Message({ msg, isMine, showAvatar }) {
  const time = msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'h:mm a') : '';

  return (
    <div className={`flex items-end gap-2 mb-1 ${isMine ? 'flex-row-reverse' : 'flex-row'} animate-fade-up`}>
      {/* Avatar placeholder to maintain alignment */}
      <div className="w-7 flex-shrink-0">
        {!isMine && showAvatar && (
          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            {msg.senderPhoto ? (
              <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-slate-500 font-bold">
                {msg.senderName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={`max-w-[70%] flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Sender name */}
        {!isMine && showAvatar && (
          <span className="text-xs text-slate-400 px-1">{msg.senderName}</span>
        )}

        {/* Image */}
        {msg.imageUrl && (
          <div className={`rounded-2xl overflow-hidden shadow-sm ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
            style={{animation: isMine ? 'messageInRight 0.25s cubic-bezier(0.34,1.56,0.64,1)' : 'messageInLeft 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}>
            <img src={msg.imageUrl} alt="Shared" className="max-w-xs max-h-64 object-cover" />
          </div>
        )}

        {/* Text bubble */}
        {msg.text && (
          <div
            style={{animation: isMine ? 'messageInRight 0.25s cubic-bezier(0.34,1.56,0.64,1)' : 'messageInLeft 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              isMine
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-sm'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Timestamp + read */}
        <div className={`flex items-center gap-1 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-slate-400">{time}</span>
          {isMine && (
            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
