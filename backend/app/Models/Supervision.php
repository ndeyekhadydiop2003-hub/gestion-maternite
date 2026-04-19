<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Supervision extends Model {
    protected $table      = 'supervisions';
    protected $primaryKey = 'id_supervision';
    protected $fillable   = ['date_supervision','id_personnel','id_accouchement'];

    public function personnel() {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }
    public function accouchement() {
        return $this->belongsTo(Accouchement::class, 'id_accouchement', 'id_accouchement');
    }
}
?>
