<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanifierRv extends Model
{
    protected $table = 'planifier_rv';
    protected $primaryKey = 'id';

    protected $fillable = [
        'id_patient',
        'id_personnel',
        'delai_recommande',
        'priorite',
        'motif',
        'statut',
    ];

    public function patiente()
    {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }

    public function personnel()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }

    public function rendezVous()
    {
        return $this->hasOne(RendezVous::class, 'id_planification', 'id');
    }
}
