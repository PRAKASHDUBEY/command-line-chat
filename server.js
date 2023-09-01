const net = require("net");

const PORT = 4020;
const HOST = "127.0.0.1";

const server = net.createServer();

let nonce = 0;

// Client sockets
const clients = [];

server.on("connection", (socket) => {
  
  const clientId = nonce;
  nonce++;

  let clientName;

  socket.on("data", (data) => {
    const dataString = data.toString("utf-8");
    
    if(dataString.substring(0, 4) === "name"){
      clientName  = dataString.substring(5);

      console.log(`${clientName} connected to server`);

      clients.push({ id: clientId.toString(), name: clientName, socket });

      socket.write(`id-${clientId}`);
    }
    else if(dataString.substring(0, 8) === "userList"){
      
      socket.write(`userList-${JSON.stringify(clients)}`);
    }
    else if (dataString.substring(0, 7) === "Message"){
      const sender = dataString.substring(15, dataString.indexOf("-recipient-"));
      const recipient = dataString.substring(dataString.indexOf("-recipient-") + 11, dataString.indexOf("-message-"));
      const message = dataString.substring(dataString.indexOf("-message-") + 9);
  
      clients.map((client) => {
        if(client.id == recipient) {
          client.socket.write(`Message-> ${sender}: ${message}\n`);
          socket.write(`Message-> ${sender}: ${message}\n`);
          return true;
        }
      });
    }
  });

  socket.on("end", () => {
    console.log(`${clientName} left!`);
    
    clients.map((client,index) =>{
      if(client.id = clientId){
        clients[index].name = "Account Deleted";
        return;
      }
    })
  });
});

server.listen(PORT, HOST, () => {
  console.log("Server running at: ", server.address());
});