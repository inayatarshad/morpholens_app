import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { EvidenceProvider } from "./EvidenceDrawer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <EvidenceProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </EvidenceProvider>
  );
}

/** Standard page gutter. */
export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>;
}
