
//noinspection JSUnresolvedVariable
import _ from 'underscore';
import config from 'config';
import http from 'http';
import Koa from 'koa';
import json from 'koa-json';
import error from 'koa-errorhandler';
import convert from 'koa-convert';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
//noinspection JSUnresolvedVariable,ES6UnusedImports
import { Debug, prettyError } from 'app-utils';
//noinspection JSUnresolvedVariable
import * as routesV1 from './routes/v1/_index';


const debug = new Debug('app');
const pe = prettyError();

// connect to mongo
mongoose.connect(config.mongo.hosts.join(','), config.mongo.options);
mongoose.connection.on('error', debug.error);


// setup app
const app = new Koa();

app.use(json({ pretty: false, param: '_pretty' }));
app.use(bodyParser());

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  debug.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.on('error', (err) => {
  debug.error(pe.render(err));
});

// handle errors
app.use(convert(error({
  all(err) {
    const messages = [];
    if (err.constructor.name === 'MongooseError') {
      _.each(err.errors, (e) => {
        messages.push(e.message);
      });
    } else if (err.isJoi) {
      err.code = 400;
      _.each(err.details, (e) => {
        messages.push(e.message);
      });
    } else {
      messages[0] = err.message || err.msg || err.stack;
    }
    this.status = err.statusCode || 200;
    this.body = {
      error: true,
      code: err.code || 500,
      messages
    };
  }
})));

// setup v1 routes
_.each(routesV1.default, (r) => {
  app.use(r.routes());
});

// handle 404
app.use((ctx) => {
  const msg = `Not found. ${ctx.request.method} ${ctx.path}`;
  debug.error(msg);
  ctx.body = {
    error  : true,
    code: 404,
    message: 'Not found'
  };
});

const server = http.createServer(app.callback());
server.listen(config.server.port, () => {
  debug.info(`App listen ${config.server.port} port`);
});

export default server;
