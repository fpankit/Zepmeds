import { LoginForm } from "@/components/features/login-form";
import { Logo } from "@/components/icons/logo";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-background" />
        <div className="absolute -left-1/4 top-0 h-1/2 w-1/2 animate-[spin_20s_linear_infinite] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-1/2 w-1/2 animate-[spin_25s_linear_infinite_reverse] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <main className="z-10 flex w-full max-w-md flex-col items-center space-y-8 px-4 py-12">
        <div className="flex flex-col items-center text-center">
          <Logo className="mb-4 h-12 w-auto text-primary" />
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground">
            Welcome to Zepmeds
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your health, delivered fast.
          </p>
        </div>

        <LoginForm />
      </main>
      
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Zepmeds. All rights reserved.
      </footer>
    </div>
  );
}
