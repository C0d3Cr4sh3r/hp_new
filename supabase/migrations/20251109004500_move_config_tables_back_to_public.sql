-- Move configuration tables back into the public schema so PostgREST can expose them
DO $$
DECLARE
  _table_name text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.schemata
    WHERE schema_name = 'admin'
  ) THEN
    FOR _table_name IN
      SELECT unnest(ARRAY[
        'site_settings',
        'theme_settings',
        'shootinghub_sections',
        'downloads',
        'services',
        'screenshots',
        'portfolios',
        'news',
        'bug_reports'
      ])
    LOOP
      BEGIN
        EXECUTE format('ALTER TABLE admin.%I SET SCHEMA public', _table_name);
      EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN duplicate_table THEN NULL;
      END;
    END LOOP;
  END IF;
END
$$;

DO $$
DECLARE
  _sequence_name text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.schemata
    WHERE schema_name = 'admin'
  ) THEN
    FOR _sequence_name IN
      SELECT unnest(ARRAY[
        'downloads_id_seq',
        'services_id_seq',
        'screenshots_id_seq',
        'portfolios_id_seq',
        'news_id_seq',
        'bug_reports_id_seq'
      ])
    LOOP
      BEGIN
        EXECUTE format('ALTER SEQUENCE admin.%I SET SCHEMA public', _sequence_name);
      EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN duplicate_table THEN NULL;
      END;
    END LOOP;
  END IF;
END
$$;

DROP SCHEMA IF EXISTS admin CASCADE;
