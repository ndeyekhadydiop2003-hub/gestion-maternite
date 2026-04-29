<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultationPediatrie extends Model
{
    protected $table = 'consultation_pediatrie';

    protected $fillable = [
        'id_consultation',
        'id_nouveau_ne',
        'taille',
        'perimetre_cranien',
        'vaccin_a_jour',
        'vaccins_notes',
        'developpement',
        'allaitement',
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }

    public function nouveauNe()
    {
        return $this->belongsTo(NouveauNe::class, 'id_nouveau_ne', 'id_nouveau_ne');
    }
}
