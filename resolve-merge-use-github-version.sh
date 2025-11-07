#!/bin/bash

# Script para resolver conflitos de merge usando a versão do GitHub (theirs)
# Execute este script no servidor após git pull origin main

echo "Resolvendo conflitos de merge usando versão do GitHub..."

# Resolver conflitos aceitando a versão do GitHub (theirs = a que acabamos de fazer push)
git checkout --theirs src/pages/LandingPage.tsx
git checkout --theirs src/pages/MobileLandingPage.tsx

# Adicionar arquivos resolvidos
git add src/pages/LandingPage.tsx src/pages/MobileLandingPage.tsx

# Completar o merge
git commit -m "Merge: resolver conflitos usando versão do GitHub (remoção de meteoros e correção de scroll)"

echo "✅ Conflitos resolvidos com sucesso!"
echo "✅ Merge concluído usando a versão do GitHub"


