import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {ArticleCardComponent} from './article-card/article-card.component';
import {ServiceRequestComponent} from './service-request/service-request.component';
import {ReactiveFormsModule} from "@angular/forms";
import { LoaderComponent } from './loader/loader.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@NgModule({
  declarations: [
    ArticleCardComponent,
    ServiceRequestComponent,
    LoaderComponent
  ],
  exports: [
    ArticleCardComponent,
    ServiceRequestComponent,
    LoaderComponent
  ],
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule
    ]
})
export class SharedModule {
}
