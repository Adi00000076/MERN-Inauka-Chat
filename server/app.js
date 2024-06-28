const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2');
const app = express();
const server = http.createServer(app);

const cors = require('cors')




// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chatdatabase'
});

// Handle MySQL connection errors
db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        throw err;
    }
    console.log('MySQL connected');
});

// MySQL schema creation query
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        message TEXT,
        avatar VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

// Execute table creation query
db.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
        throw err;
    }
    console.log('Messages table created or exists');
});


app.use(express.json());
app.use(cors());

// Socket.IO events
const io = socketIO(server, {
    cors: {
        origin: "*"  // Change this to specific origins in production
    }
});

io.on("connection", (socket) => {
    console.log("User connected");

    // Emit all existing messages when a user connects
    const loadMessages = () => {
        const selectQuery = "SELECT * FROM messages ORDER BY timestamp ASC";
        db.query(selectQuery, (err, results) => {
            if (err) {
                console.error("Error loading messages:", err);
                return;
            }
            socket.emit('chat', results);
        });
    }
    loadMessages();

    // Receive new messages from clients
    socket.on('newMessage', (msg) => {
        const { username, message, avatar } = msg;
        const insertQuery = "INSERT INTO messages (username, message, avatar) VALUES (?, ?, ?)";
        db.query(insertQuery, [username, message, avatar], (err, result) => {
            if (err) {
                console.error("Error saving message:", err);
                return;
            }
            const newMessage = {
                id: result.insertId,
                username,
                message,
                avatar,
                timestamp: new Date()
            };
            io.emit('message', newMessage);
        });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Start the server
const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
