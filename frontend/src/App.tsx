import { ReactNode } from "react";
import Layout from "@components/Layout/Layout.tsx";
import ChatContextProvider from "@components/Chat/ChatContextProvider.tsx";
import PeerToPeerContextProvider from "@components/PeerToPeer/PeerToPeerContextProvider.tsx";
import { usePeerToPeerContext } from "@components/PeerToPeer/PeerToPeerContext.ts";

function ChatContextProviderPeerToPeerWrapper({
  children,
}: {
  children?: ReactNode;
}) {
  const { self, peer } = usePeerToPeerContext();

  return (
    <ChatContextProvider self={self} peer={peer}>
      {children}
    </ChatContextProvider>
  );
}

function App() {
  return (
    <PeerToPeerContextProvider>
      <ChatContextProviderPeerToPeerWrapper>
        <Layout />
      </ChatContextProviderPeerToPeerWrapper>
    </PeerToPeerContextProvider>
  );
}

export default App;
