const net = require("net");
const readline = require("readline/promises");

const PORT = 4020;
const HOST = "127.0.0.1";

let id;
let clientName;
let chatWith = {
  id:null,
  name:null
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const clearLine = (dir) => {
  return new Promise((resolve, reject) => {
    process.stdout.clearLine(dir, () => {
      resolve();
    });
  });
};

const moveCursor = (dx, dy) => {
  return new Promise((resolve, reject) => {
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    });
  });
};

const command = async() => {
  await rl.question(`Press 1 to get User List > `);
  await moveCursor(0, -1);
  await clearLine(0);
  socket.write(`userList`);
};

const selectChat = async () => {
  let option;
  do{
    option = await rl.question("Select user to chat > ");
    await moveCursor(0, -1);
    await clearLine(0);
  }while(!(option < Users.length))

  chatWith.id = Users[option].id;
  chatWith.name = Users[option].name;
  console.log("Press q to switch chat\n");
  talk();
}

const talk = async () => {
  const message = await rl.question(`Message to ${chatWith.name}  > `);
  await moveCursor(0, -1);
  await clearLine(0);
  if(message == 'q'){
    selectChat();
  }else{
    socket.write(
      `Message-sender-${clientName}-recipient-${chatWith.id}-message-${message}`
    );
  }
};

const socket = net.createConnection({ host: HOST, port: PORT }, async () => {
  (async () => {
    clientName = await rl.question("Enter your Name > ");

    await moveCursor(0, -1);
    await clearLine(0);

    socket.write(`name-${clientName}`);
  })();
});

socket.on("data", async (data) => {
  console.log();
  await moveCursor(0, -1);
  await clearLine(0);

  const dataString = data.toString("utf-8");
  
  // Store Id of Account
  if (dataString.substring(0, 2) === "id") {
    
    id = dataString.substring(3);
    console.log(`Welcome ${clientName}, your Id is ${id}!\n`);

    command();
  } 
  // User List fetched once
  else if (dataString.substring(0, 8) === "userList") {

    Users = JSON.parse(dataString.substring(9));

    console.log("User List:\n");
    // Log User List
    Users.map((user, index) => {
      if(user.id !== id) console.log(`${index}. ${user.name} \n`);
    });

    selectChat();
  } 
  // Log Messages
  else if(dataString.substring(0, 7) === "Message") {
    const message = dataString.substring(8);
    console.log(message);

    talk();
  }
  else{
    console.log(dataString);
  }
});

socket.on("end", () => {
  console.log("\nConnection was ended!");
});
