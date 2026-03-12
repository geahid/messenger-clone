// src/components/ChatWindow.jsx
import { useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Message from './Message';
import MessageInput from './MessageInput';
import { format, isToday, isYesterday } from 'date-fns';

function DateDivider({ date }) {
  const label = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMMM d, yyyy');
  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      <span className="text-xs text-slate-400 font-medium px-2">{label}</span>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

function TypingIndicator({ name }) {
  return (
    <div className="flex items-end gap-2 mb-2 px-4">
      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-slate-500">{name?.charAt(0)}</span>
      </div>
      <div className="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1 items-center h-3">
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({ conversation, messages, loadingMessages, onSend, onTyping, users, onBack }) {
  const { currentUser } = useAuth();
  const bottomRef = useRef();

  const other = useMemo(() => {
    if (!conversation) return null;
    const entry = Object.entries(conversation.participantData || {}).find(([uid]) => uid !== currentUser?.uid);
    if (!entry) return null;
    return { uid: entry[0], ...entry[1] };
  }, [conversation, currentUser]);

  const otherUserLive = useMemo(() => {
    return users?.find(u => u.uid === other?.uid);
  }, [users, other]);

  const isOtherTyping = conversation?.typing?.[other?.uid];

  // Group messages with date dividers
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

  // Empty state
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 select-none">
        <div className="text-center space-y-4 px-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300" style={{fontFamily:'Sora,sans-serif'}}>
              Your messages
            </h3>
            <p className="text-slate-400 text-sm mt-1">Select a conversation or start a new one</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Mobile back */}
        {onBack && (
          <button onClick={onBack} className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
        )}

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            {other?.photoURL ? (
              <img src={other.photoURL} alt={other.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{other?.displayName?.charAt(0)}</span>
            )}
          </div>
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${otherUserLive?.online ? 'bg-emerald-400' : 'bg-slate-300'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{other?.displayName}</div>
          <div className={`text-xs ${otherUserLive?.online ? 'text-emerald-500' : 'text-slate-400'}`}>
            {isOtherTyping ? (
              <span className="text-blue-500 animate-pulse">typing…</span>
            ) : otherUserLive?.online ? 'Active now' : 'Offline'}
          </div>
        </div>

        {/* Info button */}
        <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        {loadingMessages ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : (
          <>
            {grouped.map(item => {
              if (item.type === 'divider') return <DateDivider key={item.key} date={item.date} />;
              const isMine = item.msg.senderId === currentUser?.uid;
              return (
                <Message key={item.msg.id} msg={item.msg} isMine={isMine} showAvatar={item.showAvatar} />
              );
            })}
            {isOtherTyping && <TypingIndicator name={other?.displayName} />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={onSend} onTyping={onTyping} />
    </div>
  );
}
