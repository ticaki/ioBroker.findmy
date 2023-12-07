/*
 * Created with @iobroker/create-adapter v2.5.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import iCloud from 'icloudjs';
import { iCloudFindMyService } from 'icloudjs/build/services/findMy';

// Load your modules here, e.g.:
// import * as fs from "fs";

class Findmy extends utils.Adapter {
    icloud: iCloud | undefined = undefined;
    findMyService: iCloudFindMyService | undefined = undefined;
    unload: boolean = false;
    timeout: ioBroker.Timeout | undefined = undefined;
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'findmy',
        });
        this.on('ready', this.onReady.bind(this));
        // this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        // Initialize your adapter here

        // Reset the connection indicator during startup
        this.setState('info.connection', false, true);

        this.config.pollInterval =
            Number.isNaN(this.config.pollInterval) || this.config.pollInterval < 1 ? 3 : this.config.pollInterval;
        const username = this.config.username;
        const password = this.config.password;
        if (typeof username !== 'string' || username == '' || typeof password != 'string' || password == '') {
            return;
        }

        this.icloud = new iCloud({
            username: this.config.username,
            password: this.config.password,
            saveCredentials: false,
            trustDevice: true,
            authMethod: 'srp',
            dataDirectory: '/opt/iobroker/iobroker-data',
        });
        await this.icloud.authenticate();
        this.log.debug(this.icloud.status);
        //if (this.icloud.status === 'MfaRequested') {
        //    await icloud.provideMfaCode('123456');
        //}
        try {
            await this.icloud.awaitReady;
        } catch (error: any) {
            return;
        }
        this.setState('info.connection', true, true);
        this.findMyService = this.icloud.getService('findme');
        this.endlessUpdater();
    }
    private endlessUpdater(): void {
        this.timeout = this.setTimeout(
            async () => {
                if (this.unload) return;
                if (!this.icloud || !this.findMyService) return;
                
                await this.findMyService.refresh();
                for (const device of this.findMyService.devices.values()) {
                    this.log.debug(
                        device.deviceInfo.name +
                            '\t' +
                            Math.floor(device.deviceInfo.batteryLevel * 100) +
                            '% ' +
                            device.deviceInfo.batteryStatus,
                    );
                }

                this.endlessUpdater();
            },
            (this.config.pollInterval || 1) * 60000,
        );
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            this.unload = true;
            this.setState('info.connection', false, true);

            callback();
        } catch (e) {
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  */
    // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
    //     if (obj) {
    //         // The object was changed
    //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    //     } else {
    //         // The object was deleted
    //         this.log.info(`object ${id} deleted`);
    //     }
    // }

    /**
     * Is called if a subscribed state changes
     */
    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
    //  */
    private async onMessage(obj: ioBroker.Message): Promise<void> {
        if (typeof obj === 'object' && obj.message) {
            if (obj.command === 'send') {
                // e.g. send email or pushover or whatever
                this.log.info('send command');

                // Send response in callback if required
                if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
            }
            switch (obj.command) {
                case 'connect':
                    {
                        const username = obj.message.username;
                        const password = obj.message.password;
                        if (
                            typeof username !== 'string' ||
                            username == '' ||
                            typeof password != 'string' ||
                            password == ''
                        ) {
                            if (obj.callback) this.sendTo(obj.from, obj.command, 'Message wrong', obj.callback);
                            return;
                        } else this.log.debug(`user: ${username} password: ${password}`);

                        this.icloud = new iCloud({
                            username: username,
                            password: password,
                            saveCredentials: false,
                            trustDevice: true,
                            authMethod: 'srp',
                            dataDirectory: '/opt/iobroker/iobroker-data',
                        });
                        await this.icloud.authenticate();
                        this.log.debug(this.icloud.status);
                        if (this.icloud.status === 'MfaRequested') {
                            if (obj.callback)
                                this.sendTo(obj.from, obj.command, 'Message done wait for secret', obj.callback);
                        }
                    }
                    break;
                case 'secret':
                    {
                        if (this.icloud) {
                            await this.icloud.provideMfaCode(obj.message.secret);
                            await this.icloud.awaitReady;
                            this.log.debug('Hello, ' + this.icloud.accountInfo!.dsInfo.fullName);
                        }
                    }
                    break;
            }
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Findmy(options);
} else {
    // otherwise start the instance directly
    (() => new Findmy())();
}
