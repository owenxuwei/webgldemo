import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AmmoRoutingModule } from './ammo-routing.module';
import { AmmoComponent } from './ammo.component';

@NgModule({
  declarations: [AmmoComponent],
  imports: [
    CommonModule,
    AmmoRoutingModule
  ]
})
export class AmmoModule { }
