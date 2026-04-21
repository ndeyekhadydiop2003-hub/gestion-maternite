<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    protected $table      = 'prescriptions';
    protected $primaryKey = 'id_prescription';
    protected $fillable   = [
        'id_patient', 'id_personnel', 'id_consultation',
        'medicaments', 'posologie', 'date_prescription', 'date_fin',
    ];
 
    public function patiente()
    {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }
 
    public function personnel()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }
 
    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }
}
 
?>