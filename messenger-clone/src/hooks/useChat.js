// src/hooks/useChat.js
import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, updateDoc, getDocs,
  setDoc, getDoc, limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export function useChat() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load all users for sidebar
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users'), where('uid', '!=', currentUser.uid));
    const unsub = onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => d.data()));
    });
    return unsub;
  }, [currentUser]);

  // Load conversations
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [currentUser]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversation) { setMessages([]); return; }
    setLoadingMessages(true);
    const q = query(
      collection(db, 'conversations', activeConversation.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingMessages(false);
      markAsRead(activeConversation.id);
    });
    return unsub;
  }, [activeConversation]);

  const markAsRead = useCallback(async (convId) => {
    if (!currentUser) return;
    const convRef = doc(db, 'conversations', convId);
    await updateDoc(convRef, {
      [`unread.${currentUser.uid}`]: 0,
    });
  }, [currentUser]);

  const getOrCreateConversation = useCallback(async (otherUser) => {
    if (!currentUser) return null;
    const participants = [currentUser.uid, otherUser.uid].sort();
    const convId = participants.join('_');
    const convRef = doc(db, 'conversations', convId);
    const convSnap = await getDoc(convRef);

    if (!convSnap.exists()) {
      await setDoc(convRef, {
        id: convId,
        participants,
        participantData: {
          [currentUser.uid]: {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.displayName}`,
          },
          [otherUser.uid]: {
            displayName: otherUser.displayName,
            photoURL: otherUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.displayName}`,
          },
        },
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unread: { [currentUser.uid]: 0, [otherUser.uid]: 0 },
        typing: {},
      });
    }
    const snap = await getDoc(convRef);
    return { id: convId, ...snap.data() };
  }, [currentUser]);

  const sendMessage = useCallback(async (text, imageFile = null) => {
    if (!activeConversation || !currentUser) return;
    let imageUrl = null;

    if (imageFile) {
      const storageRef = ref(storage, `chat-images/${uuidv4()}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const msgData = {
      text: text || '',
      imageUrl,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderPhoto: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.displayName}`,
      createdAt: serverTimestamp(),
      read: false,
    };

    await addDoc(collection(db, 'conversations', activeConversation.id, 'messages'), msgData);

    const otherUid = activeConversation.participants.find(uid => uid !== currentUser.uid);
    await updateDoc(doc(db, 'conversations', activeConversation.id), {
      lastMessage: text || '📷 Image',
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
      [`unread.${otherUid}`]: (activeConversation.unread?.[otherUid] || 0) + 1,
    });
  }, [activeConversation, currentUser]);

  const setTyping = useCallback(async (isTyping) => {
    if (!activeConversation || !currentUser) return;
    await updateDoc(doc(db, 'conversations', activeConversation.id), {
      [`typing.${currentUser.uid}`]: isTyping,
    });
  }, [activeConversation, currentUser]);

  const openConversation = useCallback(async (user) => {
    const conv = await getOrCreateConversation(user);
    setActiveConversation(conv);
    return conv;
  }, [getOrCreateConversation]);

  return {
    conversations, activeConversation, setActiveConversation,
    messages, users, loadingMessages,
    sendMessage, openConversation, setTyping,
  };
}
