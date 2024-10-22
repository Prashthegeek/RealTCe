const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
require('dotenv').config();  

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Allow frontend app to connect
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Connect to the database
connectDB();

// Middleware to enable CORS
app.use(cors({
    origin: 'http://localhost:5173', // Same origin as the frontend
    methods: ['GET', 'POST'],
    credentials: true,
}));

// Middleware to parse JSON requests
app.use(express.json());

// Authentication routes
app.use('/api/auth', authRoutes);

// In-memory store for room codes and users
const roomCodeStore = {};
const roomUserStore = {}; // Object to keep track of users in each room

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected');

    let currentUser; // Store user info in a local variable

    // Listen for joining a room
    socket.on('joinRoom', ({ roomId, user }) => {
        socket.join(roomId); // Join the specified room
        currentUser = user; // Set the current user for later use
        console.log(`${user.name} joined room: ${roomId}`);

        // Initialize user store for the room if it doesn't exist
        if (!roomUserStore[roomId]) {
            roomUserStore[roomId] = []; // Create an empty array for users
        }

        // Check if the user is already in the room
        if (!roomUserStore[roomId].includes(user.name)) {
            roomUserStore[roomId].push(user.name); // Add the user to the room

            // Notify everyone in the room that a new user has joined
            socket.to(roomId).emit('userJoined', `${user.name} has joined the room`);
        }

        // Send the current code to the user who just joined
        const currentCode = roomCodeStore[roomId] || ''; // Get the existing code or set to an empty string
        socket.emit('codeUpdate', currentCode);

        // Broadcast the updated user list to everyone in the room
        io.to(roomId).emit('userListUpdate', roomUserStore[roomId]);
    });

    // Listen for code updates from this user
    socket.on('codeUpdate', ({ roomId, code }) => {
        // Update the code for the room in the store
        roomCodeStore[roomId] = code;

        // Broadcast the updated code to everyone else in the room
        socket.to(roomId).emit('codeUpdate', code);
    });

    // Handle disconnects
    socket.on('disconnect', () => {
        console.log('A user disconnected');

        // Check if the currentUser is defined
        if (currentUser) {
            // Iterate over roomUserStore to remove the user from each room they might be in
            for (const roomId of Object.keys(roomUserStore)) {
                const index = roomUserStore[roomId].indexOf(currentUser.name);
                if (index !== -1) {
                    roomUserStore[roomId].splice(index, 1); // Remove the user from the list
                    // Notify everyone in the room that the user has left
                    socket.to(roomId).emit('userLeft', `${currentUser.name} has left the room`);
                    // Broadcast the updated user list to everyone in the room
                    io.to(roomId).emit('userListUpdate', roomUserStore[roomId]);
                }
            }
        }
    });
});

// Set the port for the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
