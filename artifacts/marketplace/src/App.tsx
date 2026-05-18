import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/contexts/AuthContext";

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

function AppShell() {
  const { loading } = useAuth();

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
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block w-64 lg:w-72 shrink-0 border-r border-border">
        <SideNav />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 pb-20 md:pb-0">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/auth" component={Auth} />
            <Route path="/search" component={Search} />
            <Route path="/post" component={Post} />
            <Route path="/chat" component={Chats} />
            <Route path="/chat/:id" component={ChatDetail} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/profile/view" component={ProfileView} />
            <Route path="/profile/edit" component={EditProfile} />
            <Route path="/profile" component={Profile} />
            <Route path="/profile/:id" component={PublicProfile} />
            <Route path="/followers/:id" component={Followers} />
            <Route path="/following/:id" component={Following} />
            <Route path="/product/:id" component={ProductDetail} />
            <Route path="/seller/:id/shop" component={SellerShop} />
            <Route component={NotFound} />
          </Switch>
        </div>

        {/* Mobile bottom nav — hidden on desktop */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppShell />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
