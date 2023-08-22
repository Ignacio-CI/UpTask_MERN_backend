const express = require('express');
import connectDB from './config/db.js';
import dotenv from "dotenv";
import cors from 'cors';
import userRoutes from './routes/userRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import { Server } from 'socket.io';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

// DOTENV
dotenv.config();

// DATABASE CONNECTION
connectDB();

// CORS CONFIGURATION
const whiteList = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.includes(origin)) {
            // Allow to query the API
            callback(null, true);
        } else {
            // Not allow to query the API
            callback(new Error('CORS Error'))
        }
    }
}

app.use(cors(corsOptions));

// ROUTES
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

const server = app.listen(PORT, () => {
    console.log(`Connected to port: ${PORT}`);
});

// SOCKET.IO
const io = new Server(server, {
  pingTimeout: 6000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    // Define events of the socket.io
    socket.on("open project", (project) => {
      socket.join(project);
    });

    socket.on("new task", (task) => {
      const project = task.project;
      socket.to(project).emit('task added', task);
    });

    socket.on("delete task", (task) => {
      const project = task.project;
      socket.to(project).emit("task deleted", task);
    });

    socket.on("update task", task => {
      const project = task.project._id;
      socket.to(project).emit("task updated", task);
    });

    socket.on("change state", task => {
      const project = task.project._id
      socket.to(project).emit("new state", task);
    });
});