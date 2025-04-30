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

// التحقق من رمز الإثبات للمسؤول
export const verifyAdminCode = (code: string): boolean => {
  // رمز الإثبات للمسؤول
  const ADMIN_SECRET_CODE = "Agri159208#";
  return code === ADMIN_SECRET_CODE;
};

// Authentication functions
export const loginWithEmailPassword = (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmailPassword = async (email: string, password: string, userData: Partial<InsertUser>): Promise<UserCredential> => {
  console.log("Starting user registration with:", { email, userData });
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (userCredential.user) {
    // Update display name if provided
    if (userData.displayName) {
      console.log("Updating display name to:", userData.displayName);
      await updateProfile(userCredential.user, {
        displayName: userData.displayName
      });
    }
    
    // استخدام وظيفة createUserDocument لإنشاء وثيقة المستخدم
    const role = userData.role || UserRole.STUDENT;
    console.log("Creating user document with role:", role);
    
    // إنشاء كائن المستخدم مع الخصائص المخصصة
    const user = userCredential.user;
    // تعديل العرض لتشمل البيانات المخصصة
    Object.defineProperty(user, 'customData', {
      value: {
        displayName: userData.displayName,
        username: userData.username || email.split('@')[0],
        department: userData.department,
        studentId: userData.studentId
      },
      writable: false
    });
    
    await createUserDocument(user, role);
    
    // إضافة البيانات الإضافية التي لم تتضمنها وظيفة createUserDocument
    if (userData.department || userData.studentId) {
      console.log("Updating additional user data:", { department: userData.department, studentId: userData.studentId });
      await updateDoc(doc(db, "users", userCredential.user.uid), {
        department: userData.department || null,
        studentId: userData.studentId || null
      });
    }
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
    
    // الاحتفاظ بمعلومات أساسية فقط لتجنب أي أخطاء
    const userData = {
      displayName: user.displayName || "User",
      email: user.email || "",
      username: user.email ? user.email.split('@')[0] : "user",
      role: role,
      createdAt: new Date().toISOString(),
      id: user.uid
    };
    
    // طباعة البيانات قبل حفظها في Firestore
    console.log("About to create document with data:", userData);
    
    // إنشاء الوثيقة في Firestore
    await setDoc(doc(db, "users", user.uid), userData);
    console.log("User document created successfully for:", user.uid);
    
    return userData;
  } catch (error) {
    console.error("Detailed error creating user document:", error);
    // محاولة أخرى باستخدام بيانات محدودة جدًا
    try {
      const minimalData = {
        email: user.email || "",
        role: role,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", user.uid), minimalData);
      console.log("Created user document with minimal data");
      return minimalData;
    } catch (secondError) {
      console.error("Even minimal data failed:", secondError);
      throw error; // إعادة الخطأ الأصلي
    }
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
        
        // استخراج البيانات من ملف الإكسل كمصفوفة من القيم
        const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // تحديد نوع الملف وترتيب الأعمدة
        let jsonData: ExcelUser[] = [];
        const defaultPassword = "Password123!"; // كلمة مرور افتراضية للطلاب
        
        // تفقد ما إذا كان الملف هو ملف إيميلات الطلاب
        let isStudentEmailFormat = false;
        if (rawData.length > 0 && Array.isArray(rawData[0]) && rawData[0].length > 0) {
          const firstCell = rawData[0][0];
          isStudentEmailFormat = typeof firstCell === 'string' && firstCell.includes('@');
        }
        
        if (isStudentEmailFormat) {
          // تحويل بيانات الإيميلات إلى الصيغة المطلوبة
          for (const row of rawData) {
            if (Array.isArray(row) && row.length > 0) {
              const firstCell = row[0];
              if (typeof firstCell === 'string' && firstCell.includes('@')) {
                const email = String(firstCell).trim();
                const username = email.split('@')[0];
                jsonData.push({
                  name: username, // استخدام اسم المستخدم من الإيميل
                  email: email,
                  password: defaultPassword,
                  role: UserRole.STUDENT,
                  department: "قسم عام", // قسم افتراضي للطلاب الجدد
                  studentId: username // استخدام اسم المستخدم كمعرف طالب مؤقت
                });
              }
            }
          }
        } else {
          // استخدام التنسيق القياسي لملف الإكسل
          jsonData = XLSX.utils.sheet_to_json<ExcelUser>(worksheet);
        }
        
        console.log("تم تحميل البيانات من الملف:", jsonData.length, "مستخدم");
        
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
            console.error("فشل في إنشاء المستخدم:", user.email, error);
            result.failed.push(user);
          }
        }
        
        resolve(result);
      } catch (error) {
        console.error("خطأ في معالجة ملف الإكسل:", error);
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
  
  // تم تغيير هذه الوظيفة لتعتمد على واجهة API للخادم بدلاً من Firebase Storage مباشرة
  // Upload file if provided
  if (file) {
    try {
      // إنشاء نموذج بيانات لإرسال الملف
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', content.contentType);
      formData.append('title', content.title);
      
      // إرسال الملف إلى الخادم
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('فشل في رفع الملف');
      }
      
      const data = await response.json();
      fileUrl = data.fileUrl;
    } catch (error) {
      console.error('خطأ في رفع الملف:', error);
      throw error;
    }
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
