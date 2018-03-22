import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {AppComponent, DemoComponent} from '../components/';
import {ItemService} from '../services';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        RouterModule,
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot(
            [
                {path: '', pathMatch: 'full', component: DemoComponent},
            ]
        )
    ],
    declarations: [
        AppComponent,
        DemoComponent
    ],
    providers: [
        ItemService
    ]
})
export class AppModule {}
