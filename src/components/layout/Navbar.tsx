
"use client";

import Link from 'next/link';
import { Home, PlusCircle, User, LogIn, LogOut, ListChecks, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';

export default function Navbar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary font-headline">
          Listify
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Главная
            </Link>
          </Button>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : isAuthenticated && user ? (
            <>
              <Button asChild>
                <Link href="/ads/new">
                  <PlusCircle className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Создать</span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} data-ai-hint="avatar person" />
                      <AvatarFallback>{user.fullName?.substring(0, 2).toUpperCase() || 'ME'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Админ-панель
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile/me">
                      <User className="mr-2 h-4 w-4" />
                      Профиль
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/profile/me?tab=my-ads"> {/* Assuming profile page can handle tabs */}
                      <ListChecks className="mr-2 h-4 w-4" />
                      Мои объявления
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Войти
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
