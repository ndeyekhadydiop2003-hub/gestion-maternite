<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model {
    protected $table      = 'prescriptions';
    protected $primaryKey = 'id_prescription';
    protected $fillable   = ['date_prescription','type_examen','id_consultation'];

    public function consultation() {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }
    public function examens() {
        return $this->hasMany(Examen::class, 'id_prescription', 'id_prescription');
    }
}
?>