-- Add useful database indexes for notifications performance
create index if not exists idx_notif_rec_type_created on public.notifications(recipient_id, type, created_at desc);
create index if not exists idx_validations_user_created on public.reading_validations(user_id, validated_at);