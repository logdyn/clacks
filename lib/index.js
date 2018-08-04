let _userId, _httpSessionId = null;

let clearIdentifiers = function() {
    _userId = _httpSessionId = null;
}

module.exports = class Clacks {
    init(options) {
        return function(req, res, next) {
            _userId = Object.freeze(options && options.getUserId ? options.getUserId(req) : req.user.id);
            _httpSessionId = Object.freeze(options && options.getHttpSessionId ? options.getHttpSessionId(req) : req.session.id);
            next();
            clearIdentifiers();
        }
    }

    get userId() { return _userId }

    get httpSessionId() { return _httpSessionId }

    send(payload) {
        //? routing.getWebsocket(userId || httpSessionId)
    }
}
