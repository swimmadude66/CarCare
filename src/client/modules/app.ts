import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {SharedModule} from '@modules/shared';
import {AppComponent, LoginComponent} from '@components/';
import {IsLoggedInGuard, NotLoggedInGuard} from '@guards/';
import {AuthService} from '@services/';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        SharedModule,
        RouterModule.forRoot(
            [
                {path: 'login', canActivate: [NotLoggedInGuard], component: LoginComponent},
                {path: 'signup', canLoad: [NotLoggedInGuard], canActivateChild: [NotLoggedInGuard], loadChildren: './routes/+signup#SignupLazyModule'},
                {path: '', canLoad: [IsLoggedInGuard], canActivateChild: [IsLoggedInGuard], loadChildren: './routes/+cars#CarsLazyModule'},
            ]
        )
    ],
    declarations: [
        AppComponent,
        LoginComponent
    ],
    providers: [
        AuthService,
        IsLoggedInGuard,
        NotLoggedInGuard
    ]
})
export class AppModule {}
