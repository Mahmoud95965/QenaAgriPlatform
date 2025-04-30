export * from './schema';

export interface IStorage {
  getAllUsers: () => Promise<any[]>;
  getUser: (id: number) => Promise<any | undefined>;
  getUserByUsername: (username: string) => Promise<any | undefined>;
  createUser: (user: any) => Promise<any>;
  getAllContent: () => Promise<any[]>;
  getContentById: (id: number) => Promise<any | undefined>;
  getContentByType: (contentType: string) => Promise<any[]>;
  getContentByDepartment: (department: string) => Promise<any[]>;
}