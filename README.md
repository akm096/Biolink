# BioPlatform

Modern bio-link ve profil paylasim uygulamasi. Kullanicilar tek bir herkese acik profil sayfasinda sosyal baglantilarini, ozel linklerini, tema ayarlarini, arka plan gorselini veya videosunu, muzik bilgisini ve rozetlerini yonetebilir.

Proje iki parcadan olusur:

- `client/`: React + Vite arayuzu
- `server/`: Express + SQLite API sunucusu

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
| API | Node.js, Express |
| Veritabani | SQLite, better-sqlite3 |
| Kimlik dogrulama | JWT, bcryptjs |

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

