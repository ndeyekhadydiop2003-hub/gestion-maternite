<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vaccin extends Model
{
    protected $primaryKey = 'id_vaccin';

    protected $fillable = [
        'id_nouveau_ne',
        'nom_vaccin',
        'date_administration',
        'statut',
        'lot',
        'site_injection',
        'observations',
        'id_personnel',
    ];

    protected $casts = [
        'date_administration' => 'date',
    ];

    public function nouveauNe()
    {
        return $this->belongsTo(NouveauNe::class, 'id_nouveau_ne', 'id_nouveau_ne');
    }

    public function personnel()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }
}
