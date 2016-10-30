
module.exports = {
  mongo   : {
    hosts  : [
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/api-boilerplate-test'
    ],
    options: {
      server: {
        socketOptions: {
          keepAlive: 1
        }
      }
    }
  }
};
