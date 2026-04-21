<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ConsultationGynecologie extends Model
{
    protected $table    = 'consultation_gynecologie';
    protected $fillable = [
        'id_consultation', 'date_derniere_regles', 'cycle_menstruel',
        'dernier_frottis', 'examen_seins', 'diagnostic', 'type_contraception',
    ];
 
    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }
}
 ?>