import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/user/Login";
import Chat from "./components/user/Chat";
import { useUserContext } from "./components/userAuth/user";
import "@fontsource/gothic-a1/100.css";
import "@fontsource/gothic-a1/200.css";
import "@fontsource/gothic-a1/300.css";
import "@fontsource/gothic-a1";
import "@fontsource/gothic-a1/500.css";
import "@fontsource/gothic-a1/600.css";
import "@fontsource/gothic-a1/700.css";
import "@fontsource/gothic-a1/800.css";
import "@fontsource/gothic-a1/900.css";

function App() {
  const { user } = useUserContext();
  console.log(user);
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to={'/chat'} /> : <Login />} />
          <Route path="/chat" element={user ? <Chat /> : <Navigate to={'/login'} /> } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
