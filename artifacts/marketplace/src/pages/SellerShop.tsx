import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ProductCard from "@/components/ProductCard";
import { Store, ChevronLeft, UserCheck, UserPlus, MapPin, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SellerShopPage() {
  const [, params] = useRoute("/seller/:id/shop");
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    async function load() {
      const [{ data: p }, { data: prods }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', params!.id).single(),
        supabase.from('products').select('*, product_images(*)').eq('seller_id', params!.id).eq('status', 'active').order('created_at', { ascending: false }),
      ]);
      if (p) setProfile(p);
      setProducts(prods || []);

      if (user) {
        const { data: followData } = await supabase.from('follows').select('id')
          .eq('follower_id', user.id).eq('following_id', params!.id).maybeSingle();
        setIsFollowing(!!followData);
      }
      setLoading(false);
    }
    load();
  }, [params?.id, user]);

  const handleFollow = async () => {
    if (!user) { toast({ description: "Please sign in to follow sellers" }); return; }
    if (user.id === params?.id) return;
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', params!.id);
        setIsFollowing(false);
        toast({ description: "Unfollowed" });
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: params!.id });
        setIsFollowing(true);
        toast({ description: `Following ${profile?.username}!` });
      }
    } catch (err: any) {
      toast({ description: err.message, variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="p-8 text-center text-muted-foreground">Shop not found.</div>
  );

  return (
    <div className="pb-24 md:pb-8 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background border-b border-border p-4 sticky top-0 z-10 flex items-center gap-3 shadow-sm">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ChevronLeft size={24} />
        </button>
        <div className="w-9 h-9 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
          {profile.avatar_url
            ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.username} />
            : <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                {profile.username?.[0]?.toUpperCase()}
              </div>
          }
        </div>
        <h1 className="text-base font-bold truncate flex-1">{profile.username}'s Shop</h1>
      </div>

      {/* Seller Banner */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5 border-b border-border">
        <div className="flex items-start gap-4">
          <Link href={`/profile/${profile.id}`}>
            <div className="w-20 h-20 rounded-2xl bg-muted overflow-hidden border-2 border-primary/20 shrink-0 shadow-md">
              {profile.avatar_url
                ? <img src={profile.avatar_url} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary bg-primary/10">
                    {profile.username?.[0]?.toUpperCase()}
                  </div>
              }
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h2 className="text-lg font-bold truncate">{profile.full_name || profile.username}</h2>
              {profile.is_verified && <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold shrink-0">✓</span>}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground"><Package size={13} /> {products.length} items</span>
              <span className="flex items-center gap-1 text-muted-foreground"><Star size={13} /> {profile.rating?.toFixed(1) || "New"}</span>
              {profile.location && <span className="flex items-center gap-1 text-muted-foreground"><MapPin size={13} /> {profile.location}</span>}
            </div>
            {profile.bio && <p className="text-sm text-muted-foreground mt-2 leading-snug line-clamp-2">{profile.bio}</p>}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {user?.id !== profile.id && (
            <Button
              onClick={handleFollow}
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              className="flex-1 rounded-full font-semibold"
            >
              {isFollowing ? <><UserCheck size={16} className="mr-1.5" />Following</> : <><UserPlus size={16} className="mr-1.5" />Follow</>}
            </Button>
          )}
          <Link href={`/profile/${profile.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full rounded-full font-semibold">View Profile</Button>
          </Link>
        </div>
      </div>

      {/* Products */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base">All Listings</h3>
          <span className="text-sm text-muted-foreground">{products.length} active</span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Store size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">No active listings</p>
            <p className="text-sm mt-1">This seller hasn't posted any items yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
