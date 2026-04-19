<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{

    use HasApiTokens;
    use HasFactory;

    protected $table      = 'utilisateurs';
    protected $primaryKey = 'id_utilisateur';
    protected $fillable   = ['login','mdp','role_acces'];
    protected $hidden     = ['mdp'];

    public function personnelMedical() {
        return $this->hasOne(PersonnelMedical::class, 'id_utilisateur', 'id_utilisateur');
    }
    public function hospitalisations() {
        return $this->hasMany(Hospitalisation::class, 'id_utilisateur', 'id_utilisateur');
    }
}