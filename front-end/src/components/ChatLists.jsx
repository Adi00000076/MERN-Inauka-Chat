import React, { useEffect, useRef } from "react";
import { format } from "date-fns";
import "./ChatLists.css"; // Import your external CSS file for styles

const ChatLists = ({ chats, onSelectReply }) => {
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

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
              className={`chat_item ${chat.username === localStorage.getItem("user") ? "chat_sender" : "chat_receiver"}`}
              onClick={() => handleSelectReply(chat)} // Handle message selection for reply
            >
              <div className="chat_content">
                <h5>{chat.username}</h5>
                <p>{chat.message}</p>
                {chat.file_path && (
                  <div className="chat_file">
                    <img src={`http://99.99.96.10:3002${chat.file_path}`} alt="Attached File" />
                  </div>
                )}
                <div className="chat_time">
                  {format(new Date(chat.timestamp), "HH:mm")}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatLists;







