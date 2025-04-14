const isLocal = window.location.hostname === "localhost";

export const MESSAGE_API = isLocal
  ? "https://wccbackend.onrender.com/api"
  : "https://wccbackend.onrender.com/api";

export const SOCKET_URL = isLocal
  ? "https://wccbackend.onrender.com"
  : "https://wccbackend.onrender.com";