import { Injectable, Inject } from '@angular/core';
import {  DOCUMENT ,ɵangular_packages_platform_browser_platform_browser_g as EventManagerPlugin } from '@angular/platform-browser';

/**
 * Support Multi Event
 */
@Injectable()
export class MultiEventPlugin extends EventManagerPlugin {

    constructor( @Inject(DOCUMENT) doc: any) { super(doc); }

    supports(eventName: string): boolean {
        return eventName.endsWith('.out');
    }

    addEventListener(element: HTMLElement, eventName: string,
        handler: Function): Function {
        return this.manager.getZone()
            .runOutsideAngular(() => {
                return this.manager.addEventListener(element, eventName.substr(0, eventName.length - 4), handler);
            });
    }

    addGlobalEventListener(target: string, eventName: string,
        handler: Function): Function {
        return this.manager.getZone().runOutsideAngular(() => {
            return this.manager.addGlobalEventListener(target, eventName.substr(0, eventName.length - 4),
                handler);
        });
    }
}