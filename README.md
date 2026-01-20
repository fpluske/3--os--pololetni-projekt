# Share-ID

Jednoduchá webová aplikace pro sdílení textu, souborů a obrázků pomocí share-id (zadáš vlastní nebo necháš vygenerovat).

## Rychlé spuštění

```bash
npm install
npm start
# běží na http://localhost:5000
```
Proměnné (volitelné):
- `PORT` (default 5000)
- `DATA_DIR` (default `./uploads`)
- `MAX_UPLOAD_BYTES` (default 10485760)

## API
- `GET /api/share-id` – vygeneruje náhodný share-id.
- `GET /api/:shareId` – vrátí seznam textů a souborů.
- `POST /api/:shareId/text` – `{ text }` uloží text.
- `POST /api/:shareId/files` – multipart `files` (max 5 souborů, limit dle `MAX_UPLOAD_BYTES`).
- `GET /api/:shareId/files/:fileName` – stáhne soubor.
- Frontend: `/share/:shareId` nebo `/` + pole na zadání ID.

## Docker
```bash
docker build -t share-id:latest .
docker run -p 5000:5000 -v $(pwd)/uploads:/app/uploads share-id:latest
```

## Kubernetes (manuálně)
Uprav v [k8s/deployment.yaml](k8s/deployment.yaml) image `ghcr.io/your-org/share-id:latest`, poté:
```bash
kubectl apply -f k8s/deployment.yaml
kubectl port-forward svc/share-id 8080:80
```

## GitHub Actions + GHCR
Workflow [.github/workflows/ci.yml](.github/workflows/ci.yml) buildí image `ghcr.io/<owner>/<repo>/share-id:latest` a při push ho publikuje do GHCR (potřebuje `GITHUB_TOKEN`).

## Poznámky
- Úložiště je na FS (`DATA_DIR`). V K8s je použité `emptyDir`; pro trvalá data nahraď PersistentVolumeClaim.
- Žádná autentizace – share-id není bezpečnostní ochrana. Pro produkci přidej auth/rate-limit/HTTPS.
