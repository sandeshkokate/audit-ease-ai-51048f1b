import { useParams, Link } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SEOHead from '@/components/shared/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BlogCard from '@/components/blog/BlogCard';
import { blogPosts } from '@/data/blogPosts';
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <LandingNav />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
            <Link to="/blog" className="text-primary hover:underline text-sm">← Back to Blog</Link>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title={`${post.title} – AuditEase`} description={post.description} path={`/blog/${post.slug}`} />
      <LandingNav />

      <main className="flex-1 pt-24 pb-16">
        <article className="container mx-auto max-w-3xl px-4">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-10 space-y-4">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">{tag}</Badge>
              ))}
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none leading-relaxed text-muted-foreground [&_h2]:text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-foreground [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_ol]:mb-4 [&_li]:mb-1.5 [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA Banner */}
          <div className="mt-14 rounded-2xl gradient-primary p-8 md:p-10 text-center space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-primary-foreground">
              Stop overpaying your courier partners.
            </h2>
            <p className="text-primary-foreground/80 text-sm md:text-base">
              Try AuditEase — upload your CSV and see potential discrepancies in minutes.
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-card text-foreground hover:bg-card/90 gap-2 mt-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="container mx-auto max-w-3xl px-4 mt-16">
            <Separator className="mb-10" />
            <h2 className="text-2xl font-bold text-foreground mb-6">Read More</h2>
            <div className="space-y-6">
              {relatedPosts.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
