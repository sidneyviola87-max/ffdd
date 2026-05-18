import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatsPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function loadChats() {
      const { data } = await supabase
        .from('chats')
        .select(`*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)`)
        .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
        .order('last_message_at', { ascending: false });

      if (data) setChats(data);
      setLoading(false);
    }
    loadChats();

    const channel = supabase.channel('chats_list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `buyer_id=eq.${user.id}` }, loadChats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `seller_id=eq.${user.id}` }, loadChats)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <MessageCircle className="text-primary" size={28} />
      </div>
      <div>
        <h3 className="font-bold text-lg">Sign in to message sellers</h3>
        <p className="text-muted-foreground text-sm mt-1">Chat with sellers to ask questions and make offers</p>
      </div>
      <Link href="/auth"><Button className="rounded-full px-8">Sign In</Button></Link>
    </div>
  );

  return (
    <div className="pb-24 md:pb-8">
      <div className="bg-background border-b border-border p-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold">Messages</h1>
        {chats.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      <div>
        {loading ? (
          <div className="divide-y divide-border">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-14 h-14 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <MessageCircle size={56} className="mb-4 text-muted-foreground opacity-20" />
            <p className="font-semibold text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">When you message a seller, it'll show up here</p>
            <Link href="/"><Button variant="outline" className="mt-5 rounded-full">Browse Listings</Button></Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {chats.map(chat => {
              const isBuyer = chat.buyer_id === user.id;
              const otherUser = isBuyer ? chat.seller : chat.buyer;
              const unread = isBuyer ? chat.buyer_unread : chat.seller_unread;

              return (
                <Link key={chat.id} href={`/chat/${chat.id}`} className="block hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4 p-4">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full bg-muted overflow-hidden">
                        {otherUser?.avatar_url
                          ? <img src={otherUser.avatar_url} className="w-full h-full object-cover" alt={otherUser.username} />
                          : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-primary bg-primary/10">
                              {otherUser?.username?.[0]?.toUpperCase() || "?"}
                            </div>
                        }
                      </div>
                      {otherUser?.is_online && (
                        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className={`font-semibold text-foreground truncate ${unread > 0 ? 'text-foreground' : ''}`}>
                          {otherUser?.username || 'User'}
                        </h3>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {chat.last_message_at
                            ? formatChatTime(chat.last_message_at)
                            : ''}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {chat.last_message || 'Start a conversation...'}
                      </p>
                    </div>
                    {unread > 0 && (
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                        {unread > 9 ? '9+' : unread}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatChatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
