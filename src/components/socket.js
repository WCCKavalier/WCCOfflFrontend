// socket.js
import { io } from "socket.io-client";
import {  SOCKET_URL } from "./config";
const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false, // Allow auto connection
    reconnectionAttempts: 5, // Retry 5 times if connection fails
    reconnectionDelay: 1000, // 1 second delay between reconnections
    withCredentials: true,
  });

export default socket;
