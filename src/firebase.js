import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc, // Make sure this is imported
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrjoPKmmHSfmbUCQaBo0y0KWvK5aZWyVo",
  authDomain: "letters-cffb8.firebaseapp.com",
  projectId: "letters-cffb8",
  storageBucket: "letters-cffb8.firebasestorage.app",
  messagingSenderId: "29545574327",
  appId: "1:29545574327:web:ba61307069f10fbf794232",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ---------- LETTERS ----------
export function listenToLetters(callback, onError) {
  const qLetters = query(
    collection(db, "letters"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    qLetters,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(rows);
    },
    (err) => onError?.(err)
  );
}

export async function addLetter({ title, date, body }) {
  await addDoc(collection(db, "letters"), {
    title: title.trim(),
    date: (date || "").trim() || new Date().toISOString().slice(0, 10),
    body: body.trim(),
    favorite: false,
    createdAt: serverTimestamp(),
  });
}

export async function updateLetter(id, updates) {
  await updateDoc(doc(db, "letters", id), updates);
}

export async function toggleFavorite(id, current) {
  await updateDoc(doc(db, "letters", id), { favorite: !current });
}

export async function deleteLetter(id) {
  await deleteDoc(doc(db, "letters", id));
}

// ---------- OPEN WHEN ----------
export function listenToOpenWhen(callback, onError) {
  const q = query(collection(db, "open_when"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => onError?.(err)
  );
}

export async function addOpenWhen({ title, body }) {
  await addDoc(collection(db, "open_when"), {
    title: title.trim(), 
    body: body.trim(),
    createdAt: serverTimestamp(),
  });
}

// *** NEW FUNCTION HERE ***
export async function updateOpenWhen(id, updates) {
  await updateDoc(doc(db, "open_when", id), updates);
}

export async function deleteOpenWhen(id) {
  await deleteDoc(doc(db, "open_when", id));
}

// ---------- COMMENTS ----------
export async function createComment({ letterId, author, text }) {
  await addDoc(collection(db, "comments"), {
    letterId,
    author: author?.trim() || "someone",
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
}

export function listenToComments(letterId, callback, onError) {
  const q = query(collection(db, "comments"), where("letterId", "==", letterId));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
      callback(rows);
    },
    (err) => onError?.(err)
  );
}
