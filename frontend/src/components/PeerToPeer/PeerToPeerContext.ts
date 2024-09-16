import { Peer, Self } from "@utils/types.ts";
import { createContext, useContext } from "react";

export interface PeerToPeerContext {
  self: Self;
  peer: Peer;
}

export const PeerToPeerContext = createContext<PeerToPeerContext>(
  {} as PeerToPeerContext,
);

export function usePeerToPeerContext() {
  return useContext(PeerToPeerContext);
}
