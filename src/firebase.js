// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrjoPKmmHSfmbUCQaBo0y0KWvK5aZWyVo",
  authDomain: "letters-cffb8.firebaseapp.com",
  projectId: "letters-cffb8",
  storageBucket: "letters-cffb8.firebasestorage.app",
  messagingSenderId: "29545574327",
  appId: "1:29545574327:web:ba61307069f10fbf794232",
};

// init firebase app
const app = initializeApp(firebaseConfig);

// init firestore
const db = getFirestore(app);

/* ---- helper wrappers we’ll import in App.jsx ---- */

// listen to all letters (live)
export function listenToLetters(callback) {
  // we'll order so newest first (by createdAt, desc)
  const qLetters = query(
    collection(db, "letters"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(qLetters, (snapshot) => {
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(data);
  });
}

// add a letter
export async function createLetter({ title, date, body, favorite = false }) {
  const ref = await addDoc(collection(db, "letters"), {
    title,
    date,
    body,
    favorite,
    deleted: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// update an existing letter
export async function updateLetter(id, updates) {
  const ref = doc(db, "letters", id);
  await updateDoc(ref, updates);
}

// soft-delete a letter (mark deleted=true)
export async function trashLetter(id) {
  const ref = doc(db, "letters", id);
  await updateDoc(ref, { deleted: true });
}

// restore / un-delete
export async function restoreLetterFromTrash(id) {
  const ref = doc(db, "letters", id);
  await updateDoc(ref, { deleted: false });
}

// PERMANENT delete (if we ever add it)
export async function hardDeleteLetter(id) {
  const ref = doc(db, "letters", id);
  await deleteDoc(ref);
}

/* ----- comments ----- */

// listen to comments for a specific letter
export function listenToComments(letterId, callback) {
  const qComments = query(
    collection(db, "comments"),
    where("letterId", "==", letterId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(qComments, (snapshot) => {
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(data);
  });
}

// add a comment
export async function createComment({ letterId, author, text }) {
  await addDoc(collection(db, "comments"), {
    letterId,
    author, // e.g. "me" / "you"
    text,
    createdAt: serverTimestamp(),
  });
}

export { db };
