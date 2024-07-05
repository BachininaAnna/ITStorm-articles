import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, Subject, throwError} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";
import {AuthResponseType} from "../../../types/auth-response.type";
import {environment} from "../../../environments/environment";
import {UserType} from "../../../types/user.type";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public accessTokenKey = 'accessToken';
  public refreshTokenKey = 'refreshToken';
  public userIdKey = 'userId';

  public isLogged$: Subject<boolean> = new Subject<boolean>();
  private isLogged: boolean = false;

  constructor(private http: HttpClient) {
    this.isLogged = !!localStorage.getItem(this.accessTokenKey);
  }


  signup(name: string, email: string, password: string): Observable<DefaultResponseType | AuthResponseType> {
    return this.http.post<DefaultResponseType | AuthResponseType>(environment.api + 'signup', {
      name, email, password
    })
  }

  login(email: string, password: string, rememberMe: boolean): Observable<DefaultResponseType | AuthResponseType> {
    return this.http.post<DefaultResponseType | AuthResponseType>(environment.api + 'login', {
      email, password, rememberMe
    })
  }

  refresh(): Observable<DefaultResponseType | AuthResponseType> {
    const tokens = this.getTokens();
    if (tokens && tokens.refreshToken) {
      return this.http.post<DefaultResponseType | AuthResponseType>(environment.api + 'refresh', {
        refreshToken: tokens.refreshToken
      })
    }
    throw throwError(() => 'Can not use token');
  }

  logout(): Observable<DefaultResponseType> {
    const tokens = this.getTokens();
    if (tokens && tokens.refreshToken) {
      return this.http.post<DefaultResponseType>(environment.api + 'logout', {
        refreshToken: tokens.refreshToken
      })
    }
    throw throwError(() => 'Can not find token');
  }


  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLogged = true;
    this.isLogged$.next(true);
  }

  public getTokens(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey),
    }
  }

  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLogged = false;
    this.isLogged$.next(false);
  }

  public getLoggedIn() {
    return this.isLogged;
  }

  // @ts-ignore
  getUserInfo(): Observable<UserType | DefaultResponseType> {
    const tokens = this.getTokens();
    if (tokens && tokens.accessToken) {
      return this.http.get<UserType | DefaultResponseType>(environment.api + 'users',
        {
          headers: {
            ['x-auth']: tokens.accessToken
          }
        });
    }
  }

}
