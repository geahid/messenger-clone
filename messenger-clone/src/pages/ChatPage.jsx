// src/pages/ChatPage.jsx
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useChat } from '../hooks/useChat';

export default function ChatPage() {
  const {
    conversations, activeConversation, setActiveConversation,
    messages, users, loadingMessages,
    sendMessage, openConversation, setTyping,
  } = useChat();
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setShowSidebar(false);
  };

  const handleSelectUser = async (user) => {
    await openConversation(user);
    setShowSidebar(false);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 overflow-hidden">
      {/* Sidebar – always visible on md+, conditionally on mobile */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 flex-shrink-0 h-full`}>
        <Sidebar
          conversations={conversations}
          users={users}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onSelectUser={handleSelectUser}
        />
      </div>

      {/* Chat window */}
      <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-1 min-w-0 h-full`}>
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          loadingMessages={loadingMessages}
          onSend={sendMessage}
          onTyping={setTyping}
          users={users}
          onBack={() => setShowSidebar(true)}
        />
      </div>
    </div>
  );
}
