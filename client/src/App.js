import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './App.css';

const ChatLayout = () => {
  const [selectedChannel, setSelectedChannel] = React.useState(null);

  return (
    <div className="app-layout">
      <Sidebar onSelectChannel={setSelectedChannel} selectedChannel={selectedChannel} />
      <ChatWindow selectedChannel={selectedChannel} />
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <ChatLayout />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;