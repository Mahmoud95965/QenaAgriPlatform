import fs from 'fs';
import path from 'path';
import { ContentType, type Content, type InsertContent, type ContentTypeType, type DepartmentType } from '@shared/schema';

// مسارات المجلدات
const contentDir = path.join('.', 'content');
const articlesDir = path.join(contentDir, 'articles');
const ebooksDir = path.join(contentDir, 'ebooks');
const projectsDir = path.join(contentDir, 'projects');

// التأكد من وجود المجلدات
export function ensureContentDirectories() {
  [contentDir, articlesDir, ebooksDir, projectsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// دالة لتحديد مسار المجلد حسب نوع المحتوى
function getDirectoryForContentType(contentType: string): string {
  switch (contentType) {
    case ContentType.ARTICLE:
      return articlesDir;
    case ContentType.EBOOK:
      return ebooksDir;
    case ContentType.PROJECT:
      return projectsDir;
    default:
      return contentDir;
  }
}

// دالة لحفظ محتوى المقال كملف نصي
export async function saveArticleText(id: string, title: string, content: string): Promise<string> {
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
  const fileName = `${id}_${sanitizedTitle}.txt`;
  const filePath = path.join(articlesDir, fileName);
  
  fs.writeFileSync(filePath, content, 'utf8');
  
  return fileName;
}

// دالة لقراءة محتوى المقال من الملف
export async function readArticleText(fileName: string): Promise<string> {
  const filePath = path.join(articlesDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    throw new Error('ملف المقال غير موجود');
  }
  
  return fs.readFileSync(filePath, 'utf8');
}

// دالة لتخزين بيانات المحتوى في ملف JSON
export async function saveContentMetadata(contents: Content[]): Promise<void> {
  const filePath = path.join(contentDir, 'metadata.json');
  fs.writeFileSync(filePath, JSON.stringify(contents, null, 2), 'utf8');
}

// دالة لقراءة بيانات المحتوى من ملف JSON
export async function readContentMetadata(): Promise<Content[]> {
  const filePath = path.join(contentDir, 'metadata.json');
  
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// دالة لإضافة محتوى جديد
export async function addContent(content: InsertContent): Promise<Content> {
  // قراءة البيانات الحالية
  const contents = await readContentMetadata();
  
  // إنشاء معرف فريد
  const id = Date.now().toString();
  
  // إنشاء كائن المحتوى الجديد
  const newContent: Content = {
    id: parseInt(id),
    title: content.title,
    description: content.description,
    contentType: content.contentType as ContentTypeType,
    department: content.department as DepartmentType || null,
    authorName: content.authorName,
    fileUrl: content.fileUrl || null,
    articleTextPath: content.articleTextPath || null,
    externalLink: content.externalLink || null,
    authorId: content.authorId || null,
    studentYear: content.studentYear || null,
    thumbnailUrl: content.thumbnailUrl || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // إضافة المحتوى الجديد إلى المصفوفة
  contents.push(newContent);
  
  // حفظ البيانات المحدثة
  await saveContentMetadata(contents);
  
  return newContent;
}

// دالة لتحديث محتوى موجود
export async function updateContent(id: number, content: Partial<InsertContent>): Promise<Content | null> {
  // قراءة البيانات الحالية
  const contents = await readContentMetadata();
  
  // البحث عن المحتوى المطلوب تعديله
  const index = contents.findIndex(item => item.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // تحديث المحتوى
  const oldContent = contents[index];
  
  // ضمان أن أنواع البيانات صحيحة
  const currentContentType = oldContent.contentType as ContentTypeType;
  const currentDepartment = oldContent.department as DepartmentType;
  
  const updatedContent: Content = {
    id: oldContent.id,
    title: content.title || oldContent.title,
    description: content.description || oldContent.description,
    contentType: (content.contentType as ContentTypeType) || oldContent.contentType,
    department: (content.department as DepartmentType) || oldContent.department,
    authorName: content.authorName || oldContent.authorName,
    fileUrl: content.fileUrl !== undefined ? content.fileUrl : oldContent.fileUrl,
    articleTextPath: content.articleTextPath !== undefined ? content.articleTextPath : oldContent.articleTextPath,
    externalLink: content.externalLink !== undefined ? content.externalLink : oldContent.externalLink,
    authorId: content.authorId !== undefined ? content.authorId : oldContent.authorId,
    studentYear: content.studentYear !== undefined ? content.studentYear : oldContent.studentYear,
    thumbnailUrl: content.thumbnailUrl !== undefined ? content.thumbnailUrl : oldContent.thumbnailUrl,
    createdAt: oldContent.createdAt,
    updatedAt: new Date()
  };
  
  // تحديث المصفوفة
  contents[index] = updatedContent;
  
  // حفظ البيانات المحدثة
  await saveContentMetadata(contents);
  
  return updatedContent;
}

// دالة لحذف محتوى
export async function deleteContent(id: number): Promise<boolean> {
  // قراءة البيانات الحالية
  const contents = await readContentMetadata();
  
  // البحث عن المحتوى المطلوب حذفه
  const index = contents.findIndex(item => item.id === id);
  
  if (index === -1) {
    return false;
  }
  
  // حذف أي ملفات مرتبطة
  const content = contents[index];
  
  if (content.fileUrl) {
    const urlParts = content.fileUrl.split('/');
    if (urlParts.length >= 3) {
      const filename = urlParts[urlParts.length - 1];
      const contentType = urlParts[urlParts.length - 2];
      const filePath = path.join(getDirectoryForContentType(contentType), filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
  
  // حذف المحتوى من المصفوفة
  contents.splice(index, 1);
  
  // حفظ البيانات المحدثة
  await saveContentMetadata(contents);
  
  return true;
}

// دالة للحصول على كل المحتويات
export async function getAllContent(): Promise<Content[]> {
  return readContentMetadata();
}

// دالة للحصول على محتوى محدد بالمعرف
export async function getContentById(id: number): Promise<Content | null> {
  const contents = await readContentMetadata();
  const content = contents.find(item => item.id === id);
  return content || null;
}

// دالة للحصول على المحتويات حسب النوع
export async function getContentByType(contentType: string): Promise<Content[]> {
  const contents = await readContentMetadata();
  return contents.filter(item => item.contentType === contentType);
}

// دالة للحصول على المحتويات حسب القسم
export async function getContentByDepartment(department: string): Promise<Content[]> {
  const contents = await readContentMetadata();
  return contents.filter(item => item.department === department);
}

// دالة لتحويل المقال النصي إلى PDF
export async function convertArticleToPdf(articleId: string, articleTitle: string): Promise<string> {
  // نقرأ محتوى المقال
  const sanitizedTitle = articleTitle.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
  const txtFileName = `${articleId}_${sanitizedTitle}.txt`;
  const articleContent = await readArticleText(txtFileName);
  
  // نقوم بإنشاء ملف HTML وسيط (يمكن استخدام مكتبات مثل html-pdf أو puppeteer لتحويل HTML إلى PDF)
  const htmlContent = `
  <!DOCTYPE html>
  <html dir="rtl">
  <head>
    <meta charset="UTF-8">
    <title>${articleTitle}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 20px;
        direction: rtl;
      }
      h1 {
        text-align: center;
        margin-bottom: 20px;
      }
      .content {
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <h1>${articleTitle}</h1>
    <div class="content">${articleContent}</div>
  </body>
  </html>
  `;
  
  const htmlFilePath = path.join(articlesDir, `${articleId}_${sanitizedTitle}.html`);
  fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
  
  // ملاحظة: هنا نحتاج إلى مكتبة لتحويل HTML إلى PDF
  // في هذه المرحلة، نقوم فقط بإنشاء ملف HTML ويمكن للمستخدم تنزيله
  
  return htmlFilePath;
}