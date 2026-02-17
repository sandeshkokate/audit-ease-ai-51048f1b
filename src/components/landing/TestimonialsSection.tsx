import { Star, TrendingUp } from 'lucide-react';

const testimonials = [
  {
    quote: 'We recovered ₹8.2 lakhs in the first quarter. AuditEase paid for itself 10x over.',
    author: 'Rahul Sharma',
    role: 'Founder, StyleKart',
    metric: '₹8.2L recovered',
  },
  {
    quote: 'The AI-generated emails are so good, couriers respond within 48 hours now.',
    author: 'Priya Patel',
    role: 'Operations Head, FreshBox',
    metric: '48hr avg response',
  },
  {
    quote: 'Finally, a tool that understands Indian courier billing complexity.',
    author: 'Amit Kumar',
    role: 'CEO, GadgetStore',
    metric: '15% error rate found',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="border-y border-border/50 bg-muted/30 py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
            Loved by D2C Brands Across <span className="text-gradient">India</span>
          </h2>
          <p className="text-muted-foreground md:text-lg">See what our customers have to say</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="group rounded-2xl border border-border/60 bg-card p-8 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              {/* Stars */}
              <div className="mb-5 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>

              {/* Quote */}
              <p className="mb-6 text-sm leading-relaxed text-foreground">"{t.quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>

              {/* Metric badge */}
              <div className="mt-5 pt-5 border-t border-border/50">
                <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  <TrendingUp className="h-3 w-3" />
                  {t.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
