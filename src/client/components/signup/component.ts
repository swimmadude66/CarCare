import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {SubscriberComponent, PasswordValidation, FormErrorParser} from '@core/';
import {AuthService} from '@services/';

@Component({
    selector: 'signup',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss']
})
export class SignupComponent extends SubscriberComponent {

    form: FormGroup;
    error: string;

    constructor(
        private _fb: FormBuilder,
        private _router: Router,
        private _auth: AuthService
    ) {
        super();
        this.form = _fb.group({
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [Validators.required]),
            confirmPassword: new FormControl('', [Validators.required])
        },
        {
            validator: PasswordValidation.matchPassword
        });
    }

    hasError(controlName: string) {
        const control = this.form.get(controlName);
        return control.dirty && control.invalid;
    }

    getError(controlName: string, friendlyName: string): string {
        const control = this.form.get(controlName);
        if (control.dirty && control.invalid) {
            return FormErrorParser.parseErrors(friendlyName, control.errors);
        }
        return null;
    }

    signup(): void {
        this.error = null;
        if (!this.form.valid) {
            return;
        }
        this.addSubscription(
            this._auth.signup(this.form.get('email').value, this.form.get('password').value)
            .subscribe(
                _ => {
                    this.form.reset();
                    this._router.navigate(['/']);
                },
                err => this.error = 'Could not signup at this time'
            )
        );

    }

}
