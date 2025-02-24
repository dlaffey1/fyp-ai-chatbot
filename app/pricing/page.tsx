// components/pricing.tsx
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react"; // Using a money icon as an example
import Link from "next/link";

type Plan = {
  name: string;
  icon?: React.ReactNode;
  description: string;
  price: number;
  priceNote: string;
  cta: {
    variant: "default" | "secondary"; // Updated allowed variants
    label: string;
    href: string;
  };
  features: string[];
  featured: boolean;
  classes?: string;
};

const plans: Plan[] = [
  {
    name: "Basic Medical Tool",
    icon: <DollarSign className="h-4 w-4" />,
    description:
      "For users with lighter usage. This plan uses GPT-3 tokens and includes a limited number of requests per month.",
    price: 29,
    priceNote: "Limited to 1,000 requests/month.",
    cta: {
      variant: "default",
      label: "Choose Basic",
      href: "/signup?plan=basic", // Adjust route as needed
    },
    features: [
      "Up to 1,000 requests per month",
      "Powered by GPT-3 tokens",
      "Basic support and updates",
    ],
    featured: false,
    classes: "",
  },
  {
    name: "Advanced Medical Tool",
    icon: <DollarSign className="h-4 w-4" />,
    description:
      "For heavy users and professionals. This plan uses GPT-3.5 tokens and allows a higher number of requests with enhanced performance.",
    price: 99,
    priceNote: "Unlimited requests with priority support.",
    cta: {
      variant: "secondary", // Changed from "glow" to "secondary"
      label: "Choose Advanced",
      href: "/signup?plan=advanced", // Adjust route as needed
    },
    features: [
      "Unlimited requests",
      "Powered by GPT-3.5 tokens",
      "Priority support and regular updates",
    ],
    featured: true,
    classes:
      "after:content-[''] after:absolute after:-top-[128px] after:left-1/2 after:h-[128px] after:w-full after:max-w-[960px] after:-translate-x-1/2 after:rounded-full after:bg-brand-foreground/70 after:blur-[72px]",
  },
];

export default function Pricing() {
  return (
    <Section>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4 px-4 text-center sm:gap-8">
          <h2 className="text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">
            Choose the Right Plan for Your Medical Tool
          </h2>
          <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl">
            Compare our plans and select the option that fits your needs. Whether you need fewer requests powered by GPT‑3 or unlimited access with GPT‑3.5, we’ve got you covered.
          </p>
        </div>
        <div className="mx-auto grid max-w-container grid-cols-1 gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex max-w-container flex-col gap-6 overflow-hidden rounded-2xl p-8 shadow-xl",
                plan.classes
              )}
            >
              <hr
                className={cn(
                  "absolute left-[10%] top-0 h-[1px] w-[80%] border-0 bg-gradient-to-r from-transparent via-foreground/60 to-transparent",
                  plan.featured && "via-brand"
                )}
              />
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-2">
                  <h2 className="flex items-center gap-2 font-bold">
                    {plan.icon && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {plan.icon}
                      </div>
                    )}
                    {plan.name}
                  </h2>
                  <p className="max-w-[220px] text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 lg:flex-col lg:items-start xl:flex-row xl:items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-muted-foreground">
                      $
                    </span>
                    <span className="text-6xl font-bold">{plan.price}</span>
                  </div>
                  <div className="flex min-h-[40px] flex-col">
                    {plan.price > 0 && (
                      <>
                        <span className="text-sm">
                          {plan.priceNote}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button variant={plan.cta.variant} size="lg" asChild>
                  <Link href={plan.cta.href}>{plan.cta.label}</Link>
                </Button>
                <hr className="border-input" />
              </div>
              <div>
                <ul className="flex flex-col gap-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
