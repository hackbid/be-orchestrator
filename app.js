if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 4000;
const axios = require('axios');
//import routes
const router = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');

//set ENV
const itemAPI = process.env.ITEM_API;
const mongoAPI = process.env.MONGO_API;
const userAPI = process.env.USER_API;
const categoryAPI = process.env.CATEGORY_API;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);
app.use(errorHandler);

//set up socket.io
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('joinRoom', (payload) => {
        const { roomId, username, UserId } = payload;
        socket.join(roomId);
        const message = `${username} has joined the room`;
        console.log(message);
        io.to(roomId).emit('connectedToRoom', { message });
    });
    socket.on('bid', async (payload) => {
        try {
            const { roomId, username, UserId, bidValue, historyMongoId } = payload;
            await axios.put(`${itemAPI}/${roomId}`, { UserId, amountBid: bidValue });
            io.to(roomId).emit('bidSuccess', { username, amountBid: bidValue });
            // await axios.post(`${mongoAPI}/itemHistory/${historyMongoId}/bid`, { UserId, username, bidValue });//test
        } catch (err) {
            socket.emit('bidFailed', { message: err.response.data.message });
        }
    });
    socket.on('sendMessage', async (payload) => {
        const { roomId, username, chatValue, isSeller, historyMongoId } = payload;
        io.to(roomId).emit('messageSuccess', { username, chatValue, isSeller });
        await axios.post(`${mongoAPI}/itemHistory/${historyMongoId}/chat`, { username, chatValue, isSeller });
    });
});

server.listen(port, function () {
    console.log('Server started on port ' + port);
});
