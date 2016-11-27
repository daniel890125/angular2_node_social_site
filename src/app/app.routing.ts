import { Routes,RouterModule } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from "@angular/common";

import { ModuleWithProviders } from '@angular/core';

import { SearchComponent } from './components/search/search.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ResetPassComponent } from './components/resetpass/resetpass.component';

const routes:Routes = [
  { path: '', component: SearchComponent },
  { path: 'profile/:id', component: ProfileComponent },
  { path: 'setpass/:id', component: ResetPassComponent }
];

export const APP_ROUTER_PROVIDERS:any[] = [
  // provideRoutes(routes),
  { provide: LocationStrategy, useClass: HashLocationStrategy }
];
//export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
export const routing = RouterModule.forRoot(routes);
