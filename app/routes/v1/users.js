
import Router from 'koa-router';
import { userValidation as validation } from './validation/users';
import usersCtrl from '../../controllers/v1/users';

import auth from 'mw-authentication'; // eslint-disable-line import/imports-first


const users = new Router({
  prefix: '/api/v1/users'
});


users
  .post('/signup', validation.signup(), usersCtrl.create)
  .post('/login', validation.login(), usersCtrl.login)
  // .post('/login/email', validation.signup(), usersCtrl.loginByEmail)
  // .post('/login/phone', validation.signup(), usersCtrl.loginByPhone)
  .get('/me', auth.authenticate, usersCtrl.getSelf)
  // .get('/:id', validation.signup(), usersCtrl.getById)
  // .get('/', validation.signup(), usersCtrl.list)
  // .put('/:id', validation.signup(), usersCtrl.update)
  // .delete('/:id', validation.signup(), usersCtrl.remove)
  //
  // .post('/:id/devices', validation.signup(), usersCtrl.addDevice)
  // .delete('/:id/devices/:deviceId', validation.signup(), usersCtrl.removeDevice)
;

export default users;
