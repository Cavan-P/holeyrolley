import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 3001 });
wss.on("connection", (ws) => {
    ws.on("message", (data) => console.log("got:", data.toString()));
    ws.send(JSON.stringify({ type: "hello" }));
});
console.log("server on :3001");