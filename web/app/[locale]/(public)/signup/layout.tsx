// Zone inscription localisée : fond auth + halos animés (même logique que /signup).

import { AuthPageBackground } from "@/components/auth/auth-page-background";

export default function LocaleSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthPageBackground />
      <div className="auth-page relative flex min-h-full w-full flex-1 flex-col items-center justify-center">
        <div className="relative z-10 w-full">{children}</div>
      </div>
    </>
  );
}
