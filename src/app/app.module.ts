import { BrowserModule, EventManager } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomEventManager } from './zone/custom-event-manager';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [ 
    { provide: EventManager, useClass: CustomEventManager }//移除不必要的检查事件
   
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
