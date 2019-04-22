import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoveRoutingModule } from './love-routing.module';
import { LoveComponent } from './love.component';

@NgModule({
  declarations: [LoveComponent],
  imports: [
    CommonModule,
    LoveRoutingModule
  ]
})
export class LoveModule { }
