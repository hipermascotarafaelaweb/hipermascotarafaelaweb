#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando sincronización de repos...${NC}\n"

# Verificar si el remote de production existe
if ! git remote | grep -q "^production$"; then
  echo -e "${BLUE}Agregando remote de production...${NC}"
  git remote add production https://github.com/hipermascotarafaelaweb/hipermascotarafaelaweb.git
  echo -e "${GREEN}✓ Remote agregado${NC}\n"
fi

# Pull desde origin (geromendez199)
echo -e "${BLUE}Trayendo cambios desde origin/main...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Error al hacer pull desde origin${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Pull completado${NC}\n"

# Push a production (hipermascotarafaelaweb)
echo -e "${BLUE}Subiendo cambios a production/main...${NC}"
git push production main --force
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Error al hacer push a production${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Push completado${NC}\n"

echo -e "${GREEN}✅ Sincronización completada exitosamente!${NC}"
echo -e "${BLUE}Los cambios están en hipermascotarafaelaweb y Vercel debería actualizar en unos minutos.${NC}"
