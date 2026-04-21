<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Lit extends Model
{
    protected $table      = 'lits';
    protected $primaryKey = 'id_lit';
    protected $fillable   = ['id_salle', 'numero', 'type', 'statut'];
 
    public function salle()
    {
        return $this->belongsTo(Salle::class, 'id_salle', 'id_salle');
    }
 
    public function hospitalisations()
    {
        return $this->hasMany(Hospitalisation::class, 'id_lit', 'id_lit');
    }
}
?>