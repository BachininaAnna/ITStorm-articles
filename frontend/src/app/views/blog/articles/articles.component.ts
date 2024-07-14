import {Component, HostListener, OnInit} from '@angular/core';
import {ArticleType} from "../../../../types/article.type";
import {ArticlesService} from "../../../shared/services/articles.service";
import {CategoriesService} from "../../../shared/services/categories.service";
import {AllArticlesResponseType} from "../../../../types/all-articles-response.type";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {ServiceType} from "../../../../types/service.type";
import {ParamsType} from "../../../../types/params.type";
import {debounceTime} from "rxjs";
import {arrRemove} from "rxjs/internal/util/arrRemove";
import {LoaderService} from "../../../shared/services/loader.service";

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {

  openSorting: boolean = false;
  articles: ArticleType[] = [];
  services: ServiceType[] = [];
  searchParams: ParamsType = {page: 1, categories: []};
  pages: number[] = [];
  params: ParamsType | Params = this.activatedRoute.snapshot.queryParams;

  constructor(private articlesService: ArticlesService,
              private categoriesService: CategoriesService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private loaderService: LoaderService) {
  }

  ngOnInit(): void {
    this.router.navigate(['/articles'], {
      queryParams: this.searchParams
    })

    this.updateSearchParams();

    this.getCategories();

    this.activatedRoute.queryParams
      .pipe(
        debounceTime(500)
      )
      .subscribe((params: Params) => {
        this.getArticles();
      });
  }

  getCategories() {
    this.categoriesService.getCategories()
      .subscribe((data: ServiceType[]) => {
        this.services = data.map(service => {
          service.isApplied = !!(this.searchParams.categories?.find(url => url === service.url));
          return service;
        });
      });
  }

  getArticles() {
    this.loaderService.show();
    this.articlesService.getArticles(this.searchParams)
      .subscribe((data: AllArticlesResponseType) => {
        if (data.count && this.searchParams.page && data.pages < this.searchParams.page) {
          this.searchParams.page = 1;
          this.router.navigate(['/articles'], {
            queryParams: this.searchParams
          })
        }
        this.articles = data.items;
        this.loaderService.hide();
        if (data.pages) {
          this.pages = [];
          for (let i = 1; i <= data.pages; i++) {
            this.pages.push(i);
          }
        }
      });
  }

  updateSearchParams() {
    if (this.params.hasOwnProperty('page')) {
      this.searchParams.page = +this.params.page;
    }
    if (this.params.hasOwnProperty('categories')) {
      this.searchParams.categories = Array.isArray(this.params['categories']) ? this.params['categories'] : [this.params['categories']]
      this.openSorting = true;
    } else {
      this.openSorting = false;
    }
  }

  sort(service: ServiceType) {
    service.isApplied = !service.isApplied;

    if (this.searchParams.categories?.includes(service.url) && !service.isApplied) {
      arrRemove(this.searchParams.categories, service.url);
    }
    if (service.isApplied) {
      this.searchParams.categories?.push(service.url);
    }
    this.router.navigate(['/articles'], {
      queryParams: this.searchParams
    })
  }

  openPage(page: number) {
    this.searchParams.page = page;
    this.router.navigate(['/articles'], {
      queryParams: this.searchParams
    })
  }

  openPrevPage() {
    if (this.searchParams.page && this.searchParams.page !== 1) {
      this.searchParams.page--;
    }
    this.router.navigate(['/articles'], {
      queryParams: this.searchParams
    })
  }

  openNextPage() {
    if (this.searchParams.page && this.searchParams.page !== this.pages.length) {
      this.searchParams.page++;
    }
    this.router.navigate(['/articles'], {
      queryParams: this.searchParams
    })
  }

  @HostListener('document:click', ['$event'])
  click(event: Event) {
    const elem = (event.target as HTMLElement);
    if (this.openSorting && !elem.hasAttribute("fill")) {
      if (!elem.className.includes('articles-sorting') && !elem.className.includes('articles-applied')) {
        this.openSorting = false;
      }
    }

  }
}
