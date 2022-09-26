
import { createContext, useState, useContext } from "react";

const UserContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(localStorage.getItem('user_token') || null);
  return (
    <UserContext.Provider value={{ user, setUser}}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => useContext(UserContext);