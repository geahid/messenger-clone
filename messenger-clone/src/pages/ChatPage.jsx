// src/pages/ChatPage.jsx
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';

export default function ChatPage() {
  const { userProfile } = useAuth();
  const {
    conversations, activeConversation, setActiveConversation,
    messages, users, loadingMessages,
    sendMessage, openConversation, setTyping,
    sendFriendRequest, acceptFriendRequest, declineFriendRequest,
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
    <div className="flex h-screen overflow-hidden" style={{ background: '#050810' }}>
      {/* Sidebar */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-shrink-0 h-full`}
        style={{ width: showSidebar ? '100%' : 'auto', maxWidth: 420 }}>
        <Sidebar
          conversations={conversations}
          users={users}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onSelectUser={handleSelectUser}
          userProfile={userProfile}
          acceptFriendRequest={acceptFriendRequest}
          declineFriendRequest={declineFriendRequest}
          sendFriendRequest={sendFriendRequest}
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
          sendFriendRequest={sendFriendRequest}
          userProfile={userProfile}
        />
      </div>
    </div>
  );
}