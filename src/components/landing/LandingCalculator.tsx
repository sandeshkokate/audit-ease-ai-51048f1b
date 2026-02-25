import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, Sparkles } from 'lucide-react';

export default function LandingCalculator() {
  const [monthlyShipments, setMonthlyShipments] = useState(5000);
  const [avgShippingCost, setAvgShippingCost] = useState(80);

  const industryErrorRate = 0.12;
  const avgOverchargePercent = 0.15;
  const estimatedErrors = Math.round(monthlyShipments * industryErrorRate);
  const potentialOvercharge = Math.round(estimatedErrors * avgShippingCost * avgOverchargePercent);
  const annualPotential = potentialOvercharge * 12;

  const formatCurrency = (amount: number) =>
    amount >= 100000 ? `₹${(amount / 100000).toFixed(1)}L` : `₹${amount.toLocaleString('en-IN')}`;

  return (
    <section id="calculator" className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Calculator className="h-3.5 w-3.5" /> Savings Calculator
          </div>
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Estimate Your Potential Recovery</h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">Based on publicly available industry averages — not our own claims</p>
        </div>

        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="border-b border-border p-6 md:border-b-0 md:border-r md:p-8">
              <h3 className="mb-6 font-semibold text-foreground">Your Shipping Volume</h3>
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Monthly Shipments</label>
                  <span className="text-sm font-bold text-primary">{monthlyShipments.toLocaleString()}</span>
                </div>
                <input type="range" min="500" max="50000" step="500" value={monthlyShipments} onChange={(e) => setMonthlyShipments(Number(e.target.value))} className="w-full h-2 rounded-lg bg-muted accent-primary cursor-pointer" />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>500</span><span>25,000</span><span>50,000</span></div>
              </div>
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Avg. Shipping Cost (₹)</label>
                  <span className="text-sm font-bold text-primary">₹{avgShippingCost}</span>
                </div>
                <input type="range" min="30" max="200" step="5" value={avgShippingCost} onChange={(e) => setAvgShippingCost(Number(e.target.value))} className="w-full h-2 rounded-lg bg-muted accent-primary cursor-pointer" />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>₹30</span><span>₹100</span><span>₹200</span></div>
              </div>
              <div className="rounded-xl bg-muted/50 border border-border p-4 text-xs text-muted-foreground">
                <div className="mb-1 font-semibold text-foreground">How this is calculated:</div>
                <ul className="space-y-0.5">
                  <li>• Industry avg. error rate: ~12%</li>
                  <li>• Avg. overcharge per error: ~15%</li>
                  <li>• These figures are industry estimates, not our guarantees</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Estimated Potential Recovery</h3>
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Monthly Potential</div>
                  <div className="text-2xl font-extrabold text-gradient">{formatCurrency(potentialOvercharge)}</div>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Annual Potential</div>
                  <div className="text-2xl font-extrabold text-gradient">{formatCurrency(annualPotential)}</div>
                </div>
              </div>
              <div className="mb-6 space-y-2 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Est. errors/month</span>
                  <span className="font-semibold text-foreground">~{estimatedErrors.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. overcharge per error</span>
                  <span className="font-semibold text-foreground">~₹{Math.round(avgShippingCost * avgOverchargePercent)}</span>
                </div>
              </div>
              <Link to="/contact">
                <Button variant="hero" className="w-full gap-2 shadow-button">
                  Get Detailed Analysis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="mt-2 text-center text-xs text-muted-foreground">Free analysis • No commitment required</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
