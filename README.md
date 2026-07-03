# Gültenim Butik — Premium Tesettür Katalog Sitesi

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Firebase.
Online ödeme yoktur; tüm siparişler **WhatsApp (0534 070 07 80)** ve **Instagram (@gultenim_boutique)** üzerinden alınır.

## Hızlı Başlangıç (Yerel)

```bash
npm install
npm run dev        # http://localhost:3000
```

Site, Firebase kurulumu tamamlanmadan da açılır (bölümler boş görünür).
Gerçek verinin akması için aşağıdaki **Firebase Kurulumu** adımlarını izleyin.

## 1. Firebase Kurulumu (tek seferlik)

### a) Servisleri etkinleştirin
[Firebase Console](https://console.firebase.google.com) → `gultenimbutik` projesi:

1. **Authentication** → Sign-in method → **E-posta/Şifre**'yi etkinleştirin.
2. **Firestore Database** → veritabanı oluşturun (production mode, bölge: `europe-west1` önerilir).
3. **Storage** → başlatın.

### b) Güvenlik kuralları ve index'leri yükleyin
```bash
npm install -g firebase-tools
firebase login
firebase use gultenimbutik
firebase deploy --only firestore:rules,firestore:indexes,storage
```
Kurallar bu repodadır: `firestore.rules`, `storage.rules`, `firestore.indexes.json`.

### c) Service account anahtarı (SSR/SEO için — tek gizli anahtar)
1. Console → Proje Ayarları → **Hizmet hesapları** → *Yeni özel anahtar oluştur* → JSON iner.
2. Base64'e çevirin (PowerShell):
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("serviceAccountKey.json"))
   ```
3. `.env.example`'ı `.env.local` olarak kopyalayıp çıktıyı `FIREBASE_SERVICE_ACCOUNT_KEY=` satırına yapıştırın.

> İndirdiğiniz JSON dosyasını asla repoya koymayın (`.gitignore` zaten engelliyor).

### d) İlk admini tanımlayın
1. Sitede `/kayit` sayfasından kendi e-postanızla üye olun (**küçük harflerle** yazın).
2. Console → Firestore → **`admins` koleksiyonu oluşturun** → *Doküman ekle* →
   Doküman ID = e-postanız (tamamı küçük harf), içine herhangi bir alan (örn. `role: "owner"`).
3. Artık `/admin/login`'den panele girebilirsiniz.

Yeni admin eklemek de aynı şekilde Console üzerinden yapılır — güvenlik gereği panelden admin eklenemez.

## 2. Ürünleri Yükleme

### Yol A — Toplu (önerilen ilk kurulum)
```bash
npm run download-images        # eski siteden tüm görselleri indirir (yapıldıysa atlayın)
node scripts/seed.mjs init     # seed-data/ şablonlarını üretir
# seed-data/products.json'u açın: kategori, renk, beden, açıklama, fiyat kontrolü
node scripts/seed.mjs          # görselleri Storage'a yükler + Firestore'a yazar
```
Script tekrar çalıştırılabilir; var olan ürünleri atlar.

**Fotoğraf iyileştirme:** `downloaded-images/<urun>/` içindeki görselleri Grok Imagine /
Photoroom gibi bir araçla iyileştirip **aynı dosya adıyla üzerine kaydedin**, sonra seed'i çalıştırın.

### Yol B — Tek tek (günlük kullanım)
`/admin/urunler/yeni` — görsel sürükle-bırak, ilerleme çubuğu, kapak sıralama dahil.

## 3. Vercel'e Deploy

1. Projeyi GitHub'a itin, [vercel.com](https://vercel.com) → *Import Project*.
2. **Environment Variables**: `FIREBASE_SERVICE_ACCOUNT_KEY` = base64 anahtar (Production + Preview).
3. Deploy. Özel alan adı: Vercel → Domains → `gultenimbutik.com.tr` ekleyin,
   DNS'te A kaydını `76.76.21.21`'e, `www` CNAME'i `cname.vercel-dns.com`'a yönlendirin.
4. Firebase Console → Authentication → Settings → **Authorized domains**'e
   `gultenimbutik.com.tr` ve vercel.app önizleme alan adınızı ekleyin.

## 4. Yayın Öncesi Kontrol Listesi

- [ ] `npm run build` hatasız geçiyor
- [ ] Ürün sayfası linkini WhatsApp'a yapıştırınca görselli önizleme çıkıyor (OG testi)
- [ ] Admin olmayan hesapla ürün yazma denemesi **reddediliyor** (kural testi)
- [ ] Mobilde sabit WhatsApp/Instagram butonları içerikle çakışmıyor
- [ ] `https://.../sitemap.xml` ve `/robots.txt` çalışıyor

## Mimari Notlar

| Konu | Karar |
|---|---|
| Veri çekimi | `/`, `/urun/*`, `/kategori/*` → Admin SDK + ISR (SEO/OG için); `/urunler`, `/hesabim`, `/admin` → client SDK |
| Güvenlik | Yazma yetkisi yalnızca `admins/{email}` dokümanı olanlarda; kurallar sunucu tarafında zorlanır |
| Favoriler | `users/{uid}.wishlist` array — `arrayUnion/arrayRemove` ile atomik |
| Görseller | Firebase Storage; `next/image` `remotePatterns` ile optimize |
| E-postalar | Her yerde küçük harf (kurallar büyük/küçük harfe duyarlı) |
