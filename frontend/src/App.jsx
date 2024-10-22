import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import MainApp from './pages/MainApp.jsx'
import OtpVerification from './pages/otpVerification.jsx';
import FailOtp from './pages/FailOtp.jsx';
import  SuccessOtp from './pages/SuccessOtp.jsx';
import Room from './pages/Room.jsx';

function App() {
  return ( 
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<MainApp />} />
        <Route path="/verifyOtp" element={<OtpVerification />} />
        <Route path="/successOtp" element={<SuccessOtp />} />
        <Route path="/failOtp" element={<FailOtp />} />

        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
  );
}

export default App;
