<?php
// Script para configurar Laravel Backend API

// 1. Crear proyecto Laravel
echo "Creando proyecto Laravel...\n";
system('composer create-project laravel/laravel backend');

// 2. Instalar dependencias adicionales
echo "Instalando dependencias...\n";
chdir('backend');
system('composer require tymon/jwt-auth');
system('composer require fruitcake/laravel-cors');

// 3. Configurar JWT
echo "Configurando JWT...\n";
system('php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"');
system('php artisan jwt:secret');

// 4. Crear modelos y controladores
echo "Creando modelos y controladores...\n";
system('php artisan make:model Game -mcr');
system('php artisan make:model Review -mcr');
system('php artisan make:controller AuthController');

echo "Setup de Laravel completado!\n";
echo "Recuerda configurar las variables de entorno en .env\n";
?>
