-- from terminal as user postgres
createdb gpptweets
createlang plpgsql gpptweets
--amazon
psql -d gpptweets -f /usr/local/pgsql/share/contrib/postgis-2.2/postgis.sql 
psql -d gpptweets -f /usr/local/pgsql/share/contrib/postgis-2.2/spatial_ref_sys.sql
-- psql -d gpptweets -f /usr/local/share/postgis/postgis.sql -- local (homebrew)

-- from psql (get there as follows):
-- psql -d gpptweets
create table tweets (
  tweet_id serial not null,
  twitter_tweet_id bigint,
  location geography(point),
  content json,
  date timestamp,
  constraint tweet_pkey primary key (tweet_id)
);
