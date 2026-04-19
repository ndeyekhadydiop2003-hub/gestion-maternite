<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ResultatExamen extends Model {
    protected $table      = 'resultats_examens';
    protected $primaryKey = 'id_resultat';
    protected $fillable   = ['valeur','est_normal','date_resultat','id_examen'];

    public function examen() {
        return $this->belongsTo(Examen::class, 'id_examen', 'id_examen');
    }
}
?>