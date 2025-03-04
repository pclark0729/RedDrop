-- Script to create the database if it doesn't exist

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'reddrop') THEN
        CREATE DATABASE reddrop;
    END IF;
END
$$; 