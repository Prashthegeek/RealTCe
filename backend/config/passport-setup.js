const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/User');

passport.serializeUser((user,done)=>{
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Await the database query
        if (!user) {
            return done(new Error("User not found"), null); // Handle case where user is not found
        }
        done(null, user.id); // Pass the user data (or user.id) to Passport
    } catch (error) {
        done(error, null); // Handle errors
    }
});



passport.use(
    new GoogleStrategy({
        //optionas for google strategy
        callbackURL:'/api/auth/google/redirect',  //Root url already mentioned in google developers console.
        clientID:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET
        
    },async(accessToken, refreshToken,profile,done)=>{  //all the functions need to be mentioned like accessToken etc and in order else done func wont work properly

        //passport callback functtion(2nd arg of GoogleStrategy, this block is run due to 
        //passport.authenticat('google') of the router.get('/google/redirect') url,phir yaha se
        // return done func ke under kuchh response bhejna parega, else consent screen of google 
        //after clicking an email (load /lag hi karta rahega)
        //after clicking a gmail of the google consent screen, google validates the user and 
        //then we are sent to /google/redirect link (accompanied by a code ,which is sent by the google , this code is just an indication)
        //that, currently my app have all the information about the information about the user (like ,name,email,googleId, gender  in the)
        //in the profile field. 
        //since, we used passport.authenticate('google')as a middleware before hitting the code inside /google/redirect url,
        //so,here, we would store the information about the user in the mongodb,
        //so,before reaching the /google/redirect url ,this middleware is run , so , here we will do the  
        
        try {
            // Check if the user already exists in the database
            const existingUser = await User.findOne({ email: profile.emails[0].value });

            if (existingUser) {
                // If the user exists, update their googleId (optional) and other info
                existingUser.googleId = profile.id;
                existingUser.name = profile.displayName; // You can update the name if needed
                await existingUser.save();
                return done(null, existingUser); // Pass the user object to the 'done' callback, this will go to serializeUser func
            } else {
                // If the user does not exist, create a new user
                const newUser = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                });

                await newUser.save(); // Save the new user to MongoDB(saving in mongodb is asynchronous operation means ,it takes time,so await used)
                return done(null, newUser); // Pass the new user object to the 'done' callback,this will go to serializeUser func
            }
        } catch (error) {
            console.error(error);
            return done(error, null); // Handle errors
        }
    }
)
)

module.exports = passport;