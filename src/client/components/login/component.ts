import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {SubscriberComponent} from '@core/';
import {AuthService} from '@services/*';

@Component({
    selector: 'login',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss']
})
export class LoginComponent extends SubscriberComponent {

    form: FormGroup;
    serverError: string;

    constructor(
        private _fb: FormBuilder,
        private _router: Router,
        private _auth: AuthService
    ) {
        super();
        this.form = _fb.group({
            Email: new FormControl('', [Validators.required, Validators.email]),
            Password: new FormControl('', [Validators.required])
        });
    }

    login(): void {
        this.serverError = null;
        if (!this.form.valid) {
            return;
        }
        this.addSubscription(
            this._auth.login(this.form.get('Email').value, this.form.get('Password').value)
            .subscribe(
                _ => {
                    this.form.reset();
                    this._router.navigate(['/']);
                },
                err => this.serverError = 'Could not login at this time'
            )
        );

    }

}