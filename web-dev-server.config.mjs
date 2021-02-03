import { importMapsPlugin } from '@web/dev-server-import-maps';

export default {
  nodeResolve: true,
  plugins: [importMapsPlugin()]
};