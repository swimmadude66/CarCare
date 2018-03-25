import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent, DemoComponent} from '@components/';
import {AuthService} from '@services/';
import {SharedModule} from '@modules/shared';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        SharedModule,
        RouterModule.forRoot(
            [
                {path: '', pathMatch: 'full', component: DemoComponent},
                {path: 'login', loadChildren: './routes/+login#LoginLazyModule'}
            ]
        )
    ],
    declarations: [
        AppComponent,
        DemoComponent
    ],
    providers: [
        AuthService
    ]
})
export class AppModule {}
