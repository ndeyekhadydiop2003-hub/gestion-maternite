<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Patiente extends Model
{
    protected $table      = 'patientes';
    protected $primaryKey = 'id_patient';
 
    protected $fillable = [
        'id_personnel', 'nom', 'prenom', 'date_naissance',
        'situation_matrimoniale', 'telephone', 'adresse',
        'groupe_sanguin', 'motif', 'statut', 'notes_cliniques',
    ];
 
    public function personnel()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }
 
    public function grossesses()
    {
        return $this->hasMany(Grossesse::class, 'id_patient', 'id_patient');
    }
 
    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'id_patient', 'id_patient');
    }
 
    public function antecedents()
    {
        return $this->hasMany(AntecedentMedical::class, 'id_patient', 'id_patient');
    }
 
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'id_patient', 'id_patient');
    }
 
    public function examens()
    {
        return $this->hasMany(Examen::class, 'id_patient', 'id_patient');
    }
 
    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'id_patient', 'id_patient');
    }
 
    public function hospitalisations()
    {
        return $this->hasMany(Hospitalisation::class, 'id_patient', 'id_patient');
    }
 
    public function nouveauNes()
    {
        return $this->hasMany(NouveauNe::class, 'id_patient', 'id_patient');
    }
}
 
?>