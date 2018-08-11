describe('Socket IO integration test', () => {
    const app = require('express')();
    const http = require('http');
    const server = http.Server(app);
    const io = require('socket.io')(server);
    const Clacks = require('../lib/index');
    const io_client = require('socket.io-client');

    var middle = Clacks.init(io);

    app.use(middle);

    app.get('/sendAll', (req, res) => {
        Clacks.sendAll('test');
        res.send('GET Request');
    });

    server.listen(8378);

    test('Send All, single client socket', () => {
        let socket = io_client('localhost:8378');
        let lastMessage = null;
        socket.on('message', (message) => {
            lastMessage = message
        });
        http.get('http://localhost:8378/sendAll', (res) => {
            expect(res.body).toBe('GET Request');
            expect(lastMessage).toBe('test');
        });

    });
});