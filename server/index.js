const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chatdatabase'
});




db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        throw err;
    }
    console.log('MySQL connected');
});

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        message TEXT,
        avatar VARCHAR(255),
        file_path VARCHAR(255),  -- Add file_path column
        original_name VARCHAR(255),  -- Add original_name column for file name
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
        throw err;
    }
    console.log('Messages table created or exists');
});

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB (adjust as needed)
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('file');


function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|jip|doc|docx|xls|xlsx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}


app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ msg: err });
        }
        if (req.file == undefined) {
            return res.status(400).json({ msg: 'No file selected!' });
        }
        const filePath = `/uploads/${req.file.filename}`;
        res.status(200).json({
            filePath: filePath,
            fileName: req.file.filename
        });
    });
});







app.get('/messages', (req, res) => {
    const selectQuery = "SELECT * FROM messages ORDER BY timestamp ASC";
    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error("Error loading messages:", err);
            return res.status(500).json({ error: "Failed to load messages" });
        }
        res.status(200).json(results);
    });
});

const io = socketIO(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log("User connected");

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

    socket.on('newMessage', (msg) => {
        const { username, message, avatar, file_path } = msg;
        const insertQuery = "INSERT INTO messages (username, message, avatar, file_path) VALUES (?, ?, ?, ?)";
        db.query(insertQuery, [username, message, avatar, file_path], (err, result) => {
            if (err) {
                console.error("Error saving message:", err);
                return;
            }
            const newMessage = {
                id: result.insertId,
                username,
                message,
                avatar,
                file_path, // Ensure file_path is stored in database
                timestamp: new Date()
            };
            io.emit('message', newMessage); // Emit message with file_path
        });
    });
    

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
