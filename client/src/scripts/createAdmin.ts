import { createUserWithEmailAndPassword, updateProfile, getAuth } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { UserRole } from "@shared/schema";

// Firebase configuration
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

// بيانات المستخدم المسؤول
const adminUser = {
  email: "mahmoud@gmail.com",
  password: "Mahmoud159208#",
  displayName: "محمود",
  role: UserRole.ADMIN,
  department: "other",
  username: "mahmoud",
  createdAt: new Date().toISOString()
};

// وظيفة لإنشاء حساب المسؤول
async function createAdminUser() {
  try {
    // إنشاء المستخدم في Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, adminUser.email, adminUser.password);
    
    // تحديث اسم المستخدم
    await updateProfile(userCredential.user, {
      displayName: adminUser.displayName
    });
    
    // إنشاء وثيقة المستخدم في Firestore
    const userData = {
      displayName: adminUser.displayName,
      email: adminUser.email,
      username: adminUser.username,
      role: adminUser.role,
      department: adminUser.department,
      createdAt: adminUser.createdAt,
      id: userCredential.user.uid
    };
    
    await setDoc(doc(db, "users", userCredential.user.uid), userData);
    
    console.log("تم إنشاء حساب المسؤول بنجاح!");
    console.log("البريد الإلكتروني:", adminUser.email);
    console.log("كلمة المرور:", adminUser.password);
    console.log("معرف المستخدم:", userCredential.user.uid);
    
    return userData;
  } catch (error) {
    console.error("خطأ في إنشاء حساب المسؤول:", error);
    throw error;
  }
}

// لا نقوم بتنفيذ الدالة مباشرة، سنقوم بإنشاء المستخدم من خلال وظيفة أخرى
export { createAdminUser, adminUser };