import { Server } from "socket.io";
let io: any = null;

export function initialize(server: any, corsOptions: any) {
  io = new Server(server, {
    cors: corsOptions
  });
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!')
  }
  return io;
}