let RoutingController = require('../lib/routing');

describe('Test RoutingController', () => {
    describe('Constructor', () => {
        test('Construction values', () => {
            let controller = new RoutingController((socket) => 'userId',
                (socket) => 'httpSessionId');

            expect(controller.getUserId()).toBe('userId');
            expect(controller.getHttpSessionId()).toBe('httpSessionId');
        });

        test('Positive validation construction', () => {
            expect(() => {
                new RoutingController(
                    (socket) => 'userId',
                    (socket) => 'httpSessionId');
            }).not.toThrowError();
        });

        test('invalid userId method in construction', () => {
            expect(() => {
                new RoutingController(
                    () => 'userId',
                    (socket) => 'httpSessionId');
            }).toThrowError(/^getUserId/);
        });

        test('invalid HttpSession method in construction', () => {
            expect(() => {
                new RoutingController(
                    (socket) => 'userId',
                    () => 'httpSessionId');
            }).toThrowError(/^getHttpSessionId/);
        });

        test('both invalid methods in construction', () => {
            expect(() => {
                new RoutingController(
                    () => 'userId',
                    () => 'httpSessionId');
            }).toThrowError(/^getUserId/);
        });
    }),
    describe('Adding a websocket', () => {
        describe('Websocket validation', () => {
            test('Doesn\'t allow for null websocket', () => {
                let controller = new RoutingController(
                    (socket) => 'userId',
                    (socket) => 'httpSessionId');
                expect(() => controller.addWebsocket()).toThrowError(/^Socket/);
            });

            test('Websocket must have on() function', () => {
                let controller = new RoutingController(
                    (socket) => 'userId',
                    (socket) => 'httpSessionId');
                expect(() => controller.addWebsocket({
                    send: () => {}
                })).toThrowError(/^Socket/);
            });

            test('Websocket must have send() function', () => {
                let controller = new RoutingController(
                    (socket) => 'userId',
                    (socket) => 'httpSessionId');
                expect(() => controller.addWebsocket({
                    on: () => {}
                })).toThrowError(/^Socket/);
            });
        }),
        describe('Method functionality', () => {
            test('add new websocket', () => {
                const userIdFunc = jest.fn((socket) => 'userId');
                const httpSessionIdFunc = jest.fn((socket) => 'httpSessionId');
                let controller = new RoutingController(
                    userIdFunc,
                    httpSessionIdFunc);
                const socket = {
                    on: () => {},
                    send: () => {}
                };
                expect(() => controller.addWebsocket(socket)).not.toThrow();
                expect(userIdFunc).toHaveReturnedTimes(1);
                expect(httpSessionIdFunc).toHaveReturnedTimes(1);

                expect(controller).toHaveProperty('userMap');
                const httpMap = controller.userMap.get('userId');
                expect(httpMap).toBeDefined();
                const websockets = httpMap.get('httpSessionId');
                expect(websockets).toContain(socket);
            });
            test('add existing websocket', () => {
                const userIdFunc = jest.fn((socket) => 'userId');
                const httpSessionIdFunc = jest.fn((socket) => 'httpSessionId');
                let controller = new RoutingController(
                    userIdFunc,
                    httpSessionIdFunc);
                const socket1 = {
                    on: () => {},
                    send: () => {}
                };
                const socket2 = {
                    on: () => {},
                    send: () => {}
                };
                controller.addWebsocket(socket1);

                expect(() => controller.addWebsocket(socket2)).not.toThrow();
                expect(userIdFunc).toHaveReturnedTimes(2);
                expect(httpSessionIdFunc).toHaveReturnedTimes(2);

                expect(controller).toHaveProperty('userMap');
                const httpMap = controller.userMap.get('userId');
                expect(httpMap).toBeDefined();
                const websockets = httpMap.get('httpSessionId');
                expect(websockets).toEqual(expect.arrayContaining([socket1, socket2]));
            });
        });
    });
    describe('removing a websocket', () => {
        let userId = 'userId';
        let httpSessionId = 'httpSessionId';
        let userIdFunc = jest.fn((ws) => userId);
        let httpSessionIdFunc = jest.fn((ws) => httpSessionId);
        let socket = {
            on: jest.fn(),
            send: jest.fn(x => x)
        };
        test('Invalid socket', () => {
            let controller = new RoutingController(userIdFunc, httpSessionIdFunc)
            controller.addWebsocket(socket);
            expect(() => controller.removeWebsocket({})).toThrowError(/^Socket parameter/);
        });
        test('Single websocket', () => {
            let controller = new RoutingController(userIdFunc, httpSessionIdFunc)
            controller.addWebsocket(socket);
            expect(controller.removeWebsocket(socket)).toBeTruthy();
            expect(controller.userMap.get(userId)).toBeUndefined();
        });
        test('Multiple websockets', () => {
            let controller = new RoutingController(jest.fn((ws) => ws.id), jest.fn((ws) => ws.sessionId))
            let firstSocket = {
                id: 'user',
                sessionId: 1,
                on: jest.fn(),
                send: jest.fn(x => x)
            };
            let secondSocket = {
                id: 'user',
                sessionId: 2,
                on: jest.fn(),
                send: jest.fn(x => x)
            };

            controller.addWebsocket(firstSocket);
            controller.addWebsocket(secondSocket);
            expect(controller.removeWebsocket(firstSocket)).toBeTruthy();
            expect(controller.userMap.get('user')).not.toBeUndefined();
            expect(controller.userMap.get('user').get(2)).not.toBeUndefined();
        });
        test('Undefined session map', () => {
            let controller = new RoutingController(userIdFunc, httpSessionIdFunc)
            expect(controller.removeWebsocket(socket)).toBeFalsy();
        });
    });
    describe('check if user has a session', () => {
        let userId = 'userId';
        let httpSessionId = 'httpSessionId';
        let userIdFunc = jest.fn((ws) => userId);
        let httpSessionIdFunc = jest.fn((ws) => httpSessionId);
        let controller = new RoutingController(userIdFunc, httpSessionIdFunc)
        let socket = {
            on: jest.fn(),
            send: jest.fn(x => x)
        };
        controller.addWebsocket(socket);

        test('user has session', () => {
            let result = controller.userHasSession(userId, httpSessionId);
            expect(result).toBeTruthy()
        });
        test('user doesnt have session', () => {
            let result = controller.userHasSession(userId, 'new session id');
            expect(result).toBeFalsy()
        })
    });
    describe('sendingPayload', () => {
        let userId = 'userId';
        let httpSessionId = 'httpSessionId';
        let userIdFunc = jest.fn((ws) => userId);
        let httpSessionIdFunc = jest.fn((ws) => httpSessionId);
        describe('sending to User', () => {
            test('sending to same socket', () => {
                let controller = new RoutingController(userIdFunc, httpSessionIdFunc);
                let socket = {
                    on: jest.fn(),
                    send: jest.fn(x => x)
                };
                controller.addWebsocket(socket);

                controller.sendToUserId('example', userId);

                expect(socket.send).toReturnTimes(1);
                expect(socket.send).toHaveReturnedWith('example');
            });
            test('sending to different socket', () => {
                let controller = new RoutingController(userIdFunc, httpSessionIdFunc);
                let socket = {
                    on: jest.fn(),
                    send: jest.fn(x => x)
                };
                controller.addWebsocket(socket);

                controller.sendToUserId('example', userId + '1');

                expect(socket.send).not.toBeCalled();
            })
        });
        describe('sending to Http Session', () => {
            test('sending to same socket', () => {
                let controller = new RoutingController(userIdFunc, httpSessionIdFunc);
                let socket = {
                    on: jest.fn(),
                    send: jest.fn(x => x)
                };
                controller.addWebsocket(socket);

                controller.sendToHttpSession('example', httpSessionId, userId);

                expect(socket.send).toReturnTimes(1);
                expect(socket.send).toHaveReturnedWith('example');
            });
            test('sending to same socket, no username', () => {
                let controller = new RoutingController(userIdFunc, httpSessionIdFunc);
                let socket = {
                    on: jest.fn(),
                    send: jest.fn(x => x)
                };
                controller.addWebsocket(socket);

                controller.sendToHttpSession('example', httpSessionId);

                expect(socket.send).toReturnTimes(1);
                expect(socket.send).toHaveReturnedWith('example');
            });
            test('sending to different socket', () => {
                let controller = new RoutingController(userIdFunc, httpSessionIdFunc);
                let socket = {
                    on: jest.fn(),
                    send: jest.fn(x => x)
                };
                controller.addWebsocket(socket);

                controller.sendToHttpSession('example', httpSessionId + '1');

                expect(socket.send).not.toBeCalled();
            })
        });
        describe('sending to All', () => {
            test('two mock sockets', () => {
                let controller = new RoutingController(userIdFunc, httpSessionIdFunc);
                let firstSocket = {
                    on: jest.fn(),
                    send: jest.fn(x => x)
                };
                let secondSocket = {
                    on: jest.fn(),
                    send: jest.fn(x => x)
                };
                controller.addWebsocket(firstSocket);
                controller.addWebsocket(secondSocket);

                controller.sendToAll('payload');

                expect(firstSocket.send).toReturnTimes(1);
                expect(firstSocket.send).toHaveReturnedWith('payload');
                expect(secondSocket.send).toReturnTimes(1);
                expect(secondSocket.send).toHaveReturnedWith('payload');
            });
        })
    });
});