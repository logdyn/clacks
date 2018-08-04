let httpMocks = require('node-mocks-http');
let Clacks = require('../lib/index');

describe('Testing index.js', () => {
    describe('Test init() middleware', () => {
        test('Getting userId & HttpSessionId from request', () => {
            let getUserId = jest.fn((req) => {
                return 'id=' + req.user.id + ':name=' + req.user.name
            });
            let getHttpSessionId = jest.fn((req) => {
                return 'id=' + req.session.id
            });

            let request = httpMocks.createRequest({
                session: {
                    id: 'testSessionId'
                },
                user: {
                    id: 1,
                    name: 'Test'
                }
            });

            let response = httpMocks.createResponse();

            let clacks = new Clacks();

            let next = jest.fn(() => {
                expect(clacks.userId).toBe('id=1:name=Test');
                expect(clacks.httpSessionId).toBe('id=testSessionId');
            })

            const middleware = clacks.init({
                'getUserId': getUserId,
                'getHttpSessionId': getHttpSessionId
            });
            expect(() => middleware(request, response, next)).not.toThrow();

            expect(getUserId).toReturnTimes(1);
            expect(getHttpSessionId).toReturnTimes(1);
            expect(next).toReturnTimes(1);
            expect(clacks.userId).toBe(null);
            expect(clacks.httpSessionId).toBe(null);


        });
        test('Getting userId from request', () => {
            let getUserId = jest.fn((req) => {
                return 'id=' + req.user.id + ':name=' + req.user.name
            });

            let request = httpMocks.createRequest({
                session: {
                    id: 'testSessionId'
                },
                user: {
                    id: 1,
                    name: 'Test'
                }
            });

            let response = httpMocks.createResponse();

            let clacks = new Clacks();

            let next = jest.fn(() => {
                expect(clacks.userId).toBe('id=1:name=Test');
                expect(clacks.httpSessionId).toBe('testSessionId');
            })

            const middleware = clacks.init({
                getUserId: getUserId
            });
            expect(() => middleware(request, response, next)).not.toThrow();

            expect(getUserId).toReturnTimes(1);
            expect(next).toReturnTimes(1);
            expect(clacks.userId).toBe(null);
            expect(clacks.httpSessionId).toBe(null);


        });
        test('Getting httpSessionId from request', () => {
            let getHttpSessionId = jest.fn((req) => {
                return 'id=' + req.session.id
            });

            let request = httpMocks.createRequest({
                session: {
                    id: 'testSessionId'
                },
                user: {
                    id: 1,
                    name: 'Test'
                }
            });

            let response = httpMocks.createResponse();

            let clacks = new Clacks();

            let next = jest.fn(() => {
                expect(clacks.userId).toBe(1);
                expect(clacks.httpSessionId).toBe('id=testSessionId');
            })

            const middleware = clacks.init({
                getHttpSessionId: getHttpSessionId
            });
            expect(() => middleware(request, response, next)).not.toThrow();

            expect(getHttpSessionId).toReturnTimes(1);
            expect(next).toReturnTimes(1);
            expect(clacks.userId).toBe(null);
            expect(clacks.httpSessionId).toBe(null);


        });
        test('Getting default userId & httpSessionId from request', () => {

            let clacks = new Clacks();

            const middleware = clacks.init();

            let request = httpMocks.createRequest({
                session: {
                    id: 'testSessionId'
                },
                user: {
                    id: 1,
                    name: 'Test'
                }
            });

            let response = httpMocks.createResponse();

            let next = jest.fn(() => {
                expect(clacks.userId).toBe(1);
                expect(clacks.httpSessionId).toBe('testSessionId');
            });

            expect(() => middleware(request, response, next)).not.toThrow();

            expect(next).toReturnTimes(1);
            expect(clacks.userId).toBe(null);
            expect(clacks.httpSessionId).toBe(null);
        });
    });
    describe('Test send()', () => {
        
    });
});