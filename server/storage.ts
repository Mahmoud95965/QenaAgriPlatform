import { users, contents, type User, type Content, type InsertUser, type InsertContent,
  UserRole, Department, type UserRoleType, type DepartmentType } from "@shared/schema";
import { IStorage } from "@shared/index";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

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
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllContent(): Promise<Content[]> {
    return await db.select().from(contents).orderBy(desc(contents.createdAt));
  }

  async getContentById(id: number): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content;
  }

  async getContentByType(contentType: string): Promise<Content[]> {
    return await db.select().from(contents).where(eq(contents.contentType, contentType)).orderBy(desc(contents.createdAt));
  }

  async getContentByDepartment(department: string): Promise<Content[]> {
    return await db.select().from(contents).where(eq(contents.department, department)).orderBy(desc(contents.createdAt));
  }

  async createContent(content: InsertContent): Promise<Content> {
    const [newContent] = await db.insert(contents).values(content).returning();
    return newContent;
  }

  async updateContent(id: number, content: Partial<InsertContent>): Promise<Content | null> {
    const [updatedContent] = await db
      .update(contents)
      .set({
        ...content,
        updatedAt: new Date()
      })
      .where(eq(contents.id, id))
      .returning();
    
    return updatedContent || null;
  }

  async deleteContent(id: number): Promise<boolean> {
    const result = await db.delete(contents).where(eq(contents.id, id));
    return true; // في حالة عدم حدوث استثناء، نفترض أن العملية نجحت
  }
}

// استخدم DatabaseStorage بدلاً من MemStorage
export const storage = new DatabaseStorage();
