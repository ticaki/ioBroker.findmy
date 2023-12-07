"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_icloudjs = __toESM(require("icloudjs"));
class Findmy extends utils.Adapter {
  icloud = void 0;
  findMyService = void 0;
  unload = false;
  timeout = void 0;
  constructor(options = {}) {
    super({
      ...options,
      name: "findmy"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    this.setState("info.connection", false, true);
    this.config.pollInterval = Number.isNaN(this.config.pollInterval) || this.config.pollInterval < 1 ? 3 : this.config.pollInterval;
    const username = this.config.username;
    const password = this.config.password;
    if (typeof username !== "string" || username == "" || typeof password != "string" || password == "") {
      return;
    }
    this.icloud = new import_icloudjs.default({
      username: this.config.username,
      password: this.config.password,
      saveCredentials: false,
      trustDevice: true,
      authMethod: "srp",
      dataDirectory: "/opt/iobroker/iobroker-data"
    });
    await this.icloud.authenticate();
    this.log.debug(this.icloud.status);
    try {
      await this.icloud.awaitReady;
    } catch (error) {
      return;
    }
    this.setState("info.connection", true, true);
    this.findMyService = this.icloud.getService("findme");
    this.endlessUpdater();
  }
  endlessUpdater() {
    this.timeout = this.setTimeout(
      async () => {
        if (this.unload)
          return;
        if (!this.icloud || !this.findMyService)
          return;
        await this.icloud.awaitReady;
        this.findMyService = this.icloud.getService("findme");
        await this.findMyService.refresh();
        for (const device of this.findMyService.devices.values()) {
          this.log.debug(
            device.deviceInfo.name + "	" + Math.floor(device.deviceInfo.batteryLevel * 100) + "% " + device.deviceInfo.batteryStatus
          );
        }
        this.endlessUpdater();
      },
      (this.config.pollInterval || 1) * 6e4
    );
  }
  onUnload(callback) {
    try {
      this.unload = true;
      this.setState("info.connection", false, true);
      callback();
    } catch (e) {
      callback();
    }
  }
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
  async onMessage(obj) {
    if (typeof obj === "object" && obj.message) {
      if (obj.command === "send") {
        this.log.info("send command");
        if (obj.callback)
          this.sendTo(obj.from, obj.command, "Message received", obj.callback);
      }
      switch (obj.command) {
        case "connect":
          {
            const username = obj.message.username;
            const password = obj.message.password;
            if (typeof username !== "string" || username == "" || typeof password != "string" || password == "") {
              if (obj.callback)
                this.sendTo(obj.from, obj.command, "Message wrong", obj.callback);
              return;
            } else
              this.log.debug(`user: ${username} password: ${password}`);
            this.icloud = new import_icloudjs.default({
              username,
              password,
              saveCredentials: false,
              trustDevice: true,
              authMethod: "srp",
              dataDirectory: "/opt/iobroker/iobroker-data"
            });
            await this.icloud.authenticate();
            this.log.debug(this.icloud.status);
            if (this.icloud.status === "MfaRequested") {
              if (obj.callback)
                this.sendTo(obj.from, obj.command, "Message done wait for secret", obj.callback);
            }
          }
          break;
        case "secret":
          {
            if (this.icloud) {
              await this.icloud.provideMfaCode(obj.message.secret);
              await this.icloud.awaitReady;
              this.log.debug("Hello, " + this.icloud.accountInfo.dsInfo.fullName);
            }
          }
          break;
      }
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Findmy(options);
} else {
  (() => new Findmy())();
}
//# sourceMappingURL=main.js.map
