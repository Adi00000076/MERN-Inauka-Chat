import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaSignOutAlt, FaTimes } from "react-icons/fa";
import ChatLists from "./ChatLists";
import InputText from "./InputText";
import UserLogin from "./UserLogin";
import socketIOClient from "socket.io-client";
import "./ChatContainer.css"; // Import your CSS file for styling
import Infyz from "../assets/images/infyz.jpg"; // Assuming this is your avatar image

const ChatContainer = () => {
  const [user, setUser] = useState(localStorage.getItem("user"));
  const socketio = socketIOClient("http://localhost:3002/");
  const [chats, setChats] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);
  const chatEndRef = useRef(null); // Define chatEndRef here

  useEffect(() => {
    if (!user) {
      setChats([]);
    }

    socketio.on("chat", (chats) => {
      setChats(chats);
    });

    socketio.on("message", (msg) => {
      setChats((prevChats) => [...prevChats, msg]);
    });

    return () => {
      socketio.off("chat");
      socketio.off("message");
    };
  }, [user]);

  const addMessage = async (message, fileData) => {
    const newChat = {
      username: localStorage.getItem("user"),
      message,
      avatar: localStorage.getItem("avatar"), // Ensure you have avatar stored in localStorage
      file_path: fileData?.filePath,
    };
    socketio.emit("newMessage", newChat);
  };

  const handleSelectReply = (chat) => {
    setReplyMessage(chat);
  };

  const clearReply = () => {
    setReplyMessage(null);
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("avatar");
    setUser("");
    setChats([]);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  return (
    <div className="chat-container">
      {user ? (
        <div className="home">
          <div className="chats-header">
            <div className="left-section">
              <FaUser className="user-icon" />
              <span className="username">{user}</span>
            </div>
            <div className="middle-section">
              <img src={Infyz} alt="Infyz" className="avatar" />
            </div>
            <div className="right-section">
              <p className="logout" onClick={logoutUser}>
                <FaSignOutAlt className="logout-icon" />
                <strong>Logout</strong>
              </p>
            </div>
          </div>
          <ChatLists chats={chats} onSelectReply={handleSelectReply} currentUser={user} />
          <div ref={chatEndRef} /> {/* This will ensure scrolling to bottom */}
          <InputText addMessage={addMessage} replyMessage={replyMessage} />
          {replyMessage && (
            <div className="clear-reply" onClick={clearReply}>
              <FaTimes className="clear-reply-icon" />
              Clear Reply
            </div>
          )}
        </div>
      ) : (
        <UserLogin setUser={setUser} />
      )}
    </div>
  );
};

export default ChatContainer;
