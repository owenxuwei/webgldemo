import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoveComponent } from './love.component';

const routes: Routes = [
  {
    path: '',
    component: LoveComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoveRoutingModule { }
