-- Insertar usuarios de prueba
INSERT INTO users (name, email, password) VALUES
('Admin User', 'admin@gamereviews.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('GamerPro', 'gamer@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('ReviewMaster', 'reviewer@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insertar juegos de prueba
INSERT INTO games (title, description, price, discount_price, image_url, steam_url, rating, is_free, is_on_sale, is_featured) VALUES
('Cyberpunk 2077', 'Un RPG de mundo abierto ambientado en Night City, una megalópolis obsesionada con el poder, el glamour y la modificación corporal.', 59.99, 29.99, '/placeholder.svg?height=300&width=400', 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/', 4.2, FALSE, TRUE, TRUE),

('The Witcher 3: Wild Hunt', 'Embárcate en una aventura épica en un mundo abierto lleno de peligros, misterios y decisiones que cambiarán el destino.', 39.99, 19.99, '/placeholder.svg?height=300&width=400', 'https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/', 4.8, FALSE, TRUE, TRUE),

('Fortnite', 'Battle Royale gratuito donde 100 jugadores luchan por ser el último en pie. Construye, lucha y sobrevive.', 0.00, NULL, '/placeholder.svg?height=300&width=400', NULL, 4.5, TRUE, FALSE, TRUE),

('Grand Theft Auto V', 'Experimenta las vidas entrelazadas de tres criminales únicos mientras cometen una serie de atracos audaces.', 29.99, NULL, '/placeholder.svg?height=300&width=400', 'https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/', 4.6, FALSE, FALSE, FALSE),

('Red Dead Redemption 2', 'Una épica historia sobre la vida en el corazón de América. El juego más grande y ambicioso de Rockstar Games.', 59.99, 39.99, '/placeholder.svg?height=300&width=400', 'https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/', 4.7, FALSE, TRUE, TRUE),

('Minecraft', 'Un juego sobre colocar bloques y vivir aventuras. Explora mundos generados aleatoriamente y construye desde simples casas hasta grandiosos castillos.', 26.95, NULL, '/placeholder.svg?height=300&width=400', 'https://www.minecraft.net/', 4.9, FALSE, FALSE, FALSE),

('Among Us', 'Juega online o por WiFi local con 4-15 jugadores mientras intentas preparar tu nave espacial para la partida.', 4.99, 2.49, '/placeholder.svg?height=300&width=400', 'https://store.steampowered.com/app/945360/Among_Us/', 4.3, FALSE, TRUE, FALSE),

('Valorant', 'Un shooter táctico 5v5 con personajes únicos donde la precisión, la estrategia y los poderes especiales son clave para la victoria.', 0.00, NULL, '/placeholder.svg?height=300&width=400', NULL, 4.4, TRUE, FALSE, TRUE),

('Apex Legends', 'Battle Royale gratuito donde equipos de tres luchan por la supremacía usando leyendas con habilidades únicas.', 0.00, NULL, '/placeholder.svg?height=300&width=400', NULL, 4.1, TRUE, FALSE, FALSE),

('Call of Duty: Warzone', 'Battle Royale gratuito que soporta hasta 150 jugadores en el mapa más grande de Call of Duty.', 0.00, NULL, '/placeholder.svg?height=300&width=400', NULL, 4.0, TRUE, FALSE, FALSE);

-- Insertar reseñas de prueba
INSERT INTO reviews (user_id, game_id, rating, comment) VALUES
(2, 1, 4, 'Después de las actualizaciones, Cyberpunk 2077 se ha convertido en un juego increíble. La historia es fascinante y Night City es impresionante.'),
(3, 1, 5, 'Una obra maestra de la narrativa en videojuegos. Los gráficos son espectaculares y la jugabilidad es muy satisfactoria.'),
(2, 2, 5, 'The Witcher 3 sigue siendo uno de los mejores RPGs de todos los tiempos. Cada quest tiene una historia interesante.'),
(3, 3, 4, 'Fortnite es divertido para jugar con amigos. Las actualizaciones constantes mantienen el juego fresco.'),
(2, 5, 5, 'Red Dead Redemption 2 es una experiencia cinematográfica increíble. El mundo se siente completamente vivo.'),
(3, 6, 5, 'Minecraft nunca pasa de moda. La creatividad que permite es infinita.'),
(2, 8, 4, 'Valorant tiene una curva de aprendizaje empinada pero es muy gratificante cuando mejoras.'),
(3, 2, 4, 'Un mundo abierto increíble con personajes memorables. Geralt es un protagonista fantástico.');

-- Actualizar ratings promedio de los juegos basado en las reseñas
UPDATE games SET rating = (
    SELECT ROUND(AVG(rating::numeric), 2)
    FROM reviews 
    WHERE reviews.game_id = games.id
) WHERE id IN (SELECT DISTINCT game_id FROM reviews);
