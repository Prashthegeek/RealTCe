const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const ExecuteRoutes = require('./routes/ExecuteRoutes');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
require('dotenv').config();  
const path = require('path');  // Ensure path is imported for serving static files in production

const app = express();
const server = http.createServer(app);

// Update Socket.IO to allow frontend app to connect in production
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Use environment variable for production URL
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Connect to the database
connectDB();


// Middleware to enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Same origin as the frontend
    methods: ['GET', 'POST'],
    credentials: true,
}));


// Middleware to parse JSON requests
app.use(express.json());


//execution routes 
app.use('/api/execute', ExecuteRoutes);
// Authentication routes
app.use('/api/auth', authRoutes);//isska bhi path authRoutes.js me define kar diya(glti se)


// In-memory store for room codes and users
const roomCodeStore = {};
const roomLangStore = {} ;//store the current language of the room
const roomOutputStore = {}; 
const roomUserStore = {}; // Object to keep track of users in each room



// Handle Socket.IO connections
io.on('connection', (socket) => {  //listening to connection event (means user connected, now do the work)
    console.log('A user connected with socket id : ' , socket.id);

    let currentUser; // Store user info in a local variable

    // Listen for joining a room
    socket.on('joinRoom', ({ roomId, user }) => {
        socket.join(roomId); // Join the specified room
        currentUser = user; // Set the current user for later use
        console.log(`${user.name} joined room: ${roomId}`);

        // Initialize user store for the room if it doesn't exist
        if (!roomUserStore[roomId]) {
            roomUserStore[roomId] = []; // Create an empty array for users(currently no user here)
        }
        // Check if the user is already in the room
        if (!roomUserStore[roomId].includes(user.name)) {
            roomUserStore[roomId].push(user.name); // Add the user to the room

            // Notify everyone in the room that a new user has joined
            socket.to(roomId).emit('userJoined', `${user.name} has joined the room`);  //can skip it 
        }

        // Send the current code to the user who just joined
        const currentCode = roomCodeStore[roomId] || ''; // Get the existing code or set to an empty string
        socket.emit('prevCode', currentCode);   //so, this event will be sent only when usersent and event for joinRoom

        //send the current lang to the user who just joined
        const currentLang = roomLangStore[roomId] || '';
        socket.emit('prevLang' , currentLang) ; 

        //send the current output box content to the user who just joined
        const currentOutput = roomOutputStore[roomId] || '';
        socket.emit('prevOutput' , currentOutput) ;

        // Broadcast the updated user list to everyone in the room
        io.to(roomId).emit('userListUpdate', roomUserStore[roomId]);  //sent the whole list of array to the frontend
    });

    // Listen for code updates from this user
    socket.on('codeUpdate', ({ roomId, code }) => {  
        // Update the code for the room in the store
        roomCodeStore[roomId] = code;

        // Broadcast the updated code to everyone else in the room
        socket.to(roomId).emit('codeUpdate', code);  //emit to everyone else
    });

    //listen to LangUpdate event ->
    socket.on('langUpdate' , ({roomId, language}) =>{
        //update the language for the room in the store.
        roomLangStore[roomId] = language ;
        //broadcase the updated lang to everyone else in the room. 
        socket.to(roomId).emit('langUpdate' , language);  //can have different name than langUpdate
    })


    //listen to the output Update 
    socket.on('outputUpdate' , ({roomId, output}) =>{
        roomOutputStore[roomId] = output ; 
        socket.to(roomId).emit('outputUpdate' , output) ;
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




//-----------------production------------------------

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/dist')));//npm run build in vite makes dist folder not the build 

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));  //npm run build in vite makes dist folder not the build 
});


//----------------production ends --------------------------

// Set the port for the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));