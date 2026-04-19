<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AntecedentMedical extends Model {
    protected $table      = 'antecedents_medicaux';
    protected $primaryKey = 'id_antecedent';
    protected $fillable   = ['categorie','description','gravite','id_patient'];

    public function patiente() {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }
}
?>