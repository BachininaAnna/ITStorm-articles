import {Component} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {AuthResponseType} from "../../../../types/auth-response.type";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../user.component.scss']
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', Validators.required],
    rememberMe: [false]
  })

  constructor(private fb: FormBuilder,
              private _snackBar: MatSnackBar,
              private authService: AuthService,
              private router: Router) {
  }

  checkField(field: string) {
    return this.loginForm.get(field)?.invalid
      && (this.loginForm.get(field)?.dirty || this.loginForm.get(field)?.touched)
  }

  login() {
    if (this.loginForm.valid && this.loginForm.value.email && this.loginForm.value.password) {

      this.authService.login(this.loginForm.value.email, this.loginForm.value.password, !!this.loginForm.value.rememberMe)
        .subscribe({
          next: (data: DefaultResponseType | AuthResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              this._snackBar.open((data as DefaultResponseType).message);
              throw new Error((data as DefaultResponseType).message);
            }

            this.authService.setTokens((data as AuthResponseType).accessToken, (data as AuthResponseType).refreshToken);
            this._snackBar.open('Вы успешно авторизовались');
            this.router.navigate(['/']);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error || errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка авторизации');
            }
          }
        })


    }
  }

}
