import {Component} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {AuthResponseType} from "../../../../types/auth-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['../user.component.scss']
})
export class SignupComponent {

  signupForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/[A-ЯЁ][а-яё]{1,15}/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)]],
    agree: [false, [Validators.requiredTrue]]
  })

  constructor(private fb: FormBuilder,
              private _snackBar: MatSnackBar,
              private authService: AuthService,
              private router: Router) {
  }

  checkField(field: string) {
    return this.signupForm.get(field)?.invalid
      && (this.signupForm.get(field)?.dirty || this.signupForm.get(field)?.touched)
  }

  signup() {

    if (this.signupForm.valid &&
      this.signupForm.value.name && this.signupForm.value.email &&
      this.signupForm.value.password && this.signupForm.value.agree) {

      this.authService.signup(this.signupForm.value.name, this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: (data: DefaultResponseType | AuthResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              this._snackBar.open((data as DefaultResponseType).message);
              throw new Error((data as DefaultResponseType).message);
            }

            this.authService.setTokens((data as AuthResponseType).accessToken, (data as AuthResponseType).refreshToken);
            this._snackBar.open('Вы успешно зарегистрировались');
            this.router.navigate(['/']);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error || errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка регистрации');
            }
          }
        })
    }
  }
}
