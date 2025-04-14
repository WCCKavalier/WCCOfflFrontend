import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import "./chat.css";
import { MESSAGE_API, SOCKET_URL } from "./config";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
  withCredentials: true,
});

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [username, setUsername] = useState("");
  const messagesContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("username");
    const token = sessionStorage.getItem("token");

    if (!sessionUser || !token) {
        navigate("/login");
        return;
    }

    setUsername(sessionUser);
    fetchMessages(token);

    if (!socket.connected) {
        socket.connect();
    }

    // Remove existing listener before adding new one
    socket.off("receiveMessage");
    socket.on("receiveMessage", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
        socket.off("receiveMessage");
        socket.disconnect();
    };
}, [navigate]);

  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    const isBottom =
      container.scrollHeight <= container.scrollTop + container.clientHeight + 10;
    setIsAtBottom(isBottom);
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  const fetchMessages = async (token) => {
    try {
      const { data } = await axios.get(`${MESSAGE_API}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    const token = sessionStorage.getItem("token");
    const newMessage = { username, message };
    setMessage(""); // clear input

    try {
        // DO NOT emit through socket anymore
        await axios.post(`${MESSAGE_API}/messages`, newMessage, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // DO NOT add message to UI here, wait for socket to emit from backend
    } catch (err) {
        console.error("Error sending message", err);
    }
};

  return (
    <div className="chat-wrapper">
      <h2>🟢 Discussion Forum</h2>
      <div className="chat-container">
        <p>Welcome, {username}!</p>
        <div
          ref={messagesContainerRef}
          className="messages-container"
          onScroll={handleScroll}
        >
          {messages.map((msg, idx) => (
            <p
              key={idx}
              className={`message ${msg.username === username ? "sent" : "received"}`}
            >
              <strong>{msg.username}:</strong> {msg.message}
            </p>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="message-input"
          />
          <button onClick={handleSendMessage} className="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;