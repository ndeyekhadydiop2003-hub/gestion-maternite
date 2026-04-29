<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

// app/Models/RendezVous.php
// ─────────────────────────────────────────
class RendezVous extends Model
{
    protected $table      = 'rendez_vous';
    protected $primaryKey = 'id_rendez_vous';
    protected $fillable   = [
        'id_patient', 'id_personnel','id_planification',
        'date_rv', 'heure_rv', 'motif', 'priorite', 'statut',
    ];

    public function patiente()
    {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }

    public function personnel()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }

    public function planification() {
        return $this->belongsTo(PlanifierRv::class, 'id_planification', 'id');
    }
}



?>
