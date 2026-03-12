// src/hooks/useChat.js
import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, updateDoc, getDocs,
  setDoc, getDoc, limit, arrayUnion, arrayRemove,
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

  // Load all users
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users'), where('uid', '!=', currentUser.uid));
    return onSnapshot(q, snap => setUsers(snap.docs.map(d => d.data())));
  }, [currentUser]);

  // Load conversations ordered by most recent
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, snap => setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [currentUser]);

  // Load messages
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
  }, [activeConversation?.id]);

  const markAsRead = useCallback(async (convId) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'conversations', convId), { [`unread.${currentUser.uid}`]: 0 });
  }, [currentUser]);

  const getOrCreateConversation = useCallback(async (otherUser) => {
    if (!currentUser) return null;
    const participants = [currentUser.uid, otherUser.uid].sort();
    const convId = participants.join('_');
    const convRef = doc(db, 'conversations', convId);
    const snap = await getDoc(convRef);

    if (!snap.exists()) {
      await setDoc(convRef, {
        id: convId,
        participants,
        participantData: {
          [currentUser.uid]: {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.displayName}`,
            nickname: currentUser.displayName,
          },
          [otherUser.uid]: {
            displayName: otherUser.displayName,
            photoURL: otherUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.displayName}`,
            nickname: otherUser.displayName,
          },
        },
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unread: { [currentUser.uid]: 0, [otherUser.uid]: 0 },
        typing: {},
      });
    }
    const s = await getDoc(convRef);
    return { id: convId, ...s.data() };
  }, [currentUser]);

  const sendMessage = useCallback(async (text, imageFile = null, voiceBlob = null) => {
    if (!activeConversation || !currentUser) return;
    let imageUrl = null;
    let voiceUrl = null;
    let voiceDuration = null;

    if (imageFile) {
      const storageRef = ref(storage, `chat-images/${uuidv4()}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    if (voiceBlob) {
      const storageRef = ref(storage, `voice-messages/${uuidv4()}.webm`);
      await uploadBytes(storageRef, voiceBlob);
      voiceUrl = await getDownloadURL(storageRef);
      voiceDuration = voiceBlob.duration || 0;
    }

    const msgData = {
      text: text || '',
      imageUrl,
      voiceUrl,
      voiceDuration,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderPhoto: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.displayName}`,
      createdAt: serverTimestamp(),
      read: false,
    };

    await addDoc(collection(db, 'conversations', activeConversation.id, 'messages'), msgData);
    const otherUid = activeConversation.participants.find(uid => uid !== currentUser.uid);
    await updateDoc(doc(db, 'conversations', activeConversation.id), {
      lastMessage: voiceUrl ? '🎙 Voice message' : imageUrl ? '📷 Image' : text,
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

  // Friend system
  const sendFriendRequest = useCallback(async (targetUid) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', targetUid), { friendRequests: arrayUnion(currentUser.uid) });
    await updateDoc(doc(db, 'users', currentUser.uid), { sentRequests: arrayUnion(targetUid) });
  }, [currentUser]);

  const acceptFriendRequest = useCallback(async (requesterUid) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), {
      friends: arrayUnion(requesterUid),
      friendRequests: arrayRemove(requesterUid),
    });
    await updateDoc(doc(db, 'users', requesterUid), {
      friends: arrayUnion(currentUser.uid),
      sentRequests: arrayRemove(currentUser.uid),
    });
  }, [currentUser]);

  const declineFriendRequest = useCallback(async (requesterUid) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), { friendRequests: arrayRemove(requesterUid) });
    await updateDoc(doc(db, 'users', requesterUid), { sentRequests: arrayRemove(currentUser.uid) });
  }, [currentUser]);

  return {
    conversations, activeConversation, setActiveConversation,
    messages, users, loadingMessages,
    sendMessage, openConversation, setTyping,
    sendFriendRequest, acceptFriendRequest, declineFriendRequest,
  };
}