import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./InputText.css";

const InputText = ({ addMessage, replyMessage, clearReply }) => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
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
      toast.success("Image uploaded successfully!");

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const sendMessage = async () => {
    if (message.trim() || selectedImage) {
      let messageToSend = message.trim();
      let fileData = null;

      if (replyMessage) {
        messageToSend = `Replying to: ${replyMessage.username}: ${replyMessage.message}\n${messageToSend}`;
      }

      if (selectedImage) {
        fileData = await uploadFile(selectedImage);
      }

      addMessage(messageToSend, fileData);
      setMessage("");
      setSelectedImage(null);
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
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
      } else {
        toast.error("Only image files are allowed png,jpg,gif."); // Toast notification for non-image files
        setSelectedImage(null); // Clear selected image
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
        <IoCloudUploadOutline className="upload_icon" /> Upload Image
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </label>
      {selectedImage && (
        <p>Selected Image: {selectedImage.name}</p>
      )}
      <button onClick={sendMessage} className="send_button">
        <FaPaperPlane className="send_icon" /> Send
      </button>
    </div>
  );
};

export default InputText;
