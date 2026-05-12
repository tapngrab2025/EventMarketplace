import {
  Apple,
  Facebook,
  Instagram,
  Mail,
  Phone,
  Play,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { Link } from "wouter";
import { Logo } from "./logo";

type FooterProps = {
  phone?: string;
  email?: string;
};

const quickLinks = [
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Grabs", href: "/products" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "YouTube", href: "#", icon: Youtube },
];

const appLinks: Array<{
  label: string;
  helper: string;
  href: string;
  icon: LucideIcon;
}> = [
  {
    label: "App Store",
    helper: "Download on the",
    href: "#",
    icon: Apple,
  },
  {
    label: "Google Play",
    helper: "Get it on",
    href: "#",
    icon: Play,
  },
];

export function DefaultFooter({
  phone = "+94 77 707 2265",
  email = "info@tapngrab.com",
}: FooterProps) {
  return (
    <footer className="bg-[#0a0a0a] text-white/80 max-w-7xl mx-auto">
      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2 md:gap-0 lg:grid-cols-4 lg:px-8">
          <div className="md:border-r md:border-white/10 md:pr-8 lg:pr-10">
            <Link href="/" className="inline-flex items-center">
              <Logo />
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-white/65">
              Discover trending events, limited drops, and curated experiences
              all in one place with TapnGrab.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:border-r md:border-white/10 md:px-8 lg:px-10">
            <div className="text-xs font-semibold tracking-[0.25em] text-white/40">
              QUICK LINKS
            </div>

            <nav className="mt-5 flex flex-col gap-3 text-sm text-white/80">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="md:border-r md:border-white/10 md:px-8 lg:px-10">
            <div className="text-xs font-semibold tracking-[0.25em] text-white/40">
              CONTACT
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 text-white/75 transition hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-orange-500" />
                <span>{email}</span>
              </a>

              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 text-white/75 transition hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0 text-orange-500" />
                <span>{phone}</span>
              </a>
            </div>
          </div>

          <div className="md:px-8 lg:px-10">
            <div className="text-xs font-semibold tracking-[0.25em] text-white/40">
              APP DOWNLOADS
            </div>

            <div className="mt-5 space-y-3">
              {appLinks.map(({ label, helper, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center rounded border border-white/20 bg-black px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition hover:border-white/35"
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="h-4 w-4 shrink-0 text-white" />
                    <div>
                      <div className="text-[10px] font-medium text-white/80">
                        {helper}
                      </div>
                      <div className="font-medium leading-none text-white">
                        {label}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>&copy; Copyright TapnGrab 2026</div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms of Use
            </Link>
            <Link href="/policy" className="transition hover:text-white">
              Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
