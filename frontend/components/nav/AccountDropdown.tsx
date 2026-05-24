"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, ShoppingBag, User2, Settings2 } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function AccountDropdown() {
  const { user, loading } = useAuth();
  console.log("user", user);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    toast.success("You have been logged out.");
    window.location.href = "/";
  };

  return (
    <div>
      <>
        {user ? (
          <Link
            href="/account/"
            className="flex items-center gap-2 border border-border p-2 rounded-full"
          >
            <User2 className="text-green-800" />
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="flex items-center gap-2 border border-border p-2 rounded-full"
          >
            <User2 className="text-red-800" />
          </Link>
        )}
      </>
    </div>
  );
}
