<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Examen extends Model
{
    protected $table      = 'examens';
    protected $primaryKey = 'id_examen';
    protected $fillable   = [
        'id_patient', 'id_personnel', 'id_consultation',
        'type_examen', 'date_examen',
    ];
 
    public function patiente()
    {
        return $this->belongsTo(Patiente::class, 'id_patient', 'id_patient');
    }
 
    public function personnel()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }
 
    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }
 
    public function resultats()
    {
        return $this->hasMany(ResultatExamen::class, 'id_examen', 'id_examen');
    }
}
?>