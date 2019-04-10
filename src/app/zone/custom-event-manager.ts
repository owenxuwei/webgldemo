import { Injectable, Inject, NgZone  } from '@angular/core';
import { EVENT_MANAGER_PLUGINS, EventManager } from '@angular/platform-browser';
  
@Injectable()
export class CustomEventManager extends EventManager {
  constructor(@Inject(EVENT_MANAGER_PLUGINS) plugins: any[], private zone: NgZone) {
    super(plugins, zone); 
  }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    if(eventName.endsWith('.out')){
      return this.zone.runOutsideAngular(() => 
          super.addEventListener(element, eventName.substr(0,eventName.length-4), handler));
    }
    return super.addEventListener(element, eventName, handler);
  }

  addGlobalEventListener(target: string, eventName: string, handler: Function){
    if(eventName.endsWith('.out')){
      return this.zone.runOutsideAngular(() => 
          super.addGlobalEventListener(target, eventName.substr(0,eventName.length-4), handler));
    } 
    return super.addGlobalEventListener(target, eventName, handler);
  }
}