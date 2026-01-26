const express = require('express');
const router = express.Router();
const googleMapsService = require('../services/googleMapsService');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/google-maps/search
 * Busca estabelecimentos por tipo e localização
 */
router.post('/search', authenticateToken, async (req, res) => {
    try {
        const { businessType, location, limit = 20 } = req.body;

        // Validação
        if (!businessType || !location) {
            return res.status(400).json({
                success: false,
                error: 'businessType e location são obrigatórios'
            });
        }

        if (limit < 1 || limit > 200) {
            return res.status(400).json({
                success: false,
                error: 'limit deve estar entre 1 e 200'
            });
        }

        console.log(`🔍 Busca solicitada: ${businessType} em ${location} (limite: ${limit})`);

        // Buscar estabelecimentos
        const places = await googleMapsService.searchPlaces(businessType, location, limit);

        res.json({
            success: true,
            leads: places,
            total_found: places.length,
            search_query: `${businessType} em ${location}`,
            business_type: businessType,
            location: location
        });

    } catch (error) {
        console.error('❌ Erro na busca:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar estabelecimentos'
        });
    }
});

/**
 * GET /api/google-maps/place/:placeId
 * Obtém detalhes de um estabelecimento específico
 */
router.get('/place/:placeId', authenticateToken, async (req, res) => {
    try {
        const { placeId } = req.params;

        if (!placeId) {
            return res.status(400).json({
                success: false,
                error: 'placeId é obrigatório'
            });
        }

        const details = await googleMapsService.getPlaceDetails(placeId);

        res.json({
            success: true,
            place: details
        });

    } catch (error) {
        console.error('❌ Erro ao buscar detalhes:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar detalhes do estabelecimento'
        });
    }
});

/**
 * DELETE /api/google-maps/cache
 * Limpa o cache (admin only)
 */
router.delete('/cache', authenticateToken, async (req, res) => {
    try {
        googleMapsService.clearCache();

        res.json({
            success: true,
            message: 'Cache limpo com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro ao limpar cache:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao limpar cache'
        });
    }
});

module.exports = router;
