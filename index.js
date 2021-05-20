const app = require("express")();
const server = require("http").createServer(app);
//to enable cros original request
const cors = require("cors"); 

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        method: ["GET", "POST"]
    }
});

app.use(cors());

const PORT = process.env.PORT || 5000;

//create our first route
app.get("/", (req,res) => {
    res.send("Server is running")
})

io.on("connection", (socket) => {
    //this will give us our id
    socket.emit("me", socket.id);

    socket.on("disconnect", () =>{
        socket.broadcast.emit("callended")
    });

    //socket.on are socket handlers
    socket.on("calluser", ({userToCall, signalData, from, name}) => {
        console.log("signal data is: ", signalData)
        //this is how we pass the data to the frontend
        io.to(userToCall).emit("calluser", {signal: signalData, from ,name});
    });

    socket.on("answercall", (data) => {
        io.to(data.to).emit("callaccepted", data.signal);
    });
});

server.listen(PORT,() => console.log(`Server listening on port ${PORT}`));