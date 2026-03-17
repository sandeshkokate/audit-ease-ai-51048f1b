export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  author: string;
  tags: string[];
  readingTime: string;
}

export const blogPosts: BlogPost[] = [];
