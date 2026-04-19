<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Patiente extends Model {
    protected $table      = 'patientes';
    protected $primaryKey = 'id_patient';
    protected $fillable   = ['nom','date_naissance','telephone','motif','groupe_sanguin'];

    public function rendezVous() {
        return $this->hasMany(RendezVous::class, 'id_patient', 'id_patient');
    }
    public function antecedentsMedicaux() {
        return $this->hasMany(AntecedentMedical::class, 'id_patient', 'id_patient');
    }
    public function grossesses() {
        return $this->hasMany(Grossesse::class, 'id_patient', 'id_patient');
    }
    public function consultations() {
        return $this->hasMany(Consultation::class, 'id_patient', 'id_patient');
    }
    public function hospitalisations() {
        return $this->hasMany(Hospitalisation::class, 'id_patient', 'id_patient');
    }
}
?>