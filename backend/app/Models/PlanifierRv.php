<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanifierRv extends Model {
    protected $table      = 'planifier_rv';
    protected $primaryKey = 'id';

    protected $fillable = [
        'id_patient',
        'id_personnel',
        'delai_recommande',
        'date_souhaitee',
        'priorite',
        'motif',
        'notes',
        'statut',
        'id_rv',
    ];

    protected $casts = [
        'date_souhaitee' => 'date',
    ];

    // ── Relations ──────────────────────────────
    public function patiente() {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }

    public function personnel() {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }

    // Le RDV confirmé lié à cette planification
    public function rendezVous() {
        return $this->belongsTo(RendezVous::class, 'id_rv', 'id_rendez_vous');
    }

    // Scope utiles
    public function scopeEnAttente($query) {
        return $query->where('statut', 'en_attente');
    }

    public function scopeUrgentes($query) {
        return $query->where('priorite', 'urgente');
    }
}
