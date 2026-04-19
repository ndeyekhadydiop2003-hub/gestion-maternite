<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model {
    protected $table      = 'consultations';
    protected $primaryKey = 'id_consultation';
    protected $fillable   = ['date_consultation','poids','hauteur_uterine','temperature','tension','observation','id_patient','id_grossesse','id_personnel'];

    public function patiente() {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }
    public function grossesse() {
        return $this->belongsTo(Grossesse::class, 'id_grossesse', 'id_grossesse');
    }
    public function personnel() {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }
    public function prescriptions() {
        return $this->hasMany(Prescription::class, 'id_consultation', 'id_consultation');
    }
}
?>