import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {CategoriesService} from "../services/categories.service";
import {ServiceType} from "../../../types/service.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RequestService} from "../services/request.service";
import {RequestType} from "../../../types/request.type";
import {ServiceRequestType} from "../../../types/service-request.type";

@Component({
  selector: 'service-request',
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.scss']
})
export class ServiceRequestComponent implements OnInit {
  @Input() currentService!: string;
  obj: RequestType = {
    name: '',
    phone: '',
    type: ServiceRequestType.order,
  }
  services: ServiceType[] = [];
  serviceRequestForm = this.fb.group({
    service: [''],
    name: ['', [Validators.required, Validators.pattern(/[A-ЯЁ][а-яё]{1,15}/)]],
    phone: ['', [Validators.required,
      Validators.pattern(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/)]],
  })
  isShowThanksInfo: boolean = false;
  isItConsultation: boolean = false;

  constructor(private fb: FormBuilder,
              private _snackBar: MatSnackBar,
              private categoriesService: CategoriesService,
              private requestService: RequestService) {
  }

  ngOnInit(): void {
    this.categoriesService.getCategories()
      .subscribe((data: ServiceType[]) => {
        if (!data) {
          this._snackBar.open('Ошибка получения категорий услуг');
          throw new Error('Ошибка получения категорий услуг');
        }
        this.services = data;
      })
    if (this.currentService === ServiceRequestType.consultation) {
      this.isItConsultation = true;
    }
  }

  getField(field: string) {
    return this.serviceRequestForm.get(field)?.value
  }

  checkField(field: string) {
    return this.serviceRequestForm.get(field)?.invalid
      && (this.serviceRequestForm.get(field)?.dirty || this.serviceRequestForm.get(field)?.touched);
  }

  serviceRequest() {
    if (this.serviceRequestForm.valid
      && this.serviceRequestForm.value.name
      && this.serviceRequestForm.value.phone) {

      if (this.currentService === ServiceRequestType.consultation) {
        this.obj.type = ServiceRequestType.consultation;

      } else if (this.getField('service')) {
        this.obj.service = <string>this.getField('service');
      } else if (this.currentService) {
        this.obj.service = this.currentService;
      }


      if (this.getField('name')) {
        this.obj.name = <string>this.getField('name');
      }
      if (this.getField('phone')) {
        this.obj.phone = <string>this.getField('phone');
      }


      this.requestService.newRequest(this.obj)
        .subscribe((data: DefaultResponseType) => {
          if (data.error === undefined) {
            this._snackBar.open('Ошибка отправки запроса на получение услуги. Попробуйте позже');
            throw new Error('Ошибка отправки запроса на получение услуги');
          }
          if (data.error) {
            this._snackBar.open(data.message);
          }
          if (!data.error) {
            this.isShowThanksInfo = true;
            this.isItConsultation = false;
          }
        })
    }


  }

  closeServiceRequest() {
    this.categoriesService.currentService$.next('');
    this.currentService = '';
    this.isShowThanksInfo = false;
  }
}
