<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;

    protected $table      = 'utilisateurs';
    protected $primaryKey = 'id_utilisateur';



    protected $fillable = [
         'nom',
    'prenom',
        'login',
        'password',   // ✅ CORRECTION 1 : mdp → password (standard Laravel + Hash::make())
        'role_acces',
    ];

    protected $hidden = [
        'password',   // ✅ CORRECTION 2 : mdp → password
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed', // ✅ CORRECTION 3 : hashage automatique Laravel 10+
    ];

    // ── Relations ──────────────────────────────────────────

    // ✅ CORRECT : un utilisateur → un personnel médical
    public function personnelMedical()
    {
        return $this->hasOne(PersonnelMedical::class, 'id_utilisateur', 'id_utilisateur');
    }

            public function getKeyName()
        {
            return 'id_utilisateur';
        }

        public function getAuthIdentifier()
        {
            return $this->id_utilisateur;
        }

        public function personnel()
        {
            return $this->hasOne(PersonnelMedical::class, 'id_utilisateur', 'id_utilisateur');
        }

}
