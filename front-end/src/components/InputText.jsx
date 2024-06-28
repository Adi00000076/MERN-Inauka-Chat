import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import "./InputText.css";

const InputText = ({ addMessage, replyMessage, clearReply }) => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (message.trim()) {
      // Include reply message tag if it exists
      const messageToSend = replyMessage
        ? `Replying to: ${replyMessage.username}: ${replyMessage.message}\n${message}`
        : message;
      addMessage(messageToSend);
      setMessage("");
      clearReply(); // Clear reply after sending message
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here (e.g., upload to server)
      console.log("File selected:", file);
    }
  };

  return (
    <div className="inputtext_container">
      {/* Display the reply message above the input area */}
      {replyMessage && (
        <div className="reply_message">
          <p><strong>Replying to:</strong> {replyMessage.username}: {replyMessage.message}</p>
          <button onClick={clearReply} className="clear_reply_button">Clear Reply</button>
        </div>
      )}
      <textarea
        name="message"
        id="message"
        rows="3"
        placeholder="Input Message ..."
        onChange={(e) => setMessage(e.target.value)}
        value={message}
        onKeyPress={handleKeyPress}
      ></textarea>
      <label className="file_label">
        <IoCloudUploadOutline className="upload_icon" /> Upload File
        <input type="file" onChange={handleFileChange} />
      </label>
      <button onClick={sendMessage} className="send_button">
        <FaPaperPlane className="send_icon" /> Send
      </button>
    </div>
  );
};

export default InputText;
