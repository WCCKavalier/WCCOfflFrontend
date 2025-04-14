const isLocal = window.location.hostname === "localhost";

export const MESSAGE_API = isLocal
  ? "https://wccbackendoffl.onrender.com/api"
  : "https://wccbackendoffl.onrender.com/api";

export const SOCKET_URL = isLocal
  ? "https://wccbackendoffl.onrender.com"
  : "https://wccbackendoffl.onrender.com";