/*
  # Update profiles trigger to handle new user fields
  
  1. Changes
    - Update the handle_new_user trigger function to include all new profile fields
    - Ensures first_name, last_name, birthdate, phone, country, city, and street are stored from user metadata
  
  2. Fields Updated
    - first_name (from user metadata)
    - last_name (from user metadata)
    - birthdate (from user metadata)
    - phone (from user metadata)
    - country (from user metadata)
    - city (from user metadata)
    - street (from user metadata)
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    birthdate,
    phone,
    country,
    city,
    street,
    created_at
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    (new.raw_user_meta_data->>'birthdate')::date,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'street',
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
