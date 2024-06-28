import React, { useEffect, useRef } from "react";
import "./ChatLists.css"; // Assuming you have your ChatLists styles defined here

const ChatLists = ({ chats, onSelectReply }) => {
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  // Function to format timestamp to HH:MM format
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Function to handle selecting a message for reply
  const handleSelectReply = (chat) => {
    onSelectReply(chat); // Pass selected chat to parent component
  };

  // Function to group chats by date
  const groupChatsByDate = (chats) => {
    const groupedChats = [];
    let currentDate = null;

    chats.forEach((chat) => {
      const chatDate = new Date(chat.timestamp).toDateString();

      if (chatDate !== currentDate) {
        groupedChats.push({
          date: chatDate,
          chats: [chat],
        });
        currentDate = chatDate;
      } else {
        groupedChats[groupedChats.length - 1].chats.push(chat);
      }
    });

    return groupedChats;
  };

  const groupedChats = groupChatsByDate(chats);

  return (
    <div className="chatlists">
      {groupedChats.map((group, index) => (
        <div key={index}>
          <div className="chat_date">{group.date}</div>
          {group.chats.map((chat, idx) => (
            <div
              key={idx}
              className={`chat_item ${
                chat.username === localStorage.getItem("user")
                  ? "chat_sender"
                  : "chat_receiver"
              }`}
              onClick={() => handleSelectReply(chat)} // Handle message selection for reply
            >
              <div className="chat_avatar">
                <img src={chat.avatar} alt={chat.username} />
              </div>
              <div className="chat_content">
                <h5>{chat.username}</h5>
                <p>{chat.message}</p>
                {chat.filename && (
                  <div className="chat_file">
                    {chat.mimetype.startsWith("image/") ? (
                      <img
                        src={`http://localhost:3002/uploads/${chat.filename}`}
                        alt={chat.originalname}
                      />
                    ) : (
                      <a
                        href={`http://localhost:3002/uploads/${chat.filename}`}
                        download={chat.originalname}
                      >
                        {chat.originalname}
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="chat_time">{formatTime(chat.timestamp)}</div>
            </div>
          ))}
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatLists;
