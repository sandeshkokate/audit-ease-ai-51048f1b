import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RoiCalculator() {
  const [shipments, setShipments] = useState(10000);
  const [avgValue, setAvgValue] = useState(500);

  const results = useMemo(() => {
    const errorRate = 0.15;
    const avgOvercharge = avgValue * 0.05; // ~5% of order value
    const discrepancies = Math.round(shipments * errorRate);
    const recoveryRate = 0.85;
    const monthlyRecovery = Math.round(discrepancies * avgOvercharge * recoveryRate);
    return { discrepancies, avgOvercharge: Math.round(avgOvercharge), recoveryRate, monthlyRecovery };
  }, [shipments, avgValue]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <section className="section-dark py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="container relative mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold section-dark-text md:text-5xl">
            Calculate Your <span className="text-gradient">Potential Savings</span>
          </h2>
          <p className="section-dark-muted md:text-lg">See how much you could recover with AuditEase AI</p>
        </div>

        <div className="mx-auto max-w-4xl rounded-2xl section-dark-card border p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2">
            {/* Inputs */}
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold section-dark-text mb-3">
                  Monthly Shipments: <span className="text-primary">{shipments.toLocaleString('en-IN')}</span>
                </label>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={shipments}
                  onChange={(e) => setShipments(Number(e.target.value))}
                  className="w-full accent-primary h-2 rounded-full appearance-none bg-[hsl(var(--section-dark-border))] cursor-pointer"
                />
                <div className="mt-2 flex justify-between text-xs section-dark-muted">
                  <span>1,000</span>
                  <span>50,000</span>
                  <span>1,00,000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold section-dark-text mb-3">
                  Average Order Value: <span className="text-primary">{formatCurrency(avgValue)}</span>
                </label>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={50}
                  value={avgValue}
                  onChange={(e) => setAvgValue(Number(e.target.value))}
                  className="w-full accent-primary h-2 rounded-full appearance-none bg-[hsl(var(--section-dark-border))] cursor-pointer"
                />
                <div className="mt-2 flex justify-between text-xs section-dark-muted">
                  <span>₹100</span>
                  <span>₹2,500</span>
                  <span>₹5,000</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-6">
              <div className="text-sm font-semibold section-dark-muted mb-2">Estimated Monthly Recovery</div>
              <div className="text-4xl font-extrabold text-gradient mb-6">{formatCurrency(results.monthlyRecovery)}</div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="section-dark-muted">Discrepancies found</span>
                  <span className="font-semibold section-dark-text">~{results.discrepancies.toLocaleString('en-IN')} orders</span>
                </div>
                <div className="flex justify-between">
                  <span className="section-dark-muted">Avg. overcharge</span>
                  <span className="font-semibold section-dark-text">{formatCurrency(results.avgOvercharge)}/order</span>
                </div>
                <div className="flex justify-between">
                  <span className="section-dark-muted">Recovery rate</span>
                  <span className="font-semibold section-dark-text">85%</span>
                </div>
              </div>

              <Link to="/contact" className="mt-6 block">
                <Button variant="hero" className="w-full gap-2 font-semibold">
                  Get Detailed Analysis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
