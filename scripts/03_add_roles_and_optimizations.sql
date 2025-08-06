-- Agregar columna de rol a usuarios
ALTER TABLE users ADD COLUMN role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Crear usuario administrador por defecto
INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
('Administrator', 'admin@gamereviews.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Índices adicionales para optimización
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);
CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
CREATE INDEX IF NOT EXISTS idx_games_price ON games(price);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);

-- Función para calcular estadísticas de usuario
CREATE OR REPLACE FUNCTION calculate_user_stats(user_id_param INTEGER)
RETURNS TABLE(reviews_count INTEGER, average_rating DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as reviews_count,
        COALESCE(AVG(rating), 0)::DECIMAL as average_rating
    FROM reviews 
    WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Vista para estadísticas de juegos
CREATE OR REPLACE VIEW game_stats AS
SELECT 
    g.id,
    g.title,
    g.price,
    g.discount_price,
    g.is_free,
    g.is_on_sale,
    g.is_featured,
    g.rating,
    COUNT(r.id) as reviews_count,
    COALESCE(AVG(r.rating), 0) as calculated_rating
FROM games g
LEFT JOIN reviews r ON g.id = r.game_id
GROUP BY g.id, g.title, g.price, g.discount_price, g.is_free, g.is_on_sale, g.is_featured, g.rating;

-- Trigger para actualizar rating automáticamente cuando se crea/actualiza/elimina una reseña
CREATE OR REPLACE FUNCTION update_game_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar rating del juego afectado
    UPDATE games 
    SET rating = COALESCE((
        SELECT AVG(rating) 
        FROM reviews 
        WHERE game_id = COALESCE(NEW.game_id, OLD.game_id)
    ), 0)
    WHERE id = COALESCE(NEW.game_id, OLD.game_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualización automática de ratings
DROP TRIGGER IF EXISTS trigger_update_game_rating_insert ON reviews;
DROP TRIGGER IF EXISTS trigger_update_game_rating_update ON reviews;
DROP TRIGGER IF EXISTS trigger_update_game_rating_delete ON reviews;

CREATE TRIGGER trigger_update_game_rating_insert
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_game_rating();

CREATE TRIGGER trigger_update_game_rating_update
    AFTER UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_game_rating();

CREATE TRIGGER trigger_update_game_rating_delete
    AFTER DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_game_rating();

-- Función para obtener estadísticas generales del sistema
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE(
    total_games INTEGER,
    total_users INTEGER,
    total_reviews INTEGER,
    average_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM games) as total_games,
        (SELECT COUNT(*)::INTEGER FROM users) as total_users,
        (SELECT COUNT(*)::INTEGER FROM reviews) as total_reviews,
        (SELECT COALESCE(AVG(rating), 0)::DECIMAL FROM reviews) as average_rating;
END;
$$ LANGUAGE plpgsql;

-- Insertar más juegos de ejemplo con diferentes estados
INSERT INTO games (title, description, price, discount_price, image_url, steam_url, rating, is_free, is_on_sale, is_featured) VALUES
('Rocket League', 'Un juego de fútbol con coches que combina deportes y conducción en una experiencia única.', 0.00, NULL, '/placeholder.svg?height=300&width=400', 'https://store.steampowered.com/app/252950/Rocket_League/', 4.6, TRUE, FALSE, TRUE),

('Hades', 'Un roguelike de acción ambientado en el inframundo griego con una narrativa excepcional.', 24.99, 12.49, '/placeholder.svg?height=300&width=400', 'https://store.steampowered.com/app/1145360/Hades/', 4.9, FALSE, TRUE, TRUE),

('Fall Guys', 'Battle royale party game con hasta 60 jugadores compitiendo en desafíos coloridos.', 0.00, NULL, '/placeholder.svg?height=300&width=400', NULL, 4.2, TRUE, FALSE, FALSE),

('Stardew Valley', 'Un juego de simulación de granja con elementos de RPG y una comunidad encantadora.', 14.99, NULL, '/placeholder.svg?height=300&width=400', 'https://store.steampowered.com/app/413150/Stardew_Valley/', 4.8, FALSE, FALSE, TRUE),

('Among Us', 'Juego de deducción social donde los tripulantes deben encontrar a los impostores.', 4.99, 2.49, '/placeholder.svg?height=300&width=400', 'https://store.steampowered.com/app/945360/Among_Us/', 4.3, FALSE, TRUE, FALSE)

ON CONFLICT (title) DO NOTHING;

-- Actualizar ratings de todos los juegos basado en reseñas existentes
UPDATE games SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews 
    WHERE reviews.game_id = games.id
);

COMMIT;
