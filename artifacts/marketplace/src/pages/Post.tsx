import { useState } from "react";
import { useLocation, Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImagePlus, X, LogIn } from "lucide-react";

const CATEGORIES = ["Women", "Men", "Electronics", "Home", "Beauty", "Sports", "Kids", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "For Parts"];
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "NGN", "GHS", "KES"];

export default function PostPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("Good");
  const [description, setDescription] = useState("");
  const [location_, setLocation_] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <LogIn className="text-primary" size={28} />
        </div>
        <div>
          <h3 className="font-bold text-lg">Sign in to sell</h3>
          <p className="text-muted-foreground text-sm mt-1">Create an account to list your items for sale</p>
        </div>
        <Link href="/auth"><Button className="rounded-full px-8">Sign In / Sign Up</Button></Link>
        <Link href="/"><p className="text-sm text-muted-foreground hover:text-foreground">← Back to browsing</p></Link>
      </div>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5 - images.length);
      const newImages = [...images, ...files];
      setImages(newImages);
      setPreviews(newImages.map(f => URL.createObjectURL(f)));
    }
  };

  const removeImage = (i: number) => {
    const ni = [...images]; ni.splice(i, 1); setImages(ni);
    const np = [...previews]; np.splice(i, 1); setPreviews(np);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !category) {
      toast({ description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const { data: product, error } = await supabase.from('products').insert({
        seller_id: user.id,
        title,
        price: parseFloat(price),
        currency,
        category,
        condition,
        description,
        country: location_ || "Unknown",
        status: "active",
      }).select().single();

      if (error) throw error;

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const ext = file.name.split('.').pop();
        const fileName = `${user.id}/${product.id}-${i}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
          await supabase.from('product_images').insert({ product_id: product.id, url: publicUrl, order: i });
        }
      }

      toast({ title: "Listed!", description: "Your item is now live on the marketplace." });
      setLocation(`/product/${product.id}`);
    } catch (err: any) {
      toast({ description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 md:pb-8 min-h-screen bg-background">
      <div className="bg-background border-b border-border p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold">Post an Item</h1>
        <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>Cancel</Button>
      </div>

      <form onSubmit={handlePost} className="p-4 space-y-5 max-w-2xl mx-auto">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">Photos <span className="text-muted-foreground font-normal">(up to 5)</span></label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="w-24 h-24 rounded-xl overflow-hidden relative border border-border shrink-0">
                <img src={src} className="w-full h-full object-cover" />
                {i === 0 && <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">MAIN</span>}
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80">
                  <X size={14} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center text-primary hover:bg-primary/5 cursor-pointer transition-colors shrink-0">
                <ImagePlus size={22} />
                <span className="text-[10px] mt-1 font-medium">Add Photo</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageSelect} />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Title <span className="text-destructive">*</span></label>
            <Input required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="What are you selling?" className="h-12 rounded-xl" maxLength={100} />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1.5">Price <span className="text-destructive">*</span></label>
              <Input type="number" required value={price} onChange={e => setPrice(e.target.value)}
                placeholder="0.00" className="h-12 rounded-xl" min="0" step="0.01" />
            </div>
            <div className="w-28">
              <label className="block text-sm font-semibold mb-1.5">Currency</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1.5">Category <span className="text-destructive">*</span></label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1.5">Condition</label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Location</label>
            <Input value={location_} onChange={e => setLocation_(e.target.value)}
              placeholder="City, Country" className="h-12 rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe your item — condition, size, brand, reason for selling..."
              className="min-h-[120px] rounded-xl resize-none" maxLength={1000} />
            <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/1000</p>
          </div>
        </div>

        <Button type="submit" className="w-full h-14 rounded-xl text-base font-bold shadow-md" disabled={loading}>
          {loading ? <><Loader2 className="animate-spin mr-2" size={18} />Posting...</> : "Post Listing 🚀"}
        </Button>
      </form>
    </div>
  );
}
