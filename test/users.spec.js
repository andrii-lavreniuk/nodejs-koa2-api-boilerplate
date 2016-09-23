
import config from 'config';
import mongoose from 'mongoose';
import chai from 'chai';
import chaiHttp from 'chai-http';
import User from '../app/models/user';

chai.use(chaiHttp);

const expect = chai.expect;
const host   = config.server.host;

let newUser = {};

if (!mongoose.connection.readyState) {
  mongoose.connect(config.mongo.hosts.join(','), config.mongo.options);
  mongoose.connection.on('error', (err) => {
    console.log('Could not connect to mongo server!');
    console.error(err);
  });
}

describe('Users', () => {
  it('Signup', async () => {
    const response = await chai.request(host)
      .post('/api/v1/users/signup')
      .set('Content-Type', 'application/json')
      .send({
        email: `andrei.lavrenyuk+goodweed_${Date.now()}@gmail.com`,
        password: '123456',
        username: `andrei-${Date.now()}`,
        name: 'John Doe'
      });

    //noinspection BadExpressionStatementJS
    expect(response.body.error).to.be.undefined;
    expect(response.body.result).to.be.an('object');
    // expect(response.body.result.user.picture).to.match(imageLinkRe);
    // signupUserId = String(res.body.result.user._id);
    newUser = response.body.result;
  });
});

after(async () => {
  const { result } = await User.remove({ _id: newUser._id });
  console.log('res --> ', result);
});
