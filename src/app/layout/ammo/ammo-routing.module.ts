import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AmmoComponent } from './ammo.component';

const routes: Routes = [
  {
    path: '',
    component: AmmoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AmmoRoutingModule { }
