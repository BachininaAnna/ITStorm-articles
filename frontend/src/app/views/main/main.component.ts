import {Component, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ArticlesService} from "../../shared/services/articles.service";
import {ArticleType} from "../../../types/article.type";
import {CategoriesService} from "../../shared/services/categories.service";
import {ServiceRequestType} from "../../../types/service-request.type";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  customOptions: OwlOptions = {
    loop: true,
    autoplay: false,
    center: true,
    dots: true,
    autoHeight: false,
    autoWidth: false,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      1000: {
        items: 1,
      }
    }
  }

  reviewsOptions: OwlOptions = {
    loop: true,
    autoplay: false,
    center: true,
    autoHeight: true,
    autoWidth: true,
    items: 3,
    margin: 25,
  }

  services = [
    {
      image: 'service1.png',
      title: 'Создание сайтов',
      text: 'В краткие сроки мы создадим качественный ' +
        'самое главное продающий сайт для' +
        'продвижения Вашего бизнеса!',
      price: '7 500',
      type: 'Дизайн',
    },
    {
      image: 'service2.png',
      title: 'Продвижение',
      text: 'Вам нужен качественный ' +
        'SMM-специалист или грамотный таргетолог?' +
        ' Мы готовы оказать Вам услугу “Продвижения” на наивысшем уровне!',
      price: '3 500',
      type: 'SMM',
    },
    {
      image: 'service3.png',
      title: 'Реклама',
      text: 'Без рекламы не может обойтись ни один бизнес или специалист. Обращаясь к нам, мы гарантируем быстрый прирост клиентов за счёт правильно настроенной рекламы.',
      price: '1 000',
      type: 'Таргет',
    },
    {
      image: 'service4.png',
      title: 'Копирайтинг',
      text: 'Наши копирайтеры готовы написать Вам любые продающие текста, которые не только обеспечат рост охватов, но и помогут выйти на новый уровень в продажах.',
      price: '750',
      type: 'Копирайтинг',
    },
  ];

  topArticles: ArticleType[] = [];

  consultation = ServiceRequestType.consultation;

  constructor(private articlesService: ArticlesService,
              private categoriesService: CategoriesService) {
  }

  ngOnInit(): void {
    this.articlesService.getTopArticles()
      .subscribe((data: ArticleType[]) => {
        if ((data as ArticleType[]) === undefined) {
          throw new Error('cant get top articles');
        }
        this.topArticles = data;
      })
  }

  openServiceRequest(type: string) {
    this.categoriesService.currentService$.next(type);
  }
}
