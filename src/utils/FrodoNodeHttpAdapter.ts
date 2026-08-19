import NodeHttpAdapter from '@pollyjs/adapter-node-http';

import { cleanupProxyRequestUrl } from './PollyUtils.ts';

export class FrodoNodeHttpAdapter extends NodeHttpAdapter {
  async onRequest(pollyRequest: any) {
    pollyRequest.url = cleanupProxyRequestUrl(pollyRequest.url);
    super.onRequest(pollyRequest);
  }
}
