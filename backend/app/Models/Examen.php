<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Examen extends Model {
    protected $table      = 'examens';
    protected $primaryKey = 'id_examen';
    protected $fillable   = ['date_examen','statut','id_prescription'];

    public function prescription() {
        return $this->belongsTo(Prescription::class, 'id_prescription', 'id_prescription');
    }
    public function resultat() {
        return $this->hasOne(ResultatExamen::class, 'id_examen', 'id_examen');
    }
}
?>