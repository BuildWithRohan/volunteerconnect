import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload a file to Firebase Storage and return the download URL.
 * @param {File} file - The file object to upload
 * @param {string} path - The storage path (e.g., 'needs/photos/image.jpg')
 */
export async function uploadFile(file, path) {
  if (!storage) throw new Error("Storage not initialized");
  
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}
