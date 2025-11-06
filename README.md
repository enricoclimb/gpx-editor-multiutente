# Collaborative GPX Editor with PostgreSQL and Railway
### 🚀 Deploy su Railway

1. **Crea un nuovo progetto su Railway**
   - Collega il repository GitHub.
   - Railway rileverà automaticamente il progetto Node.js.
2. **Aggiungi un database PostgreSQL**
   - Da Railway → “Add Plugin” → “PostgreSQL”.
   - Railway imposterà automaticamente la variabile `DATABASE_URL`.
3. **Imposta le variabili d’ambiente**
   - `CLIENT_URL` (opzionale) → URL del client React se serve CORS.
4. **Deploy automatico**
   - Railway esegue `npm install`, poi `npm run build` e infine `npm start`.
5. **Accesso pubblico**
   - Dopo il deploy, Railway fornirà un dominio HTTPS. Socket.IO funzionerà automaticamente.

---

### ⚙️ CI/CD con GitHub Actions

Aggiungi nel repo un file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railwayapp/actions@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

Crea un token Railway da [dashboard → account → tokens](https://railway.app/account/tokens) e aggiungilo come secret `RAILWAY_TOKEN` nel repository GitHub.

---

### 🧱 Schema Database

```sql
CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  geojson JSONB NOT NULL
);
INSERT INTO tracks (id, geojson) VALUES (1, '{"type": "FeatureCollection", "features": []}')
  ON CONFLICT (id) DO NOTHING;
```

---

### 🧩 Build locale

```bash
# Installa dipendenze server
npm install

# Setup client
cd client && npm install && npm run build && cd ..

# Avvia server locale
npm start
```

Apri [http://localhost:3000](http://localhost:3000) — la mappa sarà visibile e le modifiche si sincronizzeranno in tempo reale tra più browser.

---

### ✅ Pronto per Railway
Il progetto può essere caricato così com’è nel tuo repository GitHub [enricoclimb/gpx-editor-multiutente](https://github.com/enricoclimb/gpx-editor-multiutente). Railway creerà automaticamente:
- 1 servizio web (Node.js)
- 1 servizio PostgreSQL
