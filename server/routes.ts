import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema, insertTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/users/:id/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks(req.params.id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user to their specific room
    socket.on("join_user_room", (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join admin to admin room
    socket.on("join_admin_room", () => {
      socket.join("admin");
      console.log("Admin joined admin room");
    });

    // Admin sends message to user
    socket.on("admin_send_message", async (data: { userId: string; content: string; isTask?: boolean }) => {
      try {
        const message = await storage.createMessage({
          userId: data.userId,
          sender: "admin",
          content: data.content,
          isTask: data.isTask || false,
        });

        // Send to user
        io.to(`user_${data.userId}`).emit("receive_message", message);
        
        // Confirm to admin
        socket.emit("message_sent", message);
      } catch (error) {
        socket.emit("error", "Failed to send message");
      }
    });

    // Admin sends task to user
    socket.on("admin_send_task", async (data: { userId: string; taskType: "phone" | "sms" | "twoFactor"; content: string }) => {
      try {
        // Create task
        const task = await storage.createTask({
          userId: data.userId,
          type: data.taskType,
          status: "pending",
          data: JSON.stringify({ content: data.content }),
        });

        // Create message
        const message = await storage.createMessage({
          userId: data.userId,
          sender: "admin",
          content: data.content,
          isTask: true,
        });

        // Send to user
        io.to(`user_${data.userId}`).emit("receive_task", { task, message });
        
        // Confirm to admin
        socket.emit("task_sent", { task, message });
      } catch (error) {
        socket.emit("error", "Failed to send task");
      }
    });

    // User submits task answer
    socket.on("user_submit_answer", async (data: { taskId: number; answer: string; userId: string }) => {
      try {
        const task = await storage.getTask(data.taskId);
        if (!task) {
          socket.emit("error", "Task not found");
          return;
        }

        // Update task with answer
        await storage.updateTask(data.taskId, {
          data: JSON.stringify({ ...JSON.parse(task.data || "{}"), answer: data.answer }),
        });

        // Create user message
        const message = await storage.createMessage({
          userId: data.userId,
          sender: "user",
          content: data.answer,
          isTask: false,
        });

        // Notify admin
        io.to("admin").emit("task_answer_received", { taskId: data.taskId, answer: data.answer, message, userId: data.userId });
        
        // Confirm to user
        socket.emit("answer_submitted", message);
      } catch (error) {
        socket.emit("error", "Failed to submit answer");
      }
    });

    // Admin approves/rejects task
    socket.on("task_response", async (data: { taskId: number; approved: boolean; userId: string; feedback?: string }) => {
      try {
        const status = data.approved ? "completed" : "failed";
        const task = await storage.updateTask(data.taskId, { status });

        if (!task) {
          socket.emit("error", "Task not found");
          return;
        }

        // Update user stats
        const user = await storage.getUser(data.userId);
        if (user) {
          if (data.approved) {
            await storage.updateUser(data.userId, {
              completedTasks: (user.completedTasks || 0) + 1,
              pendingTasks: Math.max(0, (user.pendingTasks || 0) - 1),
            });
          } else {
            await storage.updateUser(data.userId, {
              pendingTasks: Math.max(0, (user.pendingTasks || 0) - 1),
            });
          }
        }

        // Send response to user
        io.to(`user_${data.userId}`).emit("task_response", { 
          taskId: data.taskId, 
          approved: data.approved, 
          feedback: data.feedback 
        });

        // Confirm to admin
        socket.emit("task_response_sent", { taskId: data.taskId, approved: data.approved });
      } catch (error) {
        socket.emit("error", "Failed to process task response");
      }
    });

    // User sends message
    socket.on("user_send_message", async (data: { userId: string; content: string }) => {
      try {
        const message = await storage.createMessage({
          userId: data.userId,
          sender: "user",
          content: data.content,
          isTask: false,
        });

        // Send to admin
        io.to("admin").emit("receive_user_message", { ...message, userId: data.userId });
        
        // Confirm to user
        socket.emit("message_sent", message);
      } catch (error) {
        socket.emit("error", "Failed to send message");
      }
    });

    // Update user status
    socket.on("update_user_status", async (data: { userId: string; status: "online" | "offline" }) => {
      try {
        await storage.updateUser(data.userId, { 
          status: data.status, 
          lastActive: new Date() 
        });
        
        // Notify admin of status change
        io.to("admin").emit("user_status_changed", data);
      } catch (error) {
        socket.emit("error", "Failed to update status");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return httpServer;
}
