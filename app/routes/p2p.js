import { WebSocketServer } from "ws";
import P2PMessage from "../lib/model/p2p.js";
import url from "url";

export const initP2PWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server, path: "/p2p" });
  const users = {};

  wss.on("connection", (ws, req) => {
    const queryParams = url.parse(req.url, true).query;
    const userId = queryParams.userId;

    if (!userId) {
      console.error("Connection rejected: Missing userId");
      ws.close();
      return;
    }

    users[userId] = ws;
    console.log(`User  connected: ${userId}`);

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data);

        const newMessage = {
          senderId: userId,
          recipientId: message.recipientId,
          content: message.content,
        };

        if (message.recipientId && users[message.recipientId]) {
          const recipientSocket = users[message.recipientId];
          if (recipientSocket.readyState === WebSocket.OPEN) {
            recipientSocket.send(JSON.stringify({ senderId: userId, ...message }));
            newMessage.read = true;
          }
        } else {
          console.log(`Recipient not connected: ${message.recipientId}`);
          newMessage.read = false;
        }

        await P2PMessage.create(newMessage);
        console.log("Message saved:", newMessage);
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    });

    ws.on("close", () => {
      console.log(`User  disconnected: ${userId}`);
      delete users[userId];
    });
  });

  console.log("P2P WebSocket server running on /p2p");
};