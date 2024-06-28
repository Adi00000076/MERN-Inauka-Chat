import React, { useState, useEffect } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import ChatLists from "./ChatLists";
import InputText from "./InputText";
import UserLogin from "./UserLogin";
import socketIOClient from "socket.io-client";
import "./ChatContainer.css";

import Infyz from "../assets/images/infyz.jpg";

const ChatContainer = () => {
  const [user, setUser] = useState(localStorage.getItem("user"));
  const socketio = socketIOClient("http://99.99.96.10:3002/");
  const [chats, setChats] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null); // State for reply message

  useEffect(() => {
    // Clear chat history on component mount if no user is logged in
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

  const addMessage = (chat) => {
    const newChat = {
      username: localStorage.getItem("user"),
      message: chat,
      avatar: localStorage.getItem("avatar"),
    };
    socketio.emit("newMessage", newChat);
  };

  const handleSelectReply = (chat) => {
    setReplyMessage(chat); // Set selected message as reply message
  };

  const clearReply = () => {
    setReplyMessage(null); // Clear the reply message
  };

  const Logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("avatar");
    setUser("");
    setChats([]); // Clear chat history on logout
  };

  return (
    <div className="chat-container">
      {user ? (
        <div className="home">
          <div className="chats_header">
            <h4>
              <FaUser /> Username: {user}
            </h4>
            <img src={Infyz} alt="Infyz" className="chats_icon" />
            <p className="chats_logout" onClick={Logout}>
              <FaSignOutAlt className="logout-icon" /> <strong>Logout</strong>
            </p>
          </div>
          <ChatLists chats={chats} onSelectReply={handleSelectReply} /> {/* Pass onSelectReply handler */}
          <InputText addMessage={addMessage} replyMessage={replyMessage} clearReply={clearReply} /> {/* Pass replyMessage and clearReply */}
        </div>
      ) : (
        <UserLogin setUser={setUser} />
      )}
    </div>
  );
};

export default ChatContainer;
