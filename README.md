# Gültenim Butik — Premium Tesettür Katalog Sitesi

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Firebase (Firestore/Auth) + Vercel Blob (görseller).
Online ödeme yoktur; tüm siparişler **WhatsApp (0534 070 07 80)** ve **Instagram (@gultenim_boutique)** üzerinden alınır.

> 💡 **Blaze planı / kredi kartı GEREKMEZ.** Veritabanı ve üyelik Firebase'in
> ücretsiz planında, görseller Vercel Blob'un ücretsiz kotasında çalışır.

## Hızlı Başlangıç (Yerel)

```bash
npm install
npm run dev        # http://localhost:3000
```

## Kurulum — 4 Adım

### Adım 1: Vercel Blob (görsel deposu)
1. [vercel.com](https://vercel.com) → projeniz → üst menüden **Storage** sekmesi
2. **Create Database** → **Blob** → isim verin (örn. `gultenim-gorseller`) → **Create**
3. **Connect Project** ile `gultenimbutik` projesine bağlayın (Production + Preview + Development işaretli kalsın)
4. Store sayfasında **`.env.local`** sekmesine tıklayın → `BLOB_READ_WRITE_TOKEN="..."` satırını kopyalayın
5. Bilgisayarınızda proje klasöründe `.env.example` dosyasını **`.env.local`** adıyla kopyalayın ve bu satırı içine yapıştırın

### Adım 2: Firebase (ücretsiz Spark planı yeterli)
[Firebase Console](https://console.firebase.google.com) → `gultenimbutik` projesi:

1. **Authentication** → Sign-in method → **E-posta/Şifre**'yi etkinleştirin
2. **Firestore Database** → *Create database* → production mode, bölge `europe-west1`
3. Kuralları yükleyin (bilgisayarınızda, proje klasöründe):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use gultenimbutik
   firebase deploy --only firestore:rules,firestore:indexes
   ```
4. **Service account anahtarı** (SEO ve admin doğrulaması için — ücretsizdir):
   - Console → ⚙️ Proje Ayarları → **Hizmet hesapları** → *Yeni özel anahtar oluştur* → JSON iner
   - PowerShell ile base64'e çevirin:
     ```powershell
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\indirilen\serviceAccountKey.json"))
     ```
   - Çıktıyı `.env.local` içine `FIREBASE_SERVICE_ACCOUNT_KEY=...` olarak yapıştırın
   - Aynı değeri Vercel'de de tanımlayın: proje → **Settings → Environment Variables** →
     Name: `FIREBASE_SERVICE_ACCOUNT_KEY`, Value: (base64 çıktısı) → tüm ortamlar → Save

### Adım 3: İlk admin
1. Sitede `/kayit` sayfasından kendi e-postanızla üye olun (**tamamı küçük harf**)
2. Firebase Console → Firestore → **Koleksiyon başlat** → ID: `admins` →
   Doküman ID = e-postanız (küçük harf), alan: `role` = `owner`
3. Artık `/admin/login`'den panele girebilirsiniz

### Adım 4: Ürünleri yükleyin

**Toplu (ilk kurulum için önerilen):**
```bash
npm run download-images        # eski siteden görseller (zaten indirildiyse atlar)
node scripts/seed.mjs init     # seed-data/ şablonlarını üretir (üretildiyse atlayın)
# seed-data/products.json'u açın: kategori/renk/beden/açıklama doldurun
node scripts/seed.mjs          # görselleri Blob'a yükler + Firestore'a yazar
```
Script tekrar çalıştırılabilir; var olan ürünleri atlar.

**Fotoğraf iyileştirme:** `downloaded-images/<urun>/` içindeki görselleri Grok Imagine /
Photoroom gibi bir araçla iyileştirip **aynı dosya adıyla üzerine kaydedin**, sonra seed'i çalıştırın.

**Tek tek (günlük kullanım):** `/admin/urunler/yeni` — sürükle-bırak yükleme, ilerleme çubuğu, kapak sıralama.

## Alan Adı (gultenimbutik.com.tr)

1. Vercel → proje → **Domains** → `gultenimbutik.com.tr` ekleyin
2. Alan adı sağlayıcınızda: A kaydı → `76.76.21.21`, `www` CNAME → `cname.vercel-dns.com`
3. Firebase Console → Authentication → Settings → **Authorized domains**'e
   `gultenimbutik.com.tr` ve `gultenimbutik.vercel.app` ekleyin

## Yayın Öncesi Kontrol Listesi

- [ ] `npm run build` hatasız geçiyor
- [ ] Ürün sayfası linkini WhatsApp'a yapıştırınca görselli önizleme çıkıyor (OG testi)
- [ ] Admin olmayan hesapla ürün yazma denemesi **reddediliyor** (kural testi)
- [ ] Mobilde sabit WhatsApp/Instagram butonları içerikle çakışmıyor
- [ ] `https://.../sitemap.xml` ve `/robots.txt` çalışıyor

## Mimari Notlar

| Konu | Karar |
|---|---|
| Veri çekimi | `/`, `/urun/*`, `/kategori/*` → Admin SDK + ISR (SEO/OG için); `/urunler`, `/hesabim`, `/admin` → client SDK |
| Görseller | **Vercel Blob** — yükleme `/api/upload` rotasından, Firebase ID token + `admins` kontrolüyle yetkilendirilir |
| Firestore güvenliği | Yazma yetkisi yalnızca `admins/{email}` dokümanı olanlarda; kurallar sunucu tarafında zorlanır |
| Favoriler | `users/{uid}.wishlist` array — `arrayUnion/arrayRemove` ile atomik |
| E-postalar | Her yerde küçük harf (kurallar büyük/küçük harfe duyarlı) |
