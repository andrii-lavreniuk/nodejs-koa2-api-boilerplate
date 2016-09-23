
import _ from 'underscore';
import config from 'config';
import mongoose from 'mongoose';
import sha1 from 'crypto-js/sha1';
import hex from 'crypto-js/enc-hex';
import { AppError, token } from 'app-utils';


const Schema = new mongoose.Schema({
  username       : { type: String, trim: true, lowercase: true, index: true, unique: true, required: true },
  firstName      : { type: String, trim: true, default: '' },
  lastName       : { type: String, trim: true, default: '' },
  phone          : { type: String, trim: true, index: true, unique: true, sparse: true },
  email          : { type: String, trim: true, index: true, unique: true, sparse: true },
  apikey         : { type: String },
  hashedPassword : { type: String },
  picture        : { type: String, default: '' },
  devices        : [{
    _id  : false,
    os   : String,
    token: String
  }]
}, {
  collection: 'users'
});

Schema.index({ email: 1 }, { unique: true, sparse: true });
Schema.index({ username: 1 }, { unique: true, sparse: true });
Schema.index({ phone: 1 }, { unique: true, sparse: true });

Schema
  .virtual('password')
  .set(function setUserVirtualPass(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function getUserPass() {
    return this._password;
  });

// function isBase64(str) {
//   return str && typeof str === 'string' && !str.match(/^http/);
// }

Schema.pre('save', function userPreSave(next) {
  // const filePath = [config.tmpPath, this._id].join('/');
  if (!this.email && !this.phone) {
    next(new AppError('Need email or phone', -678));
  }
  // if (this.fbPicture) {
  //   request(this.fbPicture)
  //     .pipe(fs.createWriteStream(filePath))
  //     .on('error', next)
  //     .on('close', () => {
  //       imager.upload([filePath], (err, s3Host, files) => {
  //         this.picture = [s3Host, files.pop()].join('/') + '?t=' + Date.now();
  //         next();
  //       }, 'items');
  //     });
  // } else if (isBase64(this.picture)) {
  //   async.waterfall([
  //     (cb) => {
  //       fs.writeFile(filePath, this.picture, 'base64', cb);
  //     },
  //     (cb) => {
  //       imager.upload([filePath], cb, 'items');
  //     }
  //   ], (err, s3Host, files) => {
  //     if (err) {
  //       return next(err);
  //     }
  //     this.picture = [s3Host, files.pop()].join('/') + '?t=' + Date.now();
  //     next();
  //   });
  // } else {
  //   next();
  // }
  next();
});

Schema.post('save', function userPostSave() {
  if (!this.apikey) {
    //noinspection JSUnresolvedFunction
    this.apikey = sha1(String(this._id), config.apiKey.secret).toString(hex);
    this.save();
  }
});

Schema.methods = {

  authenticate: function authenticate(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  makeSalt: function makeSalt() {
    return String(Math.round((new Date().valueOf() * Math.random())));
  },

  encryptPassword: function encryptPassword(password) {
    return sha1(String(password), this.salt).toString(hex);
  },

  createToken: function createToken() {
    return token.create(this._id);
  },

  toJSON: function toJSON(props) {
    const obj = this.toObject();
    const fields = typeof props === 'string' ? props.split(' ') : props || [];
    _.each(fields, (field) => {
      delete obj[field];
    });
    return obj;
  }

};

Schema.statics = {

  createToken(userId) {
    return token.create(userId);
  },

  decodeToken: function decodeToken(tkn) {
    return token.decode(tkn);
  }

};

export default mongoose.model('User', Schema);
