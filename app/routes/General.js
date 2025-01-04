import { WebSocketServer } from "ws";

let messageBuffer = [];
const BATCH_LIMIT = 5;

export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        console.log("Received message:", message);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });

        messageBuffer.push(message);

        if (messageBuffer.length >= BATCH_LIMIT) {
          console.log("Buffer limit reached. Adding messages to the queue.");
          addToQueue(messageBuffer);
          messageBuffer = [];
        }
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });

  return wss;
};