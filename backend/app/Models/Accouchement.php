<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Accouchement extends Model {
    protected $table      = 'accouchements';
    protected $primaryKey = 'id_accouchement';
    protected $fillable   = ['date_accouchement','heure_accouchement','type_accouchement','a_accoucher','id_grossesse','id_personnel'];

    public function grossesse() {
        return $this->belongsTo(Grossesse::class, 'id_grossesse', 'id_grossesse');
    }
    public function personnel() {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }
    public function nouveauNes() {
        return $this->hasMany(NouveauNe::class, 'id_accouchement', 'id_accouchement');
    }
    public function supervisions() {
        return $this->hasMany(Supervision::class, 'id_accouchement', 'id_accouchement');
    }
    public function hospitalisations() {
        return $this->hasMany(Hospitalisation::class, 'id_accouchement', 'id_accouchement');
    }
}
?>
