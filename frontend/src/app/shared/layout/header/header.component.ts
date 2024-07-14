import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {UserType} from "../../../../types/user.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLogged: boolean = false;
  user: UserType | null = null;

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router) {
  }

  ngOnInit(): void {
    this.authServiceIsLogged$();
    if (this.authService.getLoggedIn()) {
      this.isLogged = this.authService.getLoggedIn();
      this.setUserName();
    }
  }

  authServiceIsLogged$() {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
      this.setUserName();
    })
  }

  setUserName() {
    this.authService.getUserInfo()
      .subscribe((data) => {
        if ((data as UserType) === undefined) {
          throw new Error('cant get user info');
        }
        this.user = (data as UserType);
      })
  }

  logout() {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      })
  }

  doLogout(): void {
    this.authService.removeTokens();
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/login']);
  }

  scrollTo(tag: string) {
    location.href = tag;
  }
}
