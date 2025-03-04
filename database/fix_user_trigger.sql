-- Fix the handle_new_user function to match the Supabase schema
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        first_name,
        last_name,
        is_donor, 
        is_recipient, 
        is_admin,
        created_at, 
        updated_at
    )
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        FALSE, 
        FALSE, 
        FALSE,
        NOW(), 
        NOW()
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 