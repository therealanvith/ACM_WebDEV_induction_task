"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { PushNotificationButton } from "./push-notification-button";
import { ThemeToggle } from "./theme-toggle";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const isModerator = session?.user?.role === "MODERATOR";

  return (
    <header className="bg-background text-primary font-label-md text-label-md w-full sticky top-0 border-b border-outline/30 z-50">
      <div className="flex justify-between items-center px-4 sm:px-gutter h-16 w-full max-w-[1280px] mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-serif text-2xl uppercase tracking-tighter text-primary">
            Campus Found
          </Link>
          <div className="hidden md:flex gap-6 h-full items-center pl-6 border-l border-outline/30">
            <Link href="/" className="text-primary font-bold border-b-2 border-primary pb-1 h-full flex items-center hover:bg-surface-container-high px-2">
              All Items
            </Link>
            {isModerator && (
              <Link href="/admin" className="text-on-surface-variant h-full flex items-center hover:bg-surface-container-high px-2">
                Admin Board
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {session?.user && <PushNotificationButton />}

          <Link href="/items/new">
            <button className="bg-primary text-on-primary px-4 h-9 font-label-md text-xs uppercase tracking-wider hover:bg-primary/85 border border-primary rounded-none font-bold">
              Post Item
            </button>
          </Link>

          {status === "loading" ? (
            <div className="w-8 h-8 rounded bg-surface-container-high" />
          ) : session?.user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-outline/30">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded border border-outline object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="p-1.5 text-on-surface-variant hover:bg-surface-container-high"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/auth/signin">
              <button className="border border-outline text-primary px-3 h-9 font-label-md text-xs uppercase hover:bg-surface-container-high rounded-none">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
