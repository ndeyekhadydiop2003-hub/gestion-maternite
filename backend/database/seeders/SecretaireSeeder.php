<?php
// ================================================================
//  FICHIER : database/seeders/SecretaireSeeder.php
//
//  Commandes à exécuter dans votre terminal Laravel :
//    php artisan make:seeder SecretaireSeeder   (crée le fichier)
//  Puis copiez ce contenu dedans, ensuite :
//    php artisan db:seed --class=SecretaireSeeder
// ================================================================

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SecretaireSeeder extends Seeder
{
    public function run(): void
    {
        // Vérifie si le login existe déjà pour éviter les doublons
        $exists = DB::table('users')->where('login', 'secretaire01')->exists();

        if (!$exists) {
            DB::table('users')->insert([
                'login'      => 'secretaire01',
                'mdp'        => Hash::make('Maternite2025!'),
                'role_acces' => 'secretaire',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            echo "✅ Compte secrétaire créé avec succès !\n";
            echo "   Login      : secretaire01\n";
            echo "   Mot de passe : Maternite2025!\n";
        } else {
            echo "⚠️  Le compte secretaire01 existe déjà.\n";
        }
    }
}
