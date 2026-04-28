import { collection, getDocs, query, where, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, firebaseConfigured } from "./firebase";

/**
 * Get all NGO users (with location data) for map display.
 */
export async function getAllNGOs() {
  if (!firebaseConfigured || !db) return [];
  const q = query(collection(db, "users"), where("role", "==", "ngo"));
  const snapshot = await getDocs(q);
  const ngos = [];
  snapshot.forEach((doc) => {
    const data = { id: doc.id, ...doc.data() };
    // Only include NGOs that have location data
    if (data.lat && data.lng) {
      ngos.push(data);
    }
  });
  return ngos;
}

/**
 * Subscribe to a specific NGO profile.
 */
export function subscribeToNGOProfile(uid, callback) {
  if (!firebaseConfigured || !db) return () => {};
  return onSnapshot(doc(db, "users", uid), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
}

/**
 * Update NGO profile data.
 */
export async function updateNGOProfile(uid, data) {
  if (!firebaseConfigured || !db) return;
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
}
