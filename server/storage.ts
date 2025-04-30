import { users, contents, type User, type Content, type InsertUser, type InsertContent,
  UserRole, Department, type UserRoleType, type DepartmentType } from "@shared/schema";
import { IStorage } from "@shared/index";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contents: Map<number, Content>;
  currentId: number;
  currentContentId: number;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.currentId = 1;
    this.currentContentId = 1;
  }

  // ===== User Methods =====
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user = {
      id,
      uid: insertUser.uid,
      email: insertUser.email,
      username: insertUser.username,
      displayName: insertUser.displayName,
      role: insertUser.role as UserRoleType,
      department: insertUser.department as DepartmentType || null,
      studentId: insertUser.studentId || null,
      profilePicture: insertUser.profilePicture || null,
      createdAt: new Date()
    } as User;
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // ===== Content Methods =====
  
  async getAllContent(): Promise<Content[]> {
    return Array.from(this.contents.values());
  }
  
  async getContentById(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }
  
  async getContentByType(contentType: string): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      content => content.contentType === contentType
    );
  }
  
  async getContentByDepartment(department: string): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      content => content.department === department
    );
  }
  
  async createContent(content: InsertContent): Promise<Content> {
    const id = this.currentContentId++;
    const now = new Date();
    const newContent = {
      id,
      title: content.title,
      description: content.description,
      contentType: content.contentType,
      department: content.department,
      fileUrl: content.fileUrl,
      externalLink: content.externalLink,
      authorId: content.authorId,
      authorName: content.authorName,
      studentYear: content.studentYear,
      thumbnailUrl: content.thumbnailUrl,
      createdAt: now,
      updatedAt: now
    } as Content;
    
    this.contents.set(id, newContent);
    return newContent;
  }
  
  async updateContent(id: number, content: Partial<InsertContent>): Promise<Content | null> {
    const existingContent = this.contents.get(id);
    if (!existingContent) {
      return null;
    }
    
    const updatedContent = {
      ...existingContent,
      ...content,
      updatedAt: new Date()
    } as Content;
    
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  async deleteContent(id: number): Promise<boolean> {
    return this.contents.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Use raw SQL to avoid type issues
    const result = await db.execute(sql`
      INSERT INTO users (uid, email, username, display_name, role, department, student_id, profile_picture)
      VALUES (
        ${insertUser.uid},
        ${insertUser.email},
        ${insertUser.username},
        ${insertUser.displayName},
        ${insertUser.role},
        ${insertUser.department || null},
        ${insertUser.studentId || null},
        ${insertUser.profilePicture || null}
      )
      RETURNING *
    `);
    
    return result.rows[0] as User;
  }

  async getAllContent(): Promise<Content[]> {
    return await db.select().from(contents).orderBy(desc(contents.createdAt));
  }

  async getContentById(id: number): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content;
  }

  async getContentByType(contentType: string): Promise<Content[]> {
    // Use a properly typed contentType value
    return await db.select()
      .from(contents)
      .where(contentType === "article" ? 
        eq(contents.contentType, "article") :
        contentType === "ebook" ?
        eq(contents.contentType, "ebook") :
        eq(contents.contentType, "project"))
      .orderBy(desc(contents.createdAt));
  }

  async getContentByDepartment(department: string): Promise<Content[]> {
    // Use properly typed department value
    let deptFilter;
    switch(department) {
      case "horticulture":
        deptFilter = eq(contents.department, "horticulture");
        break;
      case "crops":
        deptFilter = eq(contents.department, "crops");
        break;
      case "soil":
        deptFilter = eq(contents.department, "soil");
        break;
      case "protection":
        deptFilter = eq(contents.department, "protection");
        break;
      default:
        deptFilter = eq(contents.department, "other");
    }
    
    return await db.select()
      .from(contents)
      .where(deptFilter)
      .orderBy(desc(contents.createdAt));
  }

  async createContent(content: InsertContent): Promise<Content> {
    // Use raw SQL to avoid type issues
    const result = await db.execute(sql`
      INSERT INTO contents (
        title, description, content_type, department, 
        file_url, article_text_path, external_link, 
        author_id, author_name, student_year, thumbnail_url
      )
      VALUES (
        ${content.title},
        ${content.description},
        ${content.contentType},
        ${content.department || null},
        ${content.fileUrl || null},
        ${content.articleTextPath || null},
        ${content.externalLink || null},
        ${content.authorId || null},
        ${content.authorName},
        ${content.studentYear || null},
        ${content.thumbnailUrl || null}
      )
      RETURNING *
    `);
    
    return result.rows[0] as Content;
  }

  async updateContent(id: number, contentUpdate: Partial<InsertContent>): Promise<Content | null> {
    // First get the existing content to properly merge and maintain types
    const [existingContent] = await db.select().from(contents).where(eq(contents.id, id));
    
    if (!existingContent) {
      return null;
    }
    
    // Prepare the update ensuring proper types
    const updateData: any = { updatedAt: new Date() };
    
    if (contentUpdate.title !== undefined) updateData.title = contentUpdate.title;
    if (contentUpdate.description !== undefined) updateData.description = contentUpdate.description;
    if (contentUpdate.contentType !== undefined) updateData.contentType = contentUpdate.contentType;
    if (contentUpdate.department !== undefined) updateData.department = contentUpdate.department;
    if (contentUpdate.fileUrl !== undefined) updateData.fileUrl = contentUpdate.fileUrl;
    if (contentUpdate.articleTextPath !== undefined) updateData.articleTextPath = contentUpdate.articleTextPath;
    if (contentUpdate.externalLink !== undefined) updateData.externalLink = contentUpdate.externalLink;
    if (contentUpdate.authorId !== undefined) updateData.authorId = contentUpdate.authorId;
    if (contentUpdate.authorName !== undefined) updateData.authorName = contentUpdate.authorName;
    if (contentUpdate.studentYear !== undefined) updateData.studentYear = contentUpdate.studentYear;
    if (contentUpdate.thumbnailUrl !== undefined) updateData.thumbnailUrl = contentUpdate.thumbnailUrl;
    
    const [updatedContent] = await db
      .update(contents)
      .set(updateData)
      .where(eq(contents.id, id))
      .returning();
    
    return updatedContent || null;
  }

  async deleteContent(id: number): Promise<boolean> {
    const result = await db.delete(contents).where(eq(contents.id, id));
    return true; // In case no exception occurs, we assume the operation was successful
  }
}

// استخدم DatabaseStorage بدلاً من MemStorage
export const storage = new DatabaseStorage();
