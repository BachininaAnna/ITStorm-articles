import {ArticleType} from "./article.type";

export type AllArticlesResponseType = {
  count: number,
  pages: number,
  items: ArticleType[]
}
