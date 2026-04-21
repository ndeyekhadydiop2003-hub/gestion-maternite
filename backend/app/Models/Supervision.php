<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Supervision extends Model
{
    protected $table      = 'supervisions';
    protected $primaryKey = 'id_supervision';
    protected $fillable   = [
        'id_consultation', 'id_personnel', 'date_supervision', 'commentaire'
    ];
 
    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }
 
    public function personnel()
    {
        return $this->belongsTo(PersonnelMedical::class, 'id_personnel', 'id_personnel');
    }
}
 
?>
