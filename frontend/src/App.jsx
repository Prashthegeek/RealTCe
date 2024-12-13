import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import MainApp from './pages/MainApp.jsx'
import OtpVerification from './pages/otpVerification.jsx';
import FailOtp from './pages/FailOtp.jsx';
import  SuccessOtp from './pages/SuccessOtp.jsx';
import Room from './pages/Room.jsx';
import LandingPage from './pages/LandingPage.jsx';
import GoogleRedirection from './pages/GoogleRedirect.jsx';
import ProtectedRoute from './middleware/ProtectedRoute.jsx';
import PublicRoute from './middleware/PublicRoute.jsx';
import CheckRoom from './middleware/CheckRoom.jsx';
import CreateRoom from './middleware/CreateRoom.jsx';

function App() {
  return ( 
      <Routes>
        {/* <Route path="/" element={<LandingPage />} /> */}
        {/* <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} /> */}
        <Route path="/verifyOtp" element={<OtpVerification />} />
        <Route path="/successOtp" element={<SuccessOtp />} />
        <Route path="/failOtp" element={<FailOtp />} />
        <Route path="/google-redirect" element={<GoogleRedirection />} />  {/*for google redirect oAuth part */}
        <Route path="/" element={<LandingPage />} />


        {/*creates a new room */}
        
        <Route
          path="/room/create/:roomId"
          element={
            <CreateRoom>
              <Room />
            </CreateRoom>
          }
        />

        
       {/*PublicRoute */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />


        {/* Protected Route */}
        <Route 
          path="/main" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />

        
        {/* check Route of Room*/}
        <Route 
          path="/room/:roomId" 
          element={
            <CheckRoom>
              <Room />
            </CheckRoom>
          } 
        />


      </Routes>
  );
}

export default App;
