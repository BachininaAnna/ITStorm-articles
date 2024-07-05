import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, Subject} from "rxjs";
import {environment} from "../../../environments/environment";
import {ServiceType} from "../../../types/service.type";

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  currentService$: Subject<string> = new Subject<string>();
  constructor(private http: HttpClient) { }
  getCategories(): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(environment.api + 'categories');
  }
}
