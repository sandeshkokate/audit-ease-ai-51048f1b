import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SEOHead from '@/components/shared/SEOHead';
import BlogCard from '@/components/blog/BlogCard';
import { blogPosts } from '@/data/blogPosts';
import { BookOpen } from 'lucide-react';

export default function Blog() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Blog – AuditEase AI | Courier Audit Insights"
        description="Tips, guides, and insights on courier billing audits, shipping cost optimisation, and e-commerce logistics in India."
        path="/blog"
      />
      <LandingNav />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto max-w-3xl px-4">
          <header className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Blog</h1>
            <p className="mt-2 text-muted-foreground">
              Courier audit insights for Indian e-commerce
            </p>
          </header>

          {blogPosts.length > 0 ? (
            <div className="space-y-6">
              {blogPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground">Articles coming soon. Stay tuned!</p>
            </div>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
