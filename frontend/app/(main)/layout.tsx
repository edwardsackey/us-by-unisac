import { Navbar } from "@/components/nav/Navbar";
import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-background text-foreground ">
      <div className="">
        <Navbar />

        <main className="px-4 min-h-screen sm:px-6 lg:px-8 ">
          <div className="max-w-7xl mx-auto">
            <br />
            <br />
            <br />

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
