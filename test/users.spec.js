
import config from 'config';
import mongoose from 'mongoose';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app/server';

chai.use(chaiHttp);

const expect = chai.expect;

if (!mongoose.connection.readyState) {
  mongoose.connect(config.mongo.hosts.join(','), config.mongo.options);
  mongoose.connection.on('error', (err) => {
    console.log('Could not connect to mongo server!');
    console.error(err);
  });
}

describe('Users', () => {
  it('Signup', async () => {
    const response = await chai.request(server)
      .post('/api/v1/users/signup')
      .set('Content-Type', 'application/json')
      .send({
        email: `test_user_${Date.now()}@gmail.com`,
        password: '123456',
        username: `tester-${Date.now()}`,
        name: 'John Doe'
      });

    expect(response.body.error).to.equal(undefined);
    expect(response.body.result).to.be.an('object');
  });
  it.only('Signup Failed', async () => {
    const response = await chai.request(server)
      .post('/api/v1/users/signup')
      .set('Content-Type', 'application/json')
      .send({
        email: `test_user_${Date.now()}@gmail.com`,
        password: '123456'
      });

    expect(response.body.error).to.equal(true);
    expect(response.body.code).to.equal(400);
  });
});

after(async () => {
  Object.keys(mongoose.connection.collections).forEach(async (collection) => {
    await mongoose.connection.collections[collection].remove();
  });
});
