# Jednoduchá aplikace pro sdílení souborů, textu a obrázků


## Lokální spuštění (Docker Compose)

1. Spusť v root složce projektu:
   
   docker compose up --build

2. Otevři prohlížeč na http://localhost:5000

## Build a push Docker image na GitHub Container Registry (ghcr.io)

1. Ujisti se, že repozitář je na GitHubu a máš povolené GitHub Packages.
2. Po commitu do větve main se automaticky postaví a pushne image na ghcr.io pomocí GitHub Actions.
+3. Image bude dostupný jako:
+   
+   ghcr.io/fpluske/3--os--pololetni-projekt/share-app:latest

## Kubernetes nasazení

+1. Uprav image v k8s-deployment.yaml na:
+   
+   ghcr.io/fpluske/3--os--pololetni-projekt/share-app:latest

2. V Kubernetes nasad:
   
   kubectl apply -f uploads-pvc.yaml
   kubectl apply -f k8s-deployment.yaml

3. Přístup na NodePort 30050 (např. http://<node-ip>:30050)

## Funkce
- Upload/download souborů, textu, obrázků přes share-id
- Share-id lze zadat nebo se vygeneruje
- Seznam souborů/textu pro share-id

