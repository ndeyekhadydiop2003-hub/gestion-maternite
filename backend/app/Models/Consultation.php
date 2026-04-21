<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Consultation extends Model
{
    protected $table      = 'consultations';
    protected $primaryKey = 'id_consultation';
 
    protected $fillable = [
        'id_patient', 'id_grossesse', 'id_personnel',
        'date_consultation', 'motif_consultation', 'poids',
        'temperature', 'tension', 'observation', 'prochain_rdv',
    ];
 
    public function patiente()
    {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }
 
    public function grossesse()
    {
        return $this->belongsTo(Grossesse::class, 'id_grossesse', 'id_grossesse');
    }
 
    public function personnel()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }
 
    public function supervisions()
    {
        return $this->hasMany(Supervision::class, 'id_consultation', 'id_consultation');
    }
 
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'id_consultation', 'id_consultation');
    }
 
    public function examens()
    {
        return $this->hasMany(Examen::class, 'id_consultation', 'id_consultation');
    }
 
    // ── Relations vers tables de détails par rôle ──
    public function sageFemme()
    {
        return $this->hasOne(ConsultationSageFemme::class, 'id_consultation', 'id_consultation');
    }
 
    public function pediatrie()
    {
        return $this->hasOne(ConsultationPediatrie::class, 'id_consultation', 'id_consultation');
    }
 
    public function gynecologie()
    {
        return $this->hasOne(ConsultationGynecologie::class, 'id_consultation', 'id_consultation');
    }
 
    public function psychologie()
    {
        return $this->hasOne(ConsultationPsychologie::class, 'id_consultation', 'id_consultation');
    }
 
    public function anesthesie()
    {
        return $this->hasOne(ConsultationAnesthesie::class, 'id_consultation', 'id_consultation');
    }
 
    public function planning()
    {
        return $this->hasOne(ConsultationPlanning::class, 'id_consultation', 'id_consultation');
    }
 
    public function infectiologie()
    {
        return $this->hasOne(ConsultationInfectiologie::class, 'id_consultation', 'id_consultation');
    }
}
 
?>