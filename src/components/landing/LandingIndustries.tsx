import { ShoppingBag, Factory, Store, Package, Zap } from 'lucide-react';

const audiences = [
  { icon: ShoppingBag, text: 'D2C Brands shipping 500+ orders/month' },
  { icon: Factory, text: 'Manufacturers with distributor shipments' },
  { icon: Store, text: 'Retailers managing multi-location deliveries' },
  { icon: Package, text: 'Wholesalers with bulk dispatch operations' },
  { icon: Zap, text: 'Any business tired of courier billing games' },
];

export default function LandingIndustries() {
  return (
    <section
      aria-label="Who this is for"
      className="bg-background py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Built For Businesses Like Yours
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
            If you ship, you're being overcharged. Here's who we help the most.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-4">
          {audiences.map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/30 hover:shadow-card-hover"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-base font-medium text-foreground md:text-lg">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
