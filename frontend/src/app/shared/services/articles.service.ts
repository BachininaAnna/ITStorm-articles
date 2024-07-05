import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ArticleType} from "../../../types/article.type";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {AllArticlesResponseType} from "../../../types/all-articles-response.type";
import {ParamsType} from "../../../types/params.type";
import {ArticleFullDataType} from "../../../types/article-full-data.type";

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private http: HttpClient) {
  }

  getTopArticles(): Observable<ArticleType[]> {
    return this.http.get<ArticleType[]>(environment.api + 'articles/top');
  }

  getArticles(params: ParamsType): Observable<AllArticlesResponseType> {
    return this.http.get<AllArticlesResponseType>(environment.api + 'articles', {params: params});
  }
  getRelatedArticles(url: string): Observable<ArticleType[]> {
    return this.http.get<ArticleType[]>(environment.api + 'articles/related/' + url);
  }
  getArticle(url: string): Observable<ArticleFullDataType> {
    return this.http.get<ArticleFullDataType>(environment.api + 'articles/' + url);
  }
}
