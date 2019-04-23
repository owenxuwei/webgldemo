import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {path: '', redirectTo: 'love', pathMatch: 'full'},
  {
    path: 'home', loadChildren: 'src/app/layout/home/home.module#HomeModule',
    // canActivate: [HomeCanActivate],
  },
  {
    path: 'love', loadChildren: 'src/app/layout/love/love.module#LoveModule',
    // canActivate: [HomeCanActivate],
  },
  {
    path: 'ammo', loadChildren: 'src/app/layout/ammo/ammo.module#AmmoModule',
    // canActivate: [HomeCanActivate],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
