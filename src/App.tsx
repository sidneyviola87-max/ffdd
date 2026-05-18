import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import ProfileView from "@/pages/ProfileView";
import EditProfile from "@/pages/EditProfile";
import PublicProfile from "@/pages/PublicProfile";
import Followers from "@/pages/Followers";
import Following from "@/pages/Following";
import Notifications from "@/pages/Notifications";
import ChatDetail from "@/pages/ChatDetail";
import Chats from "@/pages/Chats";
import ProductDetail from "@/pages/ProductDetail";
import Search from "@/pages/Search";
import Post from "@/pages/Post";
import SellerShop from "@/pages/SellerShop";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppShell({ user }: { user: User | null }) {
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-[430px] mx-auto">
          <Auth />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <SideNav user={user} />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 lg:ml-72">
        <div className="flex-1 pb-20 md:pb-0">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/search" component={Search} />
            <Route path="/post" component={Post} />
            <Route path="/chats" component={Chats} />
            <Route path="/chats/:id" component={ChatDetail} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/profile/view" component={ProfileView} />
            <Route path="/profile/edit" component={EditProfile} />
            <Route path="/profile" component={Profile} />
            <Route path="/profile/:id" component={PublicProfile} />
            <Route path="/followers/:id" component={Followers} />
            <Route path="/following/:id" component={Following} />
            <Route path="/product/:id" component={ProductDetail} />
            <Route path="/shop/:id" component={SellerShop} />
            <Route component={NotFound} />
          </Switch>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav user={user} />
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppShell user={user} />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
