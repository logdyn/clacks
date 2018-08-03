let httpMocks = require('node-mocks-http');
let clacks = require('../lib/index');

describe('Test init() middleware', () => {
    test('Getting userId & httpSessionId from request', async (done) => {
        let getUserId = (req) => {
            return 'id=' + req.user.id + ':name=' + req.user.name
        };

        const middleware = clacks.init({getUserId: getUserId});

        await new Promise((resolve) => {
            let request = httpMocks.createRequest({
                session: {
                    id: 'testSessionId'
                }
            });

            let response = httpMocks.createResponse();
            request.user = {
                id: 1,
                name: 'Test'
            };

            middleware(request, response, () => {
                expect(clacks.getUserId()).toBe('id=1:name=Test');
                expect(clacks.getHttpSessionId()).toBe('testSessionId');
                resolve('Success');
            });
        });

        done();
    });
});
