export default function LogoCloud() {
  const brands = ['Meesho', 'Lenskart', 'BoAt', 'Mamaearth', 'Sugar', 'Bewakoof'];

  return (
    <section className="border-y border-border/50 bg-muted/30 py-14">
      <div className="container mx-auto px-4">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by India's fastest-growing D2C brands
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {brands.map((brand) => (
            <div
              key={brand}
              className="flex h-10 items-center justify-center rounded-md px-5 text-sm font-bold tracking-wide text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
