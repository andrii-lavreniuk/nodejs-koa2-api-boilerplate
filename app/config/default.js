
const port = process.env.PORT || 3010;

const S3 = {
  key   : '',
  secret: '',
  bucket: '',
  cdn: ''
};

module.exports = {
  server  : {
    host: `http://localhost:${port}`,
    port
  },
  mongo   : {
    hosts  : [
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/api-boilerplate'
    ],
    options: {
      server: {
        socketOptions: {
          keepAlive: 1
        }
      }
    }
  },
  apiKey  : {
    secret: 'app-secret-api-key'
  },
  jwt     : {
    secret   : 'app-secret-token-key',
    algorithm: 'HS256',
    expiresIn: 60 * 60 * 24 * 30 // 30 days in seconds
  },
  temporaryToken: {
    secret   : 'app-secret-tmp-token-key',
    expiresIn: 60 * 60 * 30 // 30 minutes in seconds
  },
  branch: {
    key: ''
  },
  tmpPath: '/tmp',
  S3,
  imager: {
    keepNames: true,
    variants: {
      items: {
        separator: '/',
        resize: {
          '': '100%'
        },
        rename: filename => filename
      }
    },
    storage: {
      Local: {
        path: '/tmp'
      },
      S3
    },
    debug: true
  },
  redis: {
    url: 'redis://127.0.0.1:6379'
  },
  rollbar: {
    key: ''
  }
};
