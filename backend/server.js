const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const ExecuteRoutes = require('./routes/ExecuteRoutes');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
require('dotenv').config();  
const path = require('path');  // Ensure path is imported for serving static files in production

//for oAuth
const passportSetup = require('./config/passport-setup')   //even though isska koi use yaha nhi hai here,but, still it is necessary becoz 
//for oAuth to work properly, so, when server.js runs ,then it requires passportSetup from passport-setup.js 
//and which ultimately runs the googleStrategy inside the passport-setup.js
const passport= require('passport');
const session = require('express-session');  //better to use express-session than cookie session, just do changes in app.use(cookiesession)
//part, baaki sab wahi rahega.


const app = express();
const server = http.createServer(app);

// Update Socket.IO to allow frontend app to connect in production
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'https://rtct.onrender.com', // Use environment variable for production URL
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Connect to the database
connectDB();


// Middleware to enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://rtct.onrender.com', // Same origin as the frontend
    methods: ['GET', 'POST'],
    credentials: true,
}));


// Middleware to parse JSON requests
app.use(express.json());


//for o Auth

// Middleware for sessions
app.use(session({
    secret: 'aifuafjd', // Replace with a strong secret key
    resave: false,      // Avoid saving session if it hasn't been modified
    saveUninitialized: false, // Avoid saving empty sessions
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        secure: process.env.NODE_ENV === 'docker' || 'production', // Set to true in docker or production
    },
}));
app.use(passport.initialize());
app.use(passport.session()); 


// In-memory store for room codes and users
const roomCodeStore = {};
const roomLangStore = {} ;//store the current language of the room
const roomOutputStore = {}; 
const roomUserStore = {}; // Object to keep track of users in each room


//execution routes 
app.use('/api/execute', ExecuteRoutes);
// Authentication routes 
app.use('/api/auth', authRoutes);//isska bhi path authRoutes.js me define kar diya(glti se)

//check if room exists or not
app.get('/api/checkRoom/:roomId', (req,res) =>{  //callback func // Use app.get() for GET requests
    const roomId  = req.params.roomId; // Extract roomId from the URL//backend me url se aise params nikalte hai.
    console.log("room id is ",roomId)

    if (!roomId) {
        return res.status(400).json({ status: false, message: 'Room ID is required' });
    }

    const roomExists = !!roomUserStore[roomId]; // Check if the room exists in the store(if user exists in that room ,then yeah room exists ,else not)

    if (roomExists) {
      return res.json({ status: true });
    }
    return res.json({ status: false });
})

// Endpoint to check if a room exists so,can we create a new one

app.get('/api/create/:roomId', (req, res) => {
    try {
      const roomId = req.params.roomId; // Extract roomId from the URL
      console.log('Room ID is:', roomId);
  
      if (!roomId) {
        return res.status(400).json({ status: false, message: 'Room ID is required' });
      }
  
      const roomExists = !!roomUserStore[roomId]; // Check if the room exists in the store
  
      if (roomExists) {
        return res.json({ status: true }); // Room exists , so, in client side ,give the toast saying room already exist,so ,cant create this again
      }
  
      return res.json({ status: false }); // Room does not exist
    } catch (error) {
      console.error('Error checking room:', error);
      res.status(500).json({ status: false, message: 'Internal server error' });
    }
  });
  

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


    // leave room event handler
socket.on('leaveRoom', ({ roomId, user }) => {
    // Check if the room exists in roomUserStore
    if (roomUserStore[roomId]) {
        // Remove the user from the roomUserStore array
        roomUserStore[roomId] = roomUserStore[roomId].filter(
            userName => userName !== user.name
        );

        // Leave the socket room
        socket.leave(roomId);

        // Broadcast updated user list
        io.to(roomId).emit('userListUpdate', roomUserStore[roomId]);

        // If no users left in the room, optionally clean up room data
        if (roomUserStore[roomId].length === 0) {
            delete roomUserStore[roomId];
        }

        // notify other users that this user has left
        socket.to(roomId).emit('userLeft', `${user.name} has left the room`);
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
