
import _ from 'underscore';
import config from 'config';
import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';
import sha1 from 'crypto-js/sha1';
import hex from 'crypto-js/enc-hex';
import { AppError, token } from 'app-utils';


const Schema = new mongoose.Schema({
  username       : { type: String, trim: true, lowercase: true, required: true },
  firstName      : { type: String, trim: true, default: '' },
  lastName       : { type: String, trim: true, default: '' },
  phone          : { type: String, trim: true, index: true },
  email          : { type: String, trim: true, index: true },
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

Schema.index({ email: 1 }, { unique: 'Email already exists', sparse: true });
Schema.index({ username: 1 }, { unique: 'Username already exists', sparse: true });
Schema.index({ phone: 1 }, { unique: 'Phone already exists', sparse: true });

Schema.plugin(beautifyUnique);

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

Schema.pre('save', function userPreSave(next) {
  if (!this.email && !this.phone) {
    next(new AppError('Need email or phone', -678));
  }
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
