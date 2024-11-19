import { MessageType } from "./hash_worker_messages.js";
import { AsyncSha256 } from "./sha-256.js";

const hasher = new AsyncSha256();
const reader = new FileReader();

reader.onload = () => {
  const fileData = reader.result as string;

  postMessage({ type: MessageType.Total, data: fileData.length });

  hasher.async_digest(
    fileData,
    (hash) => {
      postMessage({ type: MessageType.Hash, data: hash });
    },
    (remaining) => {
      postMessage({ type: MessageType.Progress, data: remaining });
    },
  );
};

self.onmessage = (event) => {
  const { type, data } = event.data;

  if (type === MessageType.File) {
    reader.readAsText(data);
  }
};
