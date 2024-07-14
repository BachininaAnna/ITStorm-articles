import { Component } from '@angular/core';
import {CategoriesService} from "../../services/categories.service";
import {ServiceRequestType} from "../../../../types/service-request.type";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent{

  currentService: string = '';
  constructor(private categoriesService: CategoriesService) {
    this.categoriesService.currentService$
      .subscribe((typeService: string) => {
        this.currentService = typeService;
      })
  }

  getConsultation(){
    this.categoriesService.currentService$.next(ServiceRequestType.consultation);
  }
  scrollTo(tag: string) {
    location.href = tag;
  }
}
