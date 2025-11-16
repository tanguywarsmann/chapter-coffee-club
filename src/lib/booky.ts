import { supabase } from "@/integrations/supabase/client";

// Types
export interface CompanionData {
  id: string;
  user_id: string;
  current_stage: number;
  total_reading_days: number;
  current_streak: number;
  longest_streak: number;
  last_reading_date: string | null;
  segments_this_week: number;
  has_seen_birth_ritual: boolean;
  has_seen_week_ritual: boolean;
  has_seen_return_ritual: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProgressResult {
  isFirstDay: boolean;
  isFirstWeek: boolean;
  isReturnAfterBreak: boolean;
  companion: CompanionData;
}

/**
 * Get user's companion data
 */
export async function getCompanion(userId: string): Promise<CompanionData | null> {
  const { data, error } = await supabase
    .from('user_companion')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[getCompanion] Error:', error);
    return null;
  }

  return data;
}

/**
 * Create a new companion for user
 */
export async function createCompanion(userId: string): Promise<CompanionData> {
  const { data, error } = await supabase
    .from('user_companion')
    .insert({
      user_id: userId,
      current_stage: 1,
      total_reading_days: 0,
      current_streak: 0,
      longest_streak: 0,
      last_reading_date: null,
      segments_this_week: 0,
      has_seen_birth_ritual: false,
      has_seen_week_ritual: false,
      has_seen_return_ritual: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[createCompanion] Error:', error);
    throw new Error('Failed to create companion: ' + error.message);
  }

  return data;
}

/**
 * Update companion progress after a reading validation
 * 
 * Rules:
 * - A reading day = at least ONE segment validation that day
 * - If dateValidation is the same day as last_reading_date, don't touch current_streak or total_reading_days
 * - But always increment segments_this_week, even if same day
 * - Streak logic:
 *   - No previous reading → streak = 1
 *   - Last reading = yesterday → streak++
 *   - Last reading 2+ days ago → streak = 1
 * - Rituals are calculated BEFORE updating values
 */
export async function updateCompanionProgress(
  userId: string,
  dateValidation: Date
): Promise<UpdateProgressResult> {
  // Get current companion data (or create if doesn't exist)
  let companion = await getCompanion(userId);
  
  if (!companion) {
    companion = await createCompanion(userId);
  }

  // Store previous values for ritual detection
  const previousTotalReadingDays = companion.total_reading_days;
  const previousLastReadingDate = companion.last_reading_date;
  const previousCurrentStreak = companion.current_streak;

  // Prepare updates
  const updates: Partial<CompanionData> = {};
  let daysDifference: number | null = null;

  // Always increment segments_this_week (even if same day)
  updates.segments_this_week = companion.segments_this_week + 1;

  // Date calculations
  const validationDate = new Date(dateValidation);
  validationDate.setHours(0, 0, 0, 0); // Reset time to compare dates only

  const lastReadingDate = previousLastReadingDate 
    ? new Date(previousLastReadingDate) 
    : null;
  
  if (lastReadingDate) {
    lastReadingDate.setHours(0, 0, 0, 0);
  }

  // Check if it's the same day
  const isSameDay = lastReadingDate && 
    validationDate.getTime() === lastReadingDate.getTime();

  // Only update streak and total_reading_days if NOT the same day
  if (!isSameDay) {
    // Calculate days difference
    daysDifference = lastReadingDate
      ? Math.floor((validationDate.getTime() - lastReadingDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Update streak logic
    if (daysDifference === null) {
      // First reading ever
      updates.current_streak = 1;
      updates.total_reading_days = 1;
    } else if (daysDifference === 1) {
      // Reading yesterday → increment streak
      updates.current_streak = previousCurrentStreak + 1;
      updates.total_reading_days = previousTotalReadingDays + 1;
    } else if (daysDifference >= 2) {
      // Break in streak → reset to 1
      updates.current_streak = 1;
      updates.total_reading_days = previousTotalReadingDays + 1;
    }

    // Update longest_streak if needed
    if (updates.current_streak && updates.current_streak > companion.longest_streak) {
      updates.longest_streak = updates.current_streak;
    }

    // Update last_reading_date
    updates.last_reading_date = validationDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
  }

  // Calculate stage evolution (egg → fox cub transition at 1+ days)
  const newTotalReadingDays = updates.total_reading_days ?? previousTotalReadingDays;
  if (newTotalReadingDays >= 1) {
    updates.current_stage = 2;
  }

  // Reset segments_this_week on Monday if needed
  const today = new Date();
  const dayOfWeek = today.getDay();
  const lastReadingDay = lastReadingDate ? lastReadingDate.getDay() : null;
  
  // If we're on Monday and last reading was not today, reset weekly counter
  if (dayOfWeek === 1 && lastReadingDay !== 1) {
    updates.segments_this_week = 1; // Reset to 1 (current segment)
  }

  // RITUAL DETECTION (based on PREVIOUS values)
  const isFirstDay = previousTotalReadingDays === 0 && !companion.has_seen_birth_ritual;
  
  const newCurrentStreak = updates.current_streak ?? previousCurrentStreak;
  const isFirstWeek = !companion.has_seen_week_ritual && 
    previousCurrentStreak < 7 && 
    newCurrentStreak >= 7;

  const isReturnAfterBreak = !companion.has_seen_return_ritual &&
    previousLastReadingDate !== null &&
    !isSameDay &&
    daysDifference !== null &&
    daysDifference >= 4;

  // Update ritual flags if rituals should be shown
  if (isFirstDay) {
    updates.has_seen_birth_ritual = true;
  }
  if (isFirstWeek) {
    updates.has_seen_week_ritual = true;
  }
  if (isReturnAfterBreak) {
    updates.has_seen_return_ritual = true;
  }

  // Apply updates
  const { data: updatedCompanion, error } = await supabase
    .from('user_companion')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[updateCompanionProgress] Error:', error);
    throw new Error('Failed to update companion: ' + error.message);
  }

  return {
    isFirstDay,
    isFirstWeek,
    isReturnAfterBreak,
    companion: updatedCompanion,
  };
}
