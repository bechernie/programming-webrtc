import { useEffect, useState } from "react";
import { ImageContent } from "@hooks/useChat.ts";

function useImageContentUrl(imageContent?: ImageContent) {
  const [url, setUrl] = useState<string>();

  useEffect(
    () => {
      if (url) {
        URL.revokeObjectURL(url);
      }

      if (imageContent) {
        setUrl(URL.createObjectURL(new Blob([imageContent.image])));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imageContent],
  );

  return url;
}

export default useImageContentUrl;
