
import { AppError } from 'app-utils';
import User from '../../models/user';

const excludedFields = ['hashedPassword', 'apikey', '__v'];

const usersController = {

  async create(ctx) {
    const user = await new User(ctx.request.body).save();
    ctx.body = {
      result: user.toJSON()
    };
  },

  async login(ctx) {
    const user = await User.findOne({ apikey: ctx.request.body.apikey });
    if (!user) {
      throw new AppError(401);
    }
    ctx.body = {
      result: {
        user: user.toJSON(excludedFields),
        token: user.createToken()
      }
    };
  },
  // ,
  //
  // async loginByEmail(ctx) {
  //
  // },
  //
  // async loginByPhone(ctx) {
  //
  // },
  //
  async getSelf(ctx) {
    ctx.body = {
      result: ctx._user.toJSON(excludedFields)
    };
  }
  //
  // async getById(ctx) {
  //
  // },
  //
  // async list(ctx) {
  //
  // },
  //
  // async update(ctx) {
  //
  // },
  //
  // async remove(ctx) {
  //
  // },
  //
  // async addDevice(ctx) {
  //
  // },
  //
  // async removeDevice(ctx) {
  //
  // }

};

export default usersController;
