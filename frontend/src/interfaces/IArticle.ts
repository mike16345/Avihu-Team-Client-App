export interface ILessonGroup {
  _id: string;
  name: string;
  description?: string;
}

export interface IArticleCount {
  id: string;
  name: string;
  count: number;
  description?: string;
}

export interface IArticle {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  date: Date;
  group: ILessonGroup;
  planType?: string;
  link?: string;
  views: string[];
  likes: string[];
}
