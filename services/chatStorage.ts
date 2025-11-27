import { ChatSession } from "../types";
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, Timestamp, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";

const LOCAL_STORAGE_KEY = 'al_hikmah_sessions_v1';

export const ChatStorage = {
  // Now async to support Firestore
  getSessions: async (user: User | null): Promise<ChatSession[]> => {
    if (user) {
      // Fetch from Firestore for logged-in users
      try {
        const q = query(collection(db, "users", user.uid, "sessions"), orderBy("updatedAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
           const data = doc.data();
           // Convert Firestore Timestamp to number if necessary, though we store as number below
           return { ...data, id: doc.id } as ChatSession;
        });
      } catch (e) {
        console.error("Error fetching sessions from Firestore", e);
        return [];
      }
    } else {
      // Local Storage for guests
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) return [];
        const sessions: ChatSession[] = JSON.parse(stored);
        return sessions.sort((a, b) => {
          const timeA = a.updatedAt || a.createdAt;
          const timeB = b.updatedAt || b.createdAt;
          return timeB - timeA;
        });
      } catch (e) {
        console.error("Failed to load local sessions", e);
        return [];
      }
    }
  },

  getSession: async (user: User | null, id: string): Promise<ChatSession | undefined> => {
    if (user) {
        try {
            const docRef = doc(db, "users", user.uid, "sessions", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { ...docSnap.data(), id: docSnap.id } as ChatSession;
            }
            return undefined;
        } catch(e) {
            console.error("Error fetching single session", e);
            return undefined;
        }
    } else {
        const sessions = await ChatStorage.getSessions(null);
        return sessions.find(s => s.id === id);
    }
  },

  saveSession: async (user: User | null, session: ChatSession) => {
    const updatedSession = { ...session, updatedAt: Date.now() };

    if (user) {
        // Save to Firestore
        try {
            const docRef = doc(db, "users", user.uid, "sessions", session.id);
            await setDoc(docRef, updatedSession, { merge: true });
        } catch (e) {
            console.error("Error saving session to Firestore", e);
        }
    } else {
        // Save to LocalStorage
        const sessions = await ChatStorage.getSessions(null);
        const index = sessions.findIndex(s => s.id === session.id);
        
        if (index >= 0) {
            sessions[index] = updatedSession;
        } else {
            sessions.unshift(updatedSession);
        }
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
    }
  },

  deleteSession: async (user: User | null, id: string) => {
    if (user) {
        try {
            await deleteDoc(doc(db, "users", user.uid, "sessions", id));
        } catch (e) {
             console.error("Error deleting session from Firestore", e);
        }
    } else {
        const sessions = (await ChatStorage.getSessions(null)).filter(s => s.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
    }
  },

  createSession: (): ChatSession => {
    return {
      id: Date.now().toString(),
      title: 'New Discussion',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
};