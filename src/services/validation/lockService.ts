
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a user is currently locked out from validating a specific book segment
 */
export const checkValidationLock = async (
  userId: string,
  bookId: string,
  segment: number
): Promise<{ isLocked: boolean; remainingTime: number | null }> => {
  try {
    const { data, error } = await supabase
      .from("validation_locks")
      .select("locked_until")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .eq("segment", segment)
      .maybeSingle();

    if (error) {
      console.error("Error checking validation lock:", error);
      return { isLocked: false, remainingTime: null };
    }

    if (!data) {
      return { isLocked: false, remainingTime: null };
    }

    const now = new Date();
    const lockedUntil = new Date(data.locked_until);

    const isLocked = lockedUntil > now;
    
    // Calculate remaining seconds if locked
    const remainingTime = isLocked 
      ? Math.floor((lockedUntil.getTime() - now.getTime()) / 1000) 
      : null;

    // If lock has expired, we could clean it up, but we'll let it stay for audit purposes
    return { isLocked, remainingTime };
  } catch (error) {
    console.error("Exception checking validation lock:", error);
    return { isLocked: false, remainingTime: null };
  }
};

/**
 * Creates or updates a validation lock after multiple failed attempts
 */
export const createValidationLock = async (
  userId: string, 
  bookId: string, 
  segment: number
): Promise<boolean> => {
  try {
    // Lock for 1 hour from now
    const lockedUntil = new Date();
    lockedUntil.setHours(lockedUntil.getHours() + 1);

    const { error } = await supabase
      .from("validation_locks")
      .upsert({
        user_id: userId,
        book_id: bookId,
        segment: segment,
        locked_until: lockedUntil.toISOString(),
      })
      .select();

    if (error) {
      console.error("Error creating validation lock:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception creating validation lock:", error);
    return false;
  }
};
