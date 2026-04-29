<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Soin extends Model
{
    protected $primaryKey = 'id_soin';

    protected $fillable = [
        'id_nouveau_ne',
        'id_personnel',
        'type_soin',
        'date_soin',
        'heure_soin',
        'frequence',
        'note',
        'statut',
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
