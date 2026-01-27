const axios = require('axios');

/**
 * Serviço para integração com Google Maps Places API
 * Substitui o fluxo N8N por chamadas diretas à API oficial
 */
class GoogleMapsService {
    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.baseUrl = 'https://maps.googleapis.com/maps/api';
        this.cache = new Map();
        this.cacheTTL = parseInt(process.env.GOOGLE_MAPS_CACHE_TTL || '3600') * 1000; // 1 hora padrão
    }

    /**
     * Busca estabelecimentos por tipo e localização
     * @param {string} businessType - Tipo de estabelecimento (ex: "restaurante", "academia")
     * @param {string} location - Localização (ex: "São Paulo, SP")
     * @param {number} limit - Número máximo de resultados (padrão: 20)
     * @returns {Promise<Array>} Lista de estabelecimentos encontrados
     */
    async searchPlaces(businessType, location, limit = 20) {
        if (!this.apiKey) {
            throw new Error('GOOGLE_MAPS_API_KEY não configurada');
        }

        const cacheKey = `search:${businessType}:${location}:${limit}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('✅ Retornando resultado do cache');
            return cached;
        }

        try {
            console.log(`🔍 Buscando: ${businessType} em ${location} (limite: ${limit})`);

            // Estratégia de Busca Inteligente
            // 1. Busca Principal
            const mainQuery = `${businessType} em ${location}`;
            let allResults = [];

            // Função auxiliar para realizar uma busca textSearch
            const performTextSearch = async (query) => {
                const searchUrl = `${this.baseUrl}/place/textsearch/json`;
                let results = [];
                let pageToken = null;
                let pageCount = 0;

                do {
                    const params = {
                        query: query,
                        key: this.apiKey,
                        language: 'pt-BR'
                    };

                    if (pageToken) {
                        params.pagetoken = pageToken;
                    }

                    try {
                        const response = await axios.get(searchUrl, { params });

                        if (response.data.results) {
                            results = results.concat(response.data.results);
                        }

                        pageToken = response.data.next_page_token;
                        pageCount++;

                        if (pageToken && pageCount < 3) {
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    } catch (e) {
                        console.error(`Erro na busca '${query}':`, e.message);
                        break;
                    }
                } while (pageToken && pageCount < 3);

                return results;
            };

            // Executar busca principal
            console.log(`🔎 Executando busca principal: "${mainQuery}"`);
            const mainResults = await performTextSearch(mainQuery);
            allResults = [...mainResults];

            // Tentar variação singular/plural para melhorar resultados
            const pluralVariations = this.getWordVariations(businessType);
            for (const variation of pluralVariations) {
                if (variation !== businessType) {
                    const varQuery = `${variation} em ${location}`;
                    console.log(`🔄 Tentando variação: "${varQuery}"`);
                    const varResults = await performTextSearch(varQuery);
                    allResults = allResults.concat(varResults);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // Se precisarmos de mais leads (> 60), usar estratégia de zonas
            if (limit > 60 && allResults.length < limit) {
                console.log('🚀 Ativando expansão de zonas geográficas...');
                const zones = ['Centro', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste'];

                // Executar em paralelo (com cuidado para não estourar rate limit)
                for (const zone of zones) {
                    if (allResults.length >= limit * 1.5) break; // Buffer de segurança

                    const zoneQuery = `${businessType} em ${location} ${zone}`;
                    console.log(`📍 Buscando em zona: "${zoneQuery}"`);

                    const zoneResults = await performTextSearch(zoneQuery);
                    allResults = allResults.concat(zoneResults);

                    // Pequeno delay entre zonas para evitar rejeição da API
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            if (allResults.length === 0) {
                console.log('⚠️ Nenhum resultado encontrado');
                return [];
            }

            // Remover duplicatas por place_id
            const uniqueResults = Array.from(
                new Map(allResults.map(item => [item.place_id, item])).values()
            );

            // Limitar e Retornar
            const results = uniqueResults.slice(0, limit);
            console.log(`✅ ${results.length} estabelecimentos únicos encontrados (de ${uniqueResults.length} brutos)`);

            // Passo 3: Buscar detalhes (mantido igual)
            const detailedPlaces = await Promise.all(
                results.map(place => this.getPlaceDetails(place.place_id))
            );

            const normalizedPlaces = detailedPlaces.map(place => this.normalizePlace(place, businessType));
            this.setCache(cacheKey, normalizedPlaces);

            return normalizedPlaces;

        } catch (error) {
            console.error('❌ Erro ao buscar estabelecimentos:', error.message);
            throw error;
        }
    }

    /**
     * Obtém detalhes completos de um estabelecimento
     * @param {string} placeId - ID do estabelecimento no Google Maps
     * @returns {Promise<Object>} Detalhes do estabelecimento
     */
    async getPlaceDetails(placeId) {
        const cacheKey = `details:${placeId}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const detailsUrl = `${this.baseUrl}/place/details/json`;
            const response = await axios.get(detailsUrl, {
                params: {
                    place_id: placeId,
                    fields: 'name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,opening_hours,current_opening_hours,photos,price_level,url,geometry,business_status,types',
                    key: this.apiKey,
                    language: 'pt-BR'
                }
            });

            if (!response.data.result) {
                throw new Error(`Detalhes não encontrados para place_id: ${placeId}`);
            }

            const details = response.data.result;
            this.setCache(cacheKey, details);

            return details;

        } catch (error) {
            console.error(`❌ Erro ao buscar detalhes do place_id ${placeId}:`, error.message);
            // Retornar objeto vazio em vez de falhar
            return {
                place_id: placeId,
                name: 'Nome não disponível'
            };
        }
    }

    /**
     * Normaliza dados da API do Google Maps para o formato Lead
     * @param {Object} place - Dados brutos da API
     * @param {string} businessType - Tipo de negócio buscado
     * @returns {Object} Lead normalizado
     */
    normalizePlace(place, businessType) {
        return {
            id: place.place_id || `temp_${Date.now()}_${Math.random()}`,
            name: place.name || 'Nome não disponível',
            address: place.formatted_address || 'Endereço não disponível',
            phone: this.formatPhone(place.formatted_phone_number || place.international_phone_number),
            rating: place.rating || 0,
            totalScore: place.rating || 0,
            website: place.website || null,
            business_type: businessType,
            google_maps_url: place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            place_id: place.place_id,
            reviews_count: place.user_ratings_total || 0,
            price_level: place.price_level || null,
            opening_hours: place.opening_hours?.weekday_text || [],
            photos: this.extractPhotos(place.photos),
            location: place.geometry?.location || null,
            business_status: place.business_status || 'OPERATIONAL',
            types: place.types || [],
            is_open_now: place.current_opening_hours?.open_now ?? place.opening_hours?.open_now ?? null,
            selected: false,

            // Enriquecimento (Heurísticas Simples)
            instagram: this.detectInstagram(place.website),
            cnpj: null, // Requer integação futura com BrasilAPI
            company_size: null,
            founded_date: null
        };
    }

    /**
     * Tenta detectar URL do Instagram
     */
    detectInstagram(website) {
        if (!website) return null;
        if (website.includes('instagram.com')) return website;
        if (website.includes('linktr.ee')) return null; // Pode ter insta, mas não garantido
        return null;
    }

    /**
     * Formata número de telefone
     * @param {string} phone - Telefone bruto
     * @returns {string|null} Telefone formatado ou null
     */
    formatPhone(phone) {
        if (!phone) return null;

        // Remove caracteres não numéricos
        const cleaned = phone.replace(/\D/g, '');

        // Se não tiver número, retorna null
        if (!cleaned) return null;

        // Retorna formatado
        return phone.trim();
    }

    /**
     * Extrai URLs de fotos
     * @param {Array} photos - Array de fotos da API
     * @returns {Array<string>} URLs das fotos
     */
    extractPhotos(photos) {
        if (!photos || !Array.isArray(photos)) return [];

        return photos.slice(0, 5).map(photo => {
            if (photo.photo_reference) {
                return `${this.baseUrl}/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${this.apiKey}`;
            }
            return null;
        }).filter(Boolean);
    }

    /**
     * Gerenciamento de cache
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const { data, timestamp } = cached;
        const age = Date.now() - timestamp;

        if (age > this.cacheTTL) {
            this.cache.delete(key);
            return null;
        }

        return data;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    /**
     * Gera variações de uma palavra (singular/plural)
     */
    getWordVariations(word) {
        const variations = [word];
        const lowerWord = word.toLowerCase();

        // Regras comuns de plural em português
        if (lowerWord.endsWith('s')) {
            // Pode ser plural, tentar remover 's' final para singular
            const singular = word.slice(0, -1);
            variations.push(singular);

            // Casos especiais ending in 'es'
            if (lowerWord.endsWith('es')) {
                const singularEs = word.slice(0, -2);
                variations.push(singularEs);
            }
        } else {
            // Provavelmente singular, adicionar plural
            variations.push(word + 's');

            // Casos especiais
            if (lowerWord.endsWith('l') || lowerWord.endsWith('r')) {
                variations.push(word + 'es');
            }
        }

        // Remover duplicatas e retornar
        return [...new Set(variations)];
    }
}

module.exports = new GoogleMapsService();
