<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Hospitalisation extends Model {
    protected $table      = 'hospitalisations';
    protected $primaryKey = 'id_hospitalisation';
    protected $fillable   = ['date_admission','date_sorti','motif','statut','date_occupation','id_patient','id_lit','id_accouchement','id_utilisateur'];

    public function patiente() {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }
    public function lit() {
        return $this->belongsTo(Lit::class, 'id_lit', 'id_lit');
    }
    public function accouchement() {
        return $this->belongsTo(Accouchement::class, 'id_accouchement', 'id_accouchement');
    }
    public function utilisateur() {
        return $this->belongsTo(User::class, 'id_utilisateur', 'id_utilisateur');
    }
}
?>
