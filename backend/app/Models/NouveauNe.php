<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class NouveauNe extends Model {
    protected $table      = 'nouveau_nes';
    protected $primaryKey = 'id_nouveau';
    protected $fillable   = ['sexe','poids_naissance','taille','score_apgar_1min','score_apgar_5min','id_accouchement'];

    public function accouchement() {
        return $this->belongsTo(Accouchement::class, 'id_accouchement', 'id_accouchement');
    }
}
?>