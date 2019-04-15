import { BrowserModule, EventManager, EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MultiEventPlugin } from './zone/custom-event-plugin';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [ 
    // { provide: EventManager, useClass: CustomEventManager }//移除不必要的检查事件
    { provide: EVENT_MANAGER_PLUGINS, useClass: MultiEventPlugin, multi: true }
   
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
