# 🗄️ DATABASE.md

## TravelMind AI — Veritabanı Şeması (Supabase / PostgreSQL)

Bu doküman, projede kullanılan tabloları, alanlarını, ilişkilerini ve Row Level Security (RLS) kurallarını tanımlar.

> Not: `auth.users` tablosu Supabase tarafından otomatik yönetilir, ayrıca oluşturulmasına gerek yoktur. Uygulamaya özgü kullanıcı bilgileri `profiles` tablosunda tutulur.

---

## 📊 Genel Şema Diyagramı

```text
auth.users (Supabase yönetir)
     │
     │ 1:1
     ▼
  profiles
     │
     │ 1:N
     ▼
    trips ────────────┐
     │                 │
     │ 1:N             │ 1:N
     ▼                 ▼
trip_days        favorite_trips
     │
     │ 1:N
     ▼
trip_activities

favorite_places (kullanıcı → bağımsız mekan favorileri)
```

---

## 1. `profiles`

Kullanıcının uygulamaya özgü profil bilgilerini tutar. `auth.users` ile bire bir ilişkilidir.

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | `uuid` (PK, FK → `auth.users.id`) | Kullanıcı kimliği |
| `full_name` | `text` | Ad soyad |
| `avatar_url` | `text`, nullable | Profil fotoğrafı |
| `created_at` | `timestamptz`, default `now()` | Kayıt tarihi |

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Kullanıcı kendi profilini görebilir"
  on profiles for select
  using (auth.uid() = id);

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on profiles for update
  using (auth.uid() = id);
```

---

## 2. `trips`

Kullanıcının oluşturduğu her bir seyahat planının ana kaydı.

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | `uuid` (PK), default `gen_random_uuid()` | Plan kimliği |
| `user_id` | `uuid` (FK → `profiles.id`) | Planı oluşturan kullanıcı |
| `destination` | `text` | Şehir/ülke |
| `start_date` | `date` | Seyahat başlangıç tarihi |
| `duration_days` | `int` | Gün sayısı |
| `budget` | `numeric` | Bütçe |
| `currency` | `text`, default `'TRY'` | Para birimi |
| `people_count` | `int` | Kişi sayısı |
| `interests` | `text[]` | İlgi alanları (örn. `{"tarih", "doğa", "yemek"}`) |
| `ai_raw_response` | `jsonb` | Gemini'den gelen ham JSON çıktı (denetim/hata ayıklama amaçlı) |
| `status` | `text`, default `'completed'` | `pending` \| `completed` \| `failed` |
| `created_at` | `timestamptz`, default `now()` | Oluşturulma tarihi |

```sql
create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  destination text not null,
  start_date date not null,
  duration_days int not null check (duration_days > 0),
  budget numeric,
  currency text default 'TRY',
  people_count int default 1,
  interests text[],
  ai_raw_response jsonb,
  status text default 'completed',
  created_at timestamptz default now()
);

alter table trips enable row level security;

create policy "Kullanıcı kendi planlarını görebilir"
  on trips for select
  using (auth.uid() = user_id);

create policy "Kullanıcı kendi planını oluşturabilir"
  on trips for insert
  with check (auth.uid() = user_id);

create policy "Kullanıcı kendi planını silebilir"
  on trips for delete
  using (auth.uid() = user_id);
```

---

## 3. `trip_days`

Her seyahat planının gün bazlı kırılımı.

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | `uuid` (PK), default `gen_random_uuid()` | Gün kaydı kimliği |
| `trip_id` | `uuid` (FK → `trips.id`) | Bağlı olduğu plan |
| `day_number` | `int` | Kaçıncı gün (1, 2, 3...) |
| `date` | `date` | Bu güne denk gelen takvim tarihi |
| `summary` | `text`, nullable | Günün kısa özeti (AI tarafından üretilir) |

```sql
create table trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  day_number int not null,
  date date not null,
  summary text
);

alter table trip_days enable row level security;

create policy "Kullanıcı kendi planının günlerini görebilir"
  on trip_days for select
  using (
    exists (
      select 1 from trips
      where trips.id = trip_days.trip_id
      and trips.user_id = auth.uid()
    )
  );
```

---

## 4. `trip_activities`

Her günün saatlik aktivite/mekan kırılımı.

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | `uuid` (PK), default `gen_random_uuid()` | Aktivite kimliği |
| `trip_day_id` | `uuid` (FK → `trip_days.id`) | Bağlı olduğu gün |
| `time_slot` | `text` | Örn. `"09:00 - 11:00"` |
| `title` | `text` | Aktivite/mekan adı |
| `description` | `text`, nullable | Kısa açıklama |
| `category` | `text`, nullable | `gezi` \| `yeme-icme` \| `konaklama` \| `ulasim` vb. |
| `latitude` | `double precision`, nullable | Harita için enlem |
| `longitude` | `double precision`, nullable | Harita için boylam |
| `estimated_cost` | `numeric`, nullable | Tahmini maliyet |
| `is_place_verified` | `boolean`, default `false` | Nominatim ile doğrulandı mı |
| `order_index` | `int` | Gün içindeki sıralama |

```sql
create table trip_activities (
  id uuid primary key default gen_random_uuid(),
  trip_day_id uuid references trip_days(id) on delete cascade,
  time_slot text,
  title text not null,
  description text,
  category text,
  latitude double precision,
  longitude double precision,
  estimated_cost numeric,
  is_place_verified boolean default false,
  order_index int default 0
);

