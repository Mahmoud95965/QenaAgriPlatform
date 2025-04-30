import { users, contents, type User, type Content, type InsertUser, 
  UserRole, Department, type UserRoleType, type DepartmentType } from "@shared/schema";
import { IStorage } from "@shared/index";

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
}

export const storage = new MemStorage();
