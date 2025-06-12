import { users, messages, tasks, type User, type InsertUser, type Message, type InsertMessage, type Task, type InsertTask } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Message operations
  getMessages(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  getTask(id: number): Promise<Task | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Map<number, Message>;
  private tasks: Map<number, Task>;
  private currentMessageId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.tasks = new Map();
    this.currentMessageId = 1;
    this.currentTaskId = 1;
    
    // Initialize with some sample users for development
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleUsers: User[] = [
      {
        id: uuidv4(),
        name: "John Anderson",
        phone: "+1 (555) 123-4567",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        status: "online",
        lastActive: new Date(),
        completedTasks: 5,
        pendingTasks: 1,
      },
      {
        id: uuidv4(),
        name: "Sarah Mitchell",
        phone: "+1 (555) 987-6543",
        avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b332c5d0?w=100&h=100&fit=crop&crop=face",
        status: "offline",
        lastActive: new Date(Date.now() - 3600000), // 1 hour ago
        completedTasks: 3,
        pendingTasks: 2,
      },
      {
        id: uuidv4(),
        name: "Mike Chen",
        phone: "+1 (555) 456-7890",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        status: "online",
        lastActive: new Date(),
        completedTasks: 8,
        pendingTasks: 0,
      },
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = uuidv4();
    const user: User = {
      ...insertUser,
      id,
      status: "offline",
      lastActive: new Date(),
      completedTasks: 0,
      pendingTasks: 0,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getMessages(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...insertTask,
      id,
      timestamp: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
}

export const storage = new MemStorage();
