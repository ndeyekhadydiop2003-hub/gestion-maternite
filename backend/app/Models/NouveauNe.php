<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class NouveauNe extends Model {
    protected $table      = 'nouveau_nes';
    protected $primaryKey = 'id_nouveau_ne';
    protected $fillable   = [
        'id_accouchement',
        'id_patient',
        'sexe',
        'poids_naissance',
        'taille',
        'apgar_1min',
        'apgar_5min',
        'etat_sante',
    ];

    public function accouchement() {
        return $this->belongsTo(Accouchement::class, 'id_accouchement', 'id_accouchement');
    }


    public function patiente() {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }

    public function vaccins()
    {
        return $this->hasMany(Vaccin::class, 'id_nouveau_ne', 'id_nouveau_ne');
    }
}
