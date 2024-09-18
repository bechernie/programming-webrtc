import { ReactNode } from "react";
import Layout from "@components/Layout/Layout.tsx";
import ChatContextProvider from "@components/Chat/ChatContextProvider.tsx";
import PeerToPeerContextProvider from "@components/PeerToPeer/PeerToPeerContextProvider.tsx";
import { usePeerToPeerContext } from "@components/PeerToPeer/PeerToPeerContext.ts";
import FeaturesContextProvider from "@components/Features/FeaturesContextProvider.tsx";

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

function FeatureContextProviderPeerToPeerWrapper({
  children,
}: {
  children?: ReactNode;
}) {
  const { self, peer } = usePeerToPeerContext();

  return (
    <FeaturesContextProvider self={self} peer={peer}>
      {children}
    </FeaturesContextProvider>
  );
}

function App() {
  return (
    <PeerToPeerContextProvider>
      <ChatContextProviderPeerToPeerWrapper>
        <FeatureContextProviderPeerToPeerWrapper>
          <Layout />
        </FeatureContextProviderPeerToPeerWrapper>
      </ChatContextProviderPeerToPeerWrapper>
    </PeerToPeerContextProvider>
  );
}

export default App;
