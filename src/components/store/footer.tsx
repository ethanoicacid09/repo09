import Link from "next/link";

const footerLinks = {
  Shop: [
    { href: "/products", label: "All Products" },
    { href: "/products?category=herbal-teas", label: "Herbal Teas" },
    { href: "/products?category=yoga-essentials", label: "Yoga Essentials" },
    { href: "/products?category=supplements", label: "Supplements" },
  ],
  Learn: [
    { href: "#", label: "Herb Guide" },
    { href: "#", label: "Yoga Classes" },
    { href: "#", label: "Blog" },
    { href: "#", label: "Recipes" },
  ],
  Support: [
    { href: "#", label: "Contact" },
    { href: "#", label: "Shipping" },
    { href: "#", label: "Returns" },
    { href: "#", label: "FAQ" },
  ],
};

export function StoreFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              ZenHerb
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Premium herbs, herbal remedies, and yoga essentials for mindful living.
              Nurture your body and spirit.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t py-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} ZenHerb. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
