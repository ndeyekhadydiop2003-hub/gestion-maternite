<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Salle extends Model {
    protected $table      = 'salles';
    protected $primaryKey = 'id_chambre';
    protected $fillable   = ['type_chambre','numero_chambre','batiment'];

    public function lits() {
        return $this->hasMany(Lit::class, 'id_chambre', 'id_chambre');
    }
}

?>