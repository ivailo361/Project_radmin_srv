class UserExceptionError {
    constructor(code, message) {
        this.message = message;
        this.code = code;
    }
  }

module.exports = UserExceptionError