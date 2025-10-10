import Article from "@/components/Articles/Article";
import ArticleGroupScreen from "@/components/Articles/articleGroup/ArticleGroupScreen";
import ArticleScreen from "@/screens/ArticleScreen";

export const stacks = [
  {
    name: "Articles",
    component: ArticleScreen,
  },
  {
    name: "ArticleGroup",
    component: ArticleGroupScreen,
  },
  {
    name: "ViewArticle",
    component: Article,
  },
];
