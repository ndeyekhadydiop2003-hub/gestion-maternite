<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ConsultationSageFemme extends Model
{
    protected $table    = 'consultation_sage_femme';
    protected $fillable = [
        'id_consultation', 'id_grossesse', 'hauteur_uterine',
        'bruit_coeur_foetal', 'mouvements_foetaux',
        'gravite', 'parite', 'type_presentation',
    ];
 
    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }
 
    public function grossesse()
    {
        return $this->belongsTo(Grossesse::class, 'id_grossesse', 'id_grossesse');
    }
}
 ?>