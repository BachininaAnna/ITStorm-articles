import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, Observable, of, tap} from "rxjs";
import {environment} from "../../../environments/environment";
import {CommentType} from "../../../types/comment.type";
import {Params} from "@angular/router";
import {DefaultResponseType} from "../../../types/default-response.type";
import {ReactionOfCommentType} from "../../../types/reaction-of-comment.type";

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(private http: HttpClient) {
  }

  getComments(params: Params): Observable<{ "allCount": number, "comments": CommentType[] }> {
    return this.http.get<{ "allCount": number, "comments": CommentType[] }>
    (environment.api + 'comments', {params: params});
  }

  addComment(text: string, articleId: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'comments',
      {text: text, article: articleId});
  }

  applyAction(action: string, id: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'comments/' + id + '/apply-action',
      {action: action});
  }

  getReactionsOfComment(id: string): Observable<DefaultResponseType | ReactionOfCommentType[]> {
    return this.http.get<DefaultResponseType | ReactionOfCommentType[]>
    (environment.api + 'comments/' + id + '/actions');
  }

  getArticleCommentActions(params: Params): Observable<DefaultResponseType | ReactionOfCommentType[]> {
    return this.http.get<DefaultResponseType | ReactionOfCommentType[]>
    (environment.api + 'comments/article-comment-actions', {params: params});
  }

}
