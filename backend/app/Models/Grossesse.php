<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Grossesse extends Model {
    protected $table      = 'grossesses';
    protected $primaryKey = 'id_grossesse';
    protected $fillable   = ['date_debut','date_terme_prevu','semaines_amenorrhee','statut','type_grossesse','id_patient'];

    public function patiente() {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }
    public function consultations() {
        return $this->hasMany(Consultation::class, 'id_grossesse', 'id_grossesse');
    }
    public function accouchement() {
        return $this->hasOne(Accouchement::class, 'id_grossesse', 'id_grossesse');
    }
}
?>