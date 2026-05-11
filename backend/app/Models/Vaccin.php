<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Vaccin extends Model
{
    protected $primaryKey = 'id_vaccin';

    protected $fillable = [
        'id_nouveau_ne',
        'id_patient',
        'nom_vaccin',
        'date_administration',
        'statut',
        'lot',
        'site_injection',
        'observations',
        'id_personnel',
        'id_assigne',
    ];

    protected $casts = [
        'date_administration' => 'date',
    ];

    // Relation bébé
    public function nouveauNe()
    {
        return $this->belongsTo(NouveauNe::class, 'id_nouveau_ne', 'id_nouveau_ne');
    }

    // Relation patiente
    public function patiente()
    {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }

    // Personnel qui a administré
    public function personnel()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }

    // Scope bébés uniquement
    public function scopeBebe($query)
    {
        return $query->whereNotNull('id_nouveau_ne');
    }

    // Scope femmes uniquement
    public function scopeFemme($query)
    {
        return $query->whereNotNull('id_patient');
    }

    // Personnel assigné
    public function assigne()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_assigne', 'id_personnel');
    }
}
