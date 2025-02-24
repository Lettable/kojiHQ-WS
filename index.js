import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import url from "url";
import { connectDB } from "./app/lib/config/db.js";
import P2PMessage from "./app/lib/model/p2p.js";
import Message from "./app/lib/model/Message.js";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Socket Server is running");
});

connectDB()

const wssGeneral = new WebSocketServer({ noServer: true });
const wssP2P = new WebSocketServer({ noServer: true });
const clients = new Set();
const users = {};

wssGeneral.on("connection", (ws) => {
  console.log("New WebSocket connection");
  clients.add(ws);

  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data);

      if (message.type && message.type === 'thread') {
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message: message }));
          }
        });
      }

      if (message.type && message.type === 'post') {
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message: message }));
          }
        });
      }

      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ message: message }));
        }
      });

      if (!message.type || message.type === null) {
        Message.create(message).catch((err) => {
          console.error("Failed to save message to database:", err);
        });
      }

    } catch (err) {
      console.error("Failed to process message:", err);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    clients.delete(ws);
  });
});


wssP2P.on("connection", (ws, req) => {
  const queryParams = url.parse(req.url, true).query;
  const userId = queryParams.userId;

  if (!userId) {
    console.error("Connection rejected: Missing userId");
    ws.close();
    return;
  }

  users[userId] = ws;
  console.log(`User connected: ${userId}`);

  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data);

      const newMessage = {
        senderId: userId,
        recipientId: message.recipientId,
        content: message.content,
        parentId: message.parentId || null,
        read: false,
      };

      if (message.parentId) {
        const parentMessage = await P2PMessage.findById(message.parentId).select("content");
        if (parentMessage) {
          newMessage.parentMessageContent = parentMessage.content;
        }
      }

      const savedMessage = await P2PMessage.create(newMessage);

      if (message.recipientId && users[message.recipientId]) {
        const recipientSocket = users[message.recipientId];
        if (recipientSocket.readyState === WebSocket.OPEN) {
          recipientSocket.send(
            JSON.stringify({
              senderId: userId,
              parentId: newMessage.parentId,
              parentMessageContent: newMessage.parentMessageContent || null,
              content: message.content,
              timestamp: new Date().toISOString(),
              _id: savedMessage._id,
            })
          );

          savedMessage.read = true;
        }
      } else {
        console.log(`Recipient not connected: ${message.recipientId}`);
      }

      await savedMessage.save();
      ws.send(JSON.stringify({ success: true, _id: savedMessage._id }));

    } catch (err) {
      console.error("Failed to process message:", err);
      ws.send(JSON.stringify({ success: false, message: "Failed to process message" }));
    }
  });



  ws.on("close", () => {
    console.log(`User disconnected: ${userId}`);
    delete users[userId];
  });
});


server.on("upgrade", (req, socket, head) => {
  const pathname = url.parse(req.url).pathname;

  if (pathname === "/") {
    wssGeneral.handleUpgrade(req, socket, head, (ws) => {
      wssGeneral.emit("connection", ws, req);
    });
  } else if (pathname === "/p2p") {
    wssP2P.handleUpgrade(req, socket, head, (ws) => {
      wssP2P.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`HTTP Server running on ${PORT}`);
  console.log("WebSocket server for / running");
  console.log("WebSocket server for /p2p running");
});
