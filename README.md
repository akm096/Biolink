# BioPlatform

Modern bio-link ve profil paylasim uygulamasi. Kullanicilar tek bir herkese acik profil sayfasinda sosyal baglantilarini, ozel linklerini, tema ayarlarini, arka plan gorselini veya videosunu, muzik bilgisini ve rozetlerini yonetebilir.

Proje Cloudflare icin iki ana parcadan olusur:

- `client/`: React + Vite arayuzu
- `worker/`: Cloudflare Workers + D1 API sunucusu
- `server/`: Yerel/klasik Node.js Express + SQLite API sunucusu

## Ozellikler

- Kullanici kayit, giris ve JWT tabanli oturum yonetimi
- `/:username` adresinde herkese acik profil sayfasi
- Profil duzenleme: ad, bio, avatar, konum, tema, vurgu rengi
- Arka plan gorseli, arka plan videosu ve muzik bilgisi
- Link ekleme, duzenleme, silme, siralama ve gorunurluk yonetimi
- Hazir sosyal link ekleme secenekleri
- Tema onizleme ve coklu hazir tema destegi
- Profil goruntulenme ve link tiklanma istatistikleri
- Giris ekrani / click-to-enter overlay secenegi
- Rozetler: verified, early user, creator, developer, music, gamer
- Admin paneli: kullanicilar, platform istatistikleri, ziyaret kayitlari
- SQLite ile yerel veritabani; harici veritabani sunucusu gerekmez

## Teknolojiler

| Katman | Teknoloji |
| --- | --- |
| Arayuz | React 18, Vite |
| Stil | Tailwind CSS |
| Rota | React Router |
| Cloudflare API | Cloudflare Workers |
| Cloudflare veritabani | D1 |
| Yerel API | Node.js, Express |
| Yerel veritabani | SQLite, better-sqlite3 |
| Kimlik dogrulama | JWT / Web Crypto |

Cloudflare deploy hedefinde API katmani `worker/` altindaki Cloudflare Worker ile calisir ve veritabani olarak D1 kullanir.

## Klasor Yapisi

```text
biolink claude/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |   |-- AdminPanel.jsx
|   |   |   |-- Dashboard.jsx
|   |   |   |-- Landing.jsx
|   |   |   |-- Login.jsx
|   |   |   |-- PublicProfile.jsx
|   |   |   `-- Register.jsx
|   |   |-- utils/
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- .env.example
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- data/
|   |-- src/
|   |   |-- db/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- utils/
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   |-- make-admin.js
|   `-- package.json
|-- worker/
|   |-- migrations/
|   |   `-- 0001_schema.sql
|   |-- src/
|   |   `-- index.js
|   |-- seed.sql
|   |-- wrangler.toml
|   `-- package.json
`-- README.md
```

## Kurulum

Gereksinimler:

- Node.js 18+
- npm

Backend bagimliliklarini kurun:

```bash
cd server
npm install
```

Backend ortam dosyasini olusturun:

```bash
copy .env.example .env
```

Veritabanini olusturup demo verisini ekleyin:

```bash
npm run init-db
```

Backend sunucusunu baslatin:

```bash
npm run dev
```

Backend varsayilan olarak `http://localhost:3001` adresinde calisir.

Yeni bir terminalde frontend bagimliliklarini kurun:

```bash
cd client
npm install
```

Frontend ortam dosyasini olusturun:

```bash
copy .env.example .env
```

Frontend gelistirme sunucusunu baslatin:

```bash
npm run dev
```

Frontend varsayilan olarak `http://localhost:5173` adresinde calisir.

## Ortam Degiskenleri

### Server

`server/.env.example`:

```env
PORT=3001
JWT_SECRET=change-this-to-a-random-secret-key-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

| Degisken | Aciklama |
| --- | --- |
| `PORT` | API sunucusunun portu |
| `JWT_SECRET` | JWT imzalama anahtari |
| `NODE_ENV` | Calisma ortami |
| `CLIENT_URL` | CORS icin izin verilen frontend adresi |

### Client

`client/.env.example`:

```env
VITE_API_URL=http://localhost:5173/api
```

Gelistirme sirasinda Vite proxy kullanildigi icin API cagrilari `/api` yolundan backend'e yonlendirilir.

## Demo Hesap

Veritabani seed isleminden sonra kullanilabilir:

| Alan | Deger |
| --- | --- |
| Kullanici adi | `demo` |
| E-posta | `demo@example.com` |
| Sifre | `demo123` |
| Profil | `http://localhost:5173/demo` |

## Admin Kullanicisi Yapma

Sunucuda `make-admin.js` araci bulunur. Bir kullaniciyi admin yapmak icin server klasorunde calistirin:

```bash
cd server
node make-admin.js <username>
```

Admin paneli uygulama icinde `/admin` rotasindan erisilebilir.

## Kullanilabilir Komutlar

### Client

| Komut | Aciklama |
| --- | --- |
| `npm run dev` | Vite gelistirme sunucusunu baslatir |
| `npm run build` | Production frontend ciktisi uretir |
| `npm run preview` | Build ciktisini yerelde onizler |

### Server

| Komut | Aciklama |
| --- | --- |
| `npm run dev` | Watch modunda API sunucusunu baslatir |
| `npm start` | API sunucusunu normal modda baslatir |
| `npm run init-db` | SQLite tablolarini olusturur ve demo verisini ekler |

