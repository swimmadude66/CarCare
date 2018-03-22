import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {AppComponent, DemoComponent} from '../components/';
import {ItemService} from '../services';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        RouterModule,
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
