import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {SharedModule} from '@modules/shared';
import {AppComponent, DemoComponent} from '@components/';
import {AuthService} from '@services/';
import {IsLoggedInGuard, NotLoggedInGuard} from '@guards/';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        SharedModule,
        RouterModule.forRoot(
            [
                {path: '', pathMatch: 'full', canActivate: [IsLoggedInGuard], component: DemoComponent},
                {path: 'login', canLoad: [NotLoggedInGuard], loadChildren: './routes/+login#LoginLazyModule'}
            ]
        )
    ],
    declarations: [
        AppComponent,
        DemoComponent
    ],
    providers: [
        AuthService,
        IsLoggedInGuard,
        NotLoggedInGuard
    ]
})
export class AppModule {}
