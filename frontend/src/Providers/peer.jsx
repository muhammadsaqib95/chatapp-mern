import { Peer } from "peerjs";

  // useEffect(() => {
  //   if (userData?.id) {
  //     const peer = new Peer(userData?.id);
  //     peer.on("open", (id) => {
  //       console.log("peer id", id);
  //     });
  //     peer.on("call", (call) => {
  //       console.log("call", call);
  //       call.answer();
  //       call.on("stream", (stream) => {
  //         console.log("stream", stream);
  //       });
  //     });
  //   }
  // }, [userData]);

  import { useMemo, createContext, useContext } from "react";

const PeerContext = createContext(null);

export function usePeer() {
  return useContext(PeerContext);
}

export default function PeerProvider({ children }) {
  const peer = useMemo(
    () =>  new Peer(),
    []
  );
  return (
    <PeerContext.Provider value={{ peer }}>
      {children}
    </PeerContext.Provider>
  );
}
