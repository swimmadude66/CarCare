import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '@modules/shared';
import {GarageComponent} from '@components/garage/component';
import {CarsService} from '@services/cars/service';

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(
            [
                {path: '', pathMatch: 'full', component: GarageComponent},
            ]
        )
    ],
    declarations: [
        GarageComponent
    ],
    providers: [
        CarsService
    ]
})
export class CarsLazyModule {}
