DO $$
DECLARE
  _news_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'news'
  )
  INTO _news_exists;

  IF NOT _news_exists THEN
    RAISE NOTICE 'Skipping news migration because public.news does not exist.';
    RETURN;
  END IF;

  -- Ensure slug and status columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'slug'
  ) THEN
    EXECUTE 'ALTER TABLE public.news ADD COLUMN slug TEXT';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'status'
  ) THEN
    EXECUTE 'ALTER TABLE public.news ADD COLUMN status TEXT DEFAULT ''draft''';
  END IF;

  -- Populate slug for existing rows
  WITH generated AS (
    SELECT
      id,
      COALESCE(
        NULLIF(slug, ''),
        NULLIF(
          lower(
            regexp_replace(COALESCE(title, 'news'), '[^a-z0-9]+', '-', 'gi')
          ),
          ''
        ),
        'news'
      ) AS new_slug
    FROM public.news
  )
  UPDATE public.news n
  SET slug = generated.new_slug
  FROM generated
  WHERE n.id = generated.id
    AND (n.slug IS NULL OR n.slug = '' OR n.slug <> generated.new_slug);

  -- Resolve any duplicate slugs by appending the record id
  WITH duplicate_slugs AS (
    SELECT slug
    FROM public.news
    GROUP BY slug
    HAVING COUNT(*) > 1
  )
  UPDATE public.news
  SET slug = slug || '-' || id
  WHERE slug IN (SELECT slug FROM duplicate_slugs);

  -- Ensure status column reflects old boolean published flag when present
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'published'
  ) THEN
    UPDATE public.news
    SET status = CASE WHEN published IS TRUE THEN 'published' ELSE COALESCE(status, 'draft') END;
  ELSE
    UPDATE public.news
    SET status = COALESCE(status, 'draft');
  END IF;

  -- Enforce constraints
  EXECUTE 'ALTER TABLE public.news
    ALTER COLUMN slug SET NOT NULL,
    ALTER COLUMN status SET NOT NULL';

  EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS news_slug_key ON public.news (slug)';

  EXECUTE 'ALTER TABLE public.news
    DROP CONSTRAINT IF EXISTS news_status_check,
    ADD CONSTRAINT news_status_check CHECK (status IN (''draft'', ''published''))';

  -- Drop legacy published column and index if they still exist
  EXECUTE 'DROP INDEX IF EXISTS idx_news_published';
  EXECUTE 'ALTER TABLE public.news DROP COLUMN IF EXISTS published';

  -- Update RLS policies to use status instead of published flag
  EXECUTE 'DROP POLICY IF EXISTS "Published news are viewable by everyone" ON public.news';
  EXECUTE 'CREATE POLICY "Published news are viewable by everyone" ON public.news
    FOR SELECT
    USING (
      status = ''published'' OR auth.uid() IN (
        SELECT id FROM public.user_profiles WHERE role = ''admin''
      )
    )';

  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage news" ON public.news';
  EXECUTE 'CREATE POLICY "Admins can manage news" ON public.news
    FOR ALL
    USING (auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = ''admin''
    ))';
END
$$;
