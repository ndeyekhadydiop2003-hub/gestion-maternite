<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Lit extends Model {
    protected $table      = 'lits';
    protected $primaryKey = 'id_lit';
    protected $fillable   = ['numero_lit','statut','est_occupe','id_chambre'];

    public function salle() {
        return $this->belongsTo(Salle::class, 'id_chambre', 'id_chambre');
    }
    public function hospitalisations() {
        return $this->hasMany(Hospitalisation::class, 'id_lit', 'id_lit');
    }
}
?>