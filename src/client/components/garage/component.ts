import {Component, OnInit} from '@angular/core';
import {SubscriberComponent} from '@core/';
import {CarsService} from '@services/cars/service';
import {Car} from '@models/car';

@Component({
    selector: 'garage',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss']
})
export class GarageComponent extends SubscriberComponent implements OnInit {

    cars: Car[] = [];

    constructor(
        private _carsService: CarsService
    ) {
        super();
    }

    ngOnInit() {
        this.addSubscription(
            this._carsService.getCars()
            .subscribe(cars => this.cars = cars)
        );
    }
}
