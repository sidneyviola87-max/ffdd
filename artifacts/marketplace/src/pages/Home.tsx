import { useEffect, useState } from "react";
import { Search, TrendingUp, Flame, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORIES = ["All", "Women", "Men", "Electronics", "Home", "Beauty", "Sports", "Kids"];

const CATEGORY_ICONS: Record<string, string> = {
  All: "🛍️", Women: "👗", Men: "👔", Electronics: "📱",
  Home: "🏠", Beauty: "💄", Sports: "⚽", Kids: "🧸",
};

export default function HomePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    loadProducts(activeCategory);
  }, [activeCategory]);

  async function loadProducts(category: string) {
    setLoading(true);
    let query = supabase
      .from('products')
      .select(`*, profiles(*), product_images(*)`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(30);

    if (category !== "All") {
      query = query.eq('category', category);
    }

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  }

  return (
    <div className="pb-24 md:pb-8 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-4 pt-10 pb-8 rounded-b-[2rem] shadow-lg">
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium">Good {getGreeting()}</p>
            <h1 className="text-2xl font-bold tracking-tight">{user ? "Welcome back! 👋" : "Discover Deals ✨"}</h1>
          </div>
          {!user && (
            <Link href="/auth">
              <div className="bg-primary-foreground/20 border border-primary-foreground/30 rounded-full px-4 py-2 text-sm font-semibold hover:bg-primary-foreground/30 transition-colors">
                Sign In
              </div>
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <Link href="/search" className="flex items-center gap-3 bg-background text-muted-foreground px-4 py-3.5 rounded-2xl shadow-md">
          <Search size={18} className="text-primary shrink-0" />
          <span className="text-sm">Search products, brands, sellers...</span>
        </Link>
      </div>

      {/* Categories */}
      <div className="px-4 mt-5">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-md scale-105'
                  : 'bg-card border border-border text-foreground hover:border-primary/40'
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Banner (for guests) */}
      {!user && (
        <div className="mx-4 mt-5 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag className="text-primary" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Join thousands of sellers</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sign up free and start selling today</p>
          </div>
          <Link href="/auth">
            <div className="bg-primary text-primary-foreground rounded-xl px-3 py-2 text-xs font-bold shrink-0">
              Join Free
            </div>
          </Link>
        </div>
      )}

      {/* Products Grid */}
      <div className="mt-5 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {activeCategory === "All" ? (
              <><Flame size={18} className="text-primary" /><h2 className="text-base font-bold">Latest Listings</h2></>
            ) : (
              <><TrendingUp size={18} className="text-primary" /><h2 className="text-base font-bold">{activeCategory}</h2></>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{products.length} items</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-5xl mb-4">{CATEGORY_ICONS[activeCategory]}</div>
            <p className="font-medium">No listings yet</p>
            <p className="text-sm mt-1">Be the first to post in {activeCategory}!</p>
            {user && (
              <Link href="/post">
                <div className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-2.5 font-semibold text-sm">
                  Post Now
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
