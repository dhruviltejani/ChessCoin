import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Signup from "./Pages/Signup";
import Signin from "./Pages/Signin";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import CompleteProfile from "./Pages/CompleteProfile";
import Dashboard from "./Pages/Dashboard";
import PlayPage from "./Pages/Play";
import BotsPage from "./Pages/Bots";
import Tournaments from "./Pages/Tournaments";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "chesscoin-app.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forget-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/leagues" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Dashboard />} />
          <Route path="/messages" element={<Dashboard />} />
          <Route path="/friends" element={<Dashboard />} />
          <Route path="/notifications" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/bots" element={<BotsPage />} />
          <Route path="*" element={<Navigate to="/signup" replace />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;

