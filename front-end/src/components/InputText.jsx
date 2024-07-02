import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./InputText.css";

const InputText = ({ addMessage, replyMessage, clearReply }) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const replyMessageRef = useRef(null);

  useEffect(() => {
    // Scroll to the reply message area when a reply message is set
    if (replyMessage && replyMessageRef.current) {
      replyMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [replyMessage]);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3002/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Show success toast notification
      toast.success("File uploaded successfully!");

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error("Error uploading file.");
      return null;
    }
  };

  const sendMessage = async () => {
    if (message.trim() || selectedFile) {
      let messageToSend = message.trim();
      let fileData = null;

      if (replyMessage) {
        messageToSend = `Replying to: ${replyMessage.username}: ${replyMessage.message}\n${messageToSend}`;
      }

      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
      }

      addMessage(messageToSend, fileData);
      setMessage("");
      setSelectedFile(null);
      clearReply();
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
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast.error("Only images, PDF, Word, and Excel files are allowed.");
        setSelectedFile(null);
      }
    }
  };

  return (
    <div className="inputtext_container">
      <ToastContainer /> {/* ToastContainer component for toast notifications */}
      {replyMessage && (
        <div ref={replyMessageRef} className="reply_message">
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
        <input type="file" accept=".jpeg,.jpg,.png,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange} />
      </label>
      {selectedFile && (
        <p>Selected File: {selectedFile.name}</p>
      )}
      <button onClick={sendMessage} className="send_button">
        <FaPaperPlane className="send_icon" /> Send
      </button>
    </div>
  );
};

export default InputText;
