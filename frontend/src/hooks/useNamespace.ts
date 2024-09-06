import { useEffect, useState } from "react";
import { prepareNamespace } from "@utils/prepareNamespace.ts";

function useNamespace() {
  const [namespace, setNamespace] = useState("");

  useEffect(() => {
    setNamespace(prepareNamespace(window.location.hash, true));
  }, []);

  return namespace;
}

export default useNamespace;
