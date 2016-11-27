import { NgModule }       from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { AppComponent } from "./app.component";
import {CommentsAllComponent} from './components/commentsall/commentsall.component';
import {RatingComponent} from './components/rating/rating.component';
import { SearchComponent } from './components/search/search.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FormsModule, ReactiveFormsModule  }   from '@angular/forms';
import { Type, enableProdMode } from "@angular/core";
import { APP_ROUTER_PROVIDERS,routing } from './app.routing';
import { HttpModule } from "@angular/http";
import {SharedService} from './service/SharedService';
import { ResetPassComponent } from './components/resetpass/resetpass.component';
import {RangeSliderComponent} from "./components/common/range-slider.component";
import {CommentsComponent} from './components/comments/comments.component';
import { ShoppingCartService } from './service/shoppingCart-service';
import { AddRecordsService } from './service/addRecord-service';
import { ShoppingCartComponent } from './components/shoppingCart/shoppingCart.component';
import {PasswordComponent} from './components/forgotpass/forgotpass.component';
import {RecordComponent} from './components/record/record.component';
import {RoleComponent} from './components/role/role.component';
import {SignupComponent} from './components/signup/signup.component'
import { Star } from './components/rating/star.component';
import {expDaysComponent} from './components/expdays/expdays.component';
import {advertiseComponent} from './components/advertise/advertise.component';
import {LoginComponent} from './components/login/login.component';
import {commentFilter} from './pipes/filterpipe';
import {commentAllFilter} from './pipes/filterpipe.commentsall';
import {AutocompleteService} from './service/autocomplete.service';
import {Places} from './pipes/places.pipe';
import {Advertise} from './pipes/advertise.pipe';
import {ContactComponent} from './components/contact/contact.component'
import {ContenteditableModel} from "./components/comments/contentEditableModel";
import {DatepickerComponent} from './components/datepicker/my-date-range-picker.component';


//import {Modal} from "ng2-modal";

import {RouterModule,Routes} from '@angular/router'
// import {FormsModule} from '@angular/forms'


enableProdMode();

const routes: Routes = [
  { path: '', component: SearchComponent },
  //{ path: 'profile', component: ProfileComponent },
  { path: 'setpass/:id', component: ResetPassComponent }
];

@NgModule({
  declarations: [AppComponent,
    DatepickerComponent,
    ShoppingCartComponent,
    SearchComponent,
    ProfileComponent,
    ResetPassComponent,
    RangeSliderComponent,
    RatingComponent,
    ContactComponent,
    CommentsAllComponent,
    CommentsComponent,

    SignupComponent,
    PasswordComponent,
    RecordComponent,
    RoleComponent,
    expDaysComponent,
    advertiseComponent,
    LoginComponent,
    Star,
    commentFilter,
    commentAllFilter,
    Places,
    Advertise,
    ContenteditableModel
  ],
  imports:      [BrowserModule,
    FormsModule,HttpModule,
    ReactiveFormsModule,
    routing],
  providers:    [SharedService,APP_ROUTER_PROVIDERS,AutocompleteService, ShoppingCartService, AddRecordsService],
  bootstrap:    [AppComponent],
})
export class AppModule {}
