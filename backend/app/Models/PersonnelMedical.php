<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonnelMedical extends Model
{
    protected $table      = 'personnel_medical';
    protected $primaryKey = 'id_personnel';
    protected $fillable   = ['nom','prenom','telephone','fonction','id_utilisateur'];

    public function utilisateur() {
        return $this->belongsTo(User::class, 'id_utilisateur', 'id_utilisateur');
    }
    public function rendezVous() {
        return $this->hasMany(RendezVous::class, 'id_personnel', 'id_personnel');
    }
    public function consultations() {
        return $this->hasMany(Consultation::class, 'id_personnel', 'id_personnel');
    }
    public function accouchements() {
        return $this->hasMany(Accouchement::class, 'id_personnel', 'id_personnel');
    }
    public function supervisions() {
        return $this->hasMany(Supervision::class, 'id_personnel', 'id_personnel');
    }
}
