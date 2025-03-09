import { Button } from '@/components/ui/button';
import { Github, Mail, FileJson, ArrowUpRight } from 'lucide-react';

const footerLinks = [
  {
    href: 'mailto:hello@lagden.dev',
    icon: <Mail className="h-4 w-4" />,
    label: 'hello@lagden.dev',
  },
  {
    href: 'https://github.com/Lagden-Development/lagden.dev',
    icon: <Github className="h-4 w-4" />,
    label: 'GitHub',
    external: true,
  },
  {
    href: 'https://docs.api.lagden.dev',
    icon: <FileJson className="h-4 w-4" />,
    label: 'API Docs',
    external: true,
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-gray-800/50 bg-black/90 px-4 py-8 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col items-center md:items-start">
            <p className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-sm text-transparent">
              © {new Date().getFullYear()} Lagden Development
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {footerLinks.map((link) => (
              <Button
                key={link.label}
                variant="link"
                className="group h-auto p-0 text-gray-400 transition-colors hover:text-white"
                asChild
              >
                <a
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center"
                >
                  {link.icon}
                  <span className="relative ml-2">
                    {link.label}
                    {link.external && (
                      <ArrowUpRight className="group-hover:translate-y--0.5 ml-1 inline-block h-3 w-3 opacity-50 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </span>
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
