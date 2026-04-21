<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ConsultationInfectiologie extends Model
{
    protected $table    = 'consultation_infectiologie';
    protected $fillable = [
        'id_consultation', 'type_infection', 'agent_pathogene',
        'date_diagnostic', 'antibiogramme', 'traitement_ATB',
        'statut_resolution', 'risque_neonatal',
    ];
 
    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }
}
?>