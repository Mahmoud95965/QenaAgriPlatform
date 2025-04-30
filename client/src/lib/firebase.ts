import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, UserCredential, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, orderBy, limit, DocumentData, QuerySnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as XLSX from 'xlsx';
import { User, UserRole, UserRoleType, InsertUser, ContentType, InsertContent } from "@shared/schema";

// Firebase configuration - ideally these would be environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "demo-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const loginWithEmailPassword = (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmailPassword = async (email: string, password: string, userData: Partial<InsertUser>): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (userCredential.user) {
    // Update display name if provided
    if (userData.displayName) {
      await updateProfile(userCredential.user, {
        displayName: userData.displayName
      });
    }
    
    // Store additional user data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      username: userData.username || email.split('@')[0],
      displayName: userData.displayName || "",
      role: userData.role || UserRole.STUDENT,
      department: userData.department || null,
      studentId: userData.studentId || null,
      profilePicture: userCredential.user.photoURL || null,
      createdAt: new Date()
    });
  }
  
  return userCredential;
};

export const loginWithGoogle = (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};

export const logoutUser = (): Promise<void> => {
  return signOut(auth);
};

// User management functions
export const getUserByUid = async (uid: string): Promise<DocumentData | null> => {
  try {
    console.log("Getting user by UID:", uid);
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = { id: userDoc.id, ...userDoc.data() };
      console.log("User data retrieved:", userData);
      return userData;
    } else {
      console.log("No user document found with UID:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error in getUserByUid:", error);
    return null;
  }
};

export const createUserDocument = async (user: any, role: string = UserRole.STUDENT): Promise<DocumentData> => {
  try {
    console.log("Creating user document for:", user.uid);
    
    const userData = {
      displayName: user.displayName || "User",
      email: user.email,
      username: user.email?.split('@')[0] || "user",
      role: role,
      createdAt: new Date(),
      id: user.uid
    };
    
    await setDoc(doc(db, "users", user.uid), userData);
    console.log("User document created successfully:", userData);
    
    return userData;
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

export const updateUserRole = async (uid: string, role: string): Promise<void> => {
  await updateDoc(doc(db, "users", uid), { role });
};

// Batch user creation from Excel file
export interface ExcelUser {
  name: string;
  email: string;
  studentId?: string;
  department?: string;
  password: string;
  role: string;
}

export const createUsersFromExcel = async (file: File): Promise<{ success: ExcelUser[], failed: ExcelUser[] }> => {
  const result = { success: [] as ExcelUser[], failed: [] as ExcelUser[] };
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<ExcelUser>(worksheet);
        
        for (const user of jsonData) {
          try {
            await registerWithEmailPassword(user.email, user.password, {
              displayName: user.name,
              username: user.email.split('@')[0],
              role: user.role as string,
              department: user.department,
              studentId: user.studentId
            });
            result.success.push(user);
          } catch (error) {
            result.failed.push(user);
          }
        }
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Content management functions
export const addContent = async (content: InsertContent, file?: File): Promise<string> => {
  let fileUrl = content.fileUrl || "";
  
  // Upload file if provided
  if (file) {
    const storageRef = ref(storage, `content/${content.contentType}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    fileUrl = await getDownloadURL(storageRef);
  }
  
  const docRef = await addDoc(collection(db, "contents"), {
    ...content,
    fileUrl,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return docRef.id;
};

export const updateContent = async (id: string, content: Partial<InsertContent>, file?: File): Promise<void> => {
  const contentRef = doc(db, "contents", id);
  let updatedContent = { ...content, updatedAt: new Date() };
  
  // Upload new file if provided
  if (file) {
    const storageRef = ref(storage, `content/${content.contentType}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);
    updatedContent.fileUrl = fileUrl;
  }
  
  await updateDoc(contentRef, updatedContent);
};

export const deleteContent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "contents", id));
};

export const getContentByType = async (contentType: string, departmentFilter?: string, limitCount = 10): Promise<DocumentData[]> => {
  let q = query(
    collection(db, "contents"),
    where("contentType", "==", contentType),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  
  if (departmentFilter) {
    q = query(
      collection(db, "contents"),
      where("contentType", "==", contentType),
      where("department", "==", departmentFilter),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getRecentContent = async (limitCount = 6): Promise<DocumentData[]> => {
  const q = query(
    collection(db, "contents"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export { auth, db, storage };
