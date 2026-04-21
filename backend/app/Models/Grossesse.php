<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Grossesse extends Model
{
    protected $table      = 'grossesses';
    protected $primaryKey = 'id_grossesse';
 
    protected $fillable = [
        'id_patient', 'date_debut', 'date_terme_prevu',
        'semaines_amenorrhee', 'nombre_foetus', 'rhesus',
        'grossesse_a_risque', 'type_grossesse', 'statut',
    ];
 
    protected $casts = ['grossesse_a_risque' => 'boolean'];
 
    public function patiente()
    {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }
 
    public function accouchements()
    {
        return $this->hasMany(Accouchement::class, 'id_grossesse', 'id_grossesse');
    }
 
    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'id_grossesse', 'id_grossesse');
    }
 
    public function consultationSageFemme()
    {
        return $this->hasMany(ConsultationSageFemme::class, 'id_grossesse', 'id_grossesse');
    }
}
 
?>