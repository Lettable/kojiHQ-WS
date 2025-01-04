import Message from "../lib/model/Message";

let messageQueue = [];

export const addToQueue = (messages) => {
  messageQueue.push(...messages);
  console.log("Current queue:", messageQueue);
};

export const processQueue = async () => {
  console.log("Processing queue:", messageQueue.length);
  if (messageQueue.length > 0) {
    try {
      const messagesToSave = messageQueue.splice(0, messageQueue.length);
      await Message.insertMany(messagesToSave);
      console.log(`Saved ${messagesToSave.length} messages to the database`);
    } catch (error) {
      console.error("Failed to save messages to database:", error);
    }
  }
};


setInterval(processQueue, 30 * 1000);