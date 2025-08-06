-- Corregir permisos y agregar funciones faltantes

-- Función para obtener juegos con filtros
CREATE OR REPLACE FUNCTION get_games_filtered(
    search_term TEXT DEFAULT NULL,
    is_free_filter BOOLEAN DEFAULT NULL,
    is_on_sale_filter BOOLEAN DEFAULT NULL,
    is_featured_filter BOOLEAN DEFAULT NULL,
    sort_by_param TEXT DEFAULT 'rating'
)
RETURNS TABLE(
    id INTEGER,
    title VARCHAR(255),
    description TEXT,
    price DECIMAL(8,2),
    discount_price DECIMAL(8,2),
    image_url VARCHAR(500),
    steam_url VARCHAR(500),
    epic_url VARCHAR(500),
    rating DECIMAL(3,2),
    is_free BOOLEAN,
    is_on_sale BOOLEAN,
    is_featured BOOLEAN,
    reviews_count BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id,
        g.title,
        g.description,
        g.price,
        g.discount_price,
        g.image_url,
        g.steam_url,
        g.epic_url,
        g.rating,
        g.is_free,
        g.is_on_sale,
        g.is_featured,
        COUNT(r.id) as reviews_count,
        g.created_at,
        g.updated_at
    FROM games g
    LEFT JOIN reviews r ON g.id = r.game_id
    WHERE 
        (search_term IS NULL OR 
         g.title ILIKE '%' || search_term || '%' OR 
         g.description ILIKE '%' || search_term || '%')
        AND (is_free_filter IS NULL OR g.is_free = is_free_filter)
        AND (is_on_sale_filter IS NULL OR g.is_on_sale = is_on_sale_filter)
        AND (is_featured_filter IS NULL OR g.is_featured = is_featured_filter)
    GROUP BY g.id, g.title, g.description, g.price, g.discount_price, 
             g.image_url, g.steam_url, g.epic_url, g.rating, g.is_free, 
             g.is_on_sale, g.is_featured, g.created_at, g.updated_at
    ORDER BY 
        CASE 
            WHEN sort_by_param = 'rating' THEN g.rating
            WHEN sort_by_param = 'price_low' THEN COALESCE(g.discount_price, g.price)
            WHEN sort_by_param = 'price_high' THEN -COALESCE(g.discount_price, g.price)
            WHEN sort_by_param = 'reviews' THEN COUNT(r.id)
            ELSE g.rating
        END DESC,
        CASE 
            WHEN sort_by_param = 'name' THEN g.title
            ELSE NULL
        END ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener reseñas con paginación
CREATE OR REPLACE FUNCTION get_reviews_paginated(
    page_size INTEGER DEFAULT 10,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id INTEGER,
    user_id INTEGER,
    game_id INTEGER,
    rating INTEGER,
    comment TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    user_name VARCHAR(255),
    game_title VARCHAR(255),
    game_image_url VARCHAR(500)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.user_id,
        r.game_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        g.title as game_title,
        g.image_url as game_image_url
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN games g ON r.game_id = g.id
    ORDER BY r.created_at DESC
    LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Actualizar datos de ejemplo con más variedad
INSERT INTO reviews (user_id, game_id, rating, comment, created_at) VALUES
(2, 3, 5, 'Fortnite sigue siendo increíble después de todos estos años. La constante evolución del juego lo mantiene fresco y emocionante.', '2024-01-10 14:30:00'),
(3, 4, 4, 'GTA V es un clásico que nunca pasa de moda. La libertad que ofrece es incomparable.', '2024-01-12 16:45:00'),
(2, 5, 5, 'Red Dead Redemption 2 es una obra maestra. La atención al detalle es impresionante.', '2024-01-14 10:20:00'),
(3, 6, 5, 'Minecraft es pura creatividad. Puedes construir cualquier cosa que imagines.', '2024-01-15 09:15:00'),
(2, 7, 3, 'Among Us es divertido con amigos, pero puede volverse repetitivo rápidamente.', '2024-01-16 20:30:00'),
(3, 8, 4, 'Valorant tiene una curva de aprendizaje empinada pero es muy satisfactorio cuando mejoras.', '2024-01-17 18:45:00'),
(2, 9, 4, 'Apex Legends tiene mecánicas únicas que lo distinguen de otros battle royales.', '2024-01-18 12:00:00'),
(3, 10, 3, 'Call of Duty Warzone es entretenido pero a veces frustrante por los hackers.', '2024-01-19 15:30:00')
ON CONFLICT (user_id, game_id) DO NOTHING;

-- Actualizar ratings de juegos basado en las nuevas reseñas
UPDATE games SET rating = (
    SELECT COALESCE(ROUND(AVG(rating::numeric), 2), 0)
    FROM reviews 
    WHERE reviews.game_id = games.id
) WHERE id IN (SELECT DISTINCT game_id FROM reviews);

-- Crear índices adicionales para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_reviews_game_user ON reviews(game_id, user_id);
CREATE INDEX IF NOT EXISTS idx_games_composite ON games(is_featured, is_free, is_on_sale, rating DESC);
CREATE INDEX IF NOT EXISTS idx_users_role_email ON users(role, email);

-- Función para limpiar datos huérfanos
CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Eliminar reseñas de juegos que no existen
    DELETE FROM reviews WHERE game_id NOT IN (SELECT id FROM games);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar datos antes de insertar reseñas
CREATE OR REPLACE FUNCTION validate_review_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que el rating esté en el rango correcto
    IF NEW.rating < 1 OR NEW.rating > 5 THEN
        RAISE EXCEPTION 'Rating must be between 1 and 5';
    END IF;
    
    -- Validar que el comentario no esté vacío
    IF LENGTH(TRIM(NEW.comment)) < 10 THEN
        RAISE EXCEPTION 'Comment must be at least 10 characters long';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_review_before_insert
    BEFORE INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION validate_review_data();

COMMIT;
