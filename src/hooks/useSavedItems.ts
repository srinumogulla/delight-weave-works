import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

type ItemType = 'pooja' | 'pundit' | 'temple';

export function useSavedItems(itemType?: ItemType) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all saved items for the user
  const { data: savedItems = [], isLoading } = useQuery({
    queryKey: ['saved-items', user?.id, itemType],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id);
      
      if (itemType) {
        query = query.eq('item_type', itemType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Check if a specific item is saved
  const isItemSaved = (itemId: string, type: ItemType): boolean => {
    return savedItems.some(item => item.item_id === itemId && item.item_type === type);
  };

  // Toggle save status
  const toggleSaveMutation = useMutation({
    mutationFn: async ({ itemId, type }: { itemId: string; type: ItemType }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const isSaved = isItemSaved(itemId, type);
      
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_items')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .eq('item_type', type);
        
        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_items')
          .insert({
            user_id: user.id,
            item_id: itemId,
            item_type: type
          });
        
        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['saved-items'] });
      toast({
        title: result.action === 'added' ? 'Saved!' : 'Removed from saved',
        description: result.action === 'added' 
          ? 'Added to your favorites' 
          : 'Removed from your favorites'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update saved items',
        variant: 'destructive'
      });
    }
  });

  return {
    savedItems,
    isLoading,
    isItemSaved,
    toggleSave: toggleSaveMutation.mutate,
    isToggling: toggleSaveMutation.isPending
  };
}
