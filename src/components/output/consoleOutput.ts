/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { customElement, LitElement, property, html } from "lit-element";

import { ConsoleCatcher, Message } from "src/console/console";


@customElement('starboard-console-output')
export class ConsoleOutputElement extends LitElement {
    private logHook: (m: Message) => any;

    @property({attribute: false})
    public logs: any[] = [];

    constructor() {
        super();
        this.logHook = (msg) => {
            this.logs.push(msg); 
            this.requestUpdate();
        };
    }

    createRenderRoot() {
        return this;
    }

    hook(consoleCatcher: ConsoleCatcher) {
        consoleCatcher.hook(this.logHook);
    }

    unhook(consoleCatcher: ConsoleCatcher) {
        consoleCatcher.unhook(this.logHook);
    }

    async unhookAfterOneTick(consoleCatcher: ConsoleCatcher) {
        return new Promise(resolve => window.setTimeout(() => 
            {
                this.unhook(consoleCatcher);
                resolve();
            }, 0
        ));
    }

    addEntry(msg: Message) {
        this.logs.push(msg);
        this.requestUpdate();
    }

    render() {
        // We load the console output functionality asynchronously
        const comPromise = import(/* webpackChunkName: "console-output", webpackPrefetch: true */ "./consoleOutputModule");

        const rootEl = document.createElement('div');
        rootEl.setAttribute("style", "background-color: rgb(36, 36, 36)");
        comPromise.then(c => {
            c.renderStandardConsoleOutputIntoElement(rootEl, this.logs)
        })
        return html`${rootEl}`;
    }
}