import {Component, Input} from '@angular/core';
import {FormControl, Validators, FormGroup, FormBuilder} from '@angular/forms';
import {Car} from '@models/';

@Component({
    selector: 'car-form',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss']
})
export class CarFormComponent {

    @Input('car') set car(c: Car) {
        this._car = c;
        Object.keys(this.carFormControls).forEach(controlKey => {
            if (!this.carFormControls.hasOwnProperty(controlKey) || !c.hasOwnProperty(controlKey)) {
                return;
            }
            const control: FormControl = this.carFormControls[controlKey];
            control.setValue(c[controlKey]);
            control.updateValueAndValidity();
        });
    }

    carFormControls: {[key: string]: FormControl} = {
        Make: new FormControl('', [Validators.required]),
        Model: new FormControl('', [Validators.required]),
        Color: new FormControl('', [Validators.required]),
        Trim: new FormControl('', []),
        CarName: new FormControl('', []),
        License: new FormControl('', []),
        VIN: new FormControl('', []),
        PurchaseDate: new FormControl(new Date(), []),
    };

    carMetadata: {};
    form: FormGroup;

    private _car: Car;

    constructor(
        private _fb: FormBuilder
    ) {
        this.form = this._fb.group(this.carFormControls);
    }

    addMetadata(keyName: string) {
        if (this.carMetadata[keyName]) {
            return; // show some duplicate key error
        }
        this.carMetadata[keyName] = new FormControl('', []);
    }
}
