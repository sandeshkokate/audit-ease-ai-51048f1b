import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Package, ShoppingBag, Store, Truck, Building2, Boxes, CreditCard, Landmark, ArrowRight,
} from 'lucide-react';

const businessTypes = [
  {
    icon: ShoppingBag,
    name: 'D2C Brands',
    description: 'Fashion, beauty, electronics & lifestyle brands shipping products directly to customers',
    volume: '500–5,000 shipments/month',
  },
  {
    icon: Store,
    name: 'Marketplace Sellers',
    description: 'Sellers on major Indian marketplaces losing money on weight & zone overcharges',
    volume: 'FBA, FBF & self-ship sellers',
  },
  {
    icon: Package,
    name: 'Shopify & WooCommerce Stores',
    description: 'Independent online stores using shipping aggregators or direct courier contracts',
    volume: '₹10L–10Cr monthly GMV',
  },
  {
    icon: Landmark,
    name: 'Banks & NBFCs',
    description: 'Financial institutions shipping debit/credit cards, checkbooks, loan documents & welcome kits',
    volume: 'High-volume card & document delivery',
  },
  {
    icon: CreditCard,
    name: 'Insurance & Fintech',
    description: 'Policy documents, physical cards, POS devices & account statements shipped pan-India',
    volume: 'Bulk document dispatch',
  },
  {
    icon: Boxes,
    name: 'E-commerce Aggregators',
    description: 'Multi-brand sellers & distributors managing high shipment volumes across categories',
    volume: '10,000+ shipments/month',
  },
  {
    icon: Truck,
    name: '3PL & Fulfillment Centers',
    description: 'Warehousing & logistics providers who bill clients for shipping and need accurate reconciliation',
    volume: 'Multi-client operations',
  },
  {
    icon: Building2,
    name: 'SME Manufacturers',
    description: 'B2B2C manufacturers shipping directly to retailers or end consumers across India',
    volume: 'Pan-India distribution',
  },
];

export default function BuiltForSection() {
  return (
    <section aria-label="Who we help" className="bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Who We Help
          </div>
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Built for Businesses Losing Money on Shipping
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-lg">
            Whether you ship products, documents, or cards — if you're using Delhivery, BlueDart, DTDC,
            India Post, or any major courier, you're likely overpaying by 8–15%.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {businessTypes.map((biz) => (
            <div
              key={biz.name}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <biz.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold text-foreground">{biz.name}</h3>
              <p className="mb-3 flex-1 text-sm leading-relaxed text-muted-foreground">{biz.description}</p>
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {biz.volume}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-muted-foreground">
            Not sure if AuditEase is right for you?
          </p>
          <Link to="/contact">
            <Button variant="hero-outline" size="lg" className="gap-2 shimmer-btn">
              Get a free audit assessment <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
