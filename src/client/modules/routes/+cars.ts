import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from '@modules/shared';
import {CarsService} from '@services/cars/service';
import {GarageComponent, CarFormComponent} from '@components/cars';

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
        GarageComponent,
        CarFormComponent
    ],
    providers: [
        CarsService
    ]
})
export class CarsLazyModule {}
