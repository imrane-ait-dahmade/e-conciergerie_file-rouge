"use client";

type AuthLoadingProps = {
  message?: string;
};

/** État de chargement pendant l’hydratation de la session (localStorage). */
export function AuthLoading({ message = "Chargement…" }: AuthLoadingProps) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      {message}
    </div>
  );
}
