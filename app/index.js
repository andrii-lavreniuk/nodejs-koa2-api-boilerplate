
import pm2 from 'pm2';
import { Debug } from 'app-utils';

const debug = new Debug('pm2');
const instances = process.env.WEB_CONCURRENCY || -1;
const maxMemory = process.env.WEB_MEMORY || 460;

pm2.connect(() => {
  pm2.start({
    instances,
    script    : 'server.js',
    name      : 'api',
    exec_mode : 'cluster',
    args      : ['--optimize_for_size --max_old_space_size=460 --gc_interval=100'],
    max_memory_restart : `${maxMemory}M`
  }, (err) => { // eslint-disable-line consistent-return
    if (err) {
      return debug.error('Error while launching applications', err.stack || err);
    }

    debug.info('PM2 and application has been successfully started');

    // Display logs in standard output
    pm2.launchBus((err, bus) => {
      debug.info('[PM2] Log streaming started');

      bus.on('log:out', (packet) => {
        const data = packet.data && packet.data.type === 'Buffer' ? new Buffer(packet.data.data).toString()
          : packet.data;
        debug.info('[App:%s] %s', packet.process.name, data);
      });

      bus.on('log:err', (packet) => {
        const data = packet.data && packet.data.type === 'Buffer' ? new Buffer(packet.data.data).toString()
          : packet.data;
        debug.error('[App:%s][Err] %s', packet.process.name, data);
      });
    });
  });
});
