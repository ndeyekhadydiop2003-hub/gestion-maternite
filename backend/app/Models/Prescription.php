<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Prescription extends Model
{
    use HasFactory;

    protected $table      = 'prescriptions';
    protected $primaryKey = 'id_prescription';

    protected $fillable = [
        'id_patient',
        'id_personnel',
        'id_consultation',
        'type',
        'medicaments',
        'posologie',
        'date_prescription',
        'date_fin',
    ];

    /**
     * Relation avec la patiente
     */
    public function patiente()
    {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }

    /**
     * Relation avec le personnel médical
     * Note : On utilise PersonnelMedical car le modèle Personnel n'existe pas
     */
    public function personnel()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }

    /**
     * Relation avec la consultation
     */
    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }
}
