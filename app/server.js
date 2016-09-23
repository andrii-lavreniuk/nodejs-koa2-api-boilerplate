
//noinspection JSUnresolvedVariable
import _ from 'underscore';
import config from 'config';
import Koa from 'koa';
import json from 'koa-json';
import error from 'koa-errorhandler';
import convert from 'koa-convert';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
//noinspection JSUnresolvedVariable
import { Debug } from 'app-utils';
//noinspection JSUnresolvedVariable
import * as routesV1 from './routes/v1/_index';


const debug = new Debug('app');

// connect to mongo
mongoose.connect(config.mongo.hosts.join(','), config.mongo.options);
mongoose.connection.on('error', debug.error);


// setup app
const app = new Koa();

app.use(json({ pretty: false, param: '_pretty' }));
app.use(bodyParser());

app.use(async function t(ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});


// handle errors
app.use(convert(error({
  all(err) {
    console.log('err --> ', err);
    //noinspection JSUnusedGlobalSymbols
    this.status = err.statusCode || 200;
    //noinspection JSUnusedGlobalSymbols
    this.body = {
      error  : true,
      code: err.code || 500,
      message: err.message || err.msg || err.stack
    };
  }
})));

// setup v1 routes
_.each(routesV1.default, (r) => {
  app.use(r.routes());
});

// handle 404
app.use((ctx) => {
  console.log('qqqqqqqq  dsds --> ');
  const msg = `Not found. ${ctx.request.method} ${ctx.path}`;
  debug.error(msg);
  ctx.body = {
    error  : true,
    code: 404,
    message: 'Not found'
  };
});

//noinspection JSUnresolvedFunction
app.listen(config.server.port, () => {
  debug.info(`App listen ${config.server.port} port`);
});