alter table trip_activities enable row level security;

create policy "Kullanıcı kendi planının aktivitelerini görebilir"
  on trip_activities for select
  using (
    exists (
      select 1 from trip_days
      join trips on trips.id = trip_days.trip_id
      where trip_days.id = trip_activities.trip_day_id
      and trips.user_id = auth.uid()
    )
  );
```

---

## 5. `favorite_trips`

Kullanıcının favorilediği tam seyahat planları.

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | `uuid` (PK), default `gen_random_uuid()` | Kayıt kimliği |
| `user_id` | `uuid` (FK → `profiles.id`) | Kullanıcı |
| `trip_id` | `uuid` (FK → `trips.id`) | Favorilenen plan |
| `created_at` | `timestamptz`, default `now()` | Favorilenme tarihi |

```sql
create table favorite_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  trip_id uuid references trips(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, trip_id)
);

alter table favorite_trips enable row level security;

create policy "Kullanıcı kendi favori planlarını yönetebilir"
  on favorite_trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

## 6. `favorite_places`

Kullanıcının favorilediği bağımsız mekanlar (bir plana bağlı olmadan da favorilenebilir).

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | `uuid` (PK), default `gen_random_uuid()` | Kayıt kimliği |
| `user_id` | `uuid` (FK → `profiles.id`) | Kullanıcı |
| `place_name` | `text` | Mekan adı |
| `latitude` | `double precision`, nullable | Enlem |
| `longitude` | `double precision`, nullable | Boylam |
| `source_trip_id` | `uuid`, nullable (FK → `trips.id`) | Hangi plandan favorilendiği (varsa) |
| `created_at` | `timestamptz`, default `now()` | Favorilenme tarihi |

```sql
create table favorite_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  place_name text not null,
  latitude double precision,
  longitude double precision,
  source_trip_id uuid references trips(id) on delete set null,
  created_at timestamptz default now()
);

alter table favorite_places enable row level security;

create policy "Kullanıcı kendi favori mekanlarını yönetebilir"
  on favorite_places for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

## 7. `ai_response_cache` (maliyet kontrolü için)

Aynı sorgu kombinasyonu için Gemini'ye tekrar istek atılmasını önler.

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | `uuid` (PK), default `gen_random_uuid()` | Kayıt kimliği |
| `cache_key` | `text`, unique | `destination+start_date+duration+budget+interests` hash'i |
| `response_data` | `jsonb` | Gemini'den dönen yapılandırılmış cevap |
| `created_at` | `timestamptz`, default `now()` | Oluşturulma tarihi |
| `expires_at` | `timestamptz` | Geçerlilik süresi (örn. 30 gün) |

```sql
create table ai_response_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text unique not null,
  response_data jsonb not null,
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- Bu tablo backend (service role) tarafından yönetilir, RLS'e kapalı
-- veya yalnızca service_role erişimine izin verecek şekilde ayarlanır.
alter table ai_response_cache enable row level security;

create policy "Sadece service role erişebilir"
  on ai_response_cache for all
  using (auth.role() = 'service_role');
```

---

## 🔑 İndeksler (Önerilen)

```sql
create index idx_trips_user_id on trips(user_id);
create index idx_trip_days_trip_id on trip_days(trip_id);
create index idx_trip_activities_trip_day_id on trip_activities(trip_day_id);
create index idx_favorite_trips_user_id on favorite_trips(user_id);
create index idx_favorite_places_user_id on favorite_places(user_id);
create index idx_ai_cache_key on ai_response_cache(cache_key);
```

---

## 📝 Notlar

- Tüm tablolarda RLS **açık** tutulmalıdır; `service_role` key'i yalnızca backend'de (Express) kullanılmalı, frontend'de asla expose edilmemelidir.
- `ai_raw_response` alanı, Gemini'nin ham çıktısını saklayarak hata ayıklamayı kolaylaştırır; production'da boyut/maliyet endişesi olursa periyodik temizlenebilir.
- `is_place_verified` alanı, [AI_PROMPTS.md](./AI_PROMPTS.md) içinde açıklanan Nominatim doğrulama akışıyla birlikte çalışır — frontend bu alana göre "AI önerisi, doğrulanamadı" etiketini gösterir.
- MVP kapsamında `trip_days` ve `trip_activities` ayrı tablolar yerine `trips.ai_raw_response` içinde JSON olarak da tutulabilir; performans/basitlik dengesine göre Faz 3'te (bkz. [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)) karar verilmelidir. Bu şema, normalize edilmiş (ayrı tablolu) versiyonu önerir çünkü favoriler ve gelecekteki filtreleme özellikleri için daha esnektir.