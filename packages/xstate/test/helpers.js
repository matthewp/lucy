import { interpret } from './modules.js';

export function withService(machine, cb) {
  const service = interpret(machine).start();
  let p = cb(service);
  if(p && p.then)
    return p.then(() => service.stop());
  else
    service.stop();
}