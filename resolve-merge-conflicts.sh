#!/bin/bash

# Script para resolver conflitos de merge automaticamente
# Este script aceita a versão do GitHub (ours) para os arquivos em conflito

echo "Resolvendo conflitos de merge..."

# Resolver conflitos aceitando nossa versão (do GitHub)
git checkout --ours src/pages/LandingPage.tsx
git checkout --ours src/pages/MobileLandingPage.tsx

# Adicionar arquivos resolvidos
git add src/pages/LandingPage.tsx src/pages/MobileLandingPage.tsx

# Completar o merge
git commit -m "Merge: resolver conflitos usando versão do GitHub (remoção de meteoros e correção de scroll)"

echo "Conflitos resolvidos com sucesso!"


