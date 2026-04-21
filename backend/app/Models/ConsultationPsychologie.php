<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ConsultationPsychologie extends Model
{
    protected $table    = 'consultation_psychologie';
    protected $fillable = [
        'id_consultation', 'type_suivi', 'bilan', 'objectifs',
        'niveau_stress', 'score_edinburgh', 'orientation_ext',
    ];
 
    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }
}
?>