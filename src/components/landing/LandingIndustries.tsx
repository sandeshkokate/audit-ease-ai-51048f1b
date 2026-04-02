import {
  ShoppingBag,
  Smartphone,
  Sparkles,
  Home,
  Heart,
  Gem,
  PawPrint,
  Warehouse,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface IndustryCard {
  icon: LucideIcon;
  title: string;
  painPoint: string;
  stat: string;
  badge?: string;
}

const industries: IndustryCard[] = [
  {
    icon: ShoppingBag,
    title: 'Fashion & Apparel',
    painPoint: 'High RTO rates mean double shipping costs',
    stat: 'Recover up to 15% of shipping costs',
    badge: 'Most Popular',
  },
  {
    icon: Smartphone,
    title: 'Electronics & Gadgets',
    painPoint: 'Zone billing errors on high-value shipments',
    stat: 'Average ₹50-100 recovery per shipment',
  },
  {
    icon: Sparkles,
    title: 'Beauty & Personal Care',
    painPoint: 'Volumetric weight manipulation by couriers',
    stat: 'Detect 90%+ weight discrepancies',
  },
  {
    icon: Home,
    title: 'Home & Kitchen',
    painPoint: 'Heavy items with inflated weight charges',
    stat: 'Audit every bulky shipment',
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    painPoint: 'Thin margins need cost optimization',
    stat: 'Improve margins by 2-3%',
  },
  {
    icon: Gem,
    title: 'Jewellery & Accessories',
    painPoint: 'Small parcels billed at wrong slabs',
    stat: 'Verify every weight slab',
  },
  {
    icon: PawPrint,
    title: 'Pet Products',
    painPoint: 'Growing D2C segment, often overpaying',
    stat: 'Save 10+ hours/week on disputes',
  },
  {
    icon: Warehouse,
    title: '3PL & Fulfillment',
    painPoint: 'Audit multiple clients from one dashboard',
    stat: 'Multi-tenant support',
  },
];

export default function LandingIndustries() {
  return (
    <section
      aria-label="Industries we serve"
      className="bg-background py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Trusted by Leading D2C Brands Across India
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-lg">
            AuditEase helps e-commerce businesses across every category recover shipping overcharges
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-5 md:grid-cols-4">
          {industries.map((card) => (
            <div
              key={card.title}
              className="group relative rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:scale-105 hover:shadow-elevated"
            >
              {card.badge && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {card.badge}
                </span>
              )}
              <card.icon className="mb-3 h-8 w-8 text-primary" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.painPoint}</p>
              <p className="mt-2 text-sm font-medium text-primary">
                {card.stat}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}