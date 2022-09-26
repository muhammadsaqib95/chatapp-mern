import { useEffect } from "react";
import io  from "socket.io-client";
const socket = io.connect('http://localhost:3001');

function Chat() {
    useEffect(() => {
      socket.emit('send-message', { name: 'user' });
      socket.emit('join','user');
    }, [])
    
  return (
    <div>Chat</div>
  )
}

export default Chat