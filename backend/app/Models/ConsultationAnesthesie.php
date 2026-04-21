// app/Models/ConsultationAnesthesie.php
// ─────────────────────────────────────────
class ConsultationAnesthesie extends Model
{
    protected $table    = 'consultation_anesthesie';
    protected $fillable = [
        'id_consultation', 'date_consultation_pre_op', 'allergie_medicament',
        'type_anesthesie', 'risques', 'protocole',
        'contre_indications', 'asa_score', 'consentement',
    ];
 
    protected $casts = ['consentement' => 'boolean'];
 
    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'id_consultation', 'id_consultation');
    }
}
 