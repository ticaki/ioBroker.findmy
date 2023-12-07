![Logo](admin/findmy.png)
# ioBroker.findmy

[![NPM version](https://img.shields.io/npm/v/iobroker.findmy.svg)](https://www.npmjs.com/package/iobroker.findmy)
[![Downloads](https://img.shields.io/npm/dm/iobroker.findmy.svg)](https://www.npmjs.com/package/iobroker.findmy)
![Number of Installations](https://iobroker.live/badges/findmy-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/findmy-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.findmy.png?downloads=true)](https://nodei.co/npm/iobroker.findmy/)

```
2023-12-07 20:48:32.936  - debug: findmy.0 (59994) iPhone von Sarah     100% NotCharging
2023-12-07 20:49:33.229  - error: findmy.0 (59994) Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch().
2023-12-07 20:49:33.229  - error: findmy.0 (59994) unhandled promise rejection: invalid json response body at https://p125-fmipweb.icloud.com/fmipservice/client/web/refreshClient reason: Unexpected end of JSON input
2023-12-07 20:49:33.230  - error: findmy.0 (59994) FetchError: invalid json response body at https://p125-fmipweb.icloud.com/fmipservice/client/web/refreshClient reason: Unexpected end of JSON input
    at /home/tim/ioBroker.findmy/.dev-server/default/node_modules/node-fetch/lib/index.js:273:32
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async iCloudFindMyService.refresh (/home/tim/ioBroker.findmy/.dev-server/default/node_modules/icloudjs/build/services/findMy.js:45:22)
    at async /home/tim/ioBroker.findmy/.dev-server/default/node_modules/iobroker.findmy/build/main.js:72:9
2023-12-07 20:49:33.231  - error: findmy.0 (59994) invalid json response body at https://p125-fmipweb.icloud.com/fmipservice/client/web/refreshClient reason: Unexpected end of JSON input
2023-12-07 20:49:33.233  - debug: host.dev-findmy-iobroker-devel Incoming Host message addNotification
2023-12-07 20:49:33.233  - info: findmy.0 (59994) terminating
2023-12-07 20:49:33.234  - warn: findmy.0 (59994) Terminated (UNCAUGHT_EXCEPTION): Without reason
2023-12-07 20:49:33.735  - info: findmy.0 (59994) terminating
```