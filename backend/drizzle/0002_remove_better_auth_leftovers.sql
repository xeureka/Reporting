-- Cleanup migration to align remote Neon DB with the reverted codebase.
-- This removes only Better Auth leftovers introduced outside the current
-- Drizzle schema and preserves all tables/columns that exist in the repo now.

BEGIN;

-- Drop Better Auth tables first because they reference users(id).
DROP TABLE IF EXISTS "verification";
DROP TABLE IF EXISTS "account";
DROP TABLE IF EXISTS "session";

-- Remove auth-only columns added during Better Auth migration if they exist.
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verified";
ALTER TABLE "users" DROP COLUMN IF EXISTS "image";

COMMIT;
