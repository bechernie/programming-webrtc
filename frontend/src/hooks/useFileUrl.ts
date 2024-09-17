import { useEffect, useState } from "react";

function useFileUrl(file?: File) {
  const [url, setUrl] = useState<string>();

  useEffect(
    () => {
      if (url) {
        URL.revokeObjectURL(url);
      }

      if (file) {
        setUrl(URL.createObjectURL(file));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [file],
  );

  return url;
}

export default useFileUrl;