## API Ozeti

| Method | Endpoint | Yetki | Aciklama |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Yok | Sunucu saglik kontrolu |
| `POST` | `/api/auth/register` | Yok | Yeni kullanici olusturur |
| `POST` | `/api/auth/login` | Yok | Giris yapar |
| `GET` | `/api/auth/me` | Kullanici | Aktif kullaniciyi getirir |
| `GET` | `/api/profile/me` | Kullanici | Kendi profilini getirir |
| `PUT` | `/api/profile/me` | Kullanici | Kendi profilini gunceller |
| `GET` | `/api/profile/check/:username` | Kullanici | Kullanici adi uygunlugunu kontrol eder |
| `GET` | `/api/profile/:username` | Yok | Herkese acik profili getirir |
| `GET` | `/api/links` | Kullanici | Linkleri listeler |
| `POST` | `/api/links` | Kullanici | Link olusturur |
| `PUT` | `/api/links/:id` | Kullanici | Link gunceller |
| `DELETE` | `/api/links/:id` | Kullanici | Link siler |
| `POST` | `/api/links/reorder` | Kullanici | Link sirasini gunceller |
| `POST` | `/api/links/:id/click` | Yok | Link tiklamasini sayar |
| `GET` | `/api/stats/me` | Kullanici | Kullanici istatistiklerini getirir |
| `GET` | `/api/templates` | Yok | Hazir temalari getirir |
| `GET` | `/api/admin/stats` | Admin | Platform istatistiklerini getirir |
| `GET` | `/api/admin/users` | Admin | Kullanicilari listeler |
| `GET` | `/api/admin/users/:id` | Admin | Kullanici detayini getirir |
| `PUT` | `/api/admin/users/:id` | Admin | Kullanici/profil bilgisini gunceller |
| `DELETE` | `/api/admin/users/:id` | Admin | Kullanici siler |
| `GET` | `/api/admin/visits` | Admin | Son ziyaret kayitlarini listeler |

## Hizli Test Listesi

1. `npm run init-db` sonrasi `demo / demo123` ile giris yapin.
2. Dashboard'da profil adi, bio, avatar veya tema degistirip kaydedin.
3. Yeni link ekleyin, gorunurlugunu degistirin ve siralamayi test edin.
4. `http://localhost:5173/demo` adresinde herkese acik profilin gorundugunu kontrol edin.
5. Bir linke tiklayip istatistik ekraninda tiklama sayisinin arttigini dogrulayin.
6. Admin kullanici olusturup `/admin` ekraninda kullanici ve ziyaret kayitlarini kontrol edin.
7. Mobil gorunumde profil ve dashboard duzeninin bozulmadigini test edin.

## Production Notlari

- Production ortaminda `JWT_SECRET` mutlaka guclu ve benzersiz bir deger olmalidir.
- `CLIENT_URL`, canli frontend domain'i ile guncellenmelidir.
- SQLite veritabani `server/data/` altinda tutulur; canli ortamda bu klasor yedeklenmelidir.
- Frontend icin `client` klasorunde `npm run build` calistirilir.
- Backend Render, Railway, VPS veya benzeri Node.js destekleyen ortamlarda calistirilabilir.

## Cloudflare Pages + Workers + D1

Bu yol, projeyi Cloudflare'in ucretsiz katmaninda calistirmak icindir. Frontend Pages'e, backend Worker'a, veritabani D1'a gider.

### 1. D1 veritabani olusturun

```bash
cd worker
npm install
npx wrangler login
npx wrangler d1 create biolink-db
```

Komutun verdigi `database_id` degerini `worker/wrangler.toml` icindeki `database_id` alanina yazin.

### 2. Worker secret ve D1 tablolarini hazirlayin

```bash
cd worker
npx wrangler secret put JWT_SECRET
npm run db:migrate
npm run db:seed
```

Demo seed sonrasi hesap:

| Alan | Deger |
| --- | --- |
| Kullanici adi | `demo` |
| E-posta | `demo@example.com` |
| Sifre | `demo123` |

### 3. Backend Worker deploy edin

```bash
cd worker
npm run deploy
```

Deploy sonrasi Worker URL-ni qeyd edin, meselen:

```text
https://biolink-api.<hesabiniz>.workers.dev
```

Production ucun `CLIENT_URL` deyerini Pages domain'inizle guncelleyin:

```bash
npx wrangler secret put CLIENT_URL
```

`CLIENT_URL` secret deyilse `worker/wrangler.toml` icinde canli Pages domain'i ile deyise bilersiniz.

### 4. Frontend Pages deploy edin

Cloudflare Pages ayarlari:

| Ayar | Deger |
| --- | --- |
| Root directory | `client` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `VITE_API_URL=https://biolink-api.<hesabiniz>.workers.dev/api` |

Pages SPA rotalari ucun `client/public/_redirects` elave olunub; `/dashboard`, `/admin`, `/:username` kimi React rotalari refresh zamani acilacaq.

### 5. Yerel Cloudflare testi

Bir terminalde Worker:

```bash
cd worker
copy .dev.vars.example .dev.vars
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

Diger terminalde frontend:

```bash
cd client
copy .env.example .env
npm run dev
```

Bu halda frontend `http://localhost:8787/api` Worker API-sine baglanir.
