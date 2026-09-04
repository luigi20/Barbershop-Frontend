"use client";

import {
  Bell,
  CalendarDays,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  MoreHorizontal,
  Scissors,
  Settings,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatProfileRole } from "@/lib/profile";
import { logout } from "@/services/auth.client";
import { ProfileAvatar } from "@/components/profile/profile-avatar";

interface DashboardShellProps {
  children: ReactNode;
}

const navigation = [
  {
    name: "Início",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Agenda",
    href: "/agenda",
    icon: CalendarDays,
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: UsersRound,
  },
  {
    name: "Serviços",
    href: "/servicos",
    icon: Scissors,
  },
  {
    name: "Financeiro",
    href: "/financeiro",
    icon: WalletCards,
  },
];

const mobileNavigation = navigation.slice(0, 3);

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  }

  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    if (user.status === "unauthenticated") {
      router.replace("/login");
    }
  }, [user.status, router]);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Não foi possível encerrar a sessão.",
      );
      setIsLoggingOut(false);
    }
  }

  const isLoading =
    user.status === "loading" || user.status === "unauthenticated";
  const profile = user.profile;
  const userName = isLoading ? "Carregando..." : profile?.name || "Usuário";
  const userRole = isLoading
    ? "Aguarde..."
    : formatProfileRole(profile?.roles?.[0]);

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      {/* SIDEBAR DESKTOP */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-[var(--border-soft)] bg-[#0c0c0c] lg:flex lg:flex-col">
        <div className="flex h-20 items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary)] text-black">
              <Scissors size={20} strokeWidth={2.2} />
            </div>

            <div>
              <p className="text-[17px] font-semibold tracking-[0.12em]">
                BARBER
                <span className="text-[var(--primary)]">PRO</span>
              </p>

              <p className="text-[10px] tracking-[0.18em] text-[var(--muted)]">
                GESTÃO
              </p>
            </div>
          </Link>
        </div>

        <div className="px-4 pt-5">
          <p className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[#555]">
            Principal
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex h-11 items-center gap-3 rounded-xl px-3
                    text-sm transition-all
                    ${
                      active
                        ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-white"
                    }
                  `}
                >
                  <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <Link
            href="/configuracoes"
            className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-secondary)] hover:text-white"
          >
            <Settings size={19} />
            Configurações
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-1 flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-secondary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? (
              <LoaderCircle size={19} className="animate-spin" />
            ) : (
              <LogOut size={19} />
            )}
            {isLoggingOut ? "Saindo..." : "Sair"}
          </button>

          {logoutError && (
            <p className="mt-2 px-3 text-xs text-[var(--danger)]" role="alert">
              {logoutError}
            </p>
          )}

          <div className="mt-4 border-t border-[var(--border-soft)] pt-4">
            <Link
              href="/perfil"
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[var(--surface-secondary)]"
            >
              {isLoading ? (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)]">
                  <span className="size-4 animate-pulse rounded-full bg-[var(--primary)] opacity-50" />
                </div>
              ) : (
                <ProfileAvatar
                  name={userName}
                  photo={profile?.photo ?? null}
                  className="size-9 text-sm"
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="truncate text-xs text-[var(--muted)]">
                  {userRole}
                </p>
              </div>

              <MoreHorizontal size={17} className="text-[var(--muted)]" />
            </Link>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 h-full w-[85%] max-w-[320px] border-l border-[var(--border)] bg-[#0d0d0d] p-5">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--primary)] text-black">
                  <Scissors size={18} />
                </div>

                <span className="font-semibold">
                  BARBER
                  <span className="text-[var(--primary)]">PRO</span>
                </span>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface)]"
              >
                <X size={19} />
              </button>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    href={item.href}
                    key={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex h-12 items-center gap-3 rounded-xl px-4 text-sm
                      ${
                        active
                          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "text-[var(--muted)]"
                      }
                    `}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}

              <Link
                href="/perfil"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex h-12 items-center gap-3 rounded-xl px-4 text-sm ${
                  isActive("/perfil")
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--muted)]"
                }`}
              >
                <UserRound size={20} />
                Meu perfil
              </Link>

              <Link
                href="/configuracoes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-12 items-center gap-3 rounded-xl px-4 text-sm text-[var(--muted)]"
              >
                <Settings size={20} />
                Configurações
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-sm text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  <LogOut size={20} />
                )}
                {isLoggingOut ? "Saindo..." : "Sair"}
              </button>

              {logoutError && (
                <p className="px-4 text-xs text-[var(--danger)]" role="alert">
                  {logoutError}
                </p>
              )}
            </nav>
          </aside>
        </div>
      )}

      {/* CONTEÚDO */}

      <div className="lg:pl-[260px]">
        {/* HEADER */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-soft)] bg-[#090909]/90 px-4 backdrop-blur-xl sm:px-6 lg:h-20 lg:px-8">
          <div>
            <p className="hidden text-xs text-[var(--muted)] lg:block">
              BarberPro
            </p>

            <h2 className="text-sm font-medium lg:text-base">
              Barbearia Central
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Notificações"
              className="relative flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-white"
            >
              <Bell size={18} />

              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[var(--primary)]" />
            </button>

            <button
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(true)}
              className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] lg:hidden"
            >
              <Menu size={19} />
            </button>

            <Link
              href="/perfil"
              aria-label="Abrir meu perfil"
              className="ml-2 hidden size-10 items-center justify-center overflow-hidden rounded-full sm:flex"
            >
              {isLoading ? (
                <span className="size-10 animate-pulse rounded-full bg-[var(--primary-soft)]" />
              ) : (
                <ProfileAvatar
                  name={userName}
                  photo={profile?.photo ?? null}
                  className="size-10 text-xs"
                />
              )}
            </Link>
          </div>
        </header>

        {/* PAGE */}

        <main className="mx-auto w-full max-w-[1600px] px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[#0d0d0d]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <nav className="grid h-[68px] grid-cols-4">
          {mobileNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                href={item.href}
                key={item.href}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] ${
                  active ? "text-[var(--primary)]" : "text-[var(--muted)]"
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2.3 : 1.8} />

                {item.name}
              </Link>
            );
          })}

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[10px] text-[var(--muted)]"
          >
            <MoreHorizontal size={21} />
            Mais
          </button>
        </nav>
      </div>
    </div>
  );
}
