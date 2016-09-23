
//noinspection JSUnresolvedVariable
import validator, { object, string, array } from 'koa-context-validator';

export const userValidation = {
  signup() {
    return validator({
      body: object().keys({
        username: string().min(3).required(),
        password: string().min(6).required(),
        email: string(),
        phone: string(),
        firstName: string(),
        lastName: string(),
        picture: string(),
        devices: array()
      })
        .or('email', 'phone')
    }, { stripUnknown: true });
  },

  login() {
    return validator({
      body: object().keys({
        apikey: string().required()
      })
    }, { stripUnknown: true });
  }
};

export default {
  userValidation
};
