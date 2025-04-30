import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { upload, handleUploadErrors, deleteFile, getFilePath } from "./fileStorage";
import { saveArticleText, readArticleText, convertArticleToPdf, addContent, updateContent, deleteContent, getAllContent, getContentById, getContentByType, getContentByDepartment } from "./contentStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints prefix
  const apiPrefix = '/api';

  // Health check endpoint
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // User routes
  app.get(`${apiPrefix}/users`, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users', error: (error as Error).message });
    }
  });

  app.get(`${apiPrefix}/users/:id`, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user', error: (error as Error).message });
    }
  });

  // Content routes
  app.get(`${apiPrefix}/content`, async (req, res) => {
    try {
      const content = await storage.getAllContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch content', error: (error as Error).message });
    }
  });

  app.get(`${apiPrefix}/content/:id`, async (req, res) => {
    try {
      const content = await storage.getContentById(parseInt(req.params.id));
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch content', error: (error as Error).message });
    }
  });

  app.get(`${apiPrefix}/content/type/:contentType`, async (req, res) => {
    try {
      const contentType = req.params.contentType;
      const content = await storage.getContentByType(contentType);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch content by type', error: (error as Error).message });
    }
  });

  app.get(`${apiPrefix}/content/department/:department`, async (req, res) => {
    try {
      const department = req.params.department;
      const content = await storage.getContentByDepartment(department);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch content by department', error: (error as Error).message });
    }
  });

  // Authentication bridge endpoints (used to connect to Firebase Auth)
  app.post(`${apiPrefix}/auth/verify-token`, async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }
    
    // In a real implementation, you would verify the Firebase token
    // Here we just acknowledge the request as this is handled client-side
    res.json({ message: 'Token verification handled client-side with Firebase' });
  });
  
  // مسارات رفع وتنزيل الملفات
  
  // مسار لرفع ملف جديد
  app.post(`${apiPrefix}/upload`, upload.single('file'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لم يتم تقديم أي ملف' });
      }
      
      const file = req.file;
      const contentType = req.body.contentType;
      
      // استعادة عنوان URL للملف المرفوع (يتم استخدامه للتنزيل لاحقًا)
      const fileUrl = `/api/download/${contentType}/${file.filename}`;
      
      return res.status(200).json({
        message: 'تم رفع الملف بنجاح',
        file: {
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
        },
        fileUrl: fileUrl,
      });
    } catch (error) {
      console.error('خطأ في معالجة رفع الملف:', error);
      return res.status(500).json({ error: 'فشل في رفع الملف' });
    }
  }, handleUploadErrors);
  
  // مسار لتنزيل ملف
  app.get(`${apiPrefix}/download/:contentType/:filename`, (req: Request, res: Response) => {
    try {
      const { contentType, filename } = req.params;
      
      // الحصول على المسار الكامل للملف
      const filePath = getFilePath(contentType, filename);
      
      // التحقق من وجود الملف
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'الملف غير موجود' });
      }
      
      // إرسال الملف
      return res.download(filePath);
    } catch (error) {
      console.error('خطأ في تنزيل الملف:', error);
      return res.status(500).json({ error: 'فشل في تنزيل الملف' });
    }
  });
  
  // مسار لحذف ملف
  app.delete(`${apiPrefix}/files/:contentType/:filename`, (req: Request, res: Response) => {
    try {
      const { contentType, filename } = req.params;
      
      // الحصول على المسار الكامل للملف
      const filePath = getFilePath(contentType, filename);
      
      // محاولة حذف الملف
      const deleted = deleteFile(filePath);
      
      if (deleted) {
        return res.status(200).json({ message: 'تم حذف الملف بنجاح' });
      } else {
        return res.status(404).json({ error: 'الملف غير موجود أو لا يمكن حذفه' });
      }
    } catch (error) {
      console.error('خطأ في حذف الملف:', error);
      return res.status(500).json({ error: 'فشل في حذف الملف' });
    }
  });

  // ===================== مسارات المحتوى الجديدة =======================
  
  // ==================== مسارات خاصة بالمقالات النصية ====================
  
  // حفظ مقال نصي جديد
  app.post(`${apiPrefix}/articles/text`, async (req: Request, res: Response) => {
    try {
      const { id, title, content } = req.body;
      
      if (!id || !title || !content) {
        return res.status(400).json({ error: 'جميع الحقول (id, title, content) مطلوبة' });
      }
      
      const fileName = await saveArticleText(id, title, content);
      
      return res.status(200).json({
        message: 'تم حفظ المقال بنجاح',
        fileName: fileName,
        fileUrl: `/api/articles/text/${fileName}`
      });
    } catch (error) {
      console.error('خطأ في حفظ المقال:', error);
      return res.status(500).json({ error: 'فشل في حفظ المقال', details: (error as Error).message });
    }
  });
  
  // قراءة محتوى مقال نصي
  app.get(`${apiPrefix}/articles/text/:fileName`, async (req: Request, res: Response) => {
    try {
      const fileName = req.params.fileName;
      
      if (!fileName) {
        return res.status(400).json({ error: 'اسم الملف مطلوب' });
      }
      
      const content = await readArticleText(fileName);
      
      return res.status(200).json({
        content: content
      });
    } catch (error) {
      console.error('خطأ في قراءة المقال:', error);
      return res.status(404).json({ error: 'المقال غير موجود', details: (error as Error).message });
    }
  });
  
  // تحويل مقال نصي إلى PDF (HTML في الوقت الحالي)
  app.get(`${apiPrefix}/articles/pdf/:id/:title`, async (req: Request, res: Response) => {
    try {
      const { id, title } = req.params;
      
      if (!id || !title) {
        return res.status(400).json({ error: 'معرف المقال والعنوان مطلوبان' });
      }
      
      // تحويل المقال إلى PDF (HTML حاليًا)
      const htmlFilePath = await convertArticleToPdf(id, title);
      
      // إرسال الملف كاستجابة
      return res.download(htmlFilePath);
    } catch (error) {
      console.error('خطأ في تحويل المقال إلى PDF:', error);
      return res.status(500).json({ error: 'فشل في تحويل المقال إلى PDF', details: (error as Error).message });
    }
  });
  
  // ==================== مسارات لإدارة المحتوى الجديدة ====================
  
  // إضافة محتوى جديد
  app.post(`${apiPrefix}/content`, async (req: Request, res: Response) => {
    try {
      const contentData = req.body;
      
      if (!contentData.title || !contentData.description || !contentData.contentType || !contentData.authorName) {
        return res.status(400).json({ error: 'بعض الحقول المطلوبة غير متوفرة' });
      }
      
      const newContent = await addContent(contentData);
      
      return res.status(201).json(newContent);
    } catch (error) {
      console.error('خطأ في إضافة المحتوى:', error);
      return res.status(500).json({ error: 'فشل في إضافة المحتوى', details: (error as Error).message });
    }
  });
  
  // تحديث محتوى موجود
  app.put(`${apiPrefix}/content/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const contentData = req.body;
      
      const updatedContent = await updateContent(id, contentData);
      
      if (!updatedContent) {
        return res.status(404).json({ error: 'المحتوى غير موجود' });
      }
      
      return res.status(200).json(updatedContent);
    } catch (error) {
      console.error('خطأ في تحديث المحتوى:', error);
      return res.status(500).json({ error: 'فشل في تحديث المحتوى', details: (error as Error).message });
    }
  });
  
  // حذف محتوى
  app.delete(`${apiPrefix}/content/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const deleted = await deleteContent(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'المحتوى غير موجود' });
      }
      
      return res.status(200).json({ message: 'تم حذف المحتوى بنجاح' });
    } catch (error) {
      console.error('خطأ في حذف المحتوى:', error);
      return res.status(500).json({ error: 'فشل في حذف المحتوى', details: (error as Error).message });
    }
  });
  
  // الحصول على كل المحتويات
  app.get(`${apiPrefix}/contents`, async (req: Request, res: Response) => {
    try {
      const contents = await getAllContent();
      
      return res.status(200).json(contents);
    } catch (error) {
      console.error('خطأ في جلب المحتويات:', error);
      return res.status(500).json({ error: 'فشل في جلب المحتويات', details: (error as Error).message });
    }
  });
  
  // الحصول على محتوى محدد بالمعرف
  app.get(`${apiPrefix}/contents/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const content = await getContentById(id);
      
      if (!content) {
        return res.status(404).json({ error: 'المحتوى غير موجود' });
      }
      
      return res.status(200).json(content);
    } catch (error) {
      console.error('خطأ في جلب المحتوى:', error);
      return res.status(500).json({ error: 'فشل في جلب المحتوى', details: (error as Error).message });
    }
  });
  
  // الحصول على المحتويات حسب النوع
  app.get(`${apiPrefix}/contents/type/:contentType`, async (req: Request, res: Response) => {
    try {
      const contentType = req.params.contentType;
      
      const contents = await getContentByType(contentType);
      
      return res.status(200).json(contents);
    } catch (error) {
      console.error('خطأ في جلب المحتويات حسب النوع:', error);
      return res.status(500).json({ error: 'فشل في جلب المحتويات حسب النوع', details: (error as Error).message });
    }
  });
  
  // الحصول على المحتويات حسب القسم
  app.get(`${apiPrefix}/contents/department/:department`, async (req: Request, res: Response) => {
    try {
      const department = req.params.department;
      
      const contents = await getContentByDepartment(department);
      
      return res.status(200).json(contents);
    } catch (error) {
      console.error('خطأ في جلب المحتويات حسب القسم:', error);
      return res.status(500).json({ error: 'فشل في جلب المحتويات حسب القسم', details: (error as Error).message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
