import { useState, useEffect, useRef } from "react";
import { SearchIcon, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = ["All", "Women", "Men", "Electronics", "Home", "Beauty", "Sports", "Kids"];
const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low", value: "price_asc" },
  { label: "Price: High", value: "price_desc" },
];
const TRENDING = ["iPhone", "Nike shoes", "Dress", "Laptop", "Bag", "Watches", "Sneakers"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, activeCategory, sort);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, activeCategory, sort]);

  const doSearch = async (q: string, cat: string, s: string) => {
    setLoading(true);
    let dbQuery = supabase
      .from('products')
      .select('*, profiles(*), product_images(*)')
      .eq('status', 'active');

    if (q.trim()) dbQuery = dbQuery.ilike('title', `%${q}%`);
    if (cat !== "All") dbQuery = dbQuery.eq('category', cat);

    switch (s) {
      case "price_asc": dbQuery = dbQuery.order('price', { ascending: true }); break;
      case "price_desc": dbQuery = dbQuery.order('price', { ascending: false }); break;
      default: dbQuery = dbQuery.order('created_at', { ascending: false });
    }

    const { data } = await dbQuery.limit(40);
    setResults(data || []);
    setLoading(false);
  };

  const clearSearch = () => setQuery("");

  return (
    <div className="pb-24 md:pb-8 min-h-screen bg-background">
      {/* Search Header */}
      <div className="p-4 bg-background sticky top-0 z-10 border-b border-border shadow-sm space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, brands..."
            className="w-full h-12 pl-11 pr-10 rounded-2xl bg-muted border-none text-sm"
            autoFocus
          />
          {query && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort/Filter row */}
        <div className="flex items-center gap-2">
          {SORTS.map(s => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                sort === s.value
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-border text-muted-foreground hover:border-muted-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{results.length} results</span>
        </div>
      </div>

      <div className="p-4">
        {/* Trending (show when no query) */}
        {!query && activeCategory === "All" && !loading && results.length === 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🔥</span>
              <h3 className="font-semibold text-sm">Trending Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(t => (
                <button
                  key={t}
                  onClick={() => setQuery(t)}
                  className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {results.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : query || activeCategory !== "All" ? (
          <div className="text-center py-16 text-muted-foreground">
            <SearchIcon size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No results found</p>
            <p className="text-sm mt-1 text-muted-foreground/60">Try different keywords or category</p>
            {activeCategory !== "All" && (
              <button onClick={() => setActiveCategory("All")} className="mt-3 text-primary text-sm font-medium hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <SearchIcon size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium">Discover something amazing</p>
            <p className="text-sm mt-1 opacity-70">Type to search or tap a category above</p>
          </div>
        )}
      </div>
    </div>
  );
}
