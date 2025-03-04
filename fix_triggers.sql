-- Script to fix the trigger issue

-- First, try to drop the trigger if it exists
DO $$
BEGIN
    BEGIN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop trigger: %', SQLERRM;
    END;
END
$$;

-- Then recreate the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Finally, try to create the trigger with error handling
DO $$
BEGIN
    BEGIN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Trigger already exists, skipping creation';
    END;
END
$$; 