<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    protected $table      = 'salles';
    protected $primaryKey = 'id_salle';
    protected $fillable   = ['nom', 'type', 'capacite'];
 
    public function lits()
    {
        return $this->hasMany(Lit::class, 'id_salle', 'id_salle');
    }
}

?>