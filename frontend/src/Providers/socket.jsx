import io from "socket.io-client";
import { useMemo, createContext, useContext } from "react";

const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export default function SocketProvider({ children }) {
  const socket = useMemo(
    () =>
      io.connect("http://localhost:3001", {
        auth: { token: localStorage.getItem("user_token") },
      }),
    []
  );
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
