<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Hospitalisation extends Model
{
    protected $table      = 'hospitalisations';
    protected $primaryKey = 'id_hospitalisation';
    protected $fillable   = [
        'id_patient', 'id_lit', 'id_personnel',
        'date_entree', 'date_sortie', 'motif', 'statut',
    ];
 
    public function patiente()
    {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }
 
    public function lit()
    {
        return $this->belongsTo(Lit::class, 'id_lit', 'id_lit');
    }
 
    public function personnel()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }
}
?>
