import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "https://localhost:5173",
  },
});

const namespaces = io.of(/^\/[0-9]{7}$/);

namespaces.on("connect", function (socket) {
  const namespace = socket.nsp;
  console.log(`Socket namespace: ${namespace.name}`);

  socket.broadcast.emit("connected peer");

  socket.on("signal", function (data) {
    socket.broadcast.emit("signal", data);
  });

  socket.on("disconnect", function () {
    socket.broadcast.emit("disconnected peer");
  });
});

io.listen(3000);
