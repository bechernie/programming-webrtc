function displayStream(
  htmlVideoElement: HTMLVideoElement | null,
  stream: MediaStream | null,
) {
  if (htmlVideoElement) {
    htmlVideoElement.srcObject = stream;
  }
}

export default displayStream;
