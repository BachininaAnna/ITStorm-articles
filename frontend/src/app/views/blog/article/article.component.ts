import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ArticlesService} from "../../../shared/services/articles.service";
import {ArticleFullDataType} from "../../../../types/article-full-data.type";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {ArticleType} from "../../../../types/article.type";
import {CommentType} from "../../../../types/comment.type";
import {CommentsService} from "../../../shared/services/comments.service";
import {CommentsParamsType} from "../../../../types/commentsParams.type";
import {HttpParams} from "@angular/common/http";
import {AuthService} from "../../../core/auth/auth.service";
import {LoaderService} from "../../../shared/services/loader.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActionType} from "../../../../types/action.type";
import {throwError} from "rxjs";
import {ReactionOfCommentType} from "../../../../types/reaction-of-comment.type";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [`h3 {
    color: #709FDC;
    margin: 20px 0;
    font-size: 20px;
    font-weight: 500
  }

  h1, h1 + p {
    display: none;
  }

  p {
    padding-bottom: 20px;
  }`]
})
export class ArticleComponent implements OnInit {

  article: ArticleFullDataType | null = null;
  relatedArticles: ArticleType[] = [];
  comments: CommentType[] = [];
  pathImage = environment.serverStaticPathImage;
  url: string = '';
  textComment: string = '';
  commentsParams: CommentsParamsType = {
    offset: 3,
    article: ''
  }
  allViews: boolean = false;
  isLogged: boolean = false;
  action = ActionType;

  constructor(private articlesService: ArticlesService,
              private activatedRoute: ActivatedRoute,
              private commentsService: CommentsService,
              private authService: AuthService,
              private loaderService: LoaderService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.isLogged = this.authService.getLoggedIn();

    this.activatedRoute.params
      .subscribe(params => {
        this.allViews = false;
        this.commentsParams.offset = 3;
        this.comments = [];

        if (params['url']) {
          this.url = params['url'];

          this.articlesService.getArticle(this.url)
            .subscribe((data: ArticleFullDataType) => {
              this.article = data;
              this.commentsParams.article = data.id
              if (data.commentsCount) {
                this.comments = data.comments;
                if (this.isLogged) {
                  this.getArticleCommentActions();
                }
              }
              if (data.commentsCount <= this.comments.length) {
                this.allViews = true;
              }
            });

          this.articlesService.getRelatedArticles(this.url)
            .subscribe((data: ArticleType[]) => {
              this.relatedArticles = data;
            });
        }
      })
  }

  getComments() {
    this.loaderService.show();
    this.allViews = true;

    const httpParams = new HttpParams({fromObject: this.commentsParams});
    this.commentsService.getComments(httpParams)
      .subscribe((data: { "allCount": number, "comments": CommentType[] }) => {
        data.comments.forEach((comment: CommentType) => {
          this.comments.push(comment);
        })
        if (data.allCount > this.comments.length) {
          this.allViews = false;
        }
        if(this.isLogged){
          this.getArticleCommentActions();
        }
        this.loaderService.hide();
      })
  }

  loadSomeComments() {
    if (this.comments.length === 3) {
      this.getComments();
    } else {
      this.commentsParams.offset += 10;
      this.getComments();
    }
  }

  addComment() {
    this.commentsService.addComment(this.textComment, this.commentsParams.article)
      .subscribe((data: DefaultResponseType) => {
        this._snackBar.open(data.message);
        if (!data.error) {
          this.textComment = '';
          this.getComments();
        }
      })
  }

  applyAction(action: string, id: string) {
    if (this.isLogged) {
      this.commentsService.applyAction(action, id)
        .subscribe({
          next: (data: DefaultResponseType) => {

            if (action !== this.action.violate) {
              this._snackBar.open('Ваш голос учтен');
              this.getReactionsOfComment(id);
            }
            if (action === this.action.violate) {
              this._snackBar.open('Жалоба отправлена');
            }
          },
          error: (error) => {
            if (error.status === 400) {
              this._snackBar.open('Жалоба уже отправлена');
              return throwError(() => new Error(error));
            }
            return throwError(() => error);
          }
        })
    } else {
      this._snackBar.open('Чтобы оставлять реакции необходимо зарегистрироваться');
    }
  }

  getReactionsOfComment(id: string) {
    this.commentsService.getReactionsOfComment(id)
      .subscribe((data: DefaultResponseType | ReactionOfCommentType[]) => {
        if ((data as DefaultResponseType).error) {
          this._snackBar.open('Ошибка загрузки реакций на комментарии');
          return;
        }
        const response = (data as ReactionOfCommentType[])[0];
        const desiredComment = this.comments.find(comment => comment.id === id);
        if (desiredComment) {
          if (desiredComment.likeApplied && (!response || response?.action === this.action.dislike)) {
            desiredComment.likeApplied = false;
            desiredComment.likesCount = (desiredComment.likesCount > 0) ? (desiredComment.likesCount - 1) : 0;
          }
          if (desiredComment.dislikeApplied && (!response || response?.action === this.action.like)) {
            desiredComment.dislikeApplied = false;
            desiredComment.dislikesCount = (desiredComment.dislikesCount > 0) ? (desiredComment.dislikesCount - 1) : 0;
          }
          if (response?.action === this.action.dislike) {
            desiredComment.dislikeApplied = true;
            desiredComment.dislikesCount += 1;
          }
          if (response?.action === this.action.like) {
            desiredComment.likeApplied = true;
            desiredComment.likesCount += 1;
          }
        }
      })
  }

  getArticleCommentActions() {
    const httpParams = new HttpParams({fromObject: {articleId: this.commentsParams.article}});
    this.commentsService.getArticleCommentActions(httpParams)
      .subscribe((data: DefaultResponseType | ReactionOfCommentType[]) => {
        if ((data as DefaultResponseType).error) {
          this._snackBar.open('Ошибка загрузки реакций на комментарии');
        }

        if (data as ReactionOfCommentType[]) {
          this.comments.map((comment: CommentType) => {
            const desiredComment = (data as ReactionOfCommentType[]).find(item => item.comment === comment.id);
            comment.likeApplied = (desiredComment?.action === 'like');
            comment.dislikeApplied = (desiredComment?.action === 'dislike');
            return comment;
          })
        }
      })
  }
}

